import api from "../api";

const flashAPI = {
  getGroupWord: (idGroup) => api.get(`/admin/vocabulary/getByGroup/${idGroup}`),
  
  getTreeVocabulary: () => {
    return api.get('/tree-learn/get-tree-vocabulary');
  },
  getQuizByGroup: (idGroup) => {
    return api.get(`/quiz-tree/getByGroupWord/${idGroup}`);
  },
  submitQuiz: (payload) => {
    return api.post('/submit-quiz/submit-quiz', payload);
  }
};


export default flashAPI;