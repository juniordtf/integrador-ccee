import api from "./api";
import { xml2json } from "xml-js";

const listarParticipantesDeMercado = async (
  authData,
  page,
  date,
  category
): Promise<object> => {
  var options = {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: "listarParticipanteMercado",
    },
  };

  var xmlBodyStr = `<soapenv:Envelope
   xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
   xmlns:oas="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"
   xmlns:mh="http://xmlns.energia.org.br/MH/v2"
   xmlns:bm="http://xmlns.energia.org.br/BM/v2"
   xmlns:bo="http://xmlns.energia.org.br/BO/v2">
   <soapenv:Header>
       <mh:messageHeader>
           <mh:codigoPerfilAgente>${authData.AuthCodigoPerfilAgente}</mh:codigoPerfilAgente>
           <mh:versao>2.1</mh:versao>
       </mh:messageHeader>
       <oas:Security>
           <oas:UsernameToken>
               <oas:Username>${authData.AuthUsername}</oas:Username>
               <oas:Password>${authData.AuthPassword}</oas:Password>
           </oas:UsernameToken>
       </oas:Security>
       <mh:paginacao>
           <mh:numero>${page}</mh:numero>
           <mh:quantidadeItens>50000</mh:quantidadeItens>
       </mh:paginacao>
   </soapenv:Header>
   <soapenv:Body>
      <bm:listarParticipanteMercadoRequest>
          <bm:participantesMercado>
               <bo:participanteMercado>
                   <!-- <bo:codigo>1234</bo:codigo> -->
               </bo:participanteMercado>
               <bo:participanteMercado>
                   <!-- <bo:codigo>98765</bo:codigo> -->                   
               </bo:participanteMercado>
           </bm:participantesMercado>
           <bm:identificacoes>
               <bo:identificacao>
                   <!-- <bo:numero>11111111111111</bo:numero> -->                    
               </bo:identificacao>
               <bo:identificacao>
                   <!-- <bo:numero>22222222222222</bo:numero> -->                    
               </bo:identificacao>
           </bm:identificacoes>
           <!-- <bm:sigla>PEPSICO PETROL</bm:sigla> -->
           <bm:classe>
                <bo:codigo>${category}</bo:codigo> 
           </bm:classe>
           <!-- <bm:nomeEmpresarial>NOME EMPRESARIAL</bm:nomeEmpresarial> -->
           <bm:periodoReferencia>
               <bo:inicio>${date}</bo:inicio>  
           </bm:periodoReferencia>
       </bm:listarParticipanteMercadoRequest>
    </soapenv:Body>
  </soapenv:Envelope>`;

  return new Promise((resolve) => {
    api()
      .post("/ParticipanteMercadoBSv2", xmlBodyStr, options)
      .then((response) => {
        var responseData = [];
        if (response.status === 200) {
          let resBody = new Buffer.from(response.data).toString();
          var xml = xml2json(resBody, { compact: true, spaces: 4 });
          var json = JSON.parse(xml);
          var participantes =
            json["soapenv:Envelope"]["soapenv:Body"][
              "bmv2:listarParticipanteMercadoResponse"
            ]["bmv2:participantesMercado"]["bov2:participanteMercado"];
          responseData = { data: participantes, code: 200 };
          resolve(responseData);
        } else {
          responseData = { data: page, code: response.status };
          resolve(responseData);
        }
      })
      .catch(function (error) {
        if (error.response) {
          var responseData = { data: page, code: error.response.status };
          console.log(error.response.status);
          resolve(responseData);
        }
      });
  });
};

const listarParticipantesDeMercado_totalDePaginas = async (
  authData,
  page,
  date,
  category
): Promise<object> => {
  var options = {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: "listarParticipanteMercado",
    },
  };

  var xmlBodyStr = `<soapenv:Envelope
   xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
   xmlns:oas="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"
   xmlns:mh="http://xmlns.energia.org.br/MH/v2"
   xmlns:bm="http://xmlns.energia.org.br/BM/v2"
   xmlns:bo="http://xmlns.energia.org.br/BO/v2">
   <soapenv:Header>
       <mh:messageHeader>
           <mh:codigoPerfilAgente>${authData.AuthCodigoPerfilAgente}</mh:codigoPerfilAgente>
           <mh:versao>2.1</mh:versao>
       </mh:messageHeader>
       <oas:Security>
           <oas:UsernameToken>
               <oas:Username>${authData.AuthUsername}</oas:Username>
               <oas:Password>${authData.AuthPassword}</oas:Password>
           </oas:UsernameToken>
       </oas:Security>
       <mh:paginacao>
           <mh:numero>${page}</mh:numero>
           <mh:quantidadeItens>50000</mh:quantidadeItens>
       </mh:paginacao>
   </soapenv:Header>
   <soapenv:Body>
      <bm:listarParticipanteMercadoRequest>
          <bm:participantesMercado>
               <bo:participanteMercado>
                   <!-- <bo:codigo>1234</bo:codigo> -->
               </bo:participanteMercado>
               <bo:participanteMercado>
                   <!-- <bo:codigo>98765</bo:codigo> -->                   
               </bo:participanteMercado>
           </bm:participantesMercado>
           <bm:identificacoes>
               <bo:identificacao>
                   <!-- <bo:numero>11111111111111</bo:numero> -->                    
               </bo:identificacao>
               <bo:identificacao>
                   <!-- <bo:numero>22222222222222</bo:numero> -->                    
               </bo:identificacao>
           </bm:identificacoes>
           <!-- <bm:sigla>PEPSICO PETROL</bm:sigla> -->
           <bm:classe>
                <bo:codigo>${category}</bo:codigo> 
           </bm:classe>
           <!-- <bm:nomeEmpresarial>NOME EMPRESARIAL</bm:nomeEmpresarial> -->
           <bm:periodoReferencia>
               <bo:inicio>${date}</bo:inicio>  
           </bm:periodoReferencia>
       </bm:listarParticipanteMercadoRequest>
    </soapenv:Body>
  </soapenv:Envelope>`;

  return new Promise((resolve) => {
    api()
      .post("/ParticipanteMercadoBSv2", xmlBodyStr, options)
      .then((response) => {
        if (response.status === 200) {
          let resBody = new Buffer.from(response.data).toString();
          var xml = xml2json(resBody, { compact: true, spaces: 4 });
          var json = JSON.parse(xml);
          var totalPaginas =
            json["soapenv:Envelope"]["soapenv:Header"]["mhv2:paginacao"][
              "mhv2:totalPaginas"
            ]._text.toString();
          resolve(parseInt(totalPaginas));
        } else {
          resolve(null);
        }
      })
      .catch(function (error) {
        if (error.response) {
          console.log(error.response.status);
          console.log(error.response.data);
          resolve(null);
        }
      });
  });
};

const listarParticipantesDeMercadoPorAgente = async (
  authData,
  date,
  agentCode
): Promise<object> => {
  var options = {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: "listarParticipanteMercado",
    },
  };

  var xmlBodyStr = `<soapenv:Envelope
   xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
   xmlns:oas="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"
   xmlns:mh="http://xmlns.energia.org.br/MH/v2"
   xmlns:bm="http://xmlns.energia.org.br/BM/v2"
   xmlns:bo="http://xmlns.energia.org.br/BO/v2">
   <soapenv:Header>
       <mh:messageHeader>
           <mh:codigoPerfilAgente>${authData.AuthCodigoPerfilAgente}</mh:codigoPerfilAgente>
           <mh:versao>2.1</mh:versao>
       </mh:messageHeader>
       <oas:Security>
           <oas:UsernameToken>
               <oas:Username>${authData.AuthUsername}</oas:Username>
               <oas:Password>${authData.AuthPassword}</oas:Password>
           </oas:UsernameToken>
       </oas:Security>
       <mh:paginacao>
           <mh:numero>1</mh:numero>
           <mh:quantidadeItens>50000</mh:quantidadeItens>
       </mh:paginacao>
   </soapenv:Header>
   <soapenv:Body>
      <bm:listarParticipanteMercadoRequest>
          <bm:participantesMercado>
               <bo:participanteMercado>
                    <bo:codigo>${agentCode}</bo:codigo> 
               </bo:participanteMercado>
               <bo:participanteMercado>
                   <!-- <bo:codigo>98765</bo:codigo> -->                   
               </bo:participanteMercado>
           </bm:participantesMercado>
           <bm:identificacoes>
               <bo:identificacao>
                   <!-- <bo:numero>11111111111111</bo:numero> -->                    
               </bo:identificacao>
               <bo:identificacao>
                   <!-- <bo:numero>22222222222222</bo:numero> -->                    
               </bo:identificacao>
           </bm:identificacoes>
           <!-- <bm:sigla>PEPSICO PETROL</bm:sigla> -->
           <bm:classe>
           <!-- <bo:codigo></bo:codigo> -->
           </bm:classe>
           <!-- <bm:nomeEmpresarial>NOME EMPRESARIAL</bm:nomeEmpresarial> -->
           <bm:periodoReferencia>
               <bo:inicio>${date}</bo:inicio>  
           </bm:periodoReferencia>
       </bm:listarParticipanteMercadoRequest>
    </soapenv:Body>
  </soapenv:Envelope>`;

  return new Promise((resolve) => {
    api()
      .post("/ParticipanteMercadoBSv2", xmlBodyStr, options)
      .then((response) => {
        var responseData = [];
        if (response.status === 200) {
          let resBody = new Buffer.from(response.data).toString();
          var xml = xml2json(resBody, { compact: true, spaces: 4 });
          var json = JSON.parse(xml);
          var participantes =
            json["soapenv:Envelope"]["soapenv:Body"][
              "bmv2:listarParticipanteMercadoResponse"
            ]["bmv2:participantesMercado"]["bov2:participanteMercado"];
          responseData = { data: participantes, code: 200 };
          resolve(responseData);
        } else {
          responseData = { data: agentCode, code: response.status };
          resolve(responseData);
        }
      })
      .catch(function (error) {
        if (error.response) {
          var responseData = { data: agentCode, code: error.response.status };
          console.log(error.response.status);
          resolve(responseData);
        }
      });
  });
};

const listarPerfis = async (
  authData,
  agenteAtual,
  paginaAtual = 1
): Promise<object> => {
  var options = {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: "listarPerfilParticipanteMercado",
    },
  };

  var xmlBodyStr = `<soapenv:Envelope
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:oas="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"
  xmlns:mh="http://xmlns.energia.org.br/MH/v2"
  xmlns:bm="http://xmlns.energia.org.br/BM/v2"
  xmlns:bo="http://xmlns.energia.org.br/BO/v2">
  <soapenv:Header>
    <mh:messageHeader>
      <mh:codigoPerfilAgente>${authData.AuthCodigoPerfilAgente}</mh:codigoPerfilAgente>
      <mh:versao>2.1</mh:versao>
    </mh:messageHeader>
    <oas:Security>
      <oas:UsernameToken>
        <oas:Username>${authData.AuthUsername}</oas:Username>
        <oas:Password>${authData.AuthPassword}</oas:Password>
      </oas:UsernameToken>
    </oas:Security>
    <mh:paginacao>
      <mh:numero>${paginaAtual}</mh:numero>
      <mh:quantidadeItens>50</mh:quantidadeItens>
    </mh:paginacao>
  </soapenv:Header>
  <soapenv:Body>
    <bm:listarPerfilParticipanteMercadoRequest>
      <bm:perfilParticipanteMercado>
        <bo:classe>
          <!-- <bo:codigo>4</bo:codigo> -->
        </bo:classe>
        <!-- Codigo do perfil -->
         <!-- <bo:codigo>9999</bo:codigo>  -->
        <bo:fonteEnergia>
          <bo:tipo>
            <!-- <bo:id>3</bo:id> -->
          </bo:tipo>
        </bo:fonteEnergia>
        <bo:periodoVigencia>
          <!-- <bo:inicio>2011-11-01T00:00:00</bo:inicio> -->
        </bo:periodoVigencia>
         <!-- <bo:sigla>SIGLA</bo:sigla>  -->
        <bo:participanteMercado>
          <bo:codigo>${agenteAtual}</bo:codigo>
        </bo:participanteMercado>
      </bm:perfilParticipanteMercado>
    </bm:listarPerfilParticipanteMercadoRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

  return new Promise((resolve) => {
    api()
      .post("/PerfilParticipanteMercadoBSv2", xmlBodyStr, options)
      .then((response) => {
        if (response.status === 200) {
          let resBody = new Buffer.from(response.data).toString();
          var xml = xml2json(resBody, { compact: true, spaces: 4 });
          var json = JSON.parse(xml);
          var perfis =
            json["soapenv:Envelope"]["soapenv:Body"][
              "bmv2:listarPerfilParticipanteMercadoResponse"
            ]["bmv2:perfis"]["bov2:perfil"];
          const totalPaginas =
            json["soapenv:Envelope"]["soapenv:Header"]["mh:paginacao"][
              "mh:totalPaginas"
            ];

          var responseData = {
            data: perfis,
            code: response.status,
            totalPaginas,
          };
          resolve(responseData);
        } else {
          var responseData = {
            data: agenteAtual,
            code: response.status,
            totalPaginas: 0,
          };
          resolve(responseData);
        }
      })
      .catch(function (error) {
        if (error.response) {
          var responseData = {
            data: agenteAtual,
            code: error.response.status,
            totalPaginas: 0,
          };
          console.log(error.response.status);
          resolve(responseData);
        }
      });
  });
};

const listarRepresentacao = async (
  authData,
  paginaAtual = 1
): Promise<object> => {
  var options = {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: "listarRepresentacao",
    },
  };

  var xmlBodyStr = `<soap-env:Envelope xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/">
  <soap-env:Header>
   <ns2:messageHeader xsi:type="ns2:MessageHeaderType" xmlns:ns2="http://xmlns.energia.org.br/MH/v2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <ns2:codigoPerfilAgente>${authData.AuthCodigoPerfilAgente}</ns2:codigoPerfilAgente>
     </ns2:messageHeader>
   <ns1:Security xsi:type="ns1:SecurityHeaderType" xmlns:ns1="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <ns1:UsernameToken>
           <ns1:Username>${authData.AuthUsername}</ns1:Username>
           <ns1:Password>${authData.AuthPassword}</ns1:Password>
        </ns1:UsernameToken>
     </ns1:Security>
   <ns0:paginacao xsi:type="ns0:Pagina" xmlns:ns0="http://xmlns.energia.org.br/MH/v2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <ns0:numero>${paginaAtual}</ns0:numero>
        <ns0:quantidadeItens>50</ns0:quantidadeItens>
     </ns0:paginacao> 
  </soap-env:Header>
  <soap-env:Body>
     <ns0:listarRepresentacaoRequest xmlns:ns0="http://xmlns.energia.org.br/BM/v2"/>
  </soap-env:Body>
</soap-env:Envelope>`;

  return new Promise((resolve) => {
    api()
      .post("/RepresentacaoBSv2", xmlBodyStr, options)
      .then((response) => {
        if (response.status === 200) {
          let resBody = new Buffer.from(response.data).toString();
          var xml = xml2json(resBody, { compact: true, spaces: 4 });
          var json = JSON.parse(xml);
          var representacoes =
            json["soapenv:Envelope"]["soapenv:Body"][
              "bmv2:listarRepresentacaoResponse"
            ]["bmv2:representacoes"]["bov2:representacao"];
          const totalPaginas =
            json["soapenv:Envelope"]["soapenv:Header"]["mhv2:paginacao"][
              "mhv2:totalPaginas"
            ];

          const totalItens =
            json["soapenv:Envelope"]["soapenv:Header"]["mhv2:paginacao"][
              "mhv2:quantidadeTotalItens"
            ];

          var responseData = {
            data: representacoes,
            code: response.status,
            totalPaginas,
            totalItens,
          };
          resolve(responseData);
        } else {
          var responseData = {
            data: 0,
            code: response.status,
            totalPaginas: 0,
            totalItens: 0,
          };
          resolve(responseData);
        }
      })
      .catch(function (error) {
        if (error.response) {
          var responseData = {
            data: 0,
            code: error.response.status,
            totalPaginas: 0,
            totalItens: 0,
          };
          console.log(error.response.status);
          resolve(responseData);
        }
      });
  });
};

export const cadastrosService = {
  listarParticipantesDeMercado,
  listarParticipantesDeMercado_totalDePaginas,
  listarParticipantesDeMercadoPorAgente,
  listarPerfis,
  listarRepresentacao,
};
