import api from "../api";

const infoApi = {
  // Lấy profile
  getProfile: (id) =>
    api.get(`/user-profile/get-profile/${id}`),

  /**
   * @param {string|number} id
   * @param {object} textData 
   */
  updateInfo: (id, textData = {}) => {
    return api.put(`/user-profile/update-profile/${id}`, textData);
  },
/**
   * @param {string|number} id
   * @param {File} avatarFile
   */
  updateAvatar: (id, avatarFile) => {
    const formData = new FormData();
    formData.append("avatar", avatarFile); 

    return api.patch(
      `/user-profile/${id}/avatar`, 
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },
  changePassword: (id, oldPassword, newPassword) => {
    return api.put(
      `/user-profile/change-password/${id}`, 
      null, 
      {
        params: {
          oldPassword: oldPassword,
          newPassword: newPassword
        }
      }
    );
  },

  // Xoá user
  delete: (id) =>
    api.delete(`/user-profile/delete/${id}`),
};

export default infoApi;
