import React, { useEffect, useState, useRef } from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
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
import dayjs from "dayjs";
import { db } from "../../database/db";
import styles from "./styles.module.css";

export default function ClientsManagementView() {
  const [authData, setAuthData] = useState([]);
  const [dataSourceKeys, setDataSourceKeys] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedProfile, setSelectedProfile] = useState("");
  const [activeTab, setActiveTab] = useState("1");
  const [accountingDates, setAccountingDates] = useState([]);

  const date = dayjs().format("MM/YYYY");
  const initialMonth = dayjs().subtract(12, "month").format("MM/YYYY");

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

      setProfiles(perfis);

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
  }, []);

  const handleAgentChange = async (event) => {
    const selectedParticipant = event.target.value;
    setSelectedAgent(selectedParticipant);
    filterProfiles(selectedParticipant);
    fillAccountingDatesArr();
  };

  const filterProfiles = (selectedParticipant) => {
    let filteredProfiles = profiles.filter(
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

  function RenderAccountingTab() {
    return (
      <Stack divider={<Divider flexItem />}>
        <FormControl sx={{ width: "50%" }}>
          <InputLabel id="data-source-select-profile-label">Perfil</InputLabel>
          <Select
            labelId="profile-select-label"
            id="profile-simple-select"
            value={selectedProfile}
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
            Total de migrações em {date}: {participants.length}
          </Typography>
        </Stack>
        <FormControl sx={{ width: "50%" }}>
          <InputLabel id="data-source-select-label">Agente</InputLabel>
          <Select
            labelId="agent-select-label"
            id="agent-simple-select"
            value={selectedAgent}
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
              <TabPanel value="2">Item Two</TabPanel>
              <TabPanel value="3">Item Three</TabPanel>
            </TabContext>
          </div>
        ) : (
          <div />
        )}
      </Stack>
    </Container>
  );
}
