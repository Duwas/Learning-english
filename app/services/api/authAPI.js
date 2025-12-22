import api from "../api";

const authApi = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  verify_otp: (email, otp) => api.put(`/auth/activate-account/${email}/${otp}`),
  resend_otp: (email) => api.post(`/auth/resend-otp"/ ${email}`),
  forgot_password: (data) => api.post("/auth/forgot-password", data),
  reset_password: (data) => api.post("/auth/reset-password", data),
  getAll: () => api.get("/auth/all"),
};

export default authApi;