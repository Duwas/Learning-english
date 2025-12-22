import api from "../api";

const topbarApi = {
  getAll: () => api.get("/topbar-controller/get-topbar"),

  // Lấy 1 skill theo id (FE xử lý)
  getById: (id) =>
    api.get("/topbar-controller/get-topbar").then((res) =>
      res.data.find((x) => x.skillId === id)
    ),

  getLevelsBySkill: (id) =>
    api.get("/topbar-controller/get-topbar").then((res) => {
      const skill = res.data.find((x) => x.skillId === id);
      return skill ? skill.levels : [];
    }),

  getTopicsBySkillLevel: (skill, level) =>
    fetch(
      `/admin/topic/get-by-skill-level/${skill}/${level}`
    ).then((res) => res.json()),

  // Không dùng (BE không hỗ trợ)
  createSkill: () => Promise.reject("API không hỗ trợ"),
  updateSkill: () => Promise.reject("API không hỗ trợ"),
  deleteSkill: () => Promise.reject("API không hỗ trợ"),
};

export default topbarApi;
