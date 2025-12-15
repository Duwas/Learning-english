import api from "../api";

const GrmAPI = {
  getTreeGrammar: () => {
    return api.get('/tree-learn/get-tree-grammar');
  },

  getGrammarByCategory: (id) => {
    return api.get(`/admin/grammarItem/getByTopic/${id}`);
  },
};

export default GrmAPI;