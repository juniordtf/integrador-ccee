import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Modal from "@mui/material/Modal";
import dayjs from "dayjs";
import Stack from "@mui/material/Stack";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
//import { makeStyles } from "@mui/material/styles";
import styles from "./styles.module.css";
import { cadastrosService } from "../../services/cadastrosService.ts";
import { ativosService } from "../../services/ativosService.ts";

export default function DataSyncView(): React$Element<*> {
  const [authData, setAuthData] = useState([]);
  const [dataSourceKeys, setDataSourceKeys] = useState([]);
  const [selectedDataSource, setSelectedDataSource] = useState("");
  const [dataSourceItems, setDataSourceItems] = useState([]);
  const [service, setService] = useState("");
  const [category, setCategory] = useState("");
  const [pendingRequests, setPendingRequests] = useState(0);
  const [date, setDate] = useState(dayjs());
  const [open, setOpen] = useState(false);

  const servicos = [
    { id: 1, name: "Listar participantes de mercado" },
    { id: 2, name: "Listar perfis" },
    { id: 3, name: "Listar ativos de medição" },
    { id: 4, name: "Listar parcelas de carga" },
  ];
  const classes = [
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

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  useEffect(() => {
    //localStorage.clear();
    const data = JSON.parse(localStorage.getItem("authData"));
    if (data) {
      setAuthData(data);
    }
    const dataSources = JSON.parse(localStorage.getItem("DATA_SOURCE_KEYS"));
    if (dataSources) {
      setDataSourceKeys(dataSources);
    }

    if (pendingRequests > 0) {
      handleOpen();
    } else {
      handleClose();
    }
  }, [pendingRequests]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleServiceChange = (event) => {
    setService(event.target.value);
    //localStorage.removeItem("DATA_SOURCE_KEYS");
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleDataSourceChange = (event) => {
    setSelectedDataSource(event.target.value);
    const content = JSON.parse(localStorage.getItem(event.target.value));
    setDataSourceItems(content);
  };

  const sendRequest_ListarParticipantes = async () => {
    setPendingRequests(pendingRequests + 1);
    var totalPages =
      await cadastrosService.listarParticipantesDeMercado_totalDePaginas(
        authData,
        "01",
        dayjs(date).format("YYYY-MM-DDTHH:mm:ss"),
        category
      );
    setPendingRequests(pendingRequests - 1);

    console.log(totalPages);
    const categoryName = classes.find((x) => x.id === category).name;
    const key =
      "participantes_" + categoryName + "_" + dayjs(date).format("MM/YY");

    let keys = [];
    if (dataSourceKeys.length === 0) {
      keys = [key];
    } else {
      keys = dataSourceKeys.concat(key);
    }
    console.log(JSON.stringify(keys));
    localStorage.setItem("DATA_SOURCE_KEYS", JSON.stringify(keys));

    let participants = [];

    for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
      // eslint-disable-next-line no-loop-func
      setTimeout(async () => {
        setPendingRequests(pendingRequests + 1);

        var participantesData =
          await cadastrosService.listarParticipantesDeMercado(
            authData,
            currentPage,
            dayjs(date).format("YYYY-MM-DDTHH:mm:ss"),
            category
          );

        if (participantesData !== null) {
          participantesData.forEach((x) => {
            const cnpj =
              x["bov2:parte"]["bov2:pessoaJuridica"]["bov2:identificacoes"] !==
              undefined
                ? x["bov2:parte"]["bov2:pessoaJuridica"]["bov2:identificacoes"][
                    "bov2:identificacao"
                  ]["bov2:numero"]._text.toString()
                : "";
            const nomeEmpresarial =
              x["bov2:parte"]["bov2:pessoaJuridica"][
                "bov2:nomeEmpresarial"
              ]._text.toString();
            const sigla = x["bov2:sigla"]._text.toString();
            const codigo = x["bov2:codigo"]._text.toString();
            let periodoVigencia =
              x["bov2:periodoVigencia"]["bov2:inicio"]._text.toString();
            periodoVigencia = dayjs(periodoVigencia).format("DD/MM/YYYY");
            const situacao =
              x["bov2:situacao"]["bov2:descricao"]._text.toString();

            const participante = {
              cnpj,
              nomeEmpresarial,
              situacao,
              sigla,
              codigo,
              periodoVigencia,
            };
            if (participants.length === 0) {
              participants = [participante];
            } else {
              participants = participants.concat(participante);
            }
            localStorage.setItem(key, JSON.stringify(participants));
            console.log(participants.length);
          });
        }
        setPendingRequests(pendingRequests - 1);
      }, 5000);
    }
  };

  const sendRequest_ListarPerfis = async () => {
    const key = selectedDataSource.replace("participantes", "perfis");
    console.log(key);
    let keys = dataSourceKeys.concat(key);

    console.log(JSON.stringify(keys));
    localStorage.setItem("DATA_SOURCE_KEYS", JSON.stringify(keys));
    let profiles = [];

    dataSourceItems.forEach((x) => {
      setTimeout(async () => {
        setPendingRequests(pendingRequests + 1);
        var perfis = await cadastrosService.listarPerfis(authData, x.codigo);

        if (perfis !== null) {
          perfis.forEach((y) => {
            const classe = y["bov2:classe"]["bov2:descricao"]._text.toString();
            const codPerfil = y["bov2:codigo"]._text.toString();
            var comercializadorVarejista =
              y["bov2:comercializadorVarejista"]._text.toString();
            const sigla = y["bov2:sigla"]._text.toString();
            const situacao =
              y["bov2:situacao"]["bov2:descricao"]._text.toString();
            const submercado =
              y["bov2:submercado"] === undefined
                ? "Sem informação"
                : y["bov2:submercado"]["bov2:nome"]._text.toString();
            var perfilPrincipal = y["bov2:perfilPrincipal"]._text.toString();
            var regimeCotas = y["bov2:regimeCotas"]._text.toString();
            comercializadorVarejista =
              comercializadorVarejista === "true" ? "Sim" : "Não";
            perfilPrincipal = perfilPrincipal === "true" ? "Sim" : "Não";
            regimeCotas = regimeCotas === "true" ? "Sim" : "Não";

            const perfil = {
              codAgente: x.codigo,
              classe,
              codPerfil,
              comercializadorVarejista,
              sigla,
              situacao,
              submercado,
              perfilPrincipal,
              regimeCotas,
            };

            if (profiles.length === 0) {
              profiles = [perfil];
            } else {
              profiles = profiles.concat(perfil);
            }
            localStorage.setItem(key, JSON.stringify(profiles));
            console.log(profiles.length);
          });
        }
        setPendingRequests(pendingRequests - 1);
      }, 5000);
    });
  };

  const sendRequest_ListarAtivosDeMedicao = async () => {
    var date = selectedDataSource.substring(selectedDataSource.length - 5);
    date =
      "20" +
      date.substring(date.length - 2) +
      "-" +
      date.substring(0, 2) +
      "-01";

    const key = selectedDataSource.replace("perfis", "ativos");
    console.log(key);
    let keys = dataSourceKeys.concat(key);

    console.log(JSON.stringify(keys));
    localStorage.setItem("DATA_SOURCE_KEYS", JSON.stringify(keys));
    let resources = [];

    dataSourceItems.forEach((x) => {
      setTimeout(async () => {
        setPendingRequests(pendingRequests + 1);
        var responseData = await ativosService.listarAtivosDeMedicao(
          authData,
          x.codPerfil,
          dayjs(date).format("YYYY-MM-DDTHH:mm:ss")
        );
        if (responseData !== null) {
          var totalPaginas = responseData.totalPaginas;
          var totalPaginasNumber = parseInt(totalPaginas._text.toString());
          if (totalPaginasNumber > 1) {
            for (
              let paginaCorrente = 1;
              paginaCorrente <= totalPaginasNumber;
              paginaCorrente++
            ) {
              // eslint-disable-next-line no-loop-func
              setTimeout(async () => {
                setPendingRequests(pendingRequests + 1);
                var responseDataPaginated =
                  await ativosService.listarAtivosDeMedicao(
                    authData,
                    x.codPerfil,
                    dayjs(date).format("YYYY-MM-DDTHH:mm:ss"),
                    paginaCorrente
                  );

                var ativos = responseDataPaginated.ativos;
                if (ativos !== null) {
                  ativos.forEach((y) => {
                    const codAtivo = y["bov2:codigo"]._text.toString();
                    const nome = y["bov2:nome"]._text.toString();
                    const tipo =
                      y["bov2:tipo"]["bov2:descricao"]._text.toString();
                    const situacao =
                      y["bov2:situacao"]["bov2:descricao"]._text.toString();
                    const vigencia =
                      y["bov2:vigencia"]["bov2:inicio"]._text.toString();

                    const resource = {
                      codPerfil: x.codPerfil,
                      codAtivo,
                      nome,
                      tipo,
                      situacao,
                      vigencia,
                    };

                    if (resources.length === 0) {
                      resources = [resource];
                    } else {
                      resources = resources.concat(resource);
                    }
                    console.log(resource);
                    console.log("Pagina: " + paginaCorrente);
                    localStorage.setItem(key, JSON.stringify(resources));
                    console.log(resources.length);
                  });
                }
                setPendingRequests(pendingRequests - 1);
              });
            }
          } else {
            var ativos = responseData.ativos;
            ativos.forEach((y) => {
              const codAtivo = y["bov2:codigo"]._text.toString();
              const nome = y["bov2:nome"]._text.toString();
              const tipo = y["bov2:tipo"]["bov2:descricao"]._text.toString();
              const situacao =
                y["bov2:situacao"]["bov2:descricao"]._text.toString();
              const vigencia =
                y["bov2:vigencia"]["bov2:inicio"]._text.toString();

              const resource = {
                codPerfil: x.codPerfil,
                codAtivo,
                nome,
                tipo,
                situacao,
                vigencia,
              };

              if (resources.length === 0) {
                resources = [resource];
              } else {
                resources = resources.concat(resource);
              }
              console.log(resource);
              localStorage.setItem(key, JSON.stringify(resources));
              console.log(resources.length);
            });
          }
        }
        setPendingRequests(pendingRequests - 1);
      }, 5000);
    });
  };

  const sendRequest_ListarParcelasDeCarga = async () => {};

  const sendRequest = () => {
    switch (service) {
      case 1:
        sendRequest_ListarParticipantes();
        break;
      case 2:
        sendRequest_ListarPerfis();
        break;
      case 3:
        sendRequest_ListarAtivosDeMedicao();
        break;
      case 4:
        sendRequest_ListarParcelasDeCarga();
        break;
      default:
        sendRequest_ListarParticipantes();
        break;
    }
  };

  const chooseFieldsToRender = () => {
    const serviceId = parseInt(service);

    if (serviceId === 1) {
      return <div>{renderParticipantsFields()}</div>;
    } else if (serviceId === 2 || serviceId === 3) {
      return <div>{renderProfileOrMeasurementFields(serviceId)}</div>;
    } else if (serviceId === 4) {
      return <div>{renderLoadFields()}</div>;
    } else {
      return <div></div>;
    }
  };

  const renderParticipantsFields = () => {
    return (
      <Stack spacing={2}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            label="Data & Hora"
            value={date}
            onChange={(newValue) => {
              setDate(newValue);
            }}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>

        <FormControl>
          <InputLabel id="class-simple-select-label">Classe</InputLabel>
          <Select
            labelId="class-simple-select-label"
            id="class-simple-select"
            value={category}
            label="Classe"
            onChange={handleCategoryChange}
          >
            {classes.map((x) => (
              <MenuItem value={x.id}>{x.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    );
  };

  const renderProfileOrMeasurementFields = (serviceIdx) => {
    var sortedDataSourceKeys = [];
    if (serviceIdx === 2) {
      sortedDataSourceKeys = dataSourceKeys.filter((item) =>
        item.includes("participantes")
      );
    } else {
      sortedDataSourceKeys = dataSourceKeys.filter((item) =>
        item.includes("perfis")
      );
    }
    return (
      <Stack spacing={2}>
        <FormControl>
          <InputLabel id="data-source-select-label">Fonte de dados</InputLabel>
          <Select
            labelId="data-source-select-label"
            id="data-source-simple-select"
            value={selectedDataSource}
            label="Fonte de dados"
            onChange={handleDataSourceChange}
          >
            {sortedDataSourceKeys.map((x) => (
              <MenuItem value={x}>{x}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    );
  };

  const renderLoadFields = () => {
    return <div></div>;
  };

  return (
    <Container className={styles.container}>
      <Typography paragraph>Importar Dados</Typography>

      <Stack sx={{ width: "50%" }} spacing={2}>
        <FormControl>
          <InputLabel id="service-select-label">Serviço</InputLabel>
          <Select
            labelId="service-select-label"
            id="service-simple-select"
            value={service}
            label="Serviço"
            onChange={handleServiceChange}
          >
            {servicos.map((x) => (
              <MenuItem value={x.id}>{x.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {chooseFieldsToRender()}
      </Stack>
      <Button variant="outlined" onClick={sendRequest} sx={{ marginTop: 2 }}>
        Enviar
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Processando requisição
          </Typography>
          <CircularProgress />
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Por favor, aguarde...
          </Typography>
        </Box>
      </Modal>
    </Container>
  );
}
