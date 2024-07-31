import axios from "axios";

const medApi = () => {
  const serverData = JSON.parse(localStorage.getItem("serverData"));
  const serverAddress =
    serverData !== null ? serverData.serverAddress : "localhost:5000";
  const axiosInstance = axios.create({
    baseURL: "http://" + serverAddress + "/ws/medc/",
  });

  return axiosInstance;
};

export default medApi;
