// db.js
import Dexie from "dexie";

export const db = new Dexie("integratorDatabase");
db.version(1).stores({
  participantes:
    "++id, key, cnpj, nomeEmpresarial, situacao, sigla, codigo, periodoVigencia",
  perfis:
    "++id, key, codAgente, classe, codPerfil, comercializadorVarejista, sigla, situacao, submercado, perfilPrincipal, regimeCotas",
  ativosMedicao:
    "++id, key, codPerfil, codAtivo, nome, tipo, situacao, periodoVigencia",
});
