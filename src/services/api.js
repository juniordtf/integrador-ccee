import axios from "axios";

const api = () => {
  const serverData = JSON.parse(localStorage.getItem("serverData"));
  const serverAddress =
    serverData !== null ? serverData.serverAddress : "localhost:5000";
  const axiosInstance = axios.create({
    baseURL: "http://" + serverAddress + "/ws/v2/",
  });

  return axiosInstance;
};

export default api;
