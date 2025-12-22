import api from "../api";

const VocabAdminAPI = {

  getAllTreeVocabulary: async () => {
    try {
      const res = await api.get("/tree-learn/get-tree-vocabulary");
      return res?.data ?? [];
    } catch (error) {
      console.error("Error fetching tree vocab:", error);
      return [];
    }
  },

 
  getWordsByGroupId: async (groupId) => {
    try {
      const res = await api.get(`/admin/vocabulary/getByGroup/${groupId}`);
      return res?.data ?? []; // Hoặc res.data.data tùy backend trả về
    } catch (error) {
      console.error("Error fetching words:", error);
      return [];
    }
  },

  createWord: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    return api.post('/admin/vocabulary/createVocabulary', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }); 
  },


  updateWord: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    return api.put(`/admin/vocabulary/update/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // --- 5. XÓA TỪ (Dựa vào ảnh 1) ---
  // Endpoint: /api/admin/vocabulary/deleteById/{id}
  deleteWord: (id) => {
    return api.delete(`/admin/vocabulary/deleteById/${id}`);
  }
};

export default VocabAdminAPI;