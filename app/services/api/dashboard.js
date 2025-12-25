import api from "../api";

const dashboardAPI = {
  getstatus: () =>
    api.get(`/admin/dashboard/stats`),

  getuserstatus: () =>
    api.get("/admin/dashboard/user-stats"),
  getAllUsers: () => api.get("/auth/all"),
  updateStatusAccount: (id) => {
    return api.put(`/auth/status-account/${id}`);
  },
deleteAccount: (id) => {
    return api.delete(`/auth/${id}`);
  },
  
};

export default dashboardAPI;