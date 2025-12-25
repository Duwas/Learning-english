import api from "@/app/services/api";

export const topicService = {
  // --- HÀM CREATE ĐÃ SỬA ---
  create: async (params) => {
    const { skillId, levelId, name, description, imageFile } = params;

    // 1. Đưa các tham số text vào URL (Query String) theo đúng Swagger
    const queryParams = new URLSearchParams();
    queryParams.append("skillId", skillId);
    queryParams.append("name", name);
    queryParams.append("description", description || "");

    if (levelId !== null && levelId !== undefined && levelId !== "") {
      queryParams.append("levelId", levelId);
    }    

    // 2. Chỉ đưa File vào FormData (Body)
    const formData = new FormData();
    console.log(imageFile);
    
    if (imageFile) {
      // Key là "image" giống trong Swagger: image string($binary)
      formData.append("image", imageFile);
    }

    // 3. Gọi API
    // LƯU Ý: headers "Content-Type" phải là undefined để axios/browser tự thêm boundary
    return api.post(`/admin/topic/create?${queryParams.toString()}`, formData, {
      headers: {
        "Content-Type": undefined,
      },
    });
  },

  // --- HÀM UPDATE ĐÃ SỬA (CHO ĐỒNG BỘ) ---
  update: async (id, params) => {
    const { skillId, levelId, name, description, imageFile } = params;

    const queryParams = new URLSearchParams();
    
    if (skillId) queryParams.append("skillId", skillId);
    if (name) queryParams.append("name", name);
    if (levelId !== null && levelId !== undefined && levelId !== "") {
      queryParams.append("levelId", levelId);
    }
    queryParams.append("description", description || "");

    const formData = new FormData();
    if (imageFile) {
      formData.append("image", imageFile);
    }

    return api.put(`/admin/topic/update/${id}?${queryParams.toString()}`, formData, {
      headers: {
        "Content-Type": undefined,
      },
    });
  },

  deleteTopic: async (id) => {
    return api.delete(`/admin/topic/deleteById/${id}`);
  },

  getBySkillAndLevel: (skillId, levelId) => {
    return api.get(`/admin/topic/get-by-skill-level/${skillId}/${levelId}`);
  },

  getBySkill: (skillId) => {
    return api.get(`/admin/topic/get-by-skill/${skillId}`);
  },

  getAllSkills: async () => {
    return api.get("/admin/skill/getAll");
  },

  getAllLevels: async () => {
    return api.get("/admin/level/getAll");
  },

  getSkillById: async (id) => {
    return api.get(`/admin/skill/getById/${id}`);
  },
};