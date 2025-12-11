import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Lock, Mail, Phone, Scale, Eye, EyeOff, CheckCircle, XCircle, AtSign } from "lucide-react";
import { CiUser } from "react-icons/ci";
import Signupui from "@/components/Signupui";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/slices/userSlice";
const API = import.meta.env.VITE_API_URL;

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

type Toast = {
  type: 'success' | 'error';
  message: string;
  show: boolean;
};

const SignUp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<Toast>({ type: 'success', message: '', show: false });
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

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message, show: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      showToast('error', 'Passwords do not match!');
      return;
    }
  
    // Validate role is selected
    if (!formData.role) {
      showToast('error', 'Please select your role');
      return;
    }
  
    setIsLoading(true);
  
    const payload = {
      name: formData.name,
      lastname: formData.lastname,
      email: formData.email,
      username: formData.username,
      password: formData.password,
      role: formData.role,
      phoneNumber: formData.phoneNumber
    };
  
    console.log('Sending signup payload:', {
      ...payload,
      password: '***hidden***' 
    });
  
    try{
      const response = await axios.post(`${API}/api/signup`, payload);
      
      console.log('User signed up, response:', response.data);
      
      const { token, user } = response.data;
  
      if (token && user) {
        localStorage.setItem('token', token);
        dispatch(setUser(user));
        
        showToast('success', 'Account created successfully! Redirecting...');
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        throw new Error("Token or user data missing in signup response.");
      }
    } catch(error: any) {
      console.error('Signup failed:', error.response?.data || error.message);
      
      // Better error handling
      let errorMessage = 'An error occurred during signup.';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 500) {
          errorMessage = 'Server error. Please check console and contact support.';
        } else if (status === 409 || status === 400) {
          errorMessage = data?.message || 'Email, username, or phone number already exists.';
        } else {
          errorMessage = data?.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Check your connection.';
      }
      
      showToast('error', errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-8 right-8 z-50 animate-slide-down">
          <div className={`flex items-start gap-4 px-6 py-4 rounded-xl shadow-2xl border-2 backdrop-blur-sm ${
            toast.type === 'success' 
              ? 'bg-white border-amber-500/30' 
              : 'bg-white border-red-500/30'
          }`}>
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
              toast.type === 'success'
                ? 'bg-gradient-to-br from-amber-500 to-amber-600'
                : 'bg-gradient-to-br from-red-500 to-red-600'
            }`}>
              {toast.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-white" strokeWidth={2.5} />
              ) : (
                <XCircle className="h-5 w-5 text-white" strokeWidth={2.5} />
              )}
            </div>
            <div className="flex-1 pt-0.5">
              <p className={`font-bold text-base mb-0.5 ${
                toast.type === 'success' ? 'text-slate-900' : 'text-slate-900'
              }`}>
                {toast.type === 'success' ? 'Success' : 'Error'}
              </p>
              <p className="text-slate-600 text-sm font-medium">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

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
                <div className="relative group">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-amber-500 transition-colors" />
                  <input
                    type="text"
                    name="username"
                    placeholder="sumitmalik123"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="pl-12 pr-4 py-3 w-full rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900 transition-all"
                  />
                </div>
              </div>
  
              {/* Phone Number */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-amber-500 transition-colors" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="9876543210"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    className="pl-12 pr-4 py-3 w-full rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900 transition-all"
                  />
                </div>
              </div>
  
              {/* Role - Better UI */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">I am a</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'general' }))}
                    className={`py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                      formData.role === 'general'
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-slate-200 text-slate-700 hover:border-amber-300'
                    }`}
                  >
                    Individual
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'lawstudent' }))}
                    className={`py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                      formData.role === 'lawstudent'
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-slate-200 text-slate-700 hover:border-amber-300'
                    }`}
                  >
                    Law Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'lawyer' }))}
                    className={`py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                      formData.role === 'lawyer'
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-slate-200 text-slate-700 hover:border-amber-300'
                    }`}
                  >
                    Lawyer
                  </button>
                </div>
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
  
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold py-3.5 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center justify-center text-lg">
                  {isLoading ? "Creating Account..." : "Create Account"}
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