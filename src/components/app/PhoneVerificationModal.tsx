'use client';
import { useState } from 'react';
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
import { useSendOtp, useVerifyOtp } from '@/lib/hooks/usePhoneVerification';
import { useAppToast } from '@/components/ui/app-toast';

interface Props {
  open: boolean;
  token: string;
  onVerified: () => void;
}

export default function PhoneVerificationModal({ open, token, onVerified }: Props) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const { success, error: toastError } = useAppToast();

  const sendOtp = useSendOtp(token);
  const verifyOtp = useVerifyOtp(token);

  const handleSend = async () => {
    if (!phone.trim()) return;
    const res = await sendOtp.mutateAsync(phone.trim());
    if (res.status === true) {
      success('OTP sent to your phone');
      setStep('otp');
    } else {
      toastError('Failed to send OTP', { description: res.response?.detail });
    }
  };

  const handleVerify = async () => {
    if (!code.trim()) return;
    const res = await verifyOtp.mutateAsync({ phone: phone.trim(), code: code.trim() });
    if (res.status === true) {
      success('Phone verified! You can now use your trial account.');
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
            Trial accounts require phone verification to prevent abuse. This is a one-time step.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {step === 'phone' ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 555 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleSend}
                disabled={sendOtp.isPending || !phone.trim()}
              >
                {sendOtp.isPending
                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  : <Phone className="mr-2 h-4 w-4" />}
                Send verification code
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="otp">Enter the 6-digit code sent to {phone}</Label>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
