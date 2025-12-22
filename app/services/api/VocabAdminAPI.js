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
  }
};

export default VocabAdminAPI;