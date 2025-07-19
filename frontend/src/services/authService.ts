import api from "./api";

interface SignupData {
  firstname: string;
  lastname?: string;
  email: string;
  username: string;
  password: string;
  role: string;
  phoneNumber: string;
}

interface SigninData {
  email: string;
  password: string;
}
export const signUp = async(data: SignupData) => {
  const response = await api.post('/signup', data);
  return response.data;
}

export const signin = async(data: SigninData) => {
  const response = await api.post('/login', data);
  return response.data;
}