import React, { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
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
import Switch from "@mui/material/Switch";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import styles from "./styles.module.css";
import { useLiveQuery } from "dexie-react-hooks";
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

export default function DataExportView(): React$Element<*> {
  const [dataSourceKeys, setDataSourceKeys] = useState([]);
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

  useEffect(() => {
    async function fetchData() {
      var participantes = await db.participantes;
      if (participantes === undefined) {
        participantes = [];
      } else {
        participantes = await db.participantes.toArray();
      }
      var perfis = await db.perfis;
      if (perfis === undefined) {
        perfis = [];
      } else {
        perfis = await db.perfis.toArray();
      }
      var ativosMedicao = await db.ativosMedicao;
      if (ativosMedicao === undefined) {
        ativosMedicao = [];
      } else {
        ativosMedicao = await db.ativosMedicao.toArray();
      }

      var dataSources = [];

      if (participantes.length > 0) {
        console.log(participantes.length);
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
    } else if (selectedDataSource.includes("parcela")) {
      setTableHeader(PartialResourcesColumns);
      setRowKey("codParcelaDeAtivo");
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
    const selectedDataSourceKey = event.target.value;
    setSelectedDataSource(selectedDataSourceKey);
    var selectedRows = await getSelectedRows(selectedDataSourceKey);

    if (selectedRows !== undefined && selectedRows.length > 0) {
      setRows(selectedRows);
    }
  };

  const getSelectedRows = async (dataSourceKey) => {
    console.log(dataSourceKey);
    var participantes = await db.participantes;
    if (participantes === undefined) {
      participantes = [];
    } else {
      participantes = await db.participantes.toArray();
    }
    var perfis = await db.perfis;
    if (perfis === undefined) {
      perfis = [];
    } else {
      perfis = await db.perfis.toArray();
    }
    var ativosMedicao = await db.ativosMedicao;
    if (ativosMedicao === undefined) {
      ativosMedicao = [];
    } else {
      ativosMedicao = await db.ativosMedicao.toArray();
    }

    var filteredParticipants = participantes.filter(
      (x) => x.key === dataSourceKey
    );
    var filteredProfiles = perfis.filter((x) => x.key === dataSourceKey);
    var filteredResources = ativosMedicao.filter(
      (x) => x.key === dataSourceKey
    );

    if (participantes.length > 0 && filteredParticipants.length > 0) {
      return filteredParticipants;
    } else if (perfis.length > 0 && filteredProfiles.length > 0) {
      return filteredProfiles;
    } else if (ativosMedicao.length > 0 && filteredResources.length > 0) {
      return filteredResources;
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
    const data = rows;
    const fileName = selectedDataSource;
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
    if (selectedDataSource.includes("participantes")) {
      db.participantes
        .where("key")
        .equals(selectedDataSource)
        .delete()
        .then(function (deleteCount) {
          console.log("Deleted " + deleteCount + " objects");
        });
    } else if (selectedDataSource.includes("perfis")) {
      db.perfis
        .where("key")
        .equals(selectedDataSource)
        .delete()
        .then(function (deleteCount) {
          console.log("Deleted " + deleteCount + " objects");
        });
    } else if (selectedDataSource.includes("ativos")) {
      db.ativosMedicao
        .where("key")
        .equals(selectedDataSource)
        .delete()
        .then(function (deleteCount) {
          console.log("Deleted " + deleteCount + " objects");
        });
    }

    setSelectedDataSource("");
    setRows([]);
  };

  const handleCompareDataSourcesChange = (event) => {
    setCompareDataSources(event.target.checked);
  };

  const handleDataSourceAChange = async (event) => {
    setCompareDataSourcesFlag(false);

    const selectedDataSourceKey = event.target.value;
    setSelectedDataSourceA(selectedDataSourceKey);
  };

  const handleDataSourceBChange = async (event) => {
    setCompareDataSourcesFlag(false);

    const selectedDataSourceKey = event.target.value;
    setSelectedDataSourceB(selectedDataSourceKey);
  };

  const handleCompareData = async () => {
    setCompareDataSourcesFlag(true);
    const sourceA = await getSelectedRows(selectedDataSourceA);
    const sourceB = await getSelectedRows(selectedDataSourceB);

    if (sourceA !== undefined && sourceB !== undefined) {
      if (
        selectedDataSourceA.includes("participantes") &&
        selectedDataSourceB.includes("participantes")
      ) {
        let sourceB_Codigos = sourceB.map((x) => x.codigo);
        let result = sourceA.filter((x) => !sourceB_Codigos.includes(x.codigo));
        setResultDataSourceText("Novos_" + selectedDataSourceA);
        setRows(result);
        console.log("Diferença: " + result.length);
      } else if (
        selectedDataSourceA.includes("perfis") &&
        selectedDataSourceB.includes("perfis")
      ) {
        let sourceB_Codigos = sourceB.map((x) => x.codPerfil);
        let result = sourceA.filter(
          (x) => !sourceB_Codigos.includes(x.codPerfil)
        );
        setResultDataSourceText("Novos_" + selectedDataSourceA);
        setRows(result);
      } else if (
        selectedDataSourceA.includes("ativos") &&
        selectedDataSourceB.includes("ativos")
      ) {
        let sourceB_Codigos = sourceB.map((x) => x.codAtivo);
        let result = sourceA.filter(
          (x) => !sourceB_Codigos.includes(x.codAtivo)
        );
        setResultDataSourceText("Novos_" + selectedDataSourceA);
        setRows(result);
      } else {
        setRows([]);
      }
    }
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

  function RenderTable() {
    return (
      <div>
        {selectedDataSource !== "" ? (
          <div>
            <TableContainer sx={{ maxHeight: 440, marginTop: 5 }}>
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
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => {
                      return (
                        <TableRow
                          hover
                          role="checkbox"
                          tabIndex={-1}
                          key={row[rowKey]}
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
              onChange={handleDataSourceChange}
            >
              {dataSourceKeys.map((x) => (
                <MenuItem value={x}>{x}</MenuItem>
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
              labelId="data-source-select-a-label"
              id="data-source-simple-select-a"
              value={selectedDataSourceA}
              label="Fonte de dados"
              onChange={handleDataSourceAChange}
            >
              {dataSourceKeys.map((x) => (
                <MenuItem value={x}>{x}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ width: "50%" }}>
            <InputLabel id="data-source-select-label">
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
                <MenuItem value={x}>{x}</MenuItem>
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

        {compareDataSourcesFlag ? (
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
            {selectedDataSourceA !== "" && selectedDataSourceB !== "" ? (
              <div>{RenderTable()}</div>
            ) : (
              <div></div>
            )}
          </div>
        ) : (
          <div></div>
        )}
      </div>
    );
  }

  return (
    <div>
      <Typography paragraph>Exportar Dados</Typography>
      <FormControlLabel
        control={
          <Switch
            checked={compareDataSources}
            onChange={handleCompareDataSourcesChange}
            name="gilad"
          />
        }
        label="Comparar fontes de dados"
      />

      {compareDataSources
        ? RenderComparatorExporterView()
        : RenderSingleExporterView()}

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
