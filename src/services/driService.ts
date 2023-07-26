import api from "./api";
import { xml2json } from "xml-js";

const listarResultadoDeRelatorio = async (
  authData,
  eventoContabil,
  idQuadro,
  idRelatorio,
  codAgente,
  paginaAtual = 1
): Promise<object> => {
  var options = {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: "listarResultadoRelatorio",
    },
  };

  var xmlBodyStr = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:mhv2="http://xmlns.energia.org.br/MH/v2" xmlns:oas="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:bmv2="http://xmlns.energia.org.br/BM/v2" xmlns:bov2="http://xmlns.energia.org.br/BO/v2">
   <soapenv:Header>
      <mhv2:messageHeader>
         <mhv2:codigoPerfilAgente>${authData.AuthCodigoPerfilAgente}</mhv2:codigoPerfilAgente>
      </mhv2:messageHeader>
      <oas:Security>
         <oas:UsernameToken>
            <oas:Username>${authData.AuthUsername}</oas:Username>
            <oas:Password>${authData.AuthPassword}</oas:Password>
         </oas:UsernameToken>
      </oas:Security>
      <mhv2:paginacao>
         <mhv2:numero>${paginaAtual}</mhv2:numero>
         <mhv2:quantidadeItens>100</mhv2:quantidadeItens>
      </mhv2:paginacao>
   </soapenv:Header>
   <soapenv:Body>
      <bmv2:listarResultadoRelatorioRequest>
         <bmv2:eventoContabil>
            <bov2:codigo>${eventoContabil}</bov2:codigo>
         </bmv2:eventoContabil>
         <bmv2:quadro>
            <bov2:id>${idQuadro}</bov2:id>
            <bov2:parametros>
               <bov2:parametro>
                  <bov2:nome>CODIGO_AGENTE</bov2:nome>
                  <bov2:valor>${codAgente}</bov2:valor>
               </bov2:parametro>
            </bov2:parametros>
         </bmv2:quadro>
         <bmv2:relatorio>
            <bov2:id>${idRelatorio}</bov2:id>
         </bmv2:relatorio>
      </bmv2:listarResultadoRelatorioRequest>
   </soapenv:Body>
</soapenv:Envelope>`;

  return new Promise((resolve) => {
    api()
      .post("/ResultadoRelatorioBSv2", xmlBodyStr, options)
      .then((response) => {
        if (response.status === 200) {
          let resBody = new Buffer.from(response.data).toString();
          var xml = xml2json(resBody, { compact: true, spaces: 4 });
          var json = JSON.parse(xml);
          var resultados =
            json["soapenv:Envelope"]["soapenv:Body"][
              "bmv2:listarResultadoRelatorioResponse"
            ]["bmv2:resultados"]["bov2:resultadoRelatorio"];
          const totalPaginas =
            json["soapenv:Envelope"]["soapenv:Header"]["hdr:paginacao"][
              "hdr:totalPaginas"
            ];
          var responseData = {
            data: resultados,
            code: response.status,
            totalPaginas,
          };
          resolve(responseData);
        } else {
          var responseData = {
            data: codAgente,
            code: response.status,
            totalPaginas: 0,
          };
          resolve(responseData);
        }
      })
      .catch(function (error) {
        if (error.response) {
          console.log(error.response.status);
          var responseData = {
            data: codAgente,
            code: error.response.status,
            totalPaginas: 0,
          };
          resolve(responseData);
        }
      });
  });
};

export const driService = {
  listarResultadoDeRelatorio,
};
