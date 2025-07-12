import { useState, type FormEvent } from "react";
import { signin } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { Scale, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react"


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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit}
      className="bg-white p-8 rounded-2xl w-full max-w-md space-y-4 shadow-lg"
      >
        <h2 className="text-2xl text-center font-semibold text-gray-700">Login</h2>
        <div className="flex flex-col">
          <label htmlFor="email" className="mb-1 text-sm font-medium">Email</label>
          <input 
            type="email" 
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required 
            className="px-4 py-2 rounded border border-gray-300 foucs:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required 
            className="px-4 py-2 rounded border border-gray-300 foucs:outline-none focus:ring-2 focus:ring-blue-500"

          />

        </div>
        <button type="submit" className=" mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-300">Sign In</button>
      </form>
    </div>
  );
};

export default Signin;
