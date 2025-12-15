import api from "../api";

const flashAPI = {
  getGroupWord: (idGroup) =>
    api.get(`/admin/vocabulary/getByGroup/${idGroup}`),

  getTreeVocabulary: () =>
    api.get("/tree-learn/get-tree-vocabulary"),

  getQuizGrammar: (idGroup) =>
    api.get(`/quiz-tree/getByTopic/${idGroup}`),

  getQuizByGroup: (idGroup) =>
    api.get(`/quiz-tree/getByGroupWord/${idGroup}`),

  submitQuiz: (payload) =>
    api.post("/submit-quiz/submit-quiz", payload),

  submitSpeaking(formData, exerciseId) {
  return api.post(
    `/submit-quiz/submit-speaking/${exerciseId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
},
  submitWriting(payload) {
   
    return api.post("/submit-quiz/submit-writing", payload);
  },

};

export default flashAPI;
