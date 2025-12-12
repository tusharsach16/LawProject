import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { Mail, ArrowRight, ArrowLeft, ShieldCheck, Clock } from "lucide-react";
import ResetPasswordStep from "./ResetPasswordStep";
import { useToast } from "../components/useToast";
const API = import.meta.env.VITE_API_URL;

// Step 1: Enter Email
type ForgotPasswordStepProps = {
  onNext: () => void;
  email: string;
  setEmail: (value: string) => void;
};

const ForgotPasswordStep = ({ onNext, email, setEmail }: ForgotPasswordStepProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.show('Please enter your email address', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.show('OTP sent to your email!', 'success');
        setTimeout(() => onNext(), 1500);
      } else {
        toast.show(data.message || 'Failed to send OTP', 'error');
      }
    } catch (error) {
      toast.show('Something went wrong. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
          <Mail className="h-8 w-8 text-amber-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Forgot Password?</h2>
        <p className="text-slate-600">Enter your email to receive a verification code</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-amber-500 transition-colors" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                className="pl-12 pr-4 py-3 w-full rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold py-3.5 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative flex items-center justify-center">
              {isLoading ? "Sending..." : (
                <>
                  Send Verification Code
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/signin" className="text-amber-600 hover:text-amber-700 font-semibold transition-colors inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign In
          </a>
        </div>
      </div>
    </div>
  );
};

// Step 2: Verify OTP
type VerifyOTPStepProps = {
  onNext: () => void;
  email: string;
  otp: string;
  setOtp: (value: string) => void;
};

const VerifyOTPStep = ({ onNext, email, otp, setOtp }: VerifyOTPStepProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const toast = useToast();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleSubmit = async () => {
    if (!otp || otp.length !== 6) {
      toast.show('Please enter a valid 6-digit OTP', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API}/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.show('OTP verified successfully!', 'success');
        setTimeout(() => onNext(), 1000);
      } else {
        toast.show(data.message || 'Invalid OTP', 'error');
      }
    } catch {
      toast.show('Something went wrong. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    try {
      const response = await fetch(`${API}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setCanResend(false);
        setCountdown(60);
        toast.show('New OTP sent! Check your email.', 'success');
      } else {
        toast.show(data.message || 'Failed to resend OTP', 'error');
      }
    } catch {
      toast.show('Failed to resend OTP. Please try again.', 'error');
    }
  };

  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@');
    const maskedUsername = username.substring(0, 3) + '***';
    return `${maskedUsername}@${domain}`;
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
          <ShieldCheck className="h-8 w-8 text-amber-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Verify OTP</h2>
        <p className="text-slate-600">Enter the 6-digit code sent to</p>
        <p className="text-slate-700 font-semibold mt-1">{maskEmail(email)}</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="otp" className="block text-sm font-semibold text-slate-700">
              Enter OTP
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              maxLength={6}
              placeholder="000000"
              className="text-center text-2xl tracking-widest py-4 w-full rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900 transition-all font-mono"
            />
            <p className="text-xs text-slate-500 text-center">{otp.length}/6 digits</p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading || otp.length !== 6}
            className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold py-3.5 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative flex items-center justify-center">
              {isLoading ? "Verifying..." : (
                <>
                  Verify Code
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </button>

          <div className="text-center pt-2 border-t border-slate-200">
            <p className="text-sm text-slate-600 mb-3 mt-4">Didn't receive the code?</p>
            <button
              onClick={handleResendOTP}
              disabled={!canResend}
              className="text-sm font-semibold text-amber-600 hover:text-amber-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              {canResend ? "Resend OTP" : `Resend OTP in ${countdown}s`}
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> The OTP will expire in 5 minutes.
          </p>
        </div>
      </div>
    </div>
  );
};

// Main Component - ForgotPassword (default export)
const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center p-4 relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl"></div>

      <div className="relative z-10 w-full flex items-center justify-center">
        {step === 1 && <ForgotPasswordStep onNext={() => setStep(2)} email={email} setEmail={setEmail} />}
        {step === 2 && <VerifyOTPStep onNext={() => setStep(3)} email={email} otp={otp} setOtp={setOtp} />}
        {step === 3 && <ResetPasswordStep email={email} otp={otp} />}
      </div>
    </div>
  );
};

export default ForgotPassword;