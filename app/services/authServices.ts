// services/authService.ts
import axios from "axios";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  // thêm các trường khác nếu cần
}

export interface LoginResponse {
  token: string;
  user: User;
}

// const API_BASE = "https://nonvoluntary-dianoetically-marilynn.ngrok-free.dev/api"; 

const API_BASE = "https://192.168.89.5:8082/api"; 


const authService = {
  login: async (data: LoginData): Promise<LoginResponse> => {
    const res = await axios.post<LoginResponse>(`${API_BASE}/auth/login`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  },

  register: async (data: RegisterData): Promise<User> => {
    const res = await axios.post<User>(`${API_BASE}/register`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  },

  logout: async (): Promise<void> => {
    await axios.post(`${API_BASE}/logout`);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getProfile: async (): Promise<User> => {
    const token = localStorage.getItem("token");
    const res = await axios.get<User>(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};

export default authService;
