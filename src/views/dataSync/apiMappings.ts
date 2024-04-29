import { dbPersistance } from "./dbPersistance.ts";
import dayjs from "dayjs";

async function mapResponseToParticipantsData(key, item) {
    const cnpj =
      item["bov2:parte"]["bov2:pessoaJuridica"]["bov2:identificacoes"] !==
      undefined
        ? item["bov2:parte"]["bov2:pessoaJuridica"]["bov2:identificacoes"][
            "bov2:identificacao"
          ]["bov2:numero"]._text.toString()
        : "";
    const nomeEmpresarial =
      item["bov2:parte"]["bov2:pessoaJuridica"][
        "bov2:nomeEmpresarial"
      ]._text.toString();
    const sigla = item["bov2:sigla"]._text.toString();
    const codigo = item["bov2:codigo"]._text.toString();
    let periodoVigencia =
      item["bov2:periodoVigencia"]["bov2:inicio"]._text.toString();
    periodoVigencia = dayjs(periodoVigencia).format("DD/MM/YYYY");
    const situacao = item["bov2:situacao"]["bov2:descricao"]._text.toString();
    const codClasse = item["bov2:classe"]["bov2:codigo"]._text.toString();
    const nomeClasse = item["bov2:classe"]["bov2:descricao"]._text.toString();

    await dbPersistance.addParticipante(
      key,
      cnpj,
      nomeEmpresarial,
      situacao,
      sigla,
      codigo,
      periodoVigencia,
      codClasse,
      nomeClasse
    );
  }

  async function mapResponseToProfileData(key, codAgente, item) {
    const classe = item["bov2:classe"]["bov2:descricao"]._text.toString();
    const codPerfil = item["bov2:codigo"]._text.toString();
    var comercializadorVarejista =
      item["bov2:comercializadorVarejista"]._text.toString();
    const sigla = item["bov2:sigla"]._text.toString();
    const situacao = item["bov2:situacao"]["bov2:descricao"]._text.toString();
    const submercado =
      item["bov2:submercado"] === undefined
        ? "Sem informação"
        : item["bov2:submercado"]["bov2:nome"]._text.toString();
    var perfilPrincipal = item["bov2:perfilPrincipal"]._text.toString();
    var regimeCotas = item["bov2:regimeCotas"]._text.toString();
    comercializadorVarejista =
      comercializadorVarejista === "true" ? "Sim" : "Não";
    perfilPrincipal = perfilPrincipal === "true" ? "Sim" : "Não";
    regimeCotas = regimeCotas === "true" ? "Sim" : "Não";

    await dbPersistance.addPerfil(
      key,
      codAgente,
      classe,
      codPerfil,
      comercializadorVarejista,
      sigla,
      situacao,
      submercado,
      perfilPrincipal,
      regimeCotas
    );
  }

  async function mapResponseToResourceData(key, codPerfil, item) {
    const codAtivo = item["bov2:codigo"]._text.toString();
    const nome = item["bov2:nome"]._text.toString();
    const tipo = item["bov2:tipo"]["bov2:descricao"]._text.toString();
    const situacao = item["bov2:situacao"]["bov2:descricao"]._text.toString();
    const vigencia = item["bov2:vigencia"]["bov2:inicio"]._text.toString();
    var periodoVigencia = dayjs(vigencia).format("DD/MM/YYYY");

    await dbPersistance.addAtivo(
      key,
      codPerfil,
      codAtivo,
      nome,
      tipo,
      situacao,
      periodoVigencia
    );
  }

  async function mapResponseToPartialMeasurementData(key, codMedidor, item) {
    const codParcelaAtivo =
      item["bov2:codigo"] !== undefined
        ? item["bov2:codigo"]._text.toString()
        : "";
    const codAtivoMedicao =
      item["bov2:ativoMedicao"] !== undefined
        ? item["bov2:ativoMedicao"]["bov2:codigo"]._text.toString()
        : "";
    const nome =
      item["bov2:nome"] !== undefined ? item["bov2:nome"]._text.toString() : "";
    const codPerfil =
      item["bov2:participanteMercado"] !== undefined
        ? item["bov2:participanteMercado"]["bov2:perfis"]["bov2:perfil"][
            "bov2:codigo"
          ]._text.toString()
        : "";
    const idSubmercado =
      item["bov2:submercado"] !== undefined
        ? item["bov2:submercado"]["bov2:id"]._text.toString()
        : "";
    const cnpj =
      item["bov2:identificacao"] !== undefined
        ? item["bov2:identificacao"]["bov2:numero"]._text.toString()
        : "";
    const situacao =
      item["bov2:status"] !== undefined
        ? item["bov2:status"]["bov2:descricao"]._text.toString()
        : "";
    const vigencia =
      item["bov2:vigencia"] !== undefined
        ? item["bov2:vigencia"]["bov2:inicio"]._text.toString()
        : "";
    var periodoVigencia = dayjs(vigencia).format("DD/MM/YYYY");

    await dbPersistance.addParcelaDeAtivo(
      key,
      codParcelaAtivo,
      codAtivoMedicao,
      nome,
      codMedidor,
      codPerfil,
      idSubmercado,
      cnpj,
      situacao,
      periodoVigencia
    );
  }

  async function mapResponseToPartialLoadData(key, item) {
    const codParcelaCarga =
      item["bov2:numeroSequencial"] !== undefined
        ? item["bov2:numeroSequencial"]._text.toString()
        : "";
    const codAtivoMedicao =
      item["bov2:ativoMedicao"] !== undefined
        ? item["bov2:ativoMedicao"]["bov2:numero"]._text.toString()
        : "";
    const nome =
      item["bov2:nomeReduzido"] !== undefined
        ? item["bov2:nomeReduzido"]._text.toString()
        : "";
    const submercado =
      item["bov2:submercado"] !== undefined
        ? item["bov2:submercado"]["bov2:nome"]._text.toString()
        : "";
    const cnpj =
      item["bov2:identificacao"] !== undefined
        ? item["bov2:identificacao"]["bov2:numero"]._text.toString()
        : "";
    const situacao =
      item["bov2:situacao"] !== undefined
        ? item["bov2:situacao"]._text.toString()
        : "";
    const vigencia =
      item["bov2:vigencia"] !== undefined
        ? item["bov2:vigencia"]["bov2:inicio"]._text.toString()
        : "";
    var periodoVigencia = dayjs(vigencia).format("DD/MM/YYYY");
    const undCapacidadeCarga =
      item["bov2:capacidadeCarga"] !== undefined
        ? item["bov2:capacidadeCarga"]["bov2:unidadeMedida"]._text.toString()
        : "";
    const valorCapacidadeCarga =
      item["bov2:capacidadeCarga"] !== undefined
        ? item["bov2:capacidadeCarga"]["bov2:valor"]._text.toString()
        : "";

    var bairro,
      cidade,
      estado,
      logradouro,
      numero = "";
    var endereco = item["bov2:endereco"];
    if (endereco !== undefined) {
      bairro =
        endereco["bov2:bairro"] !== undefined
          ? endereco["bov2:bairro"]["bov2:descricao"]._text.toString()
          : "";
      cidade =
        endereco["bov2:cidade"] !== undefined
          ? endereco["bov2:cidade"]["bov2:descricao"]._text.toString()
          : "";
      estado =
        endereco["bov2:estado"] !== undefined
          ? endereco["bov2:estado"]["bov2:descricao"]._text.toString()
          : "";
      logradouro =
        endereco["bov2:logradouro"] !== undefined
          ? endereco["bov2:logradouro"]._text.toString()
          : "";
      numero =
        endereco["bov2:numero"] !== undefined
          ? endereco["bov2:numero"]._text.toString()
          : "";
    }
    var codConcessionaria = "";
    if (item["bov2:partes"] !== undefined) {
      var partes = item["bov2:partes"]["bov2:parte"];

      codConcessionaria = partes
        .filter((x) => x["bov2:papel"]._text.toString() === "CONCESSIONARIO")[0]
        ["bov2:agente"]["bov2:codigo"]._text.toString();
    }

    await dbPersistance.addParcelaDeCarga(
      key,
      codParcelaCarga,
      codAtivoMedicao,
      nome,
      submercado,
      cnpj,
      situacao,
      periodoVigencia,
      codConcessionaria,
      undCapacidadeCarga,
      valorCapacidadeCarga,
      bairro,
      cidade,
      estado,
      logradouro,
      numero
    );
  }

  async function mapResponseToTopologyData(key, item) {
    const codAtivoMedicao =
      item["bov2:ativoMedicao"] !== undefined
        ? item["bov2:ativoMedicao"]["bov2:numero"]._text.toString()
        : "";
    const codMedidor =
      item["bov2:ativoMedicao"] !== undefined
        ? item["bov2:ativoMedicao"]["bov2:pontos"]["bov2:pontoMedicao"][
            "bov2:codigo"
          ]._text.toString()
        : "";
    const nomeConcessionaria =
      item["bov2:nome"] !== undefined ? item["bov2:nome"]._text.toString() : "";
    const vigencia =
      item["bov2:vigencia"] !== undefined
        ? item["bov2:vigencia"]["bov2:inicio"]._text.toString()
        : "";
    var periodoVigencia =
      vigencia !== "" ? dayjs(vigencia).format("DD/MM/YYYY") : "";

    await dbPersistance.addTopologia(
      key,
      codAtivoMedicao,
      codMedidor,
      nomeConcessionaria,
      periodoVigencia
    );
  }

  function mapResponseToMeasurementData(item) {
    const coletaMedicao =
      item["bov2:coletaMedicao"] !== undefined
        ? item["bov2:coletaMedicao"]["bov2:tipo"]["bov2:nome"]._text.toString()
        : "";
    const dataPesquisada =
      item["bov2:data"] !== undefined ? item["bov2:data"]._text.toString() : "";
    const energiaAtiva_ConsumoUnd =
      item["bov2:energiaAtiva"] !== undefined
        ? item["bov2:energiaAtiva"]["bov2:consumo"][
            "bov2:unidadeMedida"
          ]._text.toString()
        : "";
    var energiaAtiva_ConsumoValor =
      item["bov2:energiaAtiva"] !== undefined
        ? item["bov2:energiaAtiva"]["bov2:consumo"][
            "bov2:valor"
          ]._text.toString()
        : "";

    energiaAtiva_ConsumoValor = energiaAtiva_ConsumoValor.replace(".", ",");
    const energiaAtiva_GeracaoUnd =
      item["bov2:energiaAtiva"] !== undefined
        ? item["bov2:energiaAtiva"]["bov2:geracao"][
            "bov2:unidadeMedida"
          ]._text.toString()
        : "";
    var energiaAtiva_GeracaoValor =
      item["bov2:energiaAtiva"] !== undefined
        ? item["bov2:energiaAtiva"]["bov2:geracao"][
            "bov2:valor"
          ]._text.toString()
        : "";
    energiaAtiva_GeracaoValor = energiaAtiva_GeracaoValor.replace(".", ",");
    const energiaReativa_ConsumoUnd =
      item["bov2:energiaReativa"] !== undefined
        ? item["bov2:energiaReativa"]["bov2:consumo"][
            "bov2:unidadeMedida"
          ]._text.toString()
        : "";
    var energiaReativa_ConsumoValor =
      item["bov2:energiaReativa"] !== undefined
        ? item["bov2:energiaReativa"]["bov2:consumo"][
            "bov2:valor"
          ]._text.toString()
        : "";
    energiaReativa_ConsumoValor = energiaReativa_ConsumoValor.replace(".", ",");
    const energiaReativa_GeracaoUnd =
      item["bov2:energiaReativa"] !== undefined
        ? item["bov2:energiaReativa"]["bov2:geracao"][
            "bov2:unidadeMedida"
          ]._text.toString()
        : "";
    var energiaReativa_GeracaoValor =
      item["bov2:energiaReativa"] !== undefined
        ? item["bov2:energiaReativa"]["bov2:geracao"][
            "bov2:valor"
          ]._text.toString()
        : "";
    energiaReativa_GeracaoValor = energiaReativa_GeracaoValor.replace(".", ",");
    const medidor =
      item["bov2:medidor"] !== undefined
        ? item["bov2:medidor"]["bov2:codigo"]._text.toString()
        : "";
    const tipoEnergia =
      item["bov2:tipoEnergia"] !== undefined
        ? item["bov2:tipoEnergia"]["bov2:codigo"]._text.toString()
        : "";

    return {
      coletaMedicao,
      dataPesquisada,
      energiaAtiva_ConsumoUnd,
      energiaAtiva_ConsumoValor,
      energiaAtiva_GeracaoUnd,
      energiaAtiva_GeracaoValor,
      energiaReativa_ConsumoUnd,
      energiaReativa_ConsumoValor,
      energiaReativa_GeracaoUnd,
      energiaReativa_GeracaoValor,
      medidor,
      tipoEnergia,
    };
  }

  function mapResponseToFinalMeasurementData(item) {
    var consumoAtivo =
      item["out2:consumoAtivo"] !== undefined
        ? item["out2:consumoAtivo"]._text.toString()
        : "";
    consumoAtivo = consumoAtivo.replace(".", ",");
    var consumoReativo =
      item["out2:consumoReativo"] !== undefined
        ? item["out2:consumoReativo"]._text.toString()
        : "";
    consumoReativo = consumoReativo.replace(".", ",");
    var geracaoAtiva =
      item["out2:geracaoAtiva"] !== undefined
        ? item["out2:geracaoAtiva"]._text.toString()
        : "";
    geracaoAtiva = geracaoAtiva.replace(".", ",");
    var geracaoReativo =
      item["out2:geracaoReativo"] !== undefined
        ? item["out2:geracaoReativo"]._text.toString()
        : "";
    geracaoReativo = geracaoReativo.replace(".", ",");

    const periodo =
      item["out2:periodo"] !== undefined
        ? item["out2:periodo"]["out2:fim"]._text.toString()
        : "";
    const status =
      item["out2:status"] !== undefined
        ? item["out2:status"]._text.toString()
        : "";
    const subTipo =
      item["out2:subTipo"] !== undefined
        ? item["out2:subTipo"]._text.toString()
        : "";

    return {
      consumoAtivo,
      consumoReativo,
      geracaoAtiva,
      geracaoReativo,
      periodo,
      status,
      subTipo,
    };
  }

  function mapResponseToModellingData(item) {
    const codAtivoMedicao =
      item["bov2:ativoMedicao"] !== undefined
        ? item["bov2:ativoMedicao"]["bov2:codigo"]._text.toString()
        : "";
    let dataApta =
      item["bov2:dataApta"] !== undefined
        ? item["bov2:dataApta"]._text.toString()
        : "";
    dataApta = dataApta !== "" ? dayjs(dataApta).format("DD/MM/YYYY") : "";
    let dataAutorizada =
      item["bov2:dataAutorizada"] !== undefined
        ? item["bov2:dataAutorizada"]._text.toString()
        : "";
    dataAutorizada =
      dataAutorizada !== "" ? dayjs(dataAutorizada).format("DD/MM/YYYY") : "";
    const situacao =
      item["bov2:situacao"] !== undefined
        ? item["bov2:situacao"]["bov2:nome"]._text.toString()
        : "";
    const tipo =
      item["bov2:tipo"] !== undefined
        ? item["bov2:tipo"]["bov2:descricao"]._text.toString()
        : "";

    return {
      codAtivoMedicao,
      dataApta,
      dataAutorizada,
      situacao,
      tipo,
    };
  }

  async function mapResponseToRepresentation(representados) {
    var codes = [];
    var representado = "";
    var codigo = "";

    if (representados.length === undefined) {
      representado = representados["bov2:representado"];
      codigo = representado["bov2:id"]._text.toString();
      codes.push(codigo);
    } else {
      for (var rep of representados) {
        representado = rep["bov2:representado"];
        codigo = representado["bov2:id"]._text.toString();
        codes.push(codigo);
      }
    }

    return codes;
  }

  export const apiMappings = {
    mapResponseToParticipantsData,
    mapResponseToProfileData,
    mapResponseToResourceData,
    mapResponseToPartialMeasurementData,
    mapResponseToPartialLoadData,
    mapResponseToTopologyData,
    mapResponseToMeasurementData,
    mapResponseToFinalMeasurementData,
    mapResponseToModellingData,
    mapResponseToRepresentation
  }