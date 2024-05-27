import { db } from "../../database/db.js";

async function addParticipante(
  key,
  cnpj,
  nomeEmpresarial,
  situacao,
  sigla,
  codigo,
  periodoVigencia,
  codClasse,
  nomeClasse
) {
  try {
    console.log(key);
    await db.participantes.add({
      key,
      cnpj,
      nomeEmpresarial,
      situacao,
      sigla,
      codigo,
      periodoVigencia,
      codClasse,
      nomeClasse,
    });
  } catch (error) {
    console.log(`Failed to add ${nomeEmpresarial}: ${error}`);
  }
}

async function addPerfil(
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
) {
  try {
    await db.perfis.add({
      key,
      codAgente,
      classe,
      codPerfil,
      comercializadorVarejista,
      sigla,
      situacao,
      submercado,
      perfilPrincipal,
      regimeCotas,
    });
  } catch (error) {
    console.log(`Failed to add ${codPerfil}: ${error}`);
  }
}

async function addAtivo(
  key,
  codPerfil,
  codAtivo,
  nome,
  tipo,
  situacao,
  periodoVigencia
) {
  try {
    await db.ativosMedicao.add({
      key,
      codPerfil,
      codAtivo,
      nome,
      tipo,
      situacao,
      periodoVigencia,
    });
  } catch (error) {
    console.log(`Failed to add Resource ${codAtivo}: ${error}`);
  }
}

async function addParcelaDeAtivo(
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
) {
  try {
    await db.parcelasAtivosMedicao.add({
      key,
      codParcelaAtivo,
      codAtivoMedicao,
      nome,
      codMedidor,
      codPerfil,
      idSubmercado,
      cnpj,
      situacao,
      periodoVigencia,
    });
  } catch (error) {
    console.log(
      `Failed to add Partial Measurement ${codParcelaAtivo}: ${error}`
    );
  }
}

async function addParcelaDeCarga(
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
) {
  try {
    await db.parcelasDeCarga.add({
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
      numero,
    });
  } catch (error) {
    console.log(`Failed to add Partial Load ${codParcelaCarga}: ${error}`);
  }
}

async function addTopologia(
  key,
  codAtivoMedicao,
  codMedidor,
  nomeConcessionaria,
  periodoVigencia
) {
  try {
    await db.topologia.add({
      key,
      codAtivoMedicao,
      codMedidor,
      nomeConcessionaria,
      periodoVigencia,
    });
  } catch (error) {
    console.log(
      `Failed to add Topology for resource: ${codAtivoMedicao}: ${error}`
    );
  }
}

async function addGenericFaultyRequest(
  key,
  requestCode,
  additionalRequestCode,
  searchDate,
  parameter,
  apiCode,
  serviceRequested,
  attempts
) {
  try {
    await db.genericFaultyRequest.add({
      key,
      requestCode,
      additionalRequestCode,
      searchDate,
      parameter,
      apiCode,
      serviceRequested,
      attempts,
    });
  } catch (error) {
    console.log(
      `Failed to add Topology for resource: ${requestCode}: ${error}`
    );
  }
}

async function updateGenericFaultyRequest(requestCode, id, apiCode, attempts) {
  try {
    await db.genericFaultyRequest.update(id, {
      apiCode,
      attempts,
    });
  } catch (error) {
    console.log(`Failed to update faulty request: ${requestCode}: ${error}`);
  }
}

async function deleteGenericFaultyRequest(requestCode, id) {
  try {
    await db.genericFaultyRequest.delete(id);
  } catch (error) {
    console.log(`Failed to delete faulty request: ${requestCode}: ${error}`);
  }
}

export const dbPersistance = {
  addParticipante,
  addPerfil,
  addAtivo,
  addParcelaDeAtivo,
  addParcelaDeCarga,
  addTopologia,
  addGenericFaultyRequest,
  updateGenericFaultyRequest,
  deleteGenericFaultyRequest,
};
