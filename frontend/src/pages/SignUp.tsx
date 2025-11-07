import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Lock, Mail, Phone, Scale, Eye, EyeOff } from "lucide-react";
import { CiUser } from "react-icons/ci";
import { Checkbox } from "@/components/ui/checkbox";
import Signupui from "@/components/Signupui";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/slices/userSlice";

type FormData = {
  name: string;
  lastname?: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  role: string;
  phoneNumber: string;
  rememberMe: boolean
};

const SignUp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    lastname:'',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: '',
    phoneNumber: '',
    rememberMe: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert(`Password does not match!`);
      return;
    }

    try{
      const response = await axios.post("http://localhost:5000/api/signup", {
        name: formData.name,
        lastname: formData.lastname,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        role: formData.role,
        phoneNumber: formData.phoneNumber
      });
      
      console.log('User signed up, response:', response.data);
      
      const { token, user } = response.data;

      if (token && user) {
        localStorage.setItem('token', token);
        //  Redux store ko naye user ke data se update kara hai
        dispatch(setUser(user));
        alert('User signed up successfully.');
        navigate('/dashboard');
      } else {
        throw new Error("Token or user data missing in signup response.");
      }
    } catch(error: any) {
      console.error('Signup failed:', error.response?.data || error.message);
      alert(error.response?.data.message || 'An error occurred during signup.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      {/* Left side - Signupui Component */}
      <div className="hidden lg:block">
        <Signupui />
      </div>
  
      {/* Right side - Sign up form */}
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
              <Scale className="h-10 w-10 text-white" strokeWidth={2} />
            </Link>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Create Your Account</h1>
            <p className="text-slate-600 text-lg">Join Legal Guide to access your legal dashboard</p>
          </div>
  
          {/* Form card */}
          <div className="bg-white p-8 shadow-2xl border border-slate-200 rounded-2xl animate-slide-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Sign Up</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-amber-600 mx-auto mt-2 rounded-full"></div>
              </div>
  
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">First Name</label>
                  <div className="relative group">
                    <CiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-amber-500 transition-colors" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Sumit"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="pl-12 pr-4 py-3 w-full rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Last Name</label>
                  <div className="relative group">
                    <CiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-amber-500 transition-colors" />
                    <input
                      type="text"
                      name="lastname"
                      placeholder="Malik"
                      value={formData.lastname}
                      onChange={handleChange}
                      required
                      className="pl-12 pr-4 py-3 w-full rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900 transition-all"
                    />
                  </div>
                </div>
              </div>
  
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-amber-500 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-12 pr-4 py-3 w-full rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900 transition-all"
                  />
                </div>
              </div>
  
              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="pl-4 pr-4 py-3 w-full rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900 transition-all"
                />
              </div>
  
              {/* Phone Number */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-amber-500 transition-colors" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="+91 9876543210"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    className="pl-12 pr-4 py-3 w-full rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900 transition-all"
                  />
                </div>
              </div>
  
              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">I am a</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 w-full rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900 transition-all"
                >
                  <option value="">Select your Role</option>
                  <option value="general">Individual seeking legal help</option>
                  <option value="lawstudent">Law Student</option>
                  <option value="lawyer">Lawyer</option>
                </select>
              </div>
  
              {/* Passwords */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-amber-500 transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create Password"
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
  
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Confirm Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-amber-500 transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
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
              </div>
  
              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, rememberMe: checked as boolean }))
                  }
                  className="border-slate-300 mt-0.5 cursor-pointer"
                />
                <label htmlFor="remember" className="font-medium text-slate-700 text-sm">
                  I agree to the{" "}
                  <span className="text-amber-600 hover:text-amber-700">Terms</span> and{" "}
                  <span className="text-amber-600 hover:text-amber-700">Privacy Policy</span>
                </label>
              </div>
  
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold py-3.5 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center justify-center text-lg">
                  Create Account
                </span>
              </button>
            </form>
  
            {/* Divider */}
            <div className="mt-8">
              {/* Sign in link */}
              <div className="mt-8 text-center">
                <p className="text-slate-600">
                  Already have an account?{" "}
                  <Link to="/signin" className="text-amber-600 hover:text-amber-700 font-bold transition-colors">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );  
};

export default SignUp;

