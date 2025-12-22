import api from "../api";

const GrmAPI = {
  getTreeGrammar: () => {
    return api.get('/tree-learn/get-tree-grammar');
  },

  getGrammarByCategory: (id) => {
    return api.get(`/admin/grammarItem/getByTopic/${id}`);
  },
  // --- CREATE ---
  createGrammar: (data) => {
    // data: { topicId, title, structure, explanation, example, tip, imageUrl }
    return api.post('/admin/grammarItem/create', data); 
  },

  // --- UPDATE ---
  updateGrammar: (id, data) => {
    return api.put(`/admin/grammarItem/update/${id}`, data);
  },

  // --- DELETE ---
  deleteGrammar: (id) => {
    return api.delete(`/admin/grammarItem/delete/${id}`);
  }
};


export default GrmAPI;