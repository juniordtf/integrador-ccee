import React, { useEffect, useState } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Modal from "@mui/material/Modal";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TreeView from "@mui/lab/TreeView";
import TreeItem, { treeItemClasses } from "@mui/lab/TreeItem";
import Box from "@mui/material/Box";
import { db } from "../../database/db";
import { styled } from "@mui/material/styles";
import styles from "./styles.module.css";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import formatStringByPattern from "format-string-by-pattern";
import Divider from "@mui/material/Divider";

export default function HierarchicalView() {
  const [dataSourceKeys, setDataSourceKeys] = useState([]);
  const [selectedDataSource, setSelectedDataSource] = useState("");
  const [participantsCode, setParticipantsCode] = useState("");
  const [treeViewData, setTreeViewData] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [partialResources, setPartialResources] = useState([]);
  const [selectedType, setSelectedType] = useState(0);
  const [selectedParticipantData, setSelectedParticipantData] = useState([]);
  const [selectedProfileData, setSelectedProfileData] = useState([]);
  const [selectedPartialResourceData, setSelectedPartialResourceData] =
    useState([]);
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = (event, reason) => {
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

    setSelectedType(0);
    handleOpen();

    var selectedParticipant = participants.find(
      (x) => x.codigo === participantsCode
    );

    if (selectedParticipant === undefined) {
      handleClose();
      return;
    }

    var relatedProfiles = profiles.filter(
      (x) => x.codAgente === participantsCode
    );

    if (relatedProfiles.length === 0) {
      handleClose();
      return;
    }

    var profileInitialCode = 1;
    var partialResourceInitialCode = relatedProfiles.length + 1;
    var relatedProfileNodes = [];

    for (const x of relatedProfiles) {
      var relatedPartialResource = partialResources.filter(
        (y) => y.codPerfil === x.codPerfil
      );

      if (relatedPartialResource.length > 0) {
        var relatedPartialResourceNodes = [];

        for (const z of relatedPartialResource) {
          partialResourceInitialCode++;
          var innerItem = {
            id: partialResourceInitialCode.toString(),
            name: z.nome,
            code: z.codParcelaAtivo,
            category: 3,
            icon: EmojiObjectsIcon,
            color: "#3c8039",
            bgColor: "#e6f4ea",
          };
          relatedPartialResourceNodes.push(innerItem);
        }
      }

      var item = {
        id: profileInitialCode.toString(),
        name: x.sigla,
        code: x.codPerfil,
        category: 2,
        children: relatedPartialResourceNodes,
        icon: PersonIcon,
        color: "#e3742f",
        bgColor: "#fcefe3",
      };
      relatedProfileNodes.push(item);

      profileInitialCode++;
    }

    const data = {
      id: "root",
      name: selectedParticipant.nomeEmpresarial,
      children: relatedProfileNodes,
      code: selectedParticipant.codigo,
      category: 1,
      icon: BusinessIcon,
      color: "#1a73e8",
      bgColor: "#e8f0fe",
    };

    setTreeViewData(data);
    handleClose();
  };

  const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
    color: theme.palette.text.secondary,
    [`& .${treeItemClasses.content}`]: {
      color: theme.palette.text.secondary,
      paddingRight: theme.spacing(1),
      fontWeight: theme.typography.fontWeightMedium,
      "&.Mui-expanded": {
        fontWeight: theme.typography.fontWeightRegular,
      },
      "&:hover": {
        backgroundColor: theme.palette.action.hover,
      },
      "&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused": {
        backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
        color: "var(--tree-view-color)",
      },
      [`& .${treeItemClasses.label}`]: {
        fontWeight: "inherit",
        color: "inherit",
      },
    },
    [`& .${treeItemClasses.group}`]: {
      marginLeft: 0,
      [`& .${treeItemClasses.content}`]: {
        paddingLeft: theme.spacing(2),
      },
    },
  }));

  function StyledTreeItem(props) {
    const { bgColor, color, labelIcon: LabelIcon, labelText, ...other } = props;

    return (
      <StyledTreeItemRoot
        label={
          <Box sx={{ display: "flex", alignItems: "center", p: 0.5, pr: 0 }}>
            <Box component={LabelIcon} color="inherit" sx={{ mr: 1 }} />
            <Typography
              variant="body2"
              sx={{ fontWeight: "inherit", flexGrow: 1 }}
            >
              {labelText}
            </Typography>
          </Box>
        }
        style={{
          "--tree-view-color": color,
          "--tree-view-bg-color": bgColor,
        }}
        {...other}
      />
    );
  }

  const viewDetails = (category, code) => {
    setSelectedType(category);

    if (category === 1) {
      var selectedParticipant = participants.find((x) => x.codigo === code);
      setSelectedParticipantData(selectedParticipant);
    } else if (category === 2) {
      var selectedProfile = profiles.find((x) => x.codPerfil === code);
      setSelectedProfileData(selectedProfile);
    } else {
      var selectedPartialResources = partialResources.find(
        (x) => x.codParcelaAtivo === code
      );
      setSelectedPartialResourceData(selectedPartialResources);
    }
  };

  const chooseCardToRender = () => {
    if (selectedType === 1) {
      return <div>{ParticipantCard()}</div>;
    } else if (selectedType === 2) {
      return <div>{ProfileCard()}</div>;
    } else if (selectedType === 3) {
      return <div>{PartialResourceCard()}</div>;
    } else {
      return <div></div>;
    }
  };

  function ParticipantCard() {
    var cnpj = formatStringByPattern(
      "XX.XXX.XXX/XXXX-XX",
      selectedParticipantData.cnpj
    );

    return (
      <div>
        <Box className={styles.detailsCard}>
          <Stack direction="row" spacing={1} className={styles.cardHeader}>
            <BusinessIcon sx={{ color: "#1a73e8" }} />
            <Typography className={styles.participantCardHeaderText}>
              Agente
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Typography className={styles.cardFieldText}>CNPJ:</Typography>
            <Typography className={styles.cardText}>{cnpj}</Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Typography className={styles.cardFieldText}>Nome:</Typography>
            <Typography className={styles.cardText}>
              {selectedParticipantData.nomeEmpresarial}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Typography className={styles.cardFieldText}>Sigla:</Typography>
            <Typography className={styles.cardText}>
              {selectedParticipantData.sigla}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Typography className={styles.cardFieldText}>
              Código de Agente:
            </Typography>
            <Typography className={styles.cardText}>
              {selectedParticipantData.codigo}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Typography className={styles.cardFieldText}>
              Data de início de vigência:
            </Typography>
            <Typography className={styles.cardText}>
              {selectedParticipantData.periodoVigencia}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Typography className={styles.cardFieldText}>Situação:</Typography>
            <Typography className={styles.cardText}>
              {selectedParticipantData.situacao}
            </Typography>
          </Stack>
        </Box>
      </div>
    );
  }

  function ProfileCard() {
    return (
      <div>
        <Box className={styles.detailsCard}>
          <Stack direction="row" spacing={1} className={styles.cardHeader}>
            <PersonIcon sx={{ color: "#e3742f" }} />
            <Typography className={styles.profileCardHeaderText}>
              Perfil
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Typography className={styles.cardFieldText}>Sigla:</Typography>
            <Typography className={styles.cardText}>
              {selectedProfileData.sigla}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Typography className={styles.cardFieldText}>Classe:</Typography>
            <Typography className={styles.cardText}>
              {selectedProfileData.classe}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Typography className={styles.cardFieldText}>
              Submercado:
            </Typography>
            <Typography className={styles.cardText}>
              {selectedProfileData.submercado}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Typography className={styles.cardFieldText}>Código:</Typography>
            <Typography className={styles.cardText}>
              {selectedProfileData.codPerfil}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Typography className={styles.cardFieldText}>
              Perfil principal?
            </Typography>
            <Typography className={styles.cardText}>
              {selectedProfileData.perfilPrincipal}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Typography className={styles.cardFieldText}>Situação:</Typography>
            <Typography className={styles.cardText}>
              {selectedProfileData.situacao}
            </Typography>
          </Stack>
        </Box>
      </div>
    );
  }

  function PartialResourceCard() {
    var cnpj = formatStringByPattern(
      "XX.XXX.XXX/XXXX-XX",
      selectedPartialResourceData.cnpj
    );

    return (
      <div>
        <Box className={styles.detailsCard}>
          <Stack direction="row" spacing={1} className={styles.cardHeader}>
            <EmojiObjectsIcon sx={{ color: "#3c8039" }} />
            <Typography className={styles.partialResourceCardHeaderText}>
              Parcela de Ativo de Medição
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Typography className={styles.cardFieldText}>Nome:</Typography>
            <Typography className={styles.cardText}>
              {selectedPartialResourceData.nome}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Typography className={styles.cardFieldText}>CNPJ:</Typography>
            <Typography className={styles.cardText}>{cnpj}</Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Typography className={styles.cardFieldText}>Código:</Typography>
            <Typography className={styles.cardText}>
              {selectedPartialResourceData.codParcelaAtivo}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Typography className={styles.cardFieldText}>
              Data de início de vigência:
            </Typography>
            <Typography className={styles.cardText}>
              {selectedPartialResourceData.periodoVigencia}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Typography className={styles.cardFieldText}>Situação:</Typography>
            <Typography className={styles.cardText}>
              {selectedPartialResourceData.situacao}
            </Typography>
          </Stack>
        </Box>
      </div>
    );
  }

  const renderTree = (nodes) => (
    <StyledTreeItem
      nodeId={nodes.id}
      labelText={nodes.name}
      labelIcon={nodes.icon}
      color={nodes.color}
      bgColor={nodes.bgColor}
      onClick={() => {
        viewDetails(nodes.category, nodes.code);
      }}
    >
      {Array.isArray(nodes.children)
        ? nodes.children.map((node) => renderTree(node))
        : null}
    </StyledTreeItem>
  );

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
      <Typography variant="h5" mb={2}>Visualização Hierárquica</Typography>
      <Stack
        direction="row"
        spacing={2}
      >
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
        <Divider orientation="horizontal" />
        <Button variant="outlined" onClick={generateTreeView}>
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
      <div className={styles.detailsSection}>{chooseCardToRender()}</div>

      <Modal
        open={open}
        onClose={handleClose}
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
            Gerando visualização
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
    </div>
  );
}
