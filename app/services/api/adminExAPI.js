import api from "@/app/services/api";

export const exerciseService = {
  getExercisesByTopic: async (topicId) => {
    return api.get(`/quiz-tree/getByTopic/${topicId}`);
  },
  getById: async (id) => {
    return api.get(`/exercise/getById/${id}`);
  },
  deleteById: async (id) => {
    return api.delete(`/exercise/deleteById/${id}`);
  },
  create: async (params, imageFile, audioFile) => {
    const formData = new FormData();
    if (imageFile) formData.append("image", imageFile);
    if (audioFile) formData.append("audio", audioFile);
    return api.post("/exercise/create", formData, {
      params,
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  update: async (id, params, imageFile, audioFile) => {
    const formData = new FormData();
    if (imageFile) formData.append("image", imageFile);
    if (audioFile) formData.append("audio", audioFile);
    return api.put(`/exercise/update/${id}`, formData, {
      params,
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getQuestionsByExerciseId: async (exerciseId) => {
    return api.get(`/questions/getByQuizId/${exerciseId}`);
  },
  createQuestion: async (payload) => {
    return api.post("/questions/create", payload);
  },
  updateQuestion: async (id, payload) => {
    return api.put(`/questions/update/${id}`, payload);
  },
  deleteQuestion: async (id) => {
    return api.delete(`/questions/deleteById/${id}`);
  },

  getOptionsByQuestionId: async (questionId) => {
    return api.get(`/question-options/get-by-question/${questionId}`);
  },
  createOption: async (payload) => {
    return api.post("/question-options/create", payload);
  },
  deleteOption: async (id) => {
    return api.delete(`/question-options/deleteById/${id}`);
  },
};