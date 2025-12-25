import api from "../api";

const VocabAdminAPI = {
  getAllTreeVocabulary: async () => {
    try {
      const res = await api.get("/tree-learn/get-tree-vocabulary");
      return res?.data ?? [];
    } catch (error) {
      console.error("Lỗi lấy Tree:", error);
      return [];
    }
  },
  getWordsByGroupId: async (groupId) => {
    try {
      const res = await api.get(`/admin/vocabulary/getByGroup/${groupId}`);
    
      return res?.data ?? [];
    } catch (error) {
      console.error("Lỗi lấy Words:", error);
      return [];
    }
  },
  createWord: (data) => {
    // Backend yêu cầu JSON body: { word, pron, meaningVn, topicId, groupWord, ... }
    return api.post('/admin/vocabulary/createVocabulary', data); 
  },
  updateWord: (id, data) => {
    return api.put(`/admin/vocabulary/update/${id}`, data);
  },
  deleteWord: (id) => {
    return api.delete(`/admin/vocabulary/deleteById/${id}`);
  },

  import: (file) => {
    const formData = new FormData();
    formData.append("file", file); 
    return api.post('/admin/vocabulary/upload');
  },

  export: () => {
  return api.post('/admin/vocabulary/export/xlsx', {}, { responseType: 'blob' })
    .then((res) => {
      // Tạo blob từ response
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'vocabulary.xlsx'); // tên file
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url); // giải phóng memory
    })
    .catch((err) => {
      console.error(err);
    });
}

};

export default VocabAdminAPI;