import axios from "axios";

const serverData = JSON.parse(localStorage.getItem("serverData"));

const api = axios.create({
  baseURL: "http://" + serverData.serverAddress +"/ws/v2/",
});

export default api;
