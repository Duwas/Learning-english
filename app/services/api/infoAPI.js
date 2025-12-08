import api from "../api";

const infoApi = {
  getById: (id) => api.get(`/UserProfile/${id}`),

  getByTaiKhoanId: (taiKhoanId) =>
    api.get(`/UserProfile/taiKhoan/${taiKhoanId}`),

  create: (formData) =>
    api.post(`/UserProfile`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id, formData) =>
    api.put(`/UserProfile/update/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  uploadAvatar: (id, formData) =>
    api.patch(`/UserProfile/avatar-updload/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (id) => api.delete(`/UserProfile/delete/${id}`),
};

export default infoApi;