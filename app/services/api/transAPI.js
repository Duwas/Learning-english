import api from '../api';

const transAPI = {
  translate: async ({ text, source_lang, target_lang }) => {
    const res = await api.post('/speaking/translate', {
      text,
      source_lang,
      target_lang
    });
    return res.data; 
  },
};

export default transAPI;
