import { useState, type FormEvent } from "react";
import { signUp } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Lock, Mail, Phone, Scale, Eye, EyeOff } from "lucide-react";
import { CiUser } from "react-icons/ci";
import { Checkbox } from "@radix-ui/react-checkbox";

type FormData = {
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  role: string;
  phoneNumber: string;
};

const SignUp = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    firstname: '',
    lastname:'',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: '',
    phoneNumber: '',
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
      const user = await signUp({
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        role: formData.role,
        phoneNumber: formData.phoneNumber
      });
      console.log('User signed up: ', user);
      alert('User signed up.');
      navigate('/dashboard');
    } catch(error: any) {
      console.error('Signup failed:', error.response?.data || error.message);
      alert(error.response?.data.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4"
          >
            <Scale className="h-8 w-8 text-white" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Join Legal Guide</h1>
          <p className="mt-1 text-gray-600">Create your account to get started</p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
          <form
            className="space-y-4"
            onSubmit={handleSubmit}
          >
            <h2 className="text-2xl font-bold text-center text-black">Create Account</h2>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label htmlFor="name" className="mb-1 text-sm font-medium">First Name</label>
                <div className="relative">
                  <CiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 h-4 w-4"/>
                  <input
                    type="text"
                    id="name"
                    name="firstname"
                    placeholder="Sumit"
                    value={formData.firstname}
                    onChange={handleChange}
                    required
                    className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label htmlFor="name" className="mb-1 text-sm font-medium">Last Name</label>
                <div className="relative">
                  <CiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 h-4 w-4" />
                  <input
                    type="text"
                    id="name"
                    name="lastname"
                    placeholder="Malik"
                    value={formData.lastname}
                    onChange={handleChange}
                    required
                    className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <label htmlFor="email" className="mb-1 text-sm font-medium">Email Adress</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 h-4 w-4" />
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

            <div className="flex flex-col">
              <label htmlFor="email" className="mb-1 text-sm font-medium">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="phone" className="mb-1 text-sm font-medium">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 h-4 w-4" />
                <input
                  type="tel"
                  id="phone"
                  name="phoneNumber"
                  placeholder="+919876543210"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label htmlFor="role" className="mb-1 text-sm font-medium">I am a</label>
              <select
                name="role"
                id="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Select your Role</option>
                <option value="general">Individual seeking legal help</option>
                <option value="lawstudent">Law Student</option>
                <option value="lawyer">Lawyer</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label htmlFor="password" className="mb-1 text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 h-4 w-4" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Create Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>


              <div className="flex flex-col">
                <label htmlFor="confirmPassword" className="mb-1 text-sm font-medium">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 h-4 w-4"/>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Checkbox className="border-black mt-0.5 cursor-pointer"/>
                <label htmlFor="remember" className="font-medium text-gray-700">Remember me</label>
              </div>
              
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-300"
            >
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
