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
    api
      .post("/ParticipanteMercadoBSv2", xmlBodyStr, options)
      .then((response) => {
        if (response.status === 200) {
          let resBody = new Buffer.from(response.data).toString();
          var xml = xml2json(resBody, { compact: true, spaces: 4 });
          var json = JSON.parse(xml);
          var participantes =
            json["soapenv:Envelope"]["soapenv:Body"][
              "bmv2:listarParticipanteMercadoResponse"
            ]["bmv2:participantesMercado"]["bov2:participanteMercado"];
          resolve(participantes);
        } else {
          resolve(null);
        }
      })
      .catch(function (error) {
        if (error.response) {
          console.log(error.response.status);
          resolve(null);
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
    api
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

const listarPerfis = async (authData, agenteAtual): Promise<object> => {
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
      <mh:numero>1</mh:numero>
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
    api
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
          resolve(perfis);
        } else {
          resolve(null);
        }
      })
      .catch(function (error) {
        if (error.response) {
          console.log(error.response.status);
          resolve(null);
        }
      });
  });
};

export const cadastrosService = {
  listarParticipantesDeMercado,
  listarParticipantesDeMercado_totalDePaginas,
  listarPerfis,
};
