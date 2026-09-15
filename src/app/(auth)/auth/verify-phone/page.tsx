'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth.context';
import { usePhoneStatus } from '@/lib/hooks/usePhoneVerification';
import { useMailboxes } from '@/lib/hooks/useMailboxes';
import { useSendOtp, useVerifyOtp, type PhoneChannel } from '@/lib/hooks/usePhoneVerification';
import { useAppToast } from '@/components/ui/app-toast';
import { CountrySelect } from '@/components/ui/country-select';
import { useDetectCountry, type Country } from '@/lib/hooks/useCountries';
import UpgradePlanModal from '@/components/app/UpgradePlanModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Phone, ShieldCheck } from 'lucide-react';

// SMS delivery only reaches Nigerian numbers today (Termii) — everyone else
// picks WhatsApp or Telegram (VerifyWay) instead of hitting a silent failure.
const CHANNEL_LABEL: Record<PhoneChannel, string> = {
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
};

function ownsAPaidPlan(user: { plan_status?: string; is_trial?: boolean } | null | undefined): boolean {
  return !!user && user.plan_status !== 'free' && user.is_trial !== true;
}

// Mirrors the backend's own throttle (app/routes/phone_verify.py) — 1 OTP
// per 60s per account, independent of which phone number it's sent to, so
// switching numbers doesn't reset or bypass the cooldown. The backend is
// the actual source of truth (still enforced there even if this drifts);
// this just surfaces it instead of only showing a toast after a 429.
const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyPhonePage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading, refreshUser } = useAuth();
  const { success, error: toastError } = useAppToast();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [countryOverride, setCountryOverride] = useState<Country | null>(null);
  const [localNumber, setLocalNumber] = useState('');
  const [code, setCode] = useState('');
  const [channel, setChannel] = useState<'whatsapp' | 'telegram'>('whatsapp');
  const [channelUsed, setChannelUsed] = useState<PhoneChannel | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [dailyLimitMessage, setDailyLimitMessage] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // Ticks once a cooldown is active so the countdown re-renders each second;
  // stops itself once it expires rather than running for the whole page life.
  useEffect(() => {
    if (!cooldownUntil) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const remainingSeconds = cooldownUntil ? Math.max(0, Math.ceil((cooldownUntil - now) / 1000)) : 0;
  const onCooldown = remainingSeconds > 0;

  const { data: detected } = useDetectCountry();
  // Detected country is only a default — once the user picks one explicitly
  // via CountrySelect, that override wins even if the async detection query
  // resolves afterward.
  const country = countryOverride ?? detected ?? null;
  const phone = `${country?.phonecode ?? ''}${localNumber.replace(/^0+/, '')}`;

  const isNigeria = country?.iso2 === 'NG';

  const sendOtp = useSendOtp(token);
  const verifyOtp = useVerifyOtp(token);

  const ownsPlan = ownsAPaidPlan(user);
  const { data: phoneStatus, isLoading: phoneStatusLoading } = usePhoneStatus(token);
  const { data: mailboxes, isLoading: mailboxesLoading } = useMailboxes(token);
  const activeMailbox = mailboxes?.find((m) => m.email_address === user?.email);
  const isImapMailbox = activeMailbox?.connection_type === 'imap';

  // A direct visit (bookmark, back button) while verification no longer
  // applies — already verified, upgraded, or an IMAP account — just sends
  // them into the app instead of showing a pointless form.
  useEffect(() => {
    if (authLoading || phoneStatusLoading || mailboxesLoading) return;
    if (!user) { router.replace('/auth/login'); return; }
    if (ownsPlan || isImapMailbox || phoneStatus?.is_verified) {
      router.replace('/app');
    }
  }, [authLoading, phoneStatusLoading, mailboxesLoading, user, ownsPlan, isImapMailbox, phoneStatus, router]);

  const handleSend = async (explicitChannel?: PhoneChannel) => {
    if (!country || !localNumber.trim() || onCooldown || dailyLimitMessage) return;
    const res = await sendOtp.mutateAsync({ phone, channel: explicitChannel });
    if (res.status === true) {
      const used = res.response.channel_used as PhoneChannel;
      setChannelUsed(used);
      success(`Code sent via ${CHANNEL_LABEL[used]}`);
      setStep('otp');
      setCooldownUntil(Date.now() + RESEND_COOLDOWN_SECONDS * 1000);
    } else {
      const detail: string = res.response?.detail ?? '';
      toastError('Failed to send code', { description: detail });
      // Same throttle the backend enforces either way — reflected here too
      // so a resend/number-switch attempt is disabled proactively instead
      // of only failing after the fact.
      if (detail.toLowerCase().includes('daily limit')) {
        setDailyLimitMessage(detail);
      } else if (detail.toLowerCase().includes('wait 60 seconds') || res.statusCode === 429) {
        setCooldownUntil(Date.now() + RESEND_COOLDOWN_SECONDS * 1000);
      }
    }
  };

  const handleVerify = async () => {
    if (!code.trim()) return;
    const res = await verifyOtp.mutateAsync({ phone, code: code.trim() });
    if (res.status === true) {
      success('Phone verified!');
      await refreshUser();
      router.replace('/app');
    } else {
      toastError('Verification failed', { description: res.response?.detail ?? 'Invalid code' });
    }
  };

  if (authLoading || phoneStatusLoading || mailboxesLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Phone className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-lg font-semibold">Verify your phone number</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Free accounts require phone verification to prevent abuse. This is a one-time step, and paid plans are exempt.
        </p>
      </div>

      <div className="space-y-4">
        {step === 'phone' ? (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone number</Label>
              <div className="flex gap-2">
                <CountrySelect value={country} onChange={setCountryOverride} />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="555 000 0000"
                  value={localNumber}
                  onChange={(e) => setLocalNumber(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && isNigeria && handleSend('sms')}
                />
              </div>
            </div>

            {isNigeria ? (
              <Button
                className="w-full"
                onClick={() => handleSend('sms')}
                disabled={sendOtp.isPending || !country || !localNumber.trim() || onCooldown || !!dailyLimitMessage}
              >
                {sendOtp.isPending
                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  : <Phone className="mr-2 h-4 w-4" />}
                {onCooldown ? `Try again in ${remainingSeconds}s` : 'Send verification code'}
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  SMS isn&apos;t available for this number. Choose WhatsApp or Telegram instead.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={channel === 'whatsapp' ? 'default' : 'outline'}
                    className="w-full justify-center gap-2"
                    onClick={() => { setChannel('whatsapp'); handleSend('whatsapp'); }}
                    disabled={sendOtp.isPending || !country || !localNumber.trim() || onCooldown || !!dailyLimitMessage}
                  >
                    <img src="/whatsapp.png" alt="" className="h-4 w-4" />
                    WhatsApp
                  </Button>
                  <Button
                    variant={channel === 'telegram' ? 'default' : 'outline'}
                    className="w-full justify-center gap-2"
                    onClick={() => { setChannel('telegram'); handleSend('telegram'); }}
                    disabled={sendOtp.isPending || !country || !localNumber.trim() || onCooldown || !!dailyLimitMessage}
                  >
                    <img src="/telegram.png" alt="" className="h-4 w-4" />
                    Telegram
                  </Button>
                </div>
                {onCooldown && (
                  <p className="text-xs text-muted-foreground text-center">You can request another code in {remainingSeconds}s.</p>
                )}
              </div>
            )}
            {dailyLimitMessage && (
              <p className="text-xs text-destructive text-center">{dailyLimitMessage}</p>
            )}
          </>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="otp">
                Enter the 6-digit code sent to {phone}{channelUsed ? ` via ${CHANNEL_LABEL[channelUsed]}` : ''}
              </Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleVerify}
              disabled={verifyOtp.isPending || code.length < 4}
            >
              {verifyOtp.isPending
                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                : <ShieldCheck className="mr-2 h-4 w-4" />}
              Verify
            </Button>
            {dailyLimitMessage ? (
              <p className="text-xs text-destructive text-center">{dailyLimitMessage}</p>
            ) : (
              <div className="flex items-center justify-center gap-1 text-xs">
                <span className="text-muted-foreground">Didn&apos;t get a code?</span>
                <button
                  className="text-primary hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed"
                  disabled={onCooldown || sendOtp.isPending}
                  onClick={() => handleSend(channelUsed ?? undefined)}
                >
                  {onCooldown ? `Resend in ${remainingSeconds}s` : 'Resend code'}
                </button>
              </div>
            )}
            <button
              className="w-full text-xs text-muted-foreground hover:underline"
              onClick={() => { setStep('phone'); setCode(''); }}
            >
              Use a different number
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => setShowUpgrade(true)}
          className="block w-full text-center text-xs text-muted-foreground hover:underline pt-3 border-t border-border"
        >
          Upgrade to skip phone verification
        </button>
      </div>

      <UpgradePlanModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        reason="Paid plans skip phone verification entirely — pick one to continue straight to your inbox."
        onUpgraded={() => { setShowUpgrade(false); router.replace('/app'); }}
      />
    </div>
  );
}
