import api from "../api";
const GrmAPI = {
  getGrammarByCategory: (categoryId) => {
    return api.get(`/admin/grammarItem/getByCategory/${categoryId}`);
  },
};

export default GrmAPI;