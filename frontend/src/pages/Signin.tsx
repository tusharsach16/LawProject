import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Scale, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import Signupui from "@/components/Signupui";
import axios from "axios";



type FormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

const Signin = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
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

    if(token && user && rememberMe === "true") {
      // User is already logged in, redirect to dashboard
      navigate("/dashboard1");
    }
  }, [navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:3000/api/login", 
        {
          email: formData.email,
          password: formData.password,
        }
      )
      // const {token, user} = res.data

      // local storage
      localStorage.setItem("token", res.data.token);
      // localStorage.setItem("user", JSON.stringify(res.data.user));
      
      if (formData.rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }

      alert('Sign in Succesfull')
      console.log("Login successful:", res);
      navigate("/dashboard1");
    } catch (error: any) {
      console.error("Signin failed:", error.response?.data || error.message);
      alert("Signin failed. Please try again.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      <div className="hidden lg:block">
        <Signupui/>
      </div>
      <div className="flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4"
            >
              <Scale className="h-8 w-8 text-white" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
            <p className="mt-1 text-gray-600">Sign in to access your legal dashboard</p>
          </div>

          <div className="bg-white p-6 sm:p-8 shadow-xl border-2 border-gray-200 rounded-xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-2xl font-semibold text-center text-gray-700">Login</h2>

              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-10 pr-10 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, rememberMe: checked as boolean }))
                    }
                    className="border-black mt-0.5 cursor-pointer"
                  />
                  <label htmlFor="remember" className="font-medium text-gray-700">Remember me</label>
                </div>
                <Link to="/" className="text-black font-semibold hover:underline">Forgot Password?</Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white font-semibold py-2 rounded-md transition duration-300 hover:bg-gray-800"
              >
                {isLoading ? "Signing in..." : (
                  <span className="flex items-center justify-center">
                    Signin
                    <ArrowRight className="ml-2 h-4 w-4 mt-0.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 py-2 px-4 border rounded hover:bg-gray-100">
                  <FaGoogle className="h-4 w-4" />
                  <span className="text-sm font-medium">Google</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-2 px-4 border rounded hover:bg-gray-100">
                  <FaFacebook className="h-4 w-4" />
                  <span className="text-sm font-medium">Facebook</span>
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              By signing in, you agree to our{" "}
              <Link to="/terms" className="text-blue-600 hover:text-blue-700">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-blue-600 hover:text-blue-700">
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
