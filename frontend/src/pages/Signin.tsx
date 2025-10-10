import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Scale, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import Signupui from "@/components/Signupui";
import axios from "axios";
import { setUser } from "../redux/slices/userSlice";
import { useDispatch } from "react-redux";

type FormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

const Signin = () => {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    const rememberMe = localStorage.getItem("rememberMe");

    if (token && user && rememberMe === "true") {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/login",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      dispatch(setUser(res.data.user));
      localStorage.setItem("token", res.data.token);

      if (formData.rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }

      alert('Sign in Successful');
      console.log("Login successful:", res);
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Signin failed:", error.response?.data || error.message);
      alert("Signin failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      {/* Left side - Signupui Component */}
      <div className="hidden lg:block">
        <Signupui />
      </div>

      {/* Right side - Sign in form */}
      <div className="flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 p-4 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl"></div>
        
        <div className="w-full max-w-md space-y-8 relative z-10">
          {/* Header */}
          <div className="text-center animate-slide-down">
            <Link
              to="/"
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl mb-6 shadow-2xl border-2 border-amber-500/20 hover:scale-105 transition-transform duration-300"
            >
              <Scale className="h-10 w-10 text-amber-400" strokeWidth={2} />
            </Link>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Welcome Back</h1>
            <p className="text-slate-600 text-lg">Sign in to access your legal dashboard</p>
          </div>

          {/* Form card */}
          <div className="bg-white p-8 shadow-2xl border border-slate-200 rounded-2xl animate-slide-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Login</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-amber-600 mx-auto mt-2 rounded-full"></div>
              </div>

              {/* Email field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-amber-500 transition-colors" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-12 pr-4 py-3 w-full rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900 transition-all"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-amber-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
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

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, rememberMe: checked as boolean }))
                    }
                    className="border-slate-300 mt-0.5 cursor-pointer"
                  />
                  <label htmlFor="remember" className="font-medium text-slate-700 cursor-pointer">
                    Remember me
                  </label>
                </div>
                <Link to="/" className="text-amber-600 font-semibold hover:text-amber-700 transition-colors">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold py-3.5 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center justify-center text-lg">
                  {isLoading ? "Signing in..." : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-500 font-medium">Or continue with</span>
                </div>
              </div>

              {/* Social buttons */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <button className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-medium text-slate-700">
                  <FaGoogle className="h-5 w-5 text-red-500" />
                  <span>Google</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-medium text-slate-700">
                  <FaFacebook className="h-5 w-5 text-blue-600" />
                  <span>Facebook</span>
                </button>
              </div>

              {/* Sign up link */}
              <div className="mt-8 text-center">
                <p className="text-slate-600">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-amber-600 hover:text-amber-700 font-bold transition-colors">
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Terms & Privacy */}
          <div className="text-center text-sm text-slate-500">
            <p>
              By signing in, you agree to our{" "}
              <Link to="/terms" className="text-amber-600 hover:text-amber-700 font-medium transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-amber-600 hover:text-amber-700 font-medium transition-colors">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;