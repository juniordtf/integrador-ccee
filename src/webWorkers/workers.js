import { cadastrosService } from "../services/cadastrosService.ts";

var bla = async () => {
  // eslint-disable-next-line no-restricted-globals
  self.addEventListener("message", async (e) => {
    // eslint-disable-line no-restricted-globals
    if (!e) return;

    console.log("Bla called: " + JSON.stringify(e.data));
    const users = [];

    const userDetails = {
      name: "Jane Doe",
      email: "jane.doe@gmail.com",
      id: 1,
    };

    for (let i = 0; i < 10000000; i++) {
      userDetails.id = i++;
      userDetails.dateJoined = Date.now();

      users.push(userDetails);
    }

    postMessage(users);
  });
};

var perfis = async () => {
  // eslint-disable-next-line no-restricted-globals
  self.addEventListener("message", async (e) => {
    // eslint-disable-line no-restricted-globals
    if (!e) return;

    let payload = e.data;
    let sourceItems = payload.codAgentes;
    let authData = payload.authData;
    let key = payload.key;

    console.log(key);


    for (const codAgente of sourceItems) {
      var responseData = await cadastrosService.listarPerfis(
        authData,
        codAgente
      );

      console.log(responseData);

      var totalPaginas = responseData.totalPaginas;
      var totalPaginasNumber = totalPaginas._text
        ? parseInt(totalPaginas._text.toString())
        : 0;

      if (totalPaginasNumber > 1) {
        for (
          let paginaCorrente = 1;
          paginaCorrente <= totalPaginasNumber;
          paginaCorrente++
        ) {
          // eslint-disable-next-line no-loop-func
          var responseDataPaginated = await cadastrosService.listarPerfis(
            authData,
            codAgente,
            paginaCorrente
          );

          //handleProfileResponseData(responseDataPaginated, key, codAgente);
        }
      } else {
        //handleProfileResponseData(responseData, key, codAgente);
      }
    }

    postMessage(key);
  });
};

export const workers = {
  bla,
  perfis,
};
