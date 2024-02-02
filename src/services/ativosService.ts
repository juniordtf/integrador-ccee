import api from "./api";
import { xml2json } from "xml-js";

const listarAtivosDeMedicao = async (
  authData,
  perfilAtual,
  inicioVigencia,
  paginaAtual = 1
): Promise<object> => {
  var options = {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: "listarAtivoMedicao",
    },
  };

  var xmlBodyStr = `<soapenv:Envelope
	xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
	xmlns:oas="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"
	xmlns:v2="http://xmlns.energia.org.br/MH/v2"
	xmlns:v21="http://xmlns.energia.org.br/BM/v2"
	xmlns:v22="http://xmlns.energia.org.br/BO/v2">
	<soapenv:Header>
		<v2:messageHeader>
			<v2:codigoPerfilAgente>${authData.AuthCodigoPerfilAgente}</v2:codigoPerfilAgente>
			<v2:versao>2.1</v2:versao>
		</v2:messageHeader>
		<oas:Security>
			<oas:UsernameToken>
				<oas:Username>${authData.AuthUsername}</oas:Username>
				<oas:Password>${authData.AuthPassword}</oas:Password>
			</oas:UsernameToken>
		</oas:Security>
		<v2:paginacao>
			<v2:numero>${paginaAtual}</v2:numero>
			<v2:quantidadeItens>50</v2:quantidadeItens>
		</v2:paginacao>
	</soapenv:Header>
	<soapenv:Body>
		<v21:listarAtivoMedicaoRequest>
			<v21:ativoMedicao>
				<!-- <v22:nome>zz</v22:nome> -->
				<!-- <v22:nomeReduzido>zz</v22:nomeReduzido> -->
				<v22:tipo>
					<v22:descricao>CARGA</v22:descricao>
				</v22:tipo>
				<v22:vigencia>
					<v22:inicio>${inicioVigencia}</v22:inicio> 
				</v22:vigencia>
				<v22:parcelasAtivo>
					<v22:parcelaAtivo>
						<v22:participanteMercado>
							<v22:codigo>${perfilAtual}</v22:codigo>
						</v22:participanteMercado>
					</v22:parcelaAtivo>
				</v22:parcelasAtivo>
			</v21:ativoMedicao>
		</v21:listarAtivoMedicaoRequest>
	</soapenv:Body>
</soapenv:Envelope>`;

  return new Promise((resolve) => {
    api()
      .post("/AtivoMedicaoBSv2", xmlBodyStr, options)
      .then((response) => {
        if (response.status === 200) {
          let resBody = new Buffer.from(response.data).toString();
          var xml = xml2json(resBody, { compact: true, spaces: 4 });
          var json = JSON.parse(xml);
          var ativos =
            json["soapenv:Envelope"]["soapenv:Body"][
              "bmv2:listarAtivoMedicaoResponse"
            ]["bmv2:ativosMedicao"]["bov2:ativo"];
          const totalPaginas =
            json["soapenv:Envelope"]["soapenv:Header"]["mhv2:paginacao"][
              "mhv2:totalPaginas"
            ];
          var responseData = {
            data: ativos,
            code: response.status,
            totalPaginas,
          };
          resolve(responseData);
        } else {
          var responseData = {
            data: perfilAtual,
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
            data: perfilAtual,
            code: error.response.status,
            totalPaginas: 0,
          };
          resolve(responseData);
        }
      });
  });
};

const listarParcelasDeAtivosDeMedicao = async (
  authData,
  codMedidor,
  codParcelaAtivo,
  codAtivoMedicao,
  codPerfil,
  cnpj,
  inicioVigencia,
  paginaAtual = 1
): Promise<object> => {
  var options = {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: "listarParcelaAtivo",
    },
    timeout: 60000,
  };

  codMedidor = codMedidor === undefined ? " " : codMedidor;
  codParcelaAtivo = codParcelaAtivo === undefined ? " " : codParcelaAtivo;
  codAtivoMedicao = codAtivoMedicao === undefined ? " " : codAtivoMedicao;
  codPerfil = codPerfil === undefined ? " " : codPerfil;
  inicioVigencia = inicioVigencia === undefined ? " " : inicioVigencia;
  cnpj = cnpj === undefined ? " " : cnpj;

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
        <mhv2:quantidadeItens>50</mhv2:quantidadeItens>
     </mhv2:paginacao>
  </soapenv:Header>
 <soapenv:Body>
 <bmv2:listarParcelaAtivoRequest>
  <bmv2:codigoMae>${codMedidor}</bmv2:codigoMae>   
<bmv2:periodoReferencia>
<bov2:inicio>${inicioVigencia}</bov2:inicio>
</bmv2:periodoReferencia>
<bmv2:parcelaAtivo>
 <bov2:codigo>${codParcelaAtivo}</bov2:codigo> 
<bov2:participanteMercado>
<bov2:perfis>
<bov2:perfil>
   <bov2:codigo>${codPerfil}</bov2:codigo>  
           </bov2:perfil>    
</bov2:perfis>
</bov2:participanteMercado>
<bov2:ativoMedicao>
 <bov2:codigo>${codAtivoMedicao}</bov2:codigo> 
</bov2:ativoMedicao>
<bov2:identificacao>
   <bov2:numero>${cnpj}</bov2:numero> 
</bov2:identificacao>
</bmv2:parcelaAtivo>
</bmv2:listarParcelaAtivoRequest>
 </soapenv:Body>
</soapenv:Envelope>`;

  return new Promise((resolve) => {
    api()
      .post("/ParcelaAtivoBSv2", xmlBodyStr, options)
      .then((response) => {
        if (response.status === 200) {
          let resBody = new Buffer.from(response.data).toString();
          var xml = xml2json(resBody, { compact: true, spaces: 4 });
          var json = JSON.parse(xml);
          var parcelaDeAtivos =
            json["soapenv:Envelope"]["soapenv:Body"][
              "bmv2:listarParcelaAtivoResponse"
            ]["bmv2:parcelasAtivo"]["bov2:parcelaAtivo"];
          const totalPaginas =
            json["soapenv:Envelope"]["soapenv:Header"]["mh:paginacao"][
              "mh:totalPaginas"
            ];
          var responseData = {
            data: parcelaDeAtivos,
            code: response.status,
            totalPaginas,
          };
          resolve(responseData);
        } else {
          var responseData = {
            data: codMedidor,
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
            data: codMedidor,
            code: error.response.status,
            totalPaginas: 0,
          };
          resolve(responseData);
        }
      });
  });
};

const listarParcelaDeCarga = async (
  authData,
  perfilAtual,
  ativoMedicao,
  inicioVigencia,
  paginaAtual = 1
): Promise<object> => {
  var options = {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: "listarParcelaCarga",
    },
  };

  var xmlBodyStr = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:mhv2="http://xmlns.energia.org.br/MH/v2" xmlns:oas="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:bmv2="http://xmlns.energia.org.br/BM/v2" xmlns:bov2="http://xmlns.energia.org.br/BO/v2">
  <soapenv:Header>
     <mhv2:messageHeader>
        <mhv2:codigoPerfilAgente>${perfilAtual}</mhv2:codigoPerfilAgente>
     </mhv2:messageHeader>
     <oas:Security>
        <oas:UsernameToken>
           <oas:Username>${authData.AuthUsername}</oas:Username>
           <oas:Password>${authData.AuthPassword}</oas:Password>
        </oas:UsernameToken>
     </oas:Security>
     <mhv2:paginacao>
        <mhv2:numero>${paginaAtual}</mhv2:numero>
        <mhv2:quantidadeItens>50</mhv2:quantidadeItens>
     </mhv2:paginacao>
  </soapenv:Header>
 <soapenv:Body>
     <bmv2:listarParcelaCargaRequest>
        <bmv2:parcelaAtivo>
            <!-- <bov2:codigo>909946</bov2:codigo>  -->
           <bov2:ativoMedicao>
               <bov2:numero>${ativoMedicao}</bov2:numero> 
           </bov2:ativoMedicao>
           <bov2:vigencia>
              <!-- <bov2:inicio>2017-03-01T00:00:00</bov2:inicio>
              <bov2:fim>2017-04-01T00:00:00</bov2:fim> -->
           </bov2:vigencia>
        </bmv2:parcelaAtivo>
        <bmv2:tipoRelacionamento>
           <bov2:nome>PROPRIETARIO</bov2:nome>
        </bmv2:tipoRelacionamento>
     </bmv2:listarParcelaCargaRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

  return new Promise((resolve) => {
    api()
      .post("/ParcelaCargaBSv2", xmlBodyStr, options)
      .then((response) => {
        if (response.status === 200) {
          let resBody = new Buffer.from(response.data).toString();
          var xml = xml2json(resBody, { compact: true, spaces: 4 });
          var json = JSON.parse(xml);
          var cargas =
            json["soapenv:Envelope"]["soapenv:Body"][
              "bmv2:listarParcelaCargaResponse"
            ]["bmv2:parcelasCarga"]["bov2:parcelaCarga"];
          const totalPaginas =
            json["soapenv:Envelope"]["soapenv:Header"]["hdr:paginacao"][
              "hdr:totalPaginas"
            ];
          var responseData = {
            data: cargas,
            code: response.status,
            totalPaginas,
          };
          resolve(responseData);
        } else {
          var responseData = {
            data: ativoMedicao,
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
            data: ativoMedicao,
            code: error.response.status,
            totalPaginas: 0,
          };
          resolve(responseData);
        }
      });
  });
};

const listarTopologiaPorAtivo = async (
  authData,
  perfilAtual,
  ativoMedicao,
  inicioVigencia,
  paginaAtual = 1
): Promise<object> => {
  var options = {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: "listarTopologia",
    },
  };

  var xmlBodyStr = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:mh="http://xmlns.energia.org.br/MH/v2" xmlns:oas="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:bm="http://xmlns.energia.org.br/BM/v2" xmlns:bo="http://xmlns.energia.org.br/BO/v2">
  <soapenv:Header>
      <mh:messageHeader>
          <mh:codigoPerfilAgente>${perfilAtual}</mh:codigoPerfilAgente>
      </mh:messageHeader>
      <mh:paginacao>
          <mh:numero>${paginaAtual}</mh:numero>
          <mh:quantidadeItens>50</mh:quantidadeItens>
      </mh:paginacao>
      <oas:Security>
          <oas:UsernameToken>
              <oas:Username>${authData.AuthUsername}</oas:Username>
              <oas:Password>${authData.AuthPassword}</oas:Password>
          </oas:UsernameToken>
      </oas:Security>
  </soapenv:Header>
  <soapenv:Body>
      <bm:listarTopologiaRequest>
          <bm:parcelaAtivo>
              <bo:ativoMedicao>
                  <bo:numero>${ativoMedicao}</bo:numero>
              </bo:ativoMedicao>
          </bm:parcelaAtivo>
          <!-- <bm:periodo>
              <bo:inicio>2012-06-01T00:00:00</bo:inicio>
              <bo:fim>2012-05-01T00:00:00</bo:fim>
          </bm:periodo> -->
          <bm:tipoRelacionamento>
              <!-- PROPRIETARIO ou CONCESSIONARIO  -->
              <bo:nome>PROPRIETARIO</bo:nome>
          </bm:tipoRelacionamento>
      </bm:listarTopologiaRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

  return new Promise((resolve) => {
    api()
      .post("/TopologiaBSv2", xmlBodyStr, options)
      .then((response) => {
        if (response.status === 200) {
          let resBody = new Buffer.from(response.data).toString();
          var xml = xml2json(resBody, { compact: true, spaces: 4 });
          var json = JSON.parse(xml);
          var topologias =
            json["soapenv:Envelope"]["soapenv:Body"][
              "bmv2:listarTopologiaResponse"
            ]["bmv2:topologias"]["bov2:topologia"];
          const totalPaginas =
            json["soapenv:Envelope"]["soapenv:Header"]["hdr:paginacao"][
              "hdr:totalPaginas"
            ];
          var responseData = {
            data: topologias,
            code: response.status,
            totalPaginas,
          };
          resolve(responseData);
        } else {
          var responseData = {
            data: ativoMedicao,
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
            data: ativoMedicao,
            code: error.response.status,
            totalPaginas: 0,
          };
          resolve(responseData);
        }
      });
  });
};

export const ativosService = {
  listarAtivosDeMedicao,
  listarParcelasDeAtivosDeMedicao,
  listarParcelaDeCarga,
  listarTopologiaPorAtivo,
};
