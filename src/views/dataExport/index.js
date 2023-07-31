import React, { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import formatStringByPattern from "format-string-by-pattern";
import exportFromJSON from "export-from-json";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import IconButton from "@mui/material/IconButton";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import styles from "./styles.module.css";
import CircularProgress from "@mui/material/CircularProgress";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import { useTheme } from "@mui/material/styles";
import { db } from "../../database/db";

const ParticipantsColumns = [
  {
    id: "cnpj",
    label: "CNPJ",
    minWidth: 170,
    format: (value) => formatStringByPattern("XX.XXX.XXX/XXXX-XX", value),
  },
  { id: "nomeEmpresarial", label: "Nome", minWidth: 170 },
  { id: "sigla", label: "Sigla", minWidth: 100 },
  { id: "codigo", label: "Código de Agente", minWidth: 100 },
  { id: "periodoVigencia", label: "Data de Início de Vigência", minWidth: 100 },
  { id: "situacao", label: "Situação", minWidth: 100 },
];

const ProfilesColumns = [
  {
    id: "codAgente",
    label: "Código de Agente",
    minWidth: 170,
  },
  { id: "classe", label: "Classe", minWidth: 170 },
  { id: "codPerfil", label: "Código de Perfil", minWidth: 100 },
  {
    id: "comercializadorVarejista",
    label: "É comercializador varejista?",
    minWidth: 100,
  },
  { id: "sigla", label: "Sigla", minWidth: 100 },
  { id: "situacao", label: "Situação", minWidth: 100 },
  { id: "submercado", label: "Submercado", minWidth: 100 },
  { id: "perfilPrincipal", label: "É perfil principal?", minWidth: 100 },
  { id: "regimeCotas", label: "É regime de cotas?", minWidth: 100 },
];

const ResourcesColumns = [
  {
    id: "codPerfil",
    label: "Código de Perfil",
    minWidth: 170,
  },
  { id: "codAtivo", label: "Código de Ativo", minWidth: 170 },
  { id: "nome", label: "Nome", minWidth: 100 },
  { id: "tipo", label: "Tipo", minWidth: 100 },
  { id: "situacao", label: "Situação", minWidth: 100 },
  {
    id: "periodoVigencia",
    label: "Data de início de vigência",
    minWidth: 100,
  },
];

const PartialResourcesColumns = [
  {
    id: "codPerfil",
    label: "Código de Perfil",
    minWidth: 170,
  },
  { id: "codAtivo", label: "Código de Ativo", minWidth: 170 },
  { id: "codAtivoMedicao", label: "Código de Ativo de Medição", minWidth: 170 },
  {
    id: "capacidadeTotal",
    label: "Capacidade Total",
    minWidth: 100,
    align: "right",
    format: (value) => value.toLocaleString("en-US"),
  },
  { id: "nomeEmpresarial", label: "Nome Empresarial", minWidth: 100 },
  { id: "idSubmercado", label: "Id do submercado", minWidth: 100 },
  { id: "periodoVigencia", label: "Data de início de vigência", minWidth: 170 },
  {
    id: "cnpj",
    label: "CNPJ",
    minWidth: 170,
    format: (value) => formatStringByPattern("XX.XXX.XXX/XXXX-XX", value),
  },
  { id: "situacao", label: "Situação", minWidth: 100 },
];

const PartialMeasurementColumns = [
  {
    id: "codParcelaAtivo",
    label: "Código de Parcela de Ativo",
    minWidth: 170,
  },
  { id: "nome", label: "Nome Empresarial", minWidth: 100 },
  { id: "codMedidor", label: "Código Medidor SCDE", minWidth: 100 },
  {
    id: "codPerfil",
    label: "Código de Perfil",
    minWidth: 170,
  },
  { id: "idSubmercado", label: "Id do submercado", minWidth: 100 },
  {
    id: "cnpj",
    label: "CNPJ",
    minWidth: 170,
    format: (value) => formatStringByPattern("XX.XXX.XXX/XXXX-XX", value),
  },
  { id: "situacao", label: "Situação", minWidth: 100 },
  { id: "periodoVigencia", label: "Data de início de vigência", minWidth: 170 },
];

export default function DataExportView() {
  const [dataSourceKeys, setDataSourceKeys] = useState([]);
  const [filteredDataSourceKeys, setFilteredDataSourceKeys] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [resources, setResources] = useState([]);
  const [partialResources, setPartialResources] = useState([]);
  const [initialRows, setInitialRows] = useState([]);
  const [rows, setRows] = useState([]);
  const [rowKey, setRowKey] = useState("");
  const [tableHeader, setTableHeader] = useState([]);
  const [compareDataSourcesFlag, setCompareDataSourcesFlag] = useState(false);
  const [compareDataSources, setCompareDataSources] = useState("");
  const [selectedDataSource, setSelectedDataSource] = useState("");
  const [selectedDataSourceA, setSelectedDataSourceA] = useState("");
  const [selectedDataSourceB, setSelectedDataSourceB] = useState("");
  const [resultDataSourceText, setResultDataSourceText] = useState("");
  const [selectedFileFormat, setSelectedFileFormat] = useState("csv");
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogContent, setDialogContent] = useState("");
  const [dialogReason, setDialogReason] = useState("");
  const [openDialog, setDialogOpen] = useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [inputText, setInputText] = useState("");
  const [open, setOpen] = useState(false);
  const [actionId, setActionId] = useState(2);
  const [datasetName, setDatasetName] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState("");
  const [clusterName, setClusterName] = useState("");

  const theme = useTheme();

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  const actions = [
    { id: 1, value: "Agrupar dados" },
    { id: 2, value: "Visualizar dados individualizados" },
    { id: 3, value: "Comparar conjuntos de dados" },
  ];

  const entities = [
    { id: 1, name: "Participantes", alias: "participantes" },
    { id: 2, name: "Perfis", alias: "perfis" },
    { id: 3, name: "Ativos de Medição", alias: "ativos" },
    { id: 4, name: "Parcelas de Ativos", alias: "parcelasDeAtivos" },
  ];

  const handleMultiSectecDataSourceChange = (event) => {
    const {
      target: { value },
    } = event;

    setDatasetName(typeof value === "string" ? value.split(",") : value);
  };

  const handleSelectedEntityChange = (event) => {
    const {
      target: { value },
    } = event;

    setSelectedEntity(value);

    var filteredDataSources = dataSourceKeys.filter((x) => x.includes(value));

    setFilteredDataSourceKeys(filteredDataSources);
  };

  const handleLoadingModalOpen = () => setOpen(true);

  const handleLoadingModalClose = (event, reason) => {
    if (reason === "backdropClick") {
      return;
    }
    setOpen(false);
  };

  useEffect(() => {
    async function fetchData() {
      var participantes = await db.participantes;
      if (participantes === undefined) {
        participantes = [];
      } else {
        participantes = await db.participantes.toArray();
      }

      setParticipants(participantes);

      var perfis = await db.perfis;
      if (perfis === undefined) {
        perfis = [];
      } else {
        perfis = await db.perfis.toArray();
      }

      setProfiles(perfis);

      var ativosMedicao = await db.ativosMedicao;
      if (ativosMedicao === undefined) {
        ativosMedicao = [];
      } else {
        ativosMedicao = await db.ativosMedicao.toArray();
      }

      setResources(ativosMedicao);

      var parcelasAtivosMedicao = await db.parcelasAtivosMedicao;
      if (parcelasAtivosMedicao === undefined) {
        parcelasAtivosMedicao = [];
      } else {
        parcelasAtivosMedicao = await db.parcelasAtivosMedicao.toArray();
      }

      setPartialResources(parcelasAtivosMedicao);

      var dataSources = [];

      if (participantes.length > 0) {
        dataSources = dataSources.concat(
          participantes.map(function (v) {
            return v.key;
          })
        );
      }
      if (perfis.length > 0) {
        dataSources = dataSources.concat(
          perfis.map(function (v) {
            return v.key;
          })
        );
      }

      if (ativosMedicao.length > 0) {
        dataSources = dataSources.concat(
          ativosMedicao.map(function (v) {
            return v.key;
          })
        );
      }

      if (parcelasAtivosMedicao.length > 0) {
        dataSources = dataSources.concat(
          parcelasAtivosMedicao.map(function (v) {
            return v.key;
          })
        );
      }

      const distinctDataSources = [...new Set(dataSources)];

      if (distinctDataSources) {
        setDataSourceKeys(distinctDataSources);
      }
    }
    fetchData();

    // const dataSources = JSON.parse(localStorage.getItem("DATA_SOURCE_KEYS"));
    // if (dataSources) {
    //   setDataSourceKeys(dataSources);
    // }

    if (selectedDataSource.includes("participantes")) {
      setTableHeader(ParticipantsColumns);
      setRowKey("codigo");
    } else if (selectedDataSource.includes("perfis")) {
      setTableHeader(ProfilesColumns);
      setRowKey("codPerfil");
    } else if (selectedDataSource.includes("ativos")) {
      setTableHeader(ResourcesColumns);
      setRowKey("codAtivo");
    } else if (selectedDataSource.includes("parcelasDeAtivos")) {
      setTableHeader(PartialMeasurementColumns);
      setRowKey("codParcelaAtivo");
    } else if (selectedDataSource.includes("parcelasDeCargas")) {
      setTableHeader(PartialResourcesColumns);
      setRowKey("codParcelaCarga");
    } else {
      setTableHeader([]);
      setRowKey("");
    }
  }, [selectedDataSource]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleDataSourceChange = async (event) => {
    handleLoadingModalOpen();
    setInputText("");
    const selectedDataSourceKey = event.target.value;
    setSelectedDataSource(selectedDataSourceKey);
    var selectedRows = await getSelectedRows(selectedDataSourceKey);

    if (selectedRows !== undefined && selectedRows.length > 0) {
      let data = selectedRows.map(({ id, key, ...rest }) => {
        return rest;
      });

      setRows(data);
      setInitialRows(data);
    }

    handleLoadingModalClose();
  };

  const getSelectedRows = async (dataSourceKey) => {
    var filteredParticipants = participants.filter(
      (x) => x.key === dataSourceKey
    );
    var filteredProfiles = profiles.filter((x) => x.key === dataSourceKey);
    var filteredResources = resources.filter((x) => x.key === dataSourceKey);
    var filteredPartialResources = partialResources.filter(
      (x) => x.key === dataSourceKey
    );

    if (participants.length > 0 && filteredParticipants.length > 0) {
      return filteredParticipants;
    } else if (profiles.length > 0 && filteredProfiles.length > 0) {
      return filteredProfiles;
    } else if (partialResources.length > 0 && filteredResources.length > 0) {
      return filteredResources;
    } else if (
      partialResources.length > 0 &&
      filteredPartialResources.length > 0
    ) {
      return filteredPartialResources;
    } else {
      return [];
    }
  };

  const handleExportData = () => {
    setDialogReason("exportData");
    setDialogTitle("Escolha o formato de arquivo para exportação dos dados");
    handleClickOpen();
  };

  const handleFileFormatChange = (event) => {
    setSelectedFileFormat(event.target.value);
  };

  const exportData = () => {
    const data = initialRows;
    var fileName = selectedDataSource;
    var selectedOption = parseInt(actionId);

    if(selectedOption === 1){
      fileName = clusterName;
    }

    let exportType = "";

    if (selectedFileFormat === "csv") {
      exportType = exportFromJSON.types.csv;
    } else if (selectedFileFormat === "xls") {
      exportType = exportFromJSON.types.xls;
    } else {
      exportType = exportFromJSON.types.json;
    }

    exportFromJSON({ data, fileName, exportType });
  };

  const handleDeleteData = () => {
    setDialogReason("deleteData");
    setDialogTitle(
      "Deseja realmente excluir o conjunto de dados " +
        selectedDataSource +
        " ?"
    );
    setDialogContent(
      "Uma vez excluídos esses dados não poderão ser recuperados mais."
    );
    handleClickOpen();
  };

  const deleteData = () => {
    handleLoadingModalOpen();

    if (selectedDataSource.includes("participantes")) {
      db.participantes
        .where("key")
        .equals(selectedDataSource)
        .delete()
        .then(function (deleteCount) {
          console.log(deleteCount + " objects deleted");
          handleLoadingModalClose();
        });
    } else if (selectedDataSource.includes("perfis")) {
      db.perfis
        .where("key")
        .equals(selectedDataSource)
        .delete()
        .then(function (deleteCount) {
          console.log(deleteCount + " objects deleted");
          handleLoadingModalClose();
        });
    } else if (selectedDataSource.includes("ativos")) {
      db.ativosMedicao
        .where("key")
        .equals(selectedDataSource)
        .delete()
        .then(function (deleteCount) {
          console.log(deleteCount + " objects deleted");
          handleLoadingModalClose();
        });
    } else if (selectedDataSource.includes("parcelasDeAtivos")) {
      db.parcelasAtivosMedicao
        .where("key")
        .equals(selectedDataSource)
        .delete()
        .then(function (deleteCount) {
          console.log(deleteCount + " objects deleted");
          handleLoadingModalClose();
        });
    }

    setSelectedDataSource("");
    setRows([]);
    setInitialRows([]);
  };

  const handleSaveCluster = () => {
    handleLoadingModalOpen();
    setInputText("");

    var dataSource = [];

    if (selectedEntity === "participantes") {
      dataSource = participants;
      setSelectedDataSource("participantes");
    } else if (selectedEntity === "perfis") {
      dataSource = profiles;
      setSelectedDataSource("perfis");
    } else if (selectedEntity === "ativos") {
      dataSource = resources;
      setSelectedDataSource("ativos");
    } else {
      dataSource = partialResources;
      setSelectedDataSource("parcelasDeAtivos");
    }

    var content = [];

    for (const dt of datasetName) {
      var data = dataSource.filter((x) => x.key === dt);
      content = content.concat(data);
    }

    console.log(content.length);

    setRows(content);
    setInitialRows(content);
    handleLoadingModalClose();
  };

  const handleDataSourceAChange = async (event) => {
    setCompareDataSourcesFlag(false);

    const selectedDataSourceKey = event.target.value;
    setSelectedDataSourceA(selectedDataSourceKey);
    setInputText("");
  };

  const handleDataSourceBChange = async (event) => {
    setCompareDataSourcesFlag(false);

    const selectedDataSourceKey = event.target.value;
    setSelectedDataSourceB(selectedDataSourceKey);
    setInputText("");
  };

  const handleCompareData = async () => {
    setCompareDataSourcesFlag(true);
    handleLoadingModalOpen();
    const sourceA = await getSelectedRows(selectedDataSourceA);
    const sourceB = await getSelectedRows(selectedDataSourceB);

    if (sourceA === undefined && sourceB === undefined) {
      handleLoadingModalClose();
      return;
    }

    if (
      selectedDataSourceA.includes("participantes") &&
      selectedDataSourceB.includes("participantes")
    ) {
      let sourceB_Codigos = sourceB.map((x) => x.codigo);
      let result = sourceA.filter((x) => !sourceB_Codigos.includes(x.codigo));
      setRows(result);
      setInitialRows(result);
      console.log("Diferença: " + result.length);
    } else if (
      selectedDataSourceA.includes("perfis") &&
      selectedDataSourceB.includes("perfis")
    ) {
      let sourceB_Codigos = sourceB.map((x) => x.codPerfil);
      let result = sourceA.filter(
        (x) => !sourceB_Codigos.includes(x.codPerfil)
      );
      setRows(result);
      setInitialRows(result);
    } else if (
      selectedDataSourceA.includes("ativos") &&
      selectedDataSourceB.includes("ativos")
    ) {
      let sourceB_Codigos = sourceB.map((x) => x.codAtivo);
      let result = sourceA.filter((x) => !sourceB_Codigos.includes(x.codAtivo));
      setRows(result);
      setInitialRows(result);
    } else if (
      selectedDataSourceA.includes("parcela") &&
      selectedDataSourceB.includes("parcela")
    ) {
      let sourceB_Codigos = sourceB.map((x) => x.codParcelaAtivo);
      let result = sourceA.filter(
        (x) => !sourceB_Codigos.includes(x.codParcelaAtivo)
      );
      setRows(result);
      setInitialRows(result);
    } else {
      setTableHeader([]);
      setRowKey("");
      setRows([]);
      setInitialRows([]);
    }

    setResultDataSourceText("Novos_" + selectedDataSourceA);
    setSelectedDataSource("Novos_" + selectedDataSourceA);
    handleLoadingModalClose();
  };

  const filterTable = (text) => {
    setInputText(text);
    var searchText = text.toUpperCase();
    var filteredData = [];

    if (searchText === "") {
      setRows(initialRows);
      return;
    }

    if (rowKey === "codigo") {
      filteredData = initialRows.filter(
        (x) =>
          x.codigo.includes(searchText) ||
          x.sigla.toUpperCase().includes(searchText) ||
          x.situacao.toUpperCase().includes(searchText) ||
          x.nomeEmpresarial.toUpperCase().includes(searchText) ||
          x.cnpj.includes(searchText)
      );
    } else if (rowKey === "codPerfil") {
      filteredData = initialRows.filter(
        (x) =>
          x.codPerfil.includes(searchText) ||
          x.classe.toUpperCase().includes(searchText) ||
          x.codAgente.includes(searchText) ||
          x.sigla.toUpperCase().includes(searchText) ||
          x.situacao.toUpperCase().includes(searchText) ||
          x.submercado.toUpperCase().includes(searchText)
      );
    } else if (rowKey === "codAtivo") {
      filteredData = initialRows.filter(
        (x) =>
          x.codAtivo.includes(searchText) ||
          x.codPerfil.includes(searchText) ||
          x.nome.toUpperCase().includes(searchText) ||
          x.situacao.toUpperCase().includes(searchText)
      );
    } else if (rowKey === "codParcelaAtivo") {
      filteredData = initialRows.filter(
        (x) =>
          x.codParcelaAtivo.includes(searchText) ||
          x.nome.toUpperCase().includes(searchText) ||
          x.codPerfil.includes(searchText)
      );
    } else {
      filteredData = [];
    }

    setRows(filteredData);
  };

  const handleClickOpen = () => {
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    console.log(dialogReason);
    if (dialogReason === "deleteData") {
      deleteData();
    } else {
      exportData();
    }
    setDialogOpen(false);
  };

  const handleCancel = () => {
    handleClose();
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  const handleActionChange = (event) => {
    setActionId(event.target.value);
    setSelectedDataSource("");
    setSelectedDataSourceA("");
    setSelectedDataSourceB("");
    setResultDataSourceText("");
    setInputText("");
    setSelectedEntity("");
    setDatasetName([]);
    setClusterName("");
  };

  const chooseFieldsToRender = () => {
    var option = parseInt(actionId);
    if (option === 1) {
      return <div>{RnederGroupDatasetsView()}</div>;
    } else if (option === 2) {
      return <div>{RenderSingleExporterView()}</div>;
    } else {
      return <div>{RenderComparatorExporterView()}</div>;
    }
  };

  function RenderTable() {
    return (
      <div>
        {selectedDataSource !== "" ? (
          <div>
            <Stack
              divider={<Divider orientation="horizontal" flexItem />}
              sx={{ marginTop: 2 }}
              spacing={2}
            >
              <FormControl
                sx={{ m: 1, width: "55ch", marginTop: 3 }}
                variant="standard"
              >
                <InputLabel htmlFor="standard-adornment-search">
                  Pesquisar...
                </InputLabel>
                <Input
                  id="standard-adornment-search"
                  type={"text"}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        type="button"
                        sx={{ p: "10px" }}
                        aria-label="search"
                      >
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  }
                  value={inputText}
                  onChange={(event) => filterTable(event.target.value)}
                />
              </FormControl>
              <TableContainer sx={{ maxHeight: 440, marginTop: 1 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      {tableHeader.map((column) => (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          style={{ minWidth: column.minWidth }}
                        >
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((row) => {
                        return (
                          <TableRow
                            hover
                            role="checkbox"
                            tabIndex={-1}
                            key={row.id}
                          >
                            {tableHeader.map((column) => {
                              const value = row[column.id];
                              return (
                                <TableCell key={column.id} align={column.align}>
                                  {column.format ? column.format(value) : value}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Stack>
          </div>
        ) : (
          <div></div>
        )}
      </div>
    );
  }

  function RenderSingleExporterView() {
    return (
      <div>
        <Stack
          direction="row"
          divider={<Divider orientation="vertical" flexItem />}
          sx={{ marginTop: 2 }}
          spacing={2}
        >
          <FormControl sx={{ width: "50%" }}>
            <InputLabel id="data-source-select-label">
              Fonte de dados
            </InputLabel>
            <Select
              labelId="data-source-select-label"
              id="data-source-simple-select"
              value={selectedDataSource}
              label="Fonte de dados"
              input={<OutlinedInput label="Name" />}
              onChange={handleDataSourceChange}
            >
              {dataSourceKeys.map((x) => (
                <MenuItem key={x} value={x}>
                  {x}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            onClick={handleExportData}
            sx={{ marginTop: 2 }}
          >
            Exportar
          </Button>
          <Button
            variant="outlined"
            onClick={handleDeleteData}
            sx={{ marginTop: 2 }}
          >
            Excluir
          </Button>
        </Stack>

        {selectedDataSource !== "" ? <div>{RenderTable()}</div> : <div></div>}
      </div>
    );
  }

  function RenderComparatorExporterView() {
    return (
      <div>
        <Stack
          direction="row"
          divider={<Divider orientation="vertical" flexItem />}
          sx={{ marginTop: 2 }}
          spacing={2}
        >
          <FormControl sx={{ width: "50%" }}>
            <InputLabel id="data-source-select-label">
              Fonte de dados A
            </InputLabel>
            <Select
              labelId="data-source-select-a-label-a"
              id="data-source-simple-select-a"
              value={selectedDataSourceA}
              label="Fonte de dados"
              onChange={handleDataSourceAChange}
            >
              {dataSourceKeys.map((x) => (
                <MenuItem value={x} key={x}>
                  {x}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ width: "50%" }}>
            <InputLabel id="data-source-select-label-b">
              Fonte de dados B
            </InputLabel>
            <Select
              labelId="data-source-select-b-label"
              id="data-source-simple-select-b"
              value={selectedDataSourceB}
              label="Fonte de dados"
              onChange={handleDataSourceBChange}
            >
              {dataSourceKeys.map((x) => (
                <MenuItem value={x} key={x}>
                  {x}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            onClick={handleCompareData}
            sx={{ marginTop: 2 }}
          >
            Comparar
          </Button>
        </Stack>

        {compareDataSourcesFlag &&
        selectedDataSourceA !== "" &&
        selectedDataSourceB !== "" ? (
          <div>
            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem />}
              sx={{ marginTop: 2, height: 55 }}
              spacing={2}
            >
              <div className={styles.rowContainer}>
                <div className={styles.resultFieldWithoutBorder}>
                  <Typography paragraph className={styles.resultFieldText}>
                    Resultado (A - B):
                  </Typography>
                </div>
                <div className={styles.resultField}>
                  <Typography paragraph className={styles.resultFieldText}>
                    {resultDataSourceText}
                  </Typography>
                </div>
              </div>

              <Button
                variant="outlined"
                onClick={handleExportData}
                sx={{ marginTop: 2 }}
              >
                Exportar
              </Button>
            </Stack>
            {rows.length > 0 ? (
              <div>{RenderTable()}</div>
            ) : (
              <div className={styles.dataContainer}>
                <Typography paragraph variant="h6">
                  Sem dados para exibição
                </Typography>
              </div>
            )}
          </div>
        ) : (
          <div></div>
        )}
      </div>
    );
  }

  function RnederGroupDatasetsView() {
    return (
      <div>
        <Stack
          direction="row"
          divider={<Divider orientation="vertical" flexItem />}
          sx={{ marginTop: 2 }}
          spacing={2}
        >
          <FormControl sx={{ width: "30%" }}>
            <InputLabel id="data-source-select-label">Entidade</InputLabel>
            <Select
              labelId="data-source-select-label"
              id="data-source-simple-select"
              value={selectedEntity}
              label="Entidades"
              input={<OutlinedInput label="Name" />}
              onChange={handleSelectedEntityChange}
            >
              {entities.map((x) => (
                <MenuItem key={x.id} value={x.alias}>
                  {x.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ width: "50%" }}>
            <InputLabel id="demo-multiple-name-label">
              Conjunto de dados
            </InputLabel>
            <Select
              labelId="demo-multiple-name-label"
              id="demo-multiple-name"
              multiple
              value={datasetName}
              onChange={handleMultiSectecDataSourceChange}
              input={<OutlinedInput label="Name" />}
              renderValue={(selected) => selected.join(", ")}
              MenuProps={MenuProps}
            >
              {filteredDataSourceKeys.map((name) => (
                <MenuItem key={name} value={name}>
                  <Checkbox checked={datasetName.indexOf(name) > -1} />
                  <ListItemText primary={name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <Stack
          direction="row"
          divider={<Divider orientation="vertical" flexItem />}
          sx={{ marginTop: 2 }}
          spacing={2}
        >
          <TextField
            id="custerName"
            label="Nome do agrupamento"
            sx={{ width: 400 }}
            variant="outlined"
            value={clusterName}
            onChange={(event) => setClusterName(event.target.value)}
          />
          <Button
            variant="outlined"
            onClick={handleSaveCluster}
            sx={{ marginTop: 2 }}
          >
            Gerar agrupamento
          </Button>

          {selectedDataSource !== "" ? (
            <Button variant="outlined" onClick={handleExportData}>
              Exportar
            </Button>
          ) : (
            <div></div>
          )}
        </Stack>
        {selectedDataSource !== "" ? <div>{RenderTable()}</div> : <div></div>}
      </div>
    );
  }

  const style = {
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

  return (
    <div>
      <Typography variant="h5" mb={5}>
        Exportar Dados
      </Typography>
      <FormControl>
        <FormLabel id="demo-radio-buttons-group-label">
          Método de preparo
        </FormLabel>
        <RadioGroup
          aria-labelledby="action-radio-buttons-group-label"
          defaultValue={actions[1].id}
          name="raction-radio-buttons-group"
          value={actionId}
          onChange={handleActionChange}
        >
          {actions.map((x) => (
            <FormControlLabel
              key={x.id}
              value={x.id}
              control={<Radio />}
              label={x.value}
            />
          ))}
        </RadioGroup>
      </FormControl>

      {chooseFieldsToRender()}

      <Modal
        open={open}
        onClose={handleLoadingModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            sx={{ marginTop: "-15px" }}
          >
            Processando requisição
          </Typography>
          <Box
            sx={{
              position: "relative",
              display: "inline-flex",
              marginTop: "20px",
            }}
          >
            <CircularProgress />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: "absolute",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            ></Box>
          </Box>
          <Typography
            id="modal-modal-description"
            sx={{
              marginTop: "10px",
              marginBottom: "-25px",
            }}
          >
            Por favor, aguarde...
          </Typography>
        </Box>
      </Modal>

      <Dialog
        open={openDialog}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{dialogTitle}</DialogTitle>
        <DialogContent>
          {dialogReason === "deleteData" ? (
            <DialogContentText id="alert-dialog-description">
              {dialogContent}
            </DialogContentText>
          ) : (
            <FormControl>
              <FormLabel id="demo-radio-buttons-group-label">Formato</FormLabel>
              <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                defaultValue="csv"
                name="radio-buttons-group"
                value={selectedFileFormat}
                onChange={handleFileFormatChange}
              >
                <FormControlLabel value="csv" control={<Radio />} label="csv" />
                <FormControlLabel value="xls" control={<Radio />} label="xls" />
                <FormControlLabel
                  value="json"
                  control={<Radio />}
                  label="json"
                />
              </RadioGroup>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>
            {dialogReason === "deleteData" ? "Não" : "Cancelar"}
          </Button>
          <Button onClick={handleConfirm} autoFocus>
            {dialogReason === "deleteData" ? "Sim" : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
