import axios from "axios";

const api = axios.create({
  //baseURL:  "http://192.168.89.10:8082/api",
  baseURL: "https://nonvoluntary-dianoetically-marilynn.ngrok-free.dev/api",
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);

export default api;