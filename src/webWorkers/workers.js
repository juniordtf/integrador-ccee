import dayjs from "dayjs";

var onMessage = () => {
  // eslint-disable-next-line no-restricted-globals
  self.onmessage( (e) => {
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

const listarParticipantes = () => {
  //setPendingRequests(pendingRequests + 1);
  //   var totalPages =
  //     await cadastrosService.listarParticipantesDeMercado_totalDePaginas(
  //       authData,
  //       "01",
  //       dayjs(date).format("YYYY-MM-DDTHH:mm:ss"),
  //       category
  //     );

  //console.log(totalPages);
  //   const categoryName = classes.find((x) => x.id === category).name;
  //   const key =
  //     "participantes_" + categoryName + "_" + dayjs(date).format("MM/YY");

  //   let keys = [];
  //   if (dataSourceKeys.length === 0) {
  //     keys = [key];
  //   } else {
  //     keys = dataSourceKeys.concat(key);
  //   }
  //   console.log(JSON.stringify(keys));
  //   localStorage.setItem("DATA_SOURCE_KEYS", JSON.stringify(keys));

  // eslint-disable-next-line no-restricted-globals
  self.addEventListener("message", (e) => {
    // eslint-disable-line no-restricted-globals

    console.log("listarParticipantes called");

    if (!e) return;

    console.log("******** Event Data ********");
    console.log(JSON.stringify(e.data));
    console.log("****************************");

    // const participantesData = e.data;
    // let participants = [];
    // let pendingRequests,
    //   itemsProcessed = 0;

    // participantesData.forEach((item, index, array) => {
    //   const cnpj =
    //     item["bov2:parte"]["bov2:pessoaJuridica"]["bov2:identificacoes"] !==
    //     undefined
    //       ? item["bov2:parte"]["bov2:pessoaJuridica"]["bov2:identificacoes"][
    //           "bov2:identificacao"
    //         ]["bov2:numero"]._text.toString()
    //       : "";
    //   const nomeEmpresarial =
    //     item["bov2:parte"]["bov2:pessoaJuridica"][
    //       "bov2:nomeEmpresarial"
    //     ]._text.toString();
    //   const sigla = item["bov2:sigla"]._text.toString();
    //   const codigo = item["bov2:codigo"]._text.toString();
    //   let periodoVigencia =
    //     item["bov2:periodoVigencia"]["bov2:inicio"]._text.toString();
    //   periodoVigencia = dayjs(periodoVigencia).format("DD/MM/YYYY");
    //   const situacao = item["bov2:situacao"]["bov2:descricao"]._text.toString();

    //   const participante = {
    //     cnpj,
    //     nomeEmpresarial,
    //     situacao,
    //     sigla,
    //     codigo,
    //     periodoVigencia,
    //   };
    //   if (participants.length === 0) {
    //     participants = [participante];
    //   } else {
    //     participants = participants.concat(participante);
    //   }
    //   //localStorage.setItem(key, JSON.stringify(participants));
    //   console.log(participants.length);

    //   itemsProcessed++;
    //   if (itemsProcessed === array.length) {
    //     pendingRequests--;
    //   }
    // });

    postMessage(0);
  });
};

export const workers = {
  //listarParticipantes,
  onMessage,
};
