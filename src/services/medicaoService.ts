import api from "./api";
import { xml2json } from "xml-js";

const listarMedidasCincoMinutos = async (
  authData,
  codMedidor,
  dataReferencia,
  paginaAtual = 1
): Promise<object> => {
  var options = {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: "listarMedidaCincoMinutos",
    },
    timeout: 60000,
  };

  var xmlBodyStr = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:mh="http://xmlns.energia.org.br/MH/v2" xmlns:oas="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:bm="http://xmlns.energia.org.br/BM/v2" xmlns:bo="http://xmlns.energia.org.br/BO/v2">
    <soapenv:Header>
       <mh:messageHeader>
          <mh:codigoPerfilAgente>${authData.AuthCodigoPerfilAgente}</mh:codigoPerfilAgente>
       </mh:messageHeader>
       <oas:Security>
          <oas:UsernameToken>
             <oas:Username>${authData.AuthUsername}</oas:Username>
             <oas:Password>${authData.AuthPassword}</oas:Password>
          </oas:UsernameToken>
       </oas:Security>
       <mh:paginacao>
          <mh:numero>${paginaAtual}</mh:numero>
          <mh:quantidadeItens>100</mh:quantidadeItens>
       </mh:paginacao>
    </soapenv:Header>	
    <soapenv:Body>
       <bm:listarMedidaCincoMinutosRequest>
          <bm:dataReferencia>${dataReferencia}</bm:dataReferencia>
          <bm:medidor>
             <bo:codigo>${codMedidor}</bo:codigo>
          </bm:medidor>
       </bm:listarMedidaCincoMinutosRequest>
    </soapenv:Body>
 </soapenv:Envelope>`;

  return new Promise((resolve) => {
    api()
      .post("/MedidaCincoMinutosBSv2", xmlBodyStr, options)
      .then((response) => {
        if (response.status === 200) {
          let resBody = Buffer.from(response.data).toString();
          var xml = xml2json(resBody, { compact: true, spaces: 4 });
          var json = JSON.parse(xml);
          var parcelaDeAtivos =
            json["soapenv:Envelope"]["soapenv:Body"][
              "bmv2:listarMedidaCincoMinutosResponse"
            ]["bmv2:medidas"]["bov2:medida"];
          const totalPaginas =
            json["soapenv:Envelope"]["soapenv:Header"]["hdr:paginacao"][
              "hdr:totalPaginas"
            ];
          var responseData = {
            data: parcelaDeAtivos,
            code: response.status,
            totalPaginas,
          };
          resolve(responseData);
        } else {
          var responseDataError = {
            data: codMedidor,
            code: response.status,
            totalPaginas: 0,
          };
          resolve(responseDataError);
        }
      })
      .catch(function (error) {
        if (error.response) {
          console.log(error.response.status);
          var responseData = {
            data: codMedidor,
            code: error.response.status,
            totalPaginas: 0,
          };
          resolve(responseData);
        }
      });
  });
};

export const medicaoService = {
  listarMedidasCincoMinutos,
};
