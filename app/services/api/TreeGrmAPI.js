import api from "../api";

const GrmAPI = {
  getTreeGrammar: () => {
    return api.get('/tree-learn/get-tree-grammar');
  },

  getGrammarByCategory: (categoryId) => {
    return api.get(`/admin/grammarItem/getByCategory/${categoryId}`);
  },
};

export default GrmAPI;