// FILE: /app/services/topicService.js
import api from "@/app/services/api";

export const topicService = {
  create: async (params) => {
    const { skillId, levelId, name, description, imageFile } = params;

    const queryParams = new URLSearchParams({
      skillId: skillId,
      levelId: levelId,
      name: name,
      description: description,
    }).toString();

    const formData = new FormData();
    
    if (imageFile) {
      formData.append("image", imageFile);
    }

    return api.post(`/admin/topic/create?${queryParams}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  getBySkillAndLevel: (skillId, levelId) => {
    return api.get(`/admin/topic/get-by-skill-level/${skillId}/${levelId}`);
  },
  deleteTopic: async (id) => {
    return api.delete(`/admin/topic/deleteById/${id}`);
  },
  update: async (id, params) => {
    const { skillId, levelId, name, description, imageFile } = params;


    const queryParams = new URLSearchParams({
      skillId: skillId,
      levelId: levelId,
      name: name,
      description: description,
    }).toString();

    const formData = new FormData();
    if (imageFile) {
      formData.append("image", imageFile);
    }
    return api.put(`/admin/topic/update/${id}?${queryParams}`, formData, {
      headers: {
        "Content-Type": undefined, // Để browser tự xử lý boundary
      },
    });
  },
};