import React, { useEffect, useState } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TreeView from "@mui/lab/TreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TreeItem from "@mui/lab/TreeItem";
import { db } from "../../database/db";
import styles from "./styles.module.css";

export default function HierarchicalView() {
  const [dataSourceKeys, setDataSourceKeys] = useState([]);
  const [selectedDataSource, setSelectedDataSource] = useState("");
  const [participantsCode, setParticipantsCode] = useState("");
  const [treeViewData, setTreeViewData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      var participantes = await db.participantes;
      if (participantes === undefined) {
        participantes = [];
      } else {
        participantes = await db.participantes.toArray();
      }

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

  const handleDataSourceChange = async (event) => {
    const selectedDataSourceKey = event.target.value;
    setSelectedDataSource(selectedDataSourceKey);
  };

  const generateTreeView = async () => {
    if (participantsCode === "") return;

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
    var parcelasAtivosMedicao = await db.parcelasAtivosMedicao;
    if (parcelasAtivosMedicao === undefined) {
      parcelasAtivosMedicao = [];
    } else {
      parcelasAtivosMedicao = await db.parcelasAtivosMedicao.toArray();
    }

    var selectedParticipant = participantes.find(
      (x) => x.codigo === participantsCode
    );

    var relatedProfiles = perfis.filter(
      (x) => x.codAgente === participantsCode
    );

    var profileInitialCode = 1;
    var partialResourceInitialCode = relatedProfiles.length + 1;
    var relatedProfileNodes = [];

    for (const x of relatedProfiles) {
      var relatedPartialResource = parcelasAtivosMedicao.filter(
        (y) => y.codPerfil === x.codPerfil
      );

      if (relatedPartialResource.length > 0) {
        var relatedPartialResourceNodes = [];

        for (const z of relatedPartialResource) {
          partialResourceInitialCode++;
          var innerItem = {
            id: partialResourceInitialCode.toString(),
            name: z.nome,
            codigo: z.codParcelaAtivo,
          };
          relatedPartialResourceNodes.push(innerItem);
        }
      }

      var item = {
        id: profileInitialCode.toString(),
        name: x.sigla,
        codigo: x.codPerfil,
        children: relatedPartialResourceNodes,
      };
      relatedProfileNodes.push(item);

      profileInitialCode++;
    }

    const data = {
      id: "root",
      name: selectedParticipant.nomeEmpresarial,
      children: relatedProfileNodes,
    };

    setTreeViewData(data);
  };

  const renderTree = (nodes) => (
    <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.name}>
      {Array.isArray(nodes.children)
        ? nodes.children.map((node) => renderTree(node))
        : null}
    </TreeItem>
  );

  return (
    <div>
      <Typography paragraph>Visualização Hierárquica</Typography>
      <Stack direction="row" spacing={2}>
        <FormControl sx={{ width: "45%" }}>
          <InputLabel id="data-source-select-label">Fonte de dados</InputLabel>
          <Select
            labelId="data-source-select-label"
            id="data-source-simple-select"
            label="Fonte de dados"
            value={selectedDataSource}
            onChange={handleDataSourceChange}
          >
            {dataSourceKeys.map((x) => (
              <MenuItem value={x}>{x}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          sx={{ width: "20%" }}
          id="outlined-password-input"
          label="Cód Agente"
          type="number"
          onChange={(event) => setParticipantsCode(event.target.value)}
        />
        <Button
        variant="outlined"
        onClick={generateTreeView}
      >
        Gerar Visualização
      </Button>
      </Stack>
      
      <div className={styles.treeViewContainer}>
        <TreeView
          aria-label="rich object"
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpanded={["root"]}
          defaultExpandIcon={<ChevronRightIcon />}
          sx={{
            minHeight: 250,
            maxHeight: 500,
            flexGrow: 1,
            overflowY: "auto",
          }}
        >
          {renderTree(treeViewData)}
        </TreeView>
      </div>
    </div>
  );
}
