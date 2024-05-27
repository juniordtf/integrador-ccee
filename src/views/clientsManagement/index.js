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
  const [selectedAgent, setSelectedAgent] = useState("");
  const [activeTab, setActiveTab] = useState("1");

  const date = dayjs().format("MM/YYYY");

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

      // var perfis = await db.perfis;
      // if (perfis === undefined) {
      //   perfis = [];
      // } else {
      //   perfis = await db.perfis.toArray();
      // }

      // setProfiles(perfis);

      // var ativosMedicao = await db.ativosMedicao;
      // if (ativosMedicao === undefined) {
      //   ativosMedicao = [];
      // } else {
      //   ativosMedicao = await db.ativosMedicao.toArray();
      // }

      // setResources(ativosMedicao);

      // var parcelasAtivosMedicao = await db.parcelasAtivosMedicao;
      // if (parcelasAtivosMedicao === undefined) {
      //   parcelasAtivosMedicao = [];
      // } else {
      //   parcelasAtivosMedicao = await db.parcelasAtivosMedicao.toArray();
      // }

      // setPartialResources(parcelasAtivosMedicao);

      // var parcelasDeCarga = await db.parcelasDeCarga;
      // if (parcelasDeCarga === undefined) {
      //   parcelasDeCarga = [];
      // } else {
      //   parcelasDeCarga = await db.parcelasDeCarga.toArray();
      // }

      // setPartialLoads(parcelasDeCarga);

      // var topologias = await db.topologia;
      // if (topologias === undefined) {
      //   topologias = [];
      // } else {
      //   topologias = await db.topologia.toArray();
      // }

      // setTopologies(topologias);

      var dataSources = [];

      if (participantes.length > 0) {
        dataSources = dataSources.concat(
          participantes.map(function (v) {
            return v.key;
          })
        );
      }
      // if (perfis.length > 0) {
      //   dataSources = dataSources.concat(
      //     perfis.map(function (v) {
      //       return v.key;
      //     })
      //   );
      // }

      // if (ativosMedicao.length > 0) {
      //   dataSources = dataSources.concat(
      //     ativosMedicao.map(function (v) {
      //       return v.key;
      //     })
      //   );
      // }

      // if (parcelasAtivosMedicao.length > 0) {
      //   dataSources = dataSources.concat(
      //     parcelasAtivosMedicao.map(function (v) {
      //       return v.key;
      //     })
      //   );
      // }

      // if (parcelasDeCarga.length > 0) {
      //   dataSources = dataSources.concat(
      //     parcelasDeCarga.map(function (v) {
      //       return v.key;
      //     })
      //   );
      // }

      // if (topologias.length > 0) {
      //   dataSources = dataSources.concat(
      //     topologias.map(function (v) {
      //       return v.key;
      //     })
      //   );
      // }

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
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container className={styles.container}>
      <Typography variant="h5" mb={5}>
        Gestão de clientes
      </Typography>
      <Stack divider={<flexItem />} sx={{ marginTop: 2 }} spacing={2}>
        <Stack divider={<flexItem />}>
          <Typography variant="h8" mb={1}>
            Total de clientes representados: {participants.length}
          </Typography>
          <Typography variant="h8" mb={1}>
            Total de migrações em {date}: {participants.length}
          </Typography>
        </Stack>
        <Divider orientation="horizontal" flexItem />
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
              <MenuItem key={x.id} value={x.sigla}>
                {x.sigla}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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
          <TabPanel value="1">Item One</TabPanel>
          <TabPanel value="2">Item Two</TabPanel>
          <TabPanel value="3">Item Three</TabPanel>
        </TabContext>
      </Stack>
    </Container>
  );
}
