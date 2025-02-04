import React, { useEffect, useState, useRef } from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Modal from "@mui/material/Modal";
import CircularProgress from "@mui/material/CircularProgress";
import { DataGrid } from "@mui/x-data-grid";
import { LineChart } from "@mui/x-charts/LineChart";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Button from "@mui/material/Button";
import dayjs from "dayjs";
import { db } from "../../database/db";
import { driService } from "../../services/driService.ts";
import { apiMappings } from "../driReports/apiMappings.ts";
import styles from "./styles.module.css";
import { width } from "@mui/system";

export default function ClientsManagementView() {
  const [authData, setAuthData] = useState([]);
  const [dataSourceKeys, setDataSourceKeys] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [modellingData, setModellingData] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedProfile, setSelectedProfile] = useState("");
  const [activeTab, setActiveTab] = useState("1");
  const [accountingDates, setAccountingDates] = useState([]);
  const [accountingRows, setAccountingRows] = useState([]);
  const [initialAccountingRows, setInitialAccountingRows] = useState([]);
  const [accountingColumns, setAccountingColumns] = useState([]);
  const [accountingChartLabels, setAccountingChartLabels] = useState([]);
  const [consumptionSeries, setConsumptionSeries] = useState([]);
  const [contractSeries, setContractSeries] = useState([]);
  const [loadingText, setLoadingText] = useState("");
  const [progress, setProgress] = useState(0);
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(false);
  const [accountingSummaryRows, setAccountingSummaryRows] = useState([]);

  const date = dayjs().format("MM/YYYY");
  const initialMonth = dayjs().subtract(12, "month").format("MM/YYYY");
  const REPORT_SUM001_ID = 51;
  const BOARD_SUM001_Q1_ID = 249;

  const accountingSummaryColumns = [
    { field: "recurso", headerName: "Recurso (MWh)", width: 150 },
    { field: "requisito", headerName: "Requisito (MWh)", width: 150 },
    { field: "lastro", headerName: "Lastro (MWh)", width: 150 },
  ];

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

  useEffect(() => {
    async function fetchData() {
      var participantes = await db.participantes;
      if (participantes === undefined) {
        participantes = [];
      } else {
        participantes = await db.participantes.toArray();
      }

      let repParticipants = participantes?.filter((x) =>
        x.key.includes("representados")
      );

      setParticipants(repParticipants);

      var perfis = await db.perfis;
      if (perfis === undefined) {
        perfis = [];
      } else {
        perfis = await db.perfis.toArray();
      }

      setAllProfiles(perfis);

      var modelagens = await db.modelagem;
      if (modelagens === undefined) {
        modelagens = [];
      } else {
        modelagens = await db.modelagem.toArray();
      }

      setModellingData(modelagens);

      var dataSources = [];

      if (participantes.length > 0) {
        dataSources = dataSources.concat(
          participantes.map(function (v) {
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

    if (pendingRequests > 0) {
      setLoadingModalOpen(true);
    } else {
      setLoadingModalOpen(false);
    }

    const data = JSON.parse(localStorage.getItem("authData"));
    if (data) {
      setAuthData(data);
    }
  }, [pendingRequests]);

  const handleLoadingModalClose = (event, reason) => {
    if (reason === "backdropClick") {
      return;
    }
    setLoadingModalOpen(false);
  };

  function clearFields() {
    setAccountingColumns([]);
    setInitialAccountingRows([]);
    setAccountingRows([]);
    setConsumptionSeries([]);
    setContractSeries([]);
  }

  const handleAgentChange = async (event) => {
    clearFields();
    const selectedParticipant = event.target.value;
    setSelectedAgent(selectedParticipant);
    filterProfiles(selectedParticipant);
    fillAccountingDatesArr();
  };

  const filterProfiles = (selectedParticipant) => {
    let filteredProfiles = allProfiles.filter(
      (x) =>
        x.codAgente === selectedParticipant.codigo &&
        selectedParticipant.key.includes("representados") &&
        selectedParticipant.key
          .substring(selectedParticipant.key.length - 8)
          .toString() === x.key.substring(x.key.length - 8).toString()
    );

    setProfiles([...new Set(filteredProfiles)]);
  };

  const handleProfileChange = async (event) => {
    clearFields();
    const selectedProfile = event.target.value;
    setSelectedProfile(selectedProfile);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const fillAccountingDatesArr = () => {
    const finalDate = dayjs().subtract(2, "month");
    let currentDate = dayjs().subtract(12, "month");
    let dates = [currentDate];

    while (currentDate.format("MM/YYYY") !== finalDate.format("MM/YYYY")) {
      currentDate = currentDate.add(1, "month");
      dates.push(currentDate);
    }

    setAccountingDates(dates);
  };

  async function getFullPeriodReportResults() {
    let reportResults = [];
    let i = 0;

    for (const dt of accountingDates) {
      i++;
      reportResults.push(await getReportResults(dt, i));
    }

    let columns = reportResults.map((x) => x.columns)[0];
    setAccountingColumns(columns);

    let rows = reportResults.map((x) => x.rows);
    let allRows = [];
    let idx = 0;
    let loadProgress = 0;

    for (const innerRow of rows) {
      loadProgress++;
      setProgress(parseInt((loadProgress / rows.length) * 100));

      for (const item of innerRow) {
        idx++;
        item.id = idx;
        allRows.push(item);
      }
    }

    setInitialAccountingRows(allRows);
    filterResultsByProfile(columns, allRows);
  }

  function filterResultsByProfile(accColumns, accRows) {
    let profileField = accColumns.find((x) => x.headerName.includes("PERFIL"));
    let filteredRows = accRows.filter(
      (x) => x[profileField.field] === selectedProfile.sigla
    );
    setAccountingRows(filteredRows);
    loadChartData(filteredRows, accColumns);
  }

  function loadChartData(filteredRows, accColumns) {
    let eventColumn = accColumns.find((x) => x.headerName.includes("EVENTO"));
    let consumptionColumn = accColumns.find((x) =>
      x.headerName.includes("CONSUMO TOTAL")
    );
    let contractColumn = accColumns.find((x) =>
      x.headerName.includes("CONTRATOS DE COMPRA")
    );

    let eventLabels = filteredRows.map((x) =>
      x[eventColumn.field].substring(0, 7).replace("_", "/")
    );
    let consumptionRow = filteredRows.map((x) =>
      x[consumptionColumn.field] === ""
        ? 0
        : parseFloat(x[consumptionColumn.field])
    );
    let contractRow = filteredRows.map((x) =>
      x[contractColumn.field] === "" ? 0 : parseFloat(x[contractColumn.field])
    );

    let consumptionSum = seriesSum(consumptionRow);
    let contractSum = seriesSum(contractRow);
    let summaryRow = {
      id: 1,
      recurso: parseFloat(contractSum),
      requisito: parseFloat(consumptionSum),
      lastro: parseFloat(contractSum - consumptionSum),
    };

    setAccountingSummaryRows([summaryRow]);
    setAccountingChartLabels(eventLabels);
    setConsumptionSeries(consumptionRow);
    setContractSeries(contractRow);
  }

  function seriesSum(series) {
    let sum = 0;
    for (let i = 0; i < series.length; i++) {
      sum += series[i];
    }
    return sum;
  }

  const getReportResults = async (accountingDate, index) => {
    let agentCode = selectedAgent.codigo;

    var responseData = await driService.listarResultadoDeRelatorio(
      authData,
      accountingDate.format("YYYYMM") + "001000",
      BOARD_SUM001_Q1_ID,
      REPORT_SUM001_ID,
      agentCode
    );

    if (responseData.code === 200) {
      const results = responseData.data;
      var tableData = await apiMappings.mapResponseToTableData(
        results,
        agentCode,
        index
      );
      return tableData;
    } else {
      return [];
    }
  };

  const sendAccountingReportRequest = async () => {
    setLoadingText("Processando...");
    setLoadingModalOpen(true);

    setAccountingColumns([]);
    setInitialAccountingRows([]);
    setAccountingRows([]);
    await getFullPeriodReportResults();

    setLoadingModalOpen(false);
    setProgress(0);
  };

  function RenderAccountingTab() {
    return (
      <Stack>
        {profiles !== undefined && profiles.length > 0 ? (
          <Stack>
            <FormControl sx={{ width: "50%" }}>
              <InputLabel id="data-source-select-profile-label">
                Perfil
              </InputLabel>
              <Select
                labelId="profile-select-label"
                id="profile-simple-select"
                value={selectedProfile}
                defaultValue={selectedProfile}
                label="Perfil"
                input={<OutlinedInput label="Sigla" />}
                onChange={handleProfileChange}
              >
                {profiles.map((x) => (
                  <MenuItem key={x.id} value={x}>
                    {x.sigla}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              onClick={sendAccountingReportRequest}
              sx={{ marginTop: 2, width: "50%" }}
            >
              Enviar
            </Button>
          </Stack>
        ) : (
          <div />
        )}

        {consumptionSeries !== undefined && consumptionSeries.length > 0 ? (
          <Stack>
            <DataGrid
              rows={accountingRows}
              columns={accountingColumns}
              sx={{ maxHeight: 440, marginTop: 2 }}
            />
            <LineChart
              width={500}
              height={300}
              series={[
                {
                  data: consumptionSeries,
                  label: "Requisito (MWh)",
                  color: "red",
                },
                { data: contractSeries, label: "Recurso (MWh)", color: "blue" },
              ]}
              xAxis={[{ scaleType: "point", data: accountingChartLabels }]}
            />
            <DataGrid
              rows={accountingSummaryRows}
              columns={accountingSummaryColumns}
              sx={{ maxHeight: 440, maxWidth: 450, marginTop: 2 }}
            />
          </Stack>
        ) : (
          <div />
        )}
      </Stack>
    );
  }

  return (
    <Container className={styles.container}>
      <Typography variant="h5" mb={5}>
        Gestão de clientes
      </Typography>
      <Stack sx={{ marginTop: 2 }} spacing={2}>
        <Stack>
          <Typography variant="h8" mb={1}>
            Total de clientes representados: {participants.length}
          </Typography>
          <Typography variant="h8" mb={1}>
            Total de unidades consumidoras migradas em {date}: {modellingData.length}
          </Typography>
        </Stack>
        <FormControl sx={{ width: "50%" }}>
          <InputLabel id="data-source-select-label">Agente</InputLabel>
          <Select
            labelId="agent-select-label"
            id="agent-simple-select"
            value={selectedAgent}
            defaultValue={selectedAgent}
            label="Agente"
            input={<OutlinedInput label="Name" />}
            onChange={handleAgentChange}
          >
            {participants.map((x) => (
              <MenuItem key={x.id} value={x}>
                {x.sigla}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Divider orientation="horizontal" flexItem />
        {selectedAgent !== "" ? (
          <div>
            <TabContext value={activeTab}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <TabList
                  onChange={handleTabChange}
                  aria-label="lab API tabs example"
                >
                  <Tab label="Análise de Contabilização" value="1" />
                  <Tab label="Proinfa" value="2" />
                  <Tab label="Encargos" value="3" />
                </TabList>
              </Box>
              <TabPanel value="1">{RenderAccountingTab()}</TabPanel>
              <TabPanel value="2">Sem itens para exibição</TabPanel>
              <TabPanel value="3">Sem itens para exibição</TabPanel>
            </TabContext>
          </div>
        ) : (
          <div />
        )}
      </Stack>
      <Modal
        open={loadingModalOpen}
        onClose={handleLoadingModalClose}
        aria-labelledby="loading-Modal"
        aria-describedby="displayed when fetching results"
      >
        <Box sx={style}>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            sx={{ marginTop: "-15px" }}
          >
            {loadingText}
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
            >
              <Typography
                variant="caption"
                component="div"
                color="text.secondary"
              >
                {`${Math.round(progress)}%`}
              </Typography>
            </Box>
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
    </Container>
  );
}
