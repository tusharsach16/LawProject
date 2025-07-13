import { useState, type FormEvent } from "react";
import { signin } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { Scale, Mail, Lock, Eye, EyeOff, CheckIcon, ArrowRight } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";


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
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await signin({
        email: formData.email,
        password: formData.password
      });

      // local storage
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      alert('Sign in Succesfull')
      console.log("Login successful:", res);
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Signin failed:", error.response?.data || error.message);
      alert("Signin failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-8">
      <div className="text-center mb-8">
        <Link to='/' className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4">
          <Scale className="h-8 w-8 text-white" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
        <p className="text-gray-600">Sign in to access your legal dashboard</p>
      </div>

      <form onSubmit={handleSubmit}
      className="bg-white p-8 rounded-2xl w-full max-w-md space-y-4 shadow-2xl "
      >
        <h2 className="text-2xl text-center font-semibold text-gray-700">Login</h2>
        <div className="flex flex-col">
          <label htmlFor="email" className="mb-1 text-sm font-medium">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input 
              type="email" 
              id="email"
              name="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={handleChange}
              required 
              className="pl-10 pr-4 py-2 w-full rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
        </div>
        <div className="flex flex-col">
          <label htmlFor="password">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input 
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required 
              className="pl-10 pr-4 py-2 w-full rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4"/>}
            </button>
          </div>

        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Checkbox
              id="remember"
              checked={formData.rememberMe}
              onCheckedChange={(checked) => setFormData((prev) => ({...prev, rememberMe: checked as boolean}))}
              className="border-black md:mt-0.5 cursor-pointer" />
            <span className="ml-2 text-sm font-semibold">Remember me</span>
          </div>
          <div>
            <Link to='/' className="text-sm font-semibold text-black">
              Forgot Password?
            </Link>
          </div>

        </div>
        <button
         type="submit"
         disabled={isLoading}
         className=" mt-2 w-full bg-black text-white font-semibold py-2 px-4 rounded transition duration-300">
          {isLoading ? ("Signin in...") : (
            <div className="flex items-center justify-center group text-white font-semibold cursor-pointer">
              Signin
              <ArrowRight className="ml-2 h-4 w-4 mt-0.5 transform group-hover:translate-x-2 transition-transform duration-200"/>
            </div>
          )}
        </button>
      </form>
    </div>
  );
};

export default Signin;
