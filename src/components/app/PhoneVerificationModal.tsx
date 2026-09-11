'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Phone, ShieldCheck } from 'lucide-react';
import { useSendOtp, useVerifyOtp, type PhoneChannel } from '@/lib/hooks/usePhoneVerification';
import { useAppToast } from '@/components/ui/app-toast';
import { CountrySelect } from '@/components/ui/country-select';
import { useDetectCountry, type Country } from '@/lib/hooks/useCountries';

// SMS delivery only reaches Nigerian numbers today (Termii) — everyone else
// picks WhatsApp or Telegram (VerifyWay) instead of hitting a silent failure.
const CHANNEL_LABEL: Record<PhoneChannel, string> = {
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
};

interface Props {
  open: boolean;
  token: string;
  onVerified: () => void;
}

export default function PhoneVerificationModal({ open, token, onVerified }: Props) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [country, setCountry] = useState<Country | null>(null);
  const [localNumber, setLocalNumber] = useState('');
  const phone = `${country?.phonecode ?? ''}${localNumber.replace(/^0+/, '')}`;
  const [code, setCode] = useState('');
  const [channel, setChannel] = useState<'whatsapp' | 'telegram'>('whatsapp');
  const [channelUsed, setChannelUsed] = useState<PhoneChannel | null>(null);
  const { success, error: toastError } = useAppToast();

  const { data: detected } = useDetectCountry();
  useEffect(() => {
    if (detected && !country) setCountry(detected);
  }, [detected, country]);

  const isNigeria = country?.iso2 === 'NG';

  const sendOtp = useSendOtp(token);
  const verifyOtp = useVerifyOtp(token);

  const handleSend = async (explicitChannel?: PhoneChannel) => {
    if (!country || !localNumber.trim()) return;
    const res = await sendOtp.mutateAsync({ phone, channel: explicitChannel });
    if (res.status === true) {
      const used = res.response.channel_used as PhoneChannel;
      setChannelUsed(used);
      success(`Code sent via ${CHANNEL_LABEL[used]}`);
      setStep('otp');
    } else {
      toastError('Failed to send code', { description: res.response?.detail });
    }
  };

  const handleVerify = async () => {
    if (!code.trim()) return;
    const res = await verifyOtp.mutateAsync({ phone, code: code.trim() });
    if (res.status === true) {
      success('Phone verified!');
      onVerified();
    } else {
      toastError('Verification failed', { description: res.response?.detail ?? 'Invalid code' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>Verify your phone number</DialogTitle>
          </div>
          <DialogDescription>
            Free accounts require phone verification to prevent abuse. This is a one-time step, and paid plans are exempt.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {step === 'phone' ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone number</Label>
                <div className="flex gap-2">
                  <CountrySelect value={country} onChange={setCountry} />
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
                  disabled={sendOtp.isPending || !country || !localNumber.trim()}
                >
                  {sendOtp.isPending
                    ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    : <Phone className="mr-2 h-4 w-4" />}
                  Send verification code
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    SMS isn't available for this number. Choose WhatsApp or Telegram instead.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={channel === 'whatsapp' ? 'default' : 'outline'}
                      className="w-full justify-center gap-2"
                      onClick={() => { setChannel('whatsapp'); handleSend('whatsapp'); }}
                      disabled={sendOtp.isPending || !country || !localNumber.trim()}
                    >
                      <img src="/whatsapp.png" alt="" className="h-4 w-4" />
                      WhatsApp
                    </Button>
                    <Button
                      variant={channel === 'telegram' ? 'default' : 'outline'}
                      className="w-full justify-center gap-2"
                      onClick={() => { setChannel('telegram'); handleSend('telegram'); }}
                      disabled={sendOtp.isPending || !country || !localNumber.trim()}
                    >
                      <img src="/telegram.png" alt="" className="h-4 w-4" />
                      Telegram
                    </Button>
                  </div>
                </div>
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
              <button
                className="w-full text-xs text-muted-foreground hover:underline"
                onClick={() => { setStep('phone'); setCode(''); }}
              >
                Use a different number
              </button>
            </>
          )}

          <Link
            href="/app/settings/billing"
            className="block w-full text-center text-xs text-muted-foreground hover:underline pt-1 border-t border-border"
          >
            Upgrade to skip phone verification
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
