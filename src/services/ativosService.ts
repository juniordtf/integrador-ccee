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
    api
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
            var responseData = {ativos, totalPaginas};
          resolve(responseData);
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

export const ativosService = {
  listarAtivosDeMedicao,
};
