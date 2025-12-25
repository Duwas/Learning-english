import api from "@/app/services/api";

export const exerciseService = {
  getExercisesByTopic: async (topicId) => {
    return api.get(`/quiz-tree/getByTopic/${topicId}`);
  },
  getExercisesByTopic1: async (topicId) => {
    return api.get(`/exercise/getByTopic/${topicId}`);
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
    params: {
      title: params.title,
      type: Number(params.type),
      groupWord: params.groupWord ?? 0,
      topicId: Number(params.topicId),
      description: params.description ?? "",
    },
  });
},


update: async (id, params, imageFile, audioFile) => {
  if (!id) throw new Error("Missing exercise id");

  const formData = new FormData();
  if (imageFile) formData.append("image", imageFile);
  if (audioFile) formData.append("audio", audioFile);

  return api.put(`/exercise/update/${Number(id)}`, formData, {
    params: {
      title: params.title,
      type: Number(params.type),
      groupWord: params.groupWord ?? 0,
      topicId: Number(params.topicId),
      description: params.description ?? "",
    },
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
    return api.get(`/question-options/getByQuestionId/${questionId}`);
  },
  createOption: async (payload) => {
    return api.post("/question-options/create", payload);
  },
  updateOptions: async (id, payload) => {
    return api.put(`/question-options/update/${id}`, payload);
  },
  deleteOption: async (id) => {
    return api.delete(`/question-options/delete/${id}`);
  },
  import: (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post(
    "/quiz-tree/upload-quiz-json",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
},

  export: () => {
  return api.post('/quiz-tree/export/xlsx', {}, { responseType: 'blob' })
    .then((res) => {
      // Tạo blob từ response
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'quiz-tree.xlsx'); // tên file
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