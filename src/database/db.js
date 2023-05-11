// db.js
import Dexie from "dexie";

export const db = new Dexie("integratorDatabase");
db.version(4).stores({
  participantes:
    "++id, key, cnpj, nomeEmpresarial, situacao, sigla, codigo, periodoVigencia",
  perfis:
    "++id, key, codAgente, classe, codPerfil, comercializadorVarejista, sigla, situacao, submercado, perfilPrincipal, regimeCotas",
  ativosMedicao:
    "++id, key, codPerfil, codAtivo, nome, tipo, situacao, periodoVigencia",
  parcelasAtivosMedicao:
    "++id, key, codParcelaAtivo, nome, codMedidor, codPerfil, idSubmercado, cnpj, situacao, periodoVigencia",
});
