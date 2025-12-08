// ...existing code...
import api from "../api";

/**
 * Lấy toàn bộ topic + group_words
 */
export const getAllTreeVocabulary = async () => {
  try {
    const res = await api.get("/tree-learn/get-tree-vocabulary");
    return res?.data ?? []; // trả về mảng hoặc mảng rỗng nếu không có
  } catch (error) {
    console.error("Error get-tree-vocabulary:", error?.response ?? error);
    return [];
  }
};

/**
 * Lấy 1 topic theo topic_id
 */
export const getTreeTopicById = async (topicId) => {
  try {
    const res = await api.get(`/tree-learn/get-tree-vocabulary/${topicId}`);
    return res?.data ?? null;
  } catch (error) {
    console.error("Error get-topic-id:", error?.response ?? error);
    return null;
  }
};

/**
 * Lấy group word theo ID
 */
export const getGroupWordById = async (groupId) => {
  try {
    const res = await api.get(`/tree-learn/get-group-word/${groupId}`);
    return res?.data ?? null;
  } catch (error) {
    console.error("Error get-group-word:", error?.response ?? error);
    return null;
  }
};