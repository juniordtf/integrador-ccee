import axios from "axios";

const uploadCertificate = async (formData) => {
  const options = {
    headers: {
      "Content-Type": "multipart/form-data",
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Credentials": "true",
    },
  };

  console.log("@@@@@@@@@@@@@@@@@@@@@");
  console.log(formData);
  console.log("@@@@@@@@@@@@@@@@@@@@@");

  axios({
    method: "post",
    url: "http://localhost:5000/uploadCertificate",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  })
    .then((response) => {
      if (response.status === 200) {
        console.log("Certificate uploaded");
      }
    })
    .catch(function (error) {
      if (error.response) {
        console.log(error.response.status);
      }
    });
};

export const authService = {
  uploadCertificate,
};
