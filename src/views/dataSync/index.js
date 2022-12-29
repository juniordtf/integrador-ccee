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

export default function DataSyncView(): React$Element<*> {
  const [authData, setAuthData] = useState([]);
  const [dataSourceKeys, setDataSourceKeys] = useState([]);
  const [service, setService] = useState("");
  const [category, setCategory] = useState("");
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
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleServiceChange = (event) => {
    setService(event.target.value);
    //localStorage.removeItem("DATA_SOURCE_KEYS");
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
    console.log(event.target.value);
  };

  const sendRequest_ListarParticipantes = async () => {
    handleOpen();

    var totalPages =
      await cadastrosService.listarParticipantesDeMercado_totalDePaginas(
        authData,
        "01",
        dayjs(date).format("YYYY-MM-DDTHH:mm:ss"),
        category
      );

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
        var participantesData =
          await cadastrosService.listarParticipantesDeMercado(
            authData,
            currentPage,
            dayjs(date).format("YYYY-MM-DDTHH:mm:ss"),
            category
          );

        participantesData.map((x) => {
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
          //console.log(participants.length);
        });
      }, 5000);

      if (currentPage === totalPages) {
        handleClose();
      }
    }
  };

  const sendRequest_ListarPerfis = async () => {};

  const sendRequest_ListarAtivosDeMedicao = async () => {};

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
