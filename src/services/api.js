import axios from "axios";

const serverData = JSON.parse(localStorage.getItem("serverData"));
const serverAddress = serverData !== null ? serverData.serverAddress : "localhost:5000";
const api = axios.create({
  baseURL: "http://" + serverAddress +"/ws/v2/",
});

export default api;
