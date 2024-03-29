// db.js
import Dexie from "dexie";

export const db = new Dexie("integratorDatabase");
db.version(10).stores({
  participantes:
    "++id, key, cnpj, nomeEmpresarial, situacao, sigla, codigo, periodoVigencia",
  perfis:
    "++id, key, codAgente, classe, codPerfil, comercializadorVarejista, sigla, situacao, submercado, perfilPrincipal, regimeCotas",
  ativosMedicao:
    "++id, key, codPerfil, codAtivo, nome, tipo, situacao, periodoVigencia",
  parcelasAtivosMedicao:
    "++id, key, codParcelaAtivo, codAtivoMedicao, nome, codMedidor, codPerfil, idSubmercado, cnpj, situacao, periodoVigencia",
  parcelasDeCarga:
    "++id, key, codParcelaCarga, codAtivoMedicao, nome, nomeSubmercado, cnpj, situacao, periodoVigencia, codConcessionaria, undCapacidadeCarga, valorCapacidadeCarga, bairro, cidade, estado, logradouro, numPredial",
  topologia:
    "++id, key, codAtivoMedicao, codMedidor, nomeConcessionaria, periodoVigencia",
});
