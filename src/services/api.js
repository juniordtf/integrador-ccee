import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/ws/v2/",
});

export default api;
