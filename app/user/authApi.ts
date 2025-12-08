import axios from "axios";

const API_URL = "http://localhost:8082/api/auth";

// ======================= INTERFACE =======================
export interface User {
  id: number;
  email: string;
  name: string;
  phone: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// ======================= API ==============================
export const authApi = {
  // LOGIN
  login: (data: { email: string; password: string }) =>
    axios.post<LoginResponse>(`${API_URL}/login`, data),

  // REGISTER
  register: (data: { email: string; phone:string; password: string; name: string }) =>
    axios.post(`${API_URL}/register`, data),

  // LOGOUT
  logout: () => axios.post(`${API_URL}/logout`),

  // GET PROFILE
  getProfile: () => axios.get<User>(`${API_URL}/profile`),

  // VERIFY OTP
  verifyOtp: (data: { email: string; otp: string }) =>
    axios.post(`${API_URL}/verify-otp`, data),

  // RESEND OTP
  resendOtp: (data: { email: string }) =>
    axios.post(`${API_URL}/resend-otp`, data),

  // CHANGE PASSWORD
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    axios.post(`${API_URL}/change-password`, data),

  // FORGOT PASSWORD
  forgotPassword: (email: string) =>
    axios.post(`${API_URL}/forgot-password`, { email }),
};
