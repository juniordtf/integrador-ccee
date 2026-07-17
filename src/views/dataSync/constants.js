// Constants used in DataSyncView
export const SERVICES = [
  { id: 1, name: "Listar participantes de mercado" },
  { id: 2, name: "Listar perfis" },
  { id: 3, name: "Listar ativos de medição" },
  { id: 4, name: "Listar parcelas de ativos" },
  { id: 5, name: "Listar parcelas de carga" },
  { id: 6, name: "Listar medidas - 5 minutos" },
  { id: 7, name: "Listar medidas finais" },
  { id: 8, name: "Listar topologias por ativo" },
  { id: 9, name: "Listar modelagem de ativo" },
];

export const CLASSES = [
  { id: 1, name: "Autoprodutor" },
  { id: 2, name: "Comercializador" },
  { id: 3, name: "Importador" },
  { id: 4, name: "Gerador" },
  { id: 5, name: "Distribuidor" },
  { id: 6, name: "Consumidor Livre" },
  { id: 7, name: "Produtor Independente" },
  { id: 10, name: "Transmissor" },
  { id: 11, name: "Exportador" },
  { id: 12, name: "Consumidor Especial" },
  { id: 13, name: "Não Agente" },
];

export const PARAMETERS = [
  { id: 1, name: "Código Medidor SCDE" },
  { id: 2, name: "Código Parcela de Ativo" },
  { id: 3, name: "Código Ativo de Medição" },
  { id: 4, name: "Código Perfil" },
  { id: 5, name: "CNPJ" },
];

export const MODAL_STYLE = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 300,
  bgcolor: "background.paper",
  border: "1px solid gray",
  borderRadius: "10px",
  boxShadow: 24,
  p: 4,
  textAlign: "center",
};
