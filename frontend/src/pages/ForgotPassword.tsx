import { useState, type FormEvent, type ChangeEvent } from "react";
import { Mail, ArrowRight, CheckCircle, ArrowLeft, Lock, Eye, EyeOff } from "lucide-react";

type ForgotPasswordStepProps = {
  onNext: () => void;
  email: string;
  setEmail: (value: string) => void;
};

const ForgotPasswordStep = ({ onNext, email, setEmail }: ForgotPasswordStepProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("OTP sent to your email!");
        onNext();
      } else {
        alert(data.message || "Failed to send OTP");
      }
    } catch (error) {
      alert("Something went wrong.");
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
        <div className="space-y-6">
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
            onClick={handleSubmit}
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
        </div>

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

type VerifyOTPStepProps = {
  onNext: () => void;
  email: string;
  otp: string;
  setOtp: (value: string) => void;
};

const VerifyOTPStep = ({ onNext, email, otp, setOtp }: VerifyOTPStepProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("OTP verified successfully!");
        onNext();
      } else {
        alert(data.message || "Invalid OTP");
      }
    } catch {
      alert("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        alert("New OTP sent to your email!");
      } else {
        alert("Failed to resend OTP");
      }
    } catch {
      alert("Failed to resend OTP");
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
          <CheckCircle className="h-8 w-8 text-amber-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Verify OTP</h2>
        <p className="text-slate-600">Enter the 6-digit code sent to</p>
        <p className="text-slate-700 font-semibold">{email}</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="otp" className="block text-sm font-semibold text-slate-700">
              Verification Code
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
              className="px-4 py-3 w-full rounded-xl border-2 border-slate-200 text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900 transition-all"
            />
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
        </div>

        <div className="mt-6 text-center">
          <button 
            onClick={handleResendOTP} 
            className="text-amber-600 hover:text-amber-700 font-semibold transition-colors"
          >
            Didn't receive code? Resend
          </button>
        </div>
      </div>
    </div>
  );
};

type ResetPasswordStepProps = {
  email: string;
  otp: string;
};

const ResetPasswordStep = ({ email, otp }: ResetPasswordStepProps) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Password reset successful! Please sign in with your new password.");
        window.location.href = "/signin";
      } else {
        alert(data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
          <Lock className="h-8 w-8 text-amber-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Reset Password</h2>
        <p className="text-slate-600">Enter your new password</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div className="space-y-6">
          {/* New Password Field */}
          <div className="space-y-2">
            <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-700">
              New Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-amber-500 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                value={newPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                className="pl-12 pr-12 py-3 w-full rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">
              Confirm Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-amber-500 transition-colors" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className="pl-12 pr-12 py-3 w-full rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Password Match Indicator */}
          {confirmPassword && (
            <div className={`text-sm ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
              {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
            className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold py-3.5 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative flex items-center justify-center">
              {isLoading ? "Resetting..." : (
                <>
                  Reset Password
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </button>
        </div>

        {/* Password Requirements */}
        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <p className="text-sm font-semibold text-slate-700 mb-2">Password Requirements:</p>
          <ul className="text-sm text-slate-600 space-y-1">
            <li className={newPassword.length >= 6 ? 'text-green-600' : ''}>
              {newPassword.length >= 6 ? '✓' : '•'} At least 6 characters
            </li>
            <li className={newPassword && confirmPassword && newPassword === confirmPassword ? 'text-green-600' : ''}>
              {newPassword && confirmPassword && newPassword === confirmPassword ? '✓' : '•'} Passwords must match
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default function ForgotPasswordFlow() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl"></div>

      <div className="relative z-10 w-full flex items-center justify-center">
        {step === 1 && <ForgotPasswordStep onNext={() => setStep(2)} email={email} setEmail={setEmail} />}
        {step === 2 && <VerifyOTPStep onNext={() => setStep(3)} email={email} otp={otp} setOtp={setOtp} />}
        {step === 3 && <ResetPasswordStep email={email} otp={otp} />}
      </div>
    </div>
  );
}