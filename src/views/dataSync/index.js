import React, { useEffect, useState, useRef } from "react";
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
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import dayjs from "dayjs";
import Stack from "@mui/material/Stack";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { OutTable, ExcelRenderer } from "react-excel-renderer";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Switch from "@mui/material/Switch";
import styles from "./styles.module.css";
import { cadastrosService } from "../../services/cadastrosService.ts";
import { ativosService } from "../../services/ativosService.ts";
import { medicaoService } from "../../services/medicaoService.ts";
import { workers } from "../../webWorkers/workers.js";
import WebWorker from "../../webWorkers/workerSetup";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../database/db";
import { setWeekYearWithOptions } from "date-fns/fp";
import exportFromJSON from "export-from-json";

export default function DataSyncView() {
  const [authData, setAuthData] = useState([]);
  const [dataSourceKeys, setDataSourceKeys] = useState([]);
  const [retryKeys, setRetryKeys] = useState([]);
  const [parameter, setParameter] = useState("");
  const [searchMethod, setSearchMethod] = useState("Automático");
  const [participantSearchMethod, setParticipantSearchMethod] =
    useState("Classe");
  const [selectedDataSource, setSelectedDataSource] = useState("");
  const [dataSourceItems, setDataSourceItems] = useState([]);
  const [service, setService] = useState("");
  const [category, setCategory] = useState("");
  const [pendingRequests, setPendingRequests] = useState(0);
  const [progress, setProgress] = useState(0);
  const [openSuccessDialog, setSuccessDialogOpen] = useState(false);
  const [openWarningDialog, setWarningDialogOpen] = useState(false);
  const [warningText, setWarningText] = useState("");
  const [date, setDate] = useState(dayjs());
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [scdeCode, setScdeCode] = useState("");
  const [measurementsValues, setMeasurementsValues] = useState([]);
  const [modellingValues, setModellingValues] = useState([]);
  const [onlyRepresentedAgents, setOnlyRepresentedAgents] = useState(false);

  const timerRef = useRef(null);

  const servicos = [
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

  const parameters = [
    { id: 1, name: "Código Medidor SCDE" },
    { id: 2, name: "Código Parcela de Ativo" },
    { id: 3, name: "Código Ativo de Medição" },
    { id: 4, name: "Código Perfil" },
    { id: 5, name: "CNPJ" },
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

  const handleSuccessDialogClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSuccessDialogOpen(false);
  };

  const handleWarningDialogClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setWarningDialogOpen(false);
  };

  const fetchWebWorker = () => {
    const test = {
      name: "Marco",
      Phone: "2398432984",
      authData,
      date,
      category,
    };
    workers.bla.postMessage(test);
  };

  useEffect(() => {
    //localStorage.clear();

    //workers.bla = new WebWorker(workers.bla);

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
      var parcelasDeAtivos = await db.parcelasAtivosMedicao;
      if (parcelasDeAtivos === undefined) {
        parcelasDeAtivos = [];
      } else {
        parcelasDeAtivos = await db.parcelasAtivosMedicao.toArray();
      }

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

      if (parcelasDeAtivos.length > 0) {
        dataSources = dataSources.concat(
          parcelasDeAtivos.map(function (v) {
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

    const data = JSON.parse(localStorage.getItem("authData"));
    if (data) {
      setAuthData(data);
    }

    const keys = JSON.parse(localStorage.getItem("RETRY_KEYS"));
    if (keys) {
      setRetryKeys(keys);
    }

    if (pendingRequests > 0) {
      handleOpen();
    } else {
      handleClose();
    }

    // workers.bla.addEventListener("message", (event) => {
    //   console.log(event.data.length);
    // });
  }, [pendingRequests]);

  const handleOpen = () => setOpen(true);
  const handleClose = (event, reason) => {
    if (reason === "backdropClick") {
      return;
    }
    setOpen(false);
  };

  const handleServiceChange = (event) => {
    setService(event.target.value);
    //localStorage.removeItem("DATA_SOURCE_KEYS");
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleDataSourceChange = async (event) => {
    setPendingRequests(pendingRequests + 1);

    const selectedDataSourceKey = event.target.value;
    setSelectedDataSource(event.target.value);
    var participantes = await db.participantes.toArray();
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
    var parcelasDeAtivos = await db.parcelasAtivosMedicao;
    if (parcelasDeAtivos === undefined) {
      parcelasDeAtivos = [];
    } else {
      parcelasDeAtivos = await db.parcelasAtivosMedicao.toArray();
    }

    if (
      participantes.length > 0 &&
      participantes.filter((x) => x.key === selectedDataSourceKey).length > 0
    ) {
      var selectedParticipants = participantes.filter(
        (x) => x.key === selectedDataSourceKey
      );
      console.log(selectedParticipants.length);
      setDataSourceItems(selectedParticipants);
    } else if (
      perfis.length > 0 &&
      perfis.filter((x) => x.key === selectedDataSourceKey).length > 0
    ) {
      var selectedProfiles = perfis.filter(
        (x) => x.key === selectedDataSourceKey
      );
      console.log(selectedProfiles.length);
      setDataSourceItems(selectedProfiles);
    } else if (
      parcelasDeAtivos.length > 0 &&
      parcelasDeAtivos.filter((x) => x.key === selectedDataSourceKey).length > 0
    ) {
      var selectedPartialResource = parcelasDeAtivos.filter(
        (x) => x.key === selectedDataSourceKey
      );
      console.log(selectedPartialResource.length);
      setDataSourceItems(selectedPartialResource);
    } else {
      var selectedResource = ativosMedicao.filter(
        (x) => x.key === selectedDataSourceKey
      );
      console.log(selectedResource.length);
      setDataSourceItems(selectedResource);
    }

    setPendingRequests(0);
  };

  const handleParameterChange = (event) => {
    setParameter(event.target.value);
  };

  const handleOnlyRepresentedAgentsSwitchChange = () => {
    setOnlyRepresentedAgents(!onlyRepresentedAgents);
  };

  const chooseHowToListParticipants = async () => {
    if (participantSearchMethod === "Classe") {
      sendRequest_ListarParticipantes();
    } else {
      const key =
        "buscaCustomizada_participantes_" + dayjs(date).format("DD/MM/YY");
      const sourceData = rows.map((x) => x[0]);

      let itemsProcessed = 0;
      for (const code of sourceData) {
        await listarParticipantePorCodigo(code, key);
        itemsProcessed++;
        var totalAmount = sourceData.length;
        var amountDone = (itemsProcessed / totalAmount) * 100;
        setProgress(amountDone);
      }
      setSuccessDialogOpen(true);
    }
  };

  const sendRequest_ListarParticipantes = async (classId = 0) => {
    setPendingRequests(pendingRequests + 1);

    var isAutomatic = classId === 0 ? false : true;
    var cat = classId === 0 ? category : classId;
    var totalPages =
      await cadastrosService.listarParticipantesDeMercado_totalDePaginas(
        authData,
        "01",
        dayjs(date).format("YYYY-MM-DDTHH:mm:ss"),
        cat
      );

    if (totalPages === null) {
      if (!isAutomatic) {
        setWarningText(
          "Não foram retornados agentes para os parâmetros informados"
        );
        setWarningDialogOpen(true);
      }

      setPendingRequests(pendingRequests - 1);
      return;
    }

    var key = "";

    if (classId === 0) {
      const categoryName = classes.find((x) => x.id === category).name;
      key =
        "participantes_" + categoryName + "_" + dayjs(date).format("DD/MM/YY");

      db.participantes
        .where("key")
        .equalsIgnoreCase(key)
        .count()
        .then(function (count) {
          if (count > 0) {
            console.log("Counted " + count + " objects");
            setWarningText(
              'Já existe uma coleção de dados com o nome "' + key + '"'
            );
            setPendingRequests(pendingRequests - 1);
            setWarningDialogOpen(true);
            return;
          }
        });
    } else {
      key = "participantes_" + dayjs(date).format("DD/MM/YY");
    }

    var done = await listarParticipantes(
      key,
      totalPages,
      date,
      cat,
      false,
      isAutomatic
    );

    if (done) {
      setPendingRequests(pendingRequests - 1);
      setProgress(0);

      var catInArr = classes.find((x) => x.id === cat);

      if (classes.indexOf(catInArr) + 1 === classes.length) {
        setSuccessDialogOpen(true);
      }
    }
  };

  async function listarParticipantes(
    key,
    totalPages,
    date,
    category,
    fromRetryList = false,
    isAutomatic = false
  ) {
    try {
      const initialPage = fromRetryList ? totalPages : 1;
      for (
        let currentPage = initialPage;
        currentPage <= totalPages;
        currentPage++
      ) {
        var responseData = await cadastrosService.listarParticipantesDeMercado(
          authData,
          currentPage,
          dayjs(date).format("YYYY-MM-DDTHH:mm:ss"),
          category
        );

        if (responseData.code === 200) {
          const participantes = responseData.data;
          var itemsProcessed = 0;

          var participantesData = [];
          if (participantes.length === undefined) {
            participantesData = [participantes];
          } else {
            participantesData = participantes;
          }

          Array.prototype.forEach.call(participantesData, async (item) => {
            mapResponseToParticipantsData(key, item);
          });

          if (fromRetryList) {
            removeParticipantsPageFromRetryList(key, currentPage);
          }
        } else {
          if (fromRetryList) {
            updateParticipantPageInRetryList(key, currentPage);
          } else {
            addParticipantsPageToRetryList(
              key,
              category,
              responseData.data,
              responseData.code,
              0,
              "listarParticipantes"
            );
          }
        }

        if (!isAutomatic) {
          itemsProcessed++;
          var amountDone = (currentPage / totalPages) * 100;
          setProgress(amountDone);
        }
      }

      return true;
    } catch (e) {
      console.log("Erro ao listar participantes");
      console.error(e);
      return true;
    }
  }

  async function mapResponseToParticipantsData(key, item) {
    const cnpj =
      item["bov2:parte"]["bov2:pessoaJuridica"]["bov2:identificacoes"] !==
      undefined
        ? item["bov2:parte"]["bov2:pessoaJuridica"]["bov2:identificacoes"][
            "bov2:identificacao"
          ]["bov2:numero"]._text.toString()
        : "";
    const nomeEmpresarial =
      item["bov2:parte"]["bov2:pessoaJuridica"][
        "bov2:nomeEmpresarial"
      ]._text.toString();
    const sigla = item["bov2:sigla"]._text.toString();
    const codigo = item["bov2:codigo"]._text.toString();
    let periodoVigencia =
      item["bov2:periodoVigencia"]["bov2:inicio"]._text.toString();
    periodoVigencia = dayjs(periodoVigencia).format("DD/MM/YYYY");
    const situacao = item["bov2:situacao"]["bov2:descricao"]._text.toString();
    const codClasse = item["bov2:classe"]["bov2:codigo"]._text.toString();
    const nomeClasse = item["bov2:classe"]["bov2:descricao"]._text.toString();

    await addParticipante(
      key,
      cnpj,
      nomeEmpresarial,
      situacao,
      sigla,
      codigo,
      periodoVigencia,
      codClasse,
      nomeClasse
    );
  }

  async function addParticipante(
    key,
    cnpj,
    nomeEmpresarial,
    situacao,
    sigla,
    codigo,
    periodoVigencia,
    codClasse,
    nomeClasse
  ) {
    try {
      await db.participantes.add({
        key,
        cnpj,
        nomeEmpresarial,
        situacao,
        sigla,
        codigo,
        periodoVigencia,
        codClasse,
        nomeClasse,
      });
    } catch (error) {
      console.log(`Failed to add ${nomeEmpresarial}: ${error}`);
    }
  }

  async function addParticipantsPageToRetryList(
    key,
    category,
    page,
    errorCode,
    attempts,
    serviceFailed
  ) {
    try {
      const retryKey = "retry_" + key;
      const retryParticipant = {
        page,
        category,
        errorCode,
        date,
        attempts,
        serviceFailed,
      };

      let keys = [];
      if (retryKeys.length === 0) {
        keys = [retryKey];
      } else {
        keys = retryKeys.concat(retryKey);
      }
      localStorage.setItem("RETRY_KEYS", JSON.stringify(keys));

      let retryParticipants = JSON.parse(localStorage.getItem(retryKey));
      if (retryParticipants === null) {
        retryParticipants = [retryParticipant];
      } else {
        retryParticipants = retryParticipants.concat(retryParticipant);
      }
      localStorage.setItem(retryKey, JSON.stringify(retryParticipants));
    } catch (error) {
      console.log(
        `Failed to add page number ${page} to Retry Participant's page list: ${error}`
      );
    }
  }

  async function addParticipantCodeToRetryList(
    key,
    codAgente,
    errorCode,
    attempts,
    serviceFailed
  ) {
    try {
      const retryKey = "retry_" + key;
      const retryParticipant = {
        codAgente,
        errorCode,
        attempts,
        serviceFailed,
      };

      let keys = [];
      if (retryKeys.length === 0) {
        keys = [retryKey];
      } else {
        keys = retryKeys.concat(retryKey);
      }
      localStorage.setItem("RETRY_KEYS", JSON.stringify(keys));

      let retryParticipants = JSON.parse(localStorage.getItem(retryKey));
      if (retryParticipants === null) {
        retryParticipants = [retryParticipant];
      } else {
        retryParticipants = retryParticipants.concat(retryParticipant);
      }
      localStorage.setItem(retryKey, JSON.stringify(retryParticipants));
    } catch (error) {
      console.log(
        `Failed to add page number ${codAgente} to Retry Participant's page list: ${error}`
      );
    }
  }

  const sendRequest_ListarPerfis = async () => {
    setPendingRequests(pendingRequests + 1);

    const key = selectedDataSource.replace("participantes", "perfis");
    console.log(key);

    db.perfis
      .where("key")
      .equalsIgnoreCase(key)
      .count()
      .then(async function (count) {
        if (count > 0) {
          console.log("Counted " + count + " objects");
          setWarningText(
            'Já existe uma coleção de dados com o nome "' + key + '"'
          );
          setPendingRequests(pendingRequests - 1);
          setWarningDialogOpen(true);
          return;
        } else {
          if (dataSourceItems === null) {
            setPendingRequests(pendingRequests - 1);
            return;
          }

          console.log("Total: " + dataSourceItems.length);
          var codAgentes = dataSourceItems.map((x) => x.codigo);

          await listarPerfis(key, codAgentes);
          setPendingRequests(pendingRequests - 1);
          setSuccessDialogOpen(true);
          setProgress(0);
        }
      });
  };

  async function listarPerfis(key, sourceItems, fromRetryList = false) {
    try {
      var itemsProcessed = 0;
      const requestsQuantity = sourceItems.length;

      for (const codAgente of sourceItems) {
        var responseData = await cadastrosService.listarPerfis(
          authData,
          codAgente
        );
        itemsProcessed++;

        var totalPaginas = responseData.totalPaginas;
        var totalPaginasNumber = totalPaginas._text
          ? parseInt(totalPaginas._text.toString())
          : 0;

        if (totalPaginasNumber > 1) {
          for (
            let paginaCorrente = 1;
            paginaCorrente <= totalPaginasNumber;
            paginaCorrente++
          ) {
            // eslint-disable-next-line no-loop-func
            var responseDataPaginated = await cadastrosService.listarPerfis(
              authData,
              codAgente,
              paginaCorrente
            );

            handleProfileRespondeData(
              responseDataPaginated,
              key,
              codAgente,
              fromRetryList
            );
          }
        } else {
          handleProfileRespondeData(
            responseData,
            key,
            codAgente,
            fromRetryList
          );
        }

        var amountDone = (itemsProcessed / requestsQuantity) * 100;
        setProgress(amountDone);
      }
    } catch (e) {
      console.log("Erro ao listar perfis");
      console.error(e);
    }
  }

  function handleProfileRespondeData(
    responseData,
    key,
    codAgente,
    fromRetryList
  ) {
    if (responseData.code === 200) {
      var perfis = responseData.data;

      if (perfis.length === undefined) {
        mapResponseToProfileData(key, codAgente, perfis);
      } else {
        Array.prototype.forEach.call(perfis, async (item) => {
          mapResponseToProfileData(key, codAgente, item);
        });
      }

      if (fromRetryList) {
        removeAgentFromRetryList(key, codAgente);
      }
    } else {
      if (fromRetryList) {
        updateParticipantInRetryList(codAgente, key);
      } else {
        addAgentToRetryList(
          key,
          codAgente,
          responseData.code,
          0,
          "listarPerfis"
        );
      }
    }
  }

  async function mapResponseToProfileData(key, codAgente, item) {
    const classe = item["bov2:classe"]["bov2:descricao"]._text.toString();
    const codPerfil = item["bov2:codigo"]._text.toString();
    var comercializadorVarejista =
      item["bov2:comercializadorVarejista"]._text.toString();
    const sigla = item["bov2:sigla"]._text.toString();
    const situacao = item["bov2:situacao"]["bov2:descricao"]._text.toString();
    const submercado =
      item["bov2:submercado"] === undefined
        ? "Sem informação"
        : item["bov2:submercado"]["bov2:nome"]._text.toString();
    var perfilPrincipal = item["bov2:perfilPrincipal"]._text.toString();
    var regimeCotas = item["bov2:regimeCotas"]._text.toString();
    comercializadorVarejista =
      comercializadorVarejista === "true" ? "Sim" : "Não";
    perfilPrincipal = perfilPrincipal === "true" ? "Sim" : "Não";
    regimeCotas = regimeCotas === "true" ? "Sim" : "Não";

    await addPerfil(
      key,
      codAgente,
      classe,
      codPerfil,
      comercializadorVarejista,
      sigla,
      situacao,
      submercado,
      perfilPrincipal,
      regimeCotas
    );
  }

  async function addPerfil(
    key,
    codAgente,
    classe,
    codPerfil,
    comercializadorVarejista,
    sigla,
    situacao,
    submercado,
    perfilPrincipal,
    regimeCotas
  ) {
    try {
      await db.perfis.add({
        key,
        codAgente,
        classe,
        codPerfil,
        comercializadorVarejista,
        sigla,
        situacao,
        submercado,
        perfilPrincipal,
        regimeCotas,
      });
    } catch (error) {
      console.log(`Failed to add ${codPerfil}: ${error}`);
    }
  }

  async function addAgentToRetryList(
    key,
    codAgente,
    errorCode,
    attempts,
    serviceFailed
  ) {
    try {
      const retryKey = "retry_" + key;
      const retryParticipant = {
        codAgente,
        errorCode,
        attempts,
        serviceFailed,
      };

      let keys = [];
      if (retryKeys.length === 0) {
        keys = [retryKey];
      } else {
        keys = retryKeys.concat(retryKey);
      }
      localStorage.setItem("RETRY_KEYS", JSON.stringify(keys));

      let retryParticipants = JSON.parse(localStorage.getItem(retryKey));
      if (retryParticipants === null) {
        retryParticipants = [retryParticipant];
      } else {
        retryParticipants = retryParticipants.concat(retryParticipant);
      }
      localStorage.setItem(retryKey, JSON.stringify(retryParticipants));
    } catch (error) {
      console.log(
        `Failed to add ${codAgente} to Retry Participant's list: ${error}`
      );
    }
  }

  async function updateParticipantInRetryList(codAgente, key) {
    const retryKey = "retry_" + key;
    let retryData = JSON.parse(localStorage.getItem(retryKey));
    console.log("updateParticipantInRetryList");

    if (!retryData) return;

    const itemToBeUpdated = retryData.find((x) => x.codAgente === codAgente);
    var itemToBeUpdatedClone = itemToBeUpdated;
    itemToBeUpdatedClone.attempts = itemToBeUpdated.attempts + 1;
    const index = retryData.indexOf(itemToBeUpdated);

    if (index !== -1) {
      retryData[index] = itemToBeUpdatedClone;
      localStorage.setItem(retryKey, JSON.stringify(retryData));
    }
  }

  async function updateParticipantPageInRetryList(page, key) {
    const retryKey = "retry_" + key;
    let retryData = JSON.parse(localStorage.getItem(retryKey));
    console.log("updateParticipantPageInRetryList");

    if (!retryData) return;

    const itemToBeUpdated = retryData.find((x) => x.page === page);
    var itemToBeUpdatedClone = itemToBeUpdated;
    itemToBeUpdatedClone.attempts = itemToBeUpdated.attempts + 1;
    const index = retryData.indexOf(itemToBeUpdated);

    if (index !== -1) {
      retryData[index] = itemToBeUpdatedClone;
      localStorage.setItem(retryKey, JSON.stringify(retryData));
    }
  }

  async function updatePartialResourceInRetryList(parameterCode, key) {
    const retryKey = "retry_" + key;
    let retryData = JSON.parse(localStorage.getItem(retryKey));
    console.log("updateParticipantInRetryList");

    if (!retryData) return;

    const itemToBeUpdated = retryData.find(
      (x) => x.parameterCode === parameterCode
    );
    var itemToBeUpdatedClone = itemToBeUpdated;
    itemToBeUpdatedClone.attempts = itemToBeUpdated.attempts + 1;
    const index = retryData.indexOf(itemToBeUpdated);

    if (index !== -1) {
      retryData[index] = itemToBeUpdatedClone;
      localStorage.setItem(retryKey, JSON.stringify(retryData));
    }
  }

  const sendRequest_ListarAtivosDeMedicao = async () => {
    setPendingRequests(pendingRequests + 1);

    var date = selectedDataSource.substring(selectedDataSource.length - 5);
    date =
      "20" +
      date.substring(date.length - 2) +
      "-" +
      date.substring(0, 2) +
      "-01";

    const key = selectedDataSource.replace("perfis", "ativos");
    console.log(key);

    db.ativosMedicao
      .where("key")
      .equalsIgnoreCase(key)
      .count()
      .then(async function (count) {
        if (count > 0) {
          console.log("Counted " + count + " objects");
          setWarningText(
            'Já existe uma coleção de dados com o nome "' + key + '"'
          );
          setPendingRequests(pendingRequests - 1);
          setWarningDialogOpen(true);
          return;
        } else {
          if (dataSourceItems === null) {
            setPendingRequests(pendingRequests - 1);
            return;
          }

          console.log("Total: " + dataSourceItems.length);
          var codPerfis = dataSourceItems.map((x) => x.codPerfil);

          await listarAtivos(key, codPerfis);
          setPendingRequests(pendingRequests - 1);
          setSuccessDialogOpen(true);
          setProgress(0);
        }
      });
  };

  async function listarAtivos(key, sourceItems, fromRetryList = false) {
    try {
      var itemsProcessed = 0;
      const requestsQuantity = sourceItems.length;

      for (const codPerfil of sourceItems) {
        var responseData = await ativosService.listarAtivosDeMedicao(
          authData,
          codPerfil,
          dayjs(date).format("YYYY-MM-DDTHH:mm:ss")
        );

        itemsProcessed++;

        var totalPaginas = responseData.totalPaginas;
        var totalPaginasNumber = totalPaginas._text
          ? parseInt(totalPaginas._text.toString())
          : 0;
        if (totalPaginasNumber > 1) {
          for (
            let paginaCorrente = 1;
            paginaCorrente <= totalPaginasNumber;
            paginaCorrente++
          ) {
            // eslint-disable-next-line no-loop-func
            var responseDataPaginated =
              await ativosService.listarAtivosDeMedicao(
                authData,
                codPerfil,
                dayjs(date).format("YYYY-MM-DDTHH:mm:ss"),
                paginaCorrente
              );

            var ativos = responseDataPaginated.data;
            if (responseDataPaginated.code === 200) {
              if (ativos.length === undefined) {
                mapResponseToResourceData(key, codPerfil, ativos);
              } else {
                Array.prototype.forEach.call(ativos, async (item) => {
                  mapResponseToResourceData(key, codPerfil, item);
                });
              }

              if (fromRetryList) {
                removeProfileFromRetryList(key, codPerfil);
              }
            } else {
              if (responseDataPaginated.code !== 500) {
                if (!fromRetryList) {
                  addProfileToRetryList(
                    key,
                    codPerfil,
                    responseDataPaginated.code,
                    0,
                    "listarAtivosDeMedicao"
                  );
                }
              } else {
                if (fromRetryList) {
                  removeProfileFromRetryList(key, codPerfil);
                }
              }
            }
          }
        } else {
          var ativos = responseData.data;
          if (responseData.code === 200) {
            if (ativos.length === undefined) {
              mapResponseToResourceData(key, codPerfil, ativos);
            } else {
              Array.prototype.forEach.call(ativos, async (item) => {
                mapResponseToResourceData(key, codPerfil, item);
              });
            }

            if (fromRetryList) {
              removeProfileFromRetryList(key, codPerfil);
            }
          } else {
            if (responseData.code !== 500) {
              if (!fromRetryList) {
                addProfileToRetryList(
                  key,
                  codPerfil,
                  responseData.code,
                  0,
                  "listarAtivosDeMedicao"
                );
              }
            } else {
              if (fromRetryList) {
                removeProfileFromRetryList(key, codPerfil);
              }
            }
          }
        }

        console.log(itemsProcessed);
        var amountDone = (itemsProcessed / requestsQuantity) * 100;
        setProgress(amountDone);
      }
    } catch (e) {
      console.log("Erro ao listar ativos");
      console.error(e);
    }
  }

  async function mapResponseToResourceData(key, codPerfil, item) {
    const codAtivo = item["bov2:codigo"]._text.toString();
    const nome = item["bov2:nome"]._text.toString();
    const tipo = item["bov2:tipo"]["bov2:descricao"]._text.toString();
    const situacao = item["bov2:situacao"]["bov2:descricao"]._text.toString();
    const vigencia = item["bov2:vigencia"]["bov2:inicio"]._text.toString();
    var periodoVigencia = dayjs(vigencia).format("DD/MM/YYYY");

    await addAtivo(
      key,
      codPerfil,
      codAtivo,
      nome,
      tipo,
      situacao,
      periodoVigencia
    );
  }

  async function addAtivo(
    key,
    codPerfil,
    codAtivo,
    nome,
    tipo,
    situacao,
    periodoVigencia
  ) {
    try {
      await db.ativosMedicao.add({
        key,
        codPerfil,
        codAtivo,
        nome,
        tipo,
        situacao,
        periodoVigencia,
      });
    } catch (error) {
      console.log(`Failed to add Resource ${codAtivo}: ${error}`);
    }
  }

  async function addProfileToRetryList(
    key,
    codPerfil,
    errorCode,
    attempts,
    serviceFailed
  ) {
    try {
      const retryKey = "retry_" + key;
      const retryProfile = {
        codPerfil,
        errorCode,
        attempts,
        serviceFailed,
      };

      let keys = [];
      if (retryKeys.length === 0) {
        keys = [retryKey];
      } else {
        keys = retryKeys.concat(retryKey);
      }
      localStorage.setItem("RETRY_KEYS", JSON.stringify(keys));

      let retryProfiles = JSON.parse(localStorage.getItem(retryKey));
      if (retryProfiles === null) {
        retryProfiles = [retryProfile];
      } else {
        retryProfiles = retryProfiles.concat(retryProfile);
      }
      localStorage.setItem(retryKey, JSON.stringify(retryProfiles));
    } catch (error) {
      console.log(
        `Failed to add ${codPerfil} to Retry Profile's list: ${error}`
      );
    }
  }

  async function addParameterToRetryList(
    key,
    parameterCode,
    searchDate,
    parameter,
    errorCode,
    attempts,
    serviceFailed
  ) {
    try {
      const retryKey = "retry_" + key;
      const retryParameter = {
        parameterCode,
        searchDate,
        parameter,
        errorCode,
        attempts,
        serviceFailed,
      };

      let keys = [];
      if (retryKeys.length === 0) {
        keys = [retryKey];
      } else {
        keys = retryKeys.concat(retryKey);
      }
      localStorage.setItem("RETRY_KEYS", JSON.stringify(keys));

      let retryParameters = JSON.parse(localStorage.getItem(retryKey));
      if (retryParameters === null) {
        retryParameters = [retryParameter];
      } else {
        retryParameters = retryParameters.concat(retryParameter);
      }
      localStorage.setItem(retryKey, JSON.stringify(retryParameters));
    } catch (error) {
      console.log(
        `Failed to add ${parameterCode} to Retry Parameter's list: ${error}`
      );
    }
  }

  async function addResourceToRetryList(
    key,
    codAtivoMedicao,
    codPerfil,
    searchDate,
    errorCode,
    attempts,
    serviceFailed
  ) {
    try {
      const retryKey = "retry_" + key;
      const retryParameter = {
        codAtivoMedicao,
        codPerfil,
        searchDate,
        errorCode,
        attempts,
        serviceFailed,
      };

      let keys = [];
      if (retryKeys.length === 0) {
        keys = [retryKey];
      } else {
        keys = retryKeys.concat(retryKey);
      }
      localStorage.setItem("RETRY_KEYS", JSON.stringify(keys));

      let retryResources = JSON.parse(localStorage.getItem(retryKey));
      if (retryResources === null) {
        retryResources = [retryParameter];
      } else {
        retryResources = retryResources.concat(retryParameter);
      }
      localStorage.setItem(retryKey, JSON.stringify(retryResources));
    } catch (error) {
      console.log(
        `Failed to add ${codAtivoMedicao} to Retry Resource's list: ${error}`
      );
    }
  }

  const retryFaultyRequests = async () => {
    if (retryKeys.length === 0) return;

    await proccessRetryList();
    setSuccessDialogOpen(true);
  };

  async function proccessRetryList() {
    setPendingRequests(pendingRequests + 1);

    for (const key of retryKeys) {
      let retryData = JSON.parse(localStorage.getItem(key));

      if (key.includes("participantes_representados")) {
        for (const rd of retryData) {
          await listarParticipantePorCodigo(
            rd.codAgente,
            key.substring(6),
            true
          );
        }
      } else if (key.includes("participantes")) {
        for (const rd of retryData) {
          await listarParticipantes(
            key.substring(6),
            rd.page,
            rd.date,
            rd.category,
            true,
            false
          );
        }
      } else if (key.includes("perfis")) {
        const codAgentes = retryData.map((x) => x.codAgente);
        await listarPerfis(key.substring(6), codAgentes, true);
      } else if (key.includes("parcelasDeAtivos")) {
        const parametersCodes = retryData.map((x) => x.parameterCode);
        console.log("Total: " + parametersCodes.length);
        const searchDate = retryData.map((x) => x.searchDate)[0];
        const parameter = retryData.map((x) => x.parameter)[0];
        await listarParcelasDeAtivos(
          key.substring(6),
          parametersCodes,
          searchDate,
          parameter,
          true
        );
      } else if (key.includes("parcelasDeCarga")) {
        const parametersCodes = retryData.map((x) => x.parameterCode);
        console.log("Total: " + parametersCodes.length);
        const searchDate = retryData.map((x) => x.searchDate)[0];
        await listarParcelasDeCarga(
          key.substring(6),
          retryData,
          searchDate,
          true
        );
      } else if (key.includes("topologias")) {
        const parametersCodes = retryData.map((x) => x.parameterCode);
        console.log("Total: " + parametersCodes.length);
        const searchDate = retryData.map((x) => x.searchDate)[0];
        await listarTopologias(key.substring(6), retryData, searchDate, true);
      } else if (key.includes("ativos")) {
        const codPerfis = retryData.map((x) => x.codPerfil);
        await listarAtivos(key.substring(6), codPerfis, true);
      } else {
        return;
      }
    }

    setPendingRequests(0);
  }

  const removeAgentFromRetryList = (key, codAgente) => {
    const retryKey = "retry_" + key;
    let retryData = JSON.parse(localStorage.getItem(retryKey));
    console.log("removeProfileFromRetryList");

    if (!retryData) return;

    const itemToBeRemoved = retryData.find((x) => x.codAgente === codAgente);
    const index = retryData.indexOf(itemToBeRemoved);

    if (index > -1) {
      retryData.splice(index, 1);
    }

    if (retryData.length === 0) {
      const keyToBeRemoved = retryKeys.find((x) => x === retryKey);
      const idx = retryKeys.indexOf(keyToBeRemoved);

      if (idx > -1) {
        retryKeys.splice(idx, 1);
      }

      localStorage.setItem("RETRY_KEYS", JSON.stringify(retryKeys));
      localStorage.removeItem(retryKey);
    } else {
      localStorage.setItem(retryKey, JSON.stringify(retryData));
    }
  };

  const removeProfileFromRetryList = (key, codPerfil) => {
    const retryKey = "retry_" + key;
    let retryData = JSON.parse(localStorage.getItem(retryKey));
    console.log("removeProfileFromRetryList");

    if (!retryData) return;

    const itemToBeRemoved = retryData.find((x) => x.codPerfil === codPerfil);
    const index = retryData.indexOf(itemToBeRemoved);

    if (index > -1) {
      retryData.splice(index, 1);
    }

    if (retryData.length === 0) {
      const keyToBeRemoved = retryKeys.find((x) => x === retryKey);
      const idx = retryKeys.indexOf(keyToBeRemoved);

      if (idx > -1) {
        retryKeys.splice(idx, 1);
      }

      localStorage.setItem("RETRY_KEYS", JSON.stringify(retryKeys));
      localStorage.removeItem(retryKey);
    } else {
      localStorage.setItem(retryKey, JSON.stringify(retryData));
    }
  };

  const removeParameterFromRetryList = (key, parameterCode) => {
    const retryKey = "retry_" + key;
    let retryData = JSON.parse(localStorage.getItem(retryKey));
    console.log("removeParameterFromRetryList");

    if (!retryData) return;

    const itemToBeRemoved = retryData.find(
      (x) => x.parameterCode === parameterCode
    );
    const index = retryData.indexOf(itemToBeRemoved);

    if (index > -1) {
      retryData.splice(index, 1);
    }

    if (retryData.length === 0) {
      const keyToBeRemoved = retryKeys.find((x) => x === retryKey);
      const idx = retryKeys.indexOf(keyToBeRemoved);

      if (idx > -1) {
        retryKeys.splice(idx, 1);
      }

      localStorage.setItem("RETRY_KEYS", JSON.stringify(retryKeys));
      localStorage.removeItem(retryKey);
    } else {
      localStorage.setItem(retryKey, JSON.stringify(retryData));
    }
  };

  const removeResourceFromRetryList = (key, codAtivoMedicao) => {
    const retryKey = "retry_" + key;
    let retryData = JSON.parse(localStorage.getItem(retryKey));
    console.log("removeResourceFromRetryList");

    if (!retryData) return;

    const itemToBeRemoved = retryData.find(
      (x) => x.codAtivoMedicao === codAtivoMedicao
    );
    const index = retryData.indexOf(itemToBeRemoved);

    if (index > -1) {
      retryData.splice(index, 1);
    }

    if (retryData.length === 0) {
      const keyToBeRemoved = retryKeys.find((x) => x === retryKey);
      const idx = retryKeys.indexOf(keyToBeRemoved);

      if (idx > -1) {
        retryKeys.splice(idx, 1);
      }

      localStorage.setItem("RETRY_KEYS", JSON.stringify(retryKeys));
      localStorage.removeItem(retryKey);
    } else {
      localStorage.setItem(retryKey, JSON.stringify(retryData));
    }
  };

  const removeParticipantsPageFromRetryList = (key, page) => {
    const retryKey = "retry_" + key;
    let retryData = JSON.parse(localStorage.getItem(retryKey));
    console.log("removeParticipantsPageFromRetryList");

    if (!retryData) return;

    const itemToBeRemoved = retryData.find((x) => x.page === page);
    const index = retryData.indexOf(itemToBeRemoved);

    if (index > -1) {
      retryData.splice(index, 1);
    }

    if (retryData.length === 0) {
      const keyToBeRemoved = retryKeys.find((x) => x === retryKey);
      const idx = retryKeys.indexOf(keyToBeRemoved);

      if (idx > -1) {
        retryKeys.splice(idx, 1);
      }

      localStorage.setItem("RETRY_KEYS", JSON.stringify(retryKeys));
      localStorage.removeItem(retryKey);
    } else {
      localStorage.setItem(retryKey, JSON.stringify(retryData));
    }
  };

  const removeParticipantFromRetryList = (key, code) => {
    const retryKey = "retry_" + key;
    let retryData = JSON.parse(localStorage.getItem(retryKey));
    console.log("removeParticipantsPageFromRetryList");

    if (!retryData) return;

    const itemToBeRemoved = retryData.find((x) => x.code === code);
    const index = retryData.indexOf(itemToBeRemoved);

    if (index > -1) {
      retryData.splice(index, 1);
    }

    if (retryData.length === 0) {
      const keyToBeRemoved = retryKeys.find((x) => x === retryKey);
      const idx = retryKeys.indexOf(keyToBeRemoved);

      if (idx > -1) {
        retryKeys.splice(idx, 1);
      }

      localStorage.setItem("RETRY_KEYS", JSON.stringify(retryKeys));
      localStorage.removeItem(retryKey);
    } else {
      localStorage.setItem(retryKey, JSON.stringify(retryData));
    }
  };

  const removeExpiredData = async () => {
    if (retryKeys.length === 0) {
      setPendingRequests(0);
      return;
    }

    await removeExpiredDataFromList();
    setSuccessDialogOpen(true);
  };

  async function removeExpiredDataFromList() {
    setPendingRequests(pendingRequests + 1);

    for (const key of retryKeys) {
      let retryData = JSON.parse(localStorage.getItem(key));
      let itemsToRemove = retryData.filter((z) => z.attempts > 1);

      if (itemsToRemove.length === 0) {
        setPendingRequests(0);
        return;
      }

      if (key.includes("participantes")) {
        for (const x of itemsToRemove) {
          await removeParticipantsPageFromRetryList(key.substring(6), x.page);
        }
      } else if (key.includes("perfis")) {
        for (const x of itemsToRemove) {
          await removeAgentFromRetryList(key.substring(6), x.codAgente);
        }
      } else if (key.includes("parcelasDeAtivos")) {
        for (const x of itemsToRemove) {
          await removeParameterFromRetryList(key.substring(6), x.parameterCode);
        }
      } else if (
        key.includes("parcelasDeCarga") ||
        key.includes("topologias")
      ) {
        for (const x of itemsToRemove) {
          await removeResourceFromRetryList(
            key.substring(6),
            x.codAtivoMedicao
          );
        }
      } else if (key.includes("ativos")) {
        for (const x of itemsToRemove) {
          await removeProfileFromRetryList(key.substring(6), x.codPerfil);
        }
      } else {
        return;
      }
    }
    setPendingRequests(0);
  }

  const exportMeasurementData = async () => {
    var medService =
      servicos.id === 6 ? "medidasCincoMinutos" : "medidasFinais";
    var fileName = medService + "_" + scdeCode;
    let exportType = exportFromJSON.types.xls;

    exportFromJSON({ data: measurementsValues, fileName, exportType });
  };

  const exportModellingData = async () => {
    var fileName =
      "modelagens_" + parseInt(date.month() + 1) + "-" + date.year();
    let exportType = exportFromJSON.types.xls;

    exportFromJSON({ data: modellingValues, fileName, exportType });
  };

  const sendRequest_ListarParcelasDeAtivo = async () => {
    setPendingRequests(pendingRequests + 1);

    var key,
      formDate,
      selectedParameter = "";
    var sourceData = [];

    if (searchMethod === "Manual") {
      key =
        "buscaCustomizada_parcelasDeAtivos_" + dayjs(date).format("DD/MM/YY");
      formDate = dayjs(date).format("YYYY-MM-DDTHH:mm:ss");
      sourceData = rows.map((x) => x[0]);
      selectedParameter = parameter;
    } else {
      var date = selectedDataSource.substring(selectedDataSource.length - 5);
      formDate =
        "20" +
        date.substring(date.length - 2) +
        "-" +
        date.substring(0, 2) +
        "-01";
      formDate = dayjs(formDate).format("YYYY-MM-DDTHH:mm:ss");
      key = selectedDataSource.replace("perfis", "parcelasDeAtivos");

      if (dataSourceItems === null) {
        setPendingRequests(pendingRequests - 1);
        return;
      }

      sourceData = dataSourceItems.map((x) => x.codPerfil);
      selectedParameter = 4;
    }

    db.parcelasAtivosMedicao
      .where("key")
      .equalsIgnoreCase(key)
      .count()
      .then(async function (count) {
        if (count > 0) {
          console.log("Counted " + count + " objects");
          setWarningText(
            'Já existe uma coleção de dados com o nome "' + key + '"'
          );
          setPendingRequests(pendingRequests - 1);
          setWarningDialogOpen(true);
          return;
        } else {
          console.log("Total: " + sourceData.length);

          await listarParcelasDeAtivos(
            key,
            sourceData,
            formDate,
            selectedParameter
          );
          setPendingRequests(pendingRequests - 1);
          setProgress(0);
          setSuccessDialogOpen(true);
        }
      });
  };

  async function listarParcelasDeAtivos(
    key,
    sourceItems,
    searchDate,
    selectedParameter,
    fromRetryList = false
  ) {
    try {
      var itemsProcessed = 0;
      var codMedidor,
        codParcelaAtivo,
        codAtivoMedicao,
        codPerfil,
        cnpj = "";

      const requestsQuantity = sourceItems.length;

      for (const item of sourceItems) {
        if (selectedParameter === 1) {
          codMedidor = item;
        } else if (selectedParameter === 2) {
          codParcelaAtivo = item;
        } else if (selectedParameter === 3) {
          codAtivoMedicao = item;
        } else if (selectedParameter === 4) {
          codPerfil = item;
        } else {
          cnpj = item;
        }

        var responseData = await ativosService.listarParcelasDeAtivosDeMedicao(
          authData,
          codMedidor,
          codParcelaAtivo,
          codAtivoMedicao,
          codPerfil,
          cnpj,
          searchDate
        );

        itemsProcessed++;

        var totalPaginas = responseData.totalPaginas;
        var totalPaginasNumber = totalPaginas._text
          ? parseInt(totalPaginas._text.toString())
          : 0;
        if (totalPaginasNumber > 1) {
          for (
            let paginaCorrente = 1;
            paginaCorrente <= totalPaginasNumber;
            paginaCorrente++
          ) {
            // eslint-disable-next-line no-loop-func

            var responseDataPaginated =
              await ativosService.listarParcelasDeAtivosDeMedicao(
                authData,
                codMedidor,
                codParcelaAtivo,
                codAtivoMedicao,
                codPerfil,
                cnpj,
                searchDate,
                paginaCorrente
              );

            handlePartialResourceResponseData(
              responseDataPaginated,
              key,
              codMedidor,
              selectedParameter,
              searchDate,
              item,
              fromRetryList
            );
          }
        } else {
          handlePartialResourceResponseData(
            responseData,
            key,
            codMedidor,
            selectedParameter,
            searchDate,
            item,
            fromRetryList
          );
        }

        var amountDone = (itemsProcessed / requestsQuantity) * 100;
        if (amountDone !== progress) {
          setProgress(amountDone);
        }
      }
    } catch (e) {
      console.log("Erro ao listar parcelas de ativos");
      console.error(e);
    }
  }

  function handlePartialResourceResponseData(
    responseData,
    key,
    codMedidor,
    selectedParameter,
    searchDate,
    item,
    fromRetryList
  ) {
    if (responseData.code === 200) {
      var parcelaAtivos = responseData.data;

      if (parcelaAtivos.length === undefined) {
        mapResponseToPartialMeasurementData(key, codMedidor, parcelaAtivos);
      } else {
        Array.prototype.forEach.call(parcelaAtivos, async (x) => {
          mapResponseToPartialMeasurementData(key, codMedidor, x);
        });
      }

      if (fromRetryList) {
        removeParameterFromRetryList(key, item);
      }
    } else {
      if (fromRetryList) {
        updatePartialResourceInRetryList(item, key);
      } else {
        addParameterToRetryList(
          key,
          item,
          searchDate,
          selectedParameter,
          responseData.code,
          0,
          "listarParcelasDeAtivos"
        );
      }
    }
  }

  async function mapResponseToPartialMeasurementData(key, codMedidor, item) {
    const codParcelaAtivo =
      item["bov2:codigo"] !== undefined
        ? item["bov2:codigo"]._text.toString()
        : "";
    const codAtivoMedicao =
      item["bov2:ativoMedicao"] !== undefined
        ? item["bov2:ativoMedicao"]["bov2:codigo"]._text.toString()
        : "";
    const nome =
      item["bov2:nome"] !== undefined ? item["bov2:nome"]._text.toString() : "";
    const codPerfil =
      item["bov2:participanteMercado"] !== undefined
        ? item["bov2:participanteMercado"]["bov2:perfis"]["bov2:perfil"][
            "bov2:codigo"
          ]._text.toString()
        : "";
    const idSubmercado =
      item["bov2:submercado"] !== undefined
        ? item["bov2:submercado"]["bov2:id"]._text.toString()
        : "";
    const cnpj =
      item["bov2:identificacao"] !== undefined
        ? item["bov2:identificacao"]["bov2:numero"]._text.toString()
        : "";
    const situacao =
      item["bov2:status"] !== undefined
        ? item["bov2:status"]["bov2:descricao"]._text.toString()
        : "";
    const vigencia =
      item["bov2:vigencia"] !== undefined
        ? item["bov2:vigencia"]["bov2:inicio"]._text.toString()
        : "";
    var periodoVigencia = dayjs(vigencia).format("DD/MM/YYYY");

    await addParcelaDeAtivo(
      key,
      codParcelaAtivo,
      codAtivoMedicao,
      nome,
      codMedidor,
      codPerfil,
      idSubmercado,
      cnpj,
      situacao,
      periodoVigencia
    );
  }

  async function addParcelaDeAtivo(
    key,
    codParcelaAtivo,
    codAtivoMedicao,
    nome,
    codMedidor,
    codPerfil,
    idSubmercado,
    cnpj,
    situacao,
    periodoVigencia
  ) {
    try {
      await db.parcelasAtivosMedicao.add({
        key,
        codParcelaAtivo,
        codAtivoMedicao,
        nome,
        codMedidor,
        codPerfil,
        idSubmercado,
        cnpj,
        situacao,
        periodoVigencia,
      });
    } catch (error) {
      console.log(
        `Failed to add Partial Measurement ${codParcelaAtivo}: ${error}`
      );
    }
  }

  const sendRequest_ListarParcelasDeCarga = async () => {
    setPendingRequests(pendingRequests + 1);

    var key,
      formDate = "";

    var date = selectedDataSource.substring(selectedDataSource.length - 5);
    formDate =
      "20" +
      date.substring(date.length - 2) +
      "-" +
      date.substring(0, 2) +
      "-01";
    formDate = dayjs(formDate).format("YYYY-MM-DDTHH:mm:ss");
    key = selectedDataSource.replace("parcelasDeAtivos", "parcelasDeCarga");

    if (dataSourceItems === null) {
      setPendingRequests(pendingRequests - 1);
      return;
    }

    db.parcelasAtivosMedicao
      .where("key")
      .equalsIgnoreCase(key)
      .count()
      .then(async function (count) {
        if (count > 0) {
          console.log("Counted " + count + " objects");
          setWarningText(
            'Já existe uma coleção de dados com o nome "' + key + '"'
          );
          setPendingRequests(pendingRequests - 1);
          setWarningDialogOpen(true);
          return;
        } else {
          console.log("Total: " + dataSourceItems.length);

          await listarParcelasDeCarga(key, dataSourceItems, formDate);
          setPendingRequests(pendingRequests - 1);
          setProgress(0);
          setSuccessDialogOpen(true);
        }
      });
  };

  async function listarParcelasDeCarga(
    key,
    dataSourceItems,
    searchDate,
    fromRetryList = false
  ) {
    try {
      var itemsProcessed = 0;
      const requestsQuantity = dataSourceItems.length;

      for (const item of dataSourceItems) {
        var responseData = await ativosService.listarParcelaDeCarga(
          authData,
          item.codPerfil,
          item.codAtivoMedicao,
          searchDate
        );

        itemsProcessed++;

        var totalPaginas = responseData.totalPaginas;
        var totalPaginasNumber = totalPaginas._text
          ? parseInt(totalPaginas._text.toString())
          : 0;
        if (totalPaginasNumber > 1) {
          for (
            let paginaCorrente = 1;
            paginaCorrente <= totalPaginasNumber;
            paginaCorrente++
          ) {
            // eslint-disable-next-line no-loop-func

            var responseDataPaginated =
              await ativosService.listarParcelaDeCarga(
                authData,
                item.codPerfil,
                item.codAtivoMedicao,
                searchDate,
                paginaCorrente
              );

            handlePartialLoadResponseData(
              responseDataPaginated,
              key,
              searchDate,
              item,
              fromRetryList
            );
          }
        } else {
          handlePartialLoadResponseData(
            responseData,
            key,
            searchDate,
            item,
            fromRetryList
          );
        }

        console.log(itemsProcessed);
        var amountDone = (itemsProcessed / requestsQuantity) * 100;
        if (amountDone !== progress) {
          setProgress(amountDone);
        }
      }
    } catch (e) {
      console.log("Erro ao listar parcelas de carga");
      console.error(e);
    }
  }

  function handlePartialLoadResponseData(
    responseData,
    key,
    searchDate,
    item,
    fromRetryList
  ) {
    if (responseData.code === 200) {
      var parcelaCarga = responseData.data;

      if (parcelaCarga.length === undefined) {
        mapResponseToPartialLoadData(key, parcelaCarga);
      } else {
        Array.prototype.forEach.call(parcelaCarga, async (x) => {
          mapResponseToPartialLoadData(key, x);
        });
      }

      if (fromRetryList) {
        removeResourceFromRetryList(key, item.codAtivoMedicao);
      }
    } else {
      if (fromRetryList) {
        updateResourceInRetryList(item.codAtivoMedicao, key);
      } else {
        addResourceToRetryList(
          key,
          item.codAtivoMedicao,
          item.codPerfil,
          searchDate,
          responseData.code,
          0,
          "listarParcelasDeCarga"
        );
      }
    }
  }

  async function mapResponseToPartialLoadData(key, item) {
    const codParcelaCarga =
      item["bov2:numeroSequencial"] !== undefined
        ? item["bov2:numeroSequencial"]._text.toString()
        : "";
    const codAtivoMedicao =
      item["bov2:ativoMedicao"] !== undefined
        ? item["bov2:ativoMedicao"]["bov2:numero"]._text.toString()
        : "";
    const nome =
      item["bov2:nomeReduzido"] !== undefined
        ? item["bov2:nomeReduzido"]._text.toString()
        : "";
    const submercado =
      item["bov2:submercado"] !== undefined
        ? item["bov2:submercado"]["bov2:nome"]._text.toString()
        : "";
    const cnpj =
      item["bov2:identificacao"] !== undefined
        ? item["bov2:identificacao"]["bov2:numero"]._text.toString()
        : "";
    const situacao =
      item["bov2:situacao"] !== undefined
        ? item["bov2:situacao"]._text.toString()
        : "";
    const vigencia =
      item["bov2:vigencia"] !== undefined
        ? item["bov2:vigencia"]["bov2:inicio"]._text.toString()
        : "";
    var periodoVigencia = dayjs(vigencia).format("DD/MM/YYYY");
    const undCapacidadeCarga =
      item["bov2:capacidadeCarga"] !== undefined
        ? item["bov2:capacidadeCarga"]["bov2:unidadeMedida"]._text.toString()
        : "";
    const valorCapacidadeCarga =
      item["bov2:capacidadeCarga"] !== undefined
        ? item["bov2:capacidadeCarga"]["bov2:valor"]._text.toString()
        : "";

    var bairro,
      cidade,
      estado,
      logradouro,
      numero = "";
    var endereco = item["bov2:endereco"];
    if (endereco !== undefined) {
      bairro =
        endereco["bov2:bairro"] !== undefined
          ? endereco["bov2:bairro"]["bov2:descricao"]._text.toString()
          : "";
      cidade =
        endereco["bov2:cidade"] !== undefined
          ? endereco["bov2:cidade"]["bov2:descricao"]._text.toString()
          : "";
      estado =
        endereco["bov2:estado"] !== undefined
          ? endereco["bov2:estado"]["bov2:descricao"]._text.toString()
          : "";
      logradouro =
        endereco["bov2:logradouro"] !== undefined
          ? endereco["bov2:logradouro"]._text.toString()
          : "";
      numero =
        endereco["bov2:numero"] !== undefined
          ? endereco["bov2:numero"]._text.toString()
          : "";
    }
    var codConcessionaria = "";
    if (item["bov2:partes"] !== undefined) {
      var partes = item["bov2:partes"]["bov2:parte"];

      codConcessionaria = partes
        .filter((x) => x["bov2:papel"]._text.toString() === "CONCESSIONARIO")[0]
        ["bov2:agente"]["bov2:codigo"]._text.toString();
    }

    await addParcelaDeCarga(
      key,
      codParcelaCarga,
      codAtivoMedicao,
      nome,
      submercado,
      cnpj,
      situacao,
      periodoVigencia,
      codConcessionaria,
      undCapacidadeCarga,
      valorCapacidadeCarga,
      bairro,
      cidade,
      estado,
      logradouro,
      numero
    );
  }

  async function addParcelaDeCarga(
    key,
    codParcelaCarga,
    codAtivoMedicao,
    nome,
    submercado,
    cnpj,
    situacao,
    periodoVigencia,
    codConcessionaria,
    undCapacidadeCarga,
    valorCapacidadeCarga,
    bairro,
    cidade,
    estado,
    logradouro,
    numero
  ) {
    try {
      await db.parcelasDeCarga.add({
        key,
        codParcelaCarga,
        codAtivoMedicao,
        nome,
        submercado,
        cnpj,
        situacao,
        periodoVigencia,
        codConcessionaria,
        undCapacidadeCarga,
        valorCapacidadeCarga,
        bairro,
        cidade,
        estado,
        logradouro,
        numero,
      });
    } catch (error) {
      console.log(`Failed to add Partial Load ${codParcelaCarga}: ${error}`);
    }
  }

  async function updateResourceInRetryList(codAtivoMedicao, key) {
    const retryKey = "retry_" + key;
    let retryData = JSON.parse(localStorage.getItem(retryKey));
    console.log("updatePartialLoadInRetryList");

    if (!retryData) return;

    const itemToBeUpdated = retryData.find(
      (x) => x.codAtivoMedicao.toString() === codAtivoMedicao.toString()
    );
    var itemToBeUpdatedClone = itemToBeUpdated;
    itemToBeUpdatedClone.attempts = itemToBeUpdated.attempts + 1;
    const index = retryData.indexOf(itemToBeUpdated);

    if (index !== -1) {
      retryData[index] = itemToBeUpdatedClone;
      localStorage.setItem(retryKey, JSON.stringify(retryData));
    }
  }

  /**
   * Listar Topologias por Ativo
   * @returns
   */
  const sendRequest_ListarTopologiasPorAtivo = async () => {
    setPendingRequests(pendingRequests + 1);

    var key,
      formDate = "";

    var date = selectedDataSource.substring(selectedDataSource.length - 5);
    formDate =
      "20" +
      date.substring(date.length - 2) +
      "-" +
      date.substring(0, 2) +
      "-01";
    formDate = dayjs(formDate).format("YYYY-MM-DDTHH:mm:ss");
    key = selectedDataSource.replace("parcelasDeAtivos", "topologias");

    if (dataSourceItems === null) {
      setPendingRequests(pendingRequests - 1);
      return;
    }

    db.topologia
      .where("key")
      .equalsIgnoreCase(key)
      .count()
      .then(async function (count) {
        if (count > 0) {
          console.log("Counted " + count + " objects");
          setWarningText(
            'Já existe uma coleção de dados com o nome "' + key + '"'
          );
          setPendingRequests(pendingRequests - 1);
          setWarningDialogOpen(true);
          return;
        } else {
          console.log("Total: " + dataSourceItems.length);

          await listarTopologias(key, dataSourceItems, formDate);
          setPendingRequests(pendingRequests - 1);
          setProgress(0);
          setSuccessDialogOpen(true);
        }
      });
  };

  async function listarTopologias(
    key,
    dataSourceItems,
    searchDate,
    fromRetryList = false
  ) {
    try {
      var itemsProcessed = 0;
      const requestsQuantity = dataSourceItems.length;

      for (const item of dataSourceItems) {
        var responseData = await ativosService.listarTopologiaPorAtivo(
          authData,
          item.codPerfil,
          item.codAtivoMedicao,
          searchDate
        );

        itemsProcessed++;

        var totalPaginas = responseData.totalPaginas;
        var totalPaginasNumber = totalPaginas._text
          ? parseInt(totalPaginas._text.toString())
          : 0;
        if (totalPaginasNumber > 1) {
          for (
            let paginaCorrente = 1;
            paginaCorrente <= totalPaginasNumber;
            paginaCorrente++
          ) {
            // eslint-disable-next-line no-loop-func

            var responseDataPaginated =
              await ativosService.listarTopologiaPorAtivo(
                authData,
                item.codPerfil,
                item.codAtivoMedicao,
                searchDate,
                paginaCorrente
              );

            handleTopologyResponseData(
              responseDataPaginated,
              key,
              searchDate,
              item,
              fromRetryList
            );
          }
        } else {
          handleTopologyResponseData(
            responseData,
            key,
            searchDate,
            item,
            fromRetryList
          );
        }

        console.log(itemsProcessed);
        var amountDone = (itemsProcessed / requestsQuantity) * 100;
        if (amountDone !== progress) {
          setProgress(amountDone);
        }
      }
    } catch (e) {
      console.log("Erro ao listar topologias por ativo");
      console.error(e);
    }
  }

  function handleTopologyResponseData(
    responseData,
    key,
    searchDate,
    item,
    fromRetryList
  ) {
    if (responseData.code === 200) {
      var parcelaCarga = responseData.data;

      if (parcelaCarga.length === undefined) {
        mapResponseToTopologyData(key, parcelaCarga);
      } else {
        Array.prototype.forEach.call(parcelaCarga, async (x) => {
          mapResponseToTopologyData(key, x);
        });
      }

      if (fromRetryList) {
        removeResourceFromRetryList(key, item.codAtivoMedicao);
      }
    } else {
      if (fromRetryList) {
        updateResourceInRetryList(item.codAtivoMedicao, key);
      } else {
        addResourceToRetryList(
          key,
          item.codAtivoMedicao,
          item.codPerfil,
          searchDate,
          responseData.code,
          0,
          "listarTopologiasPorAtivo"
        );
      }
    }
  }

  async function mapResponseToTopologyData(key, item) {
    const codAtivoMedicao =
      item["bov2:ativoMedicao"] !== undefined
        ? item["bov2:ativoMedicao"]["bov2:numero"]._text.toString()
        : "";
    const codMedidor =
      item["bov2:ativoMedicao"] !== undefined
        ? item["bov2:ativoMedicao"]["bov2:pontos"]["bov2:pontoMedicao"][
            "bov2:codigo"
          ]._text.toString()
        : "";
    const nomeConcessionaria =
      item["bov2:nome"] !== undefined ? item["bov2:nome"]._text.toString() : "";
    const vigencia =
      item["bov2:vigencia"] !== undefined
        ? item["bov2:vigencia"]["bov2:inicio"]._text.toString()
        : "";
    var periodoVigencia =
      vigencia !== "" ? dayjs(vigencia).format("DD/MM/YYYY") : "";

    await addTopologia(
      key,
      codAtivoMedicao,
      codMedidor,
      nomeConcessionaria,
      periodoVigencia
    );
  }

  async function addTopologia(
    key,
    codAtivoMedicao,
    codMedidor,
    nomeConcessionaria,
    periodoVigencia
  ) {
    try {
      await db.topologia.add({
        key,
        codAtivoMedicao,
        codMedidor,
        nomeConcessionaria,
        periodoVigencia,
      });
    } catch (error) {
      console.log(
        `Failed to add Topology for resource: ${codAtivoMedicao}: ${error}`
      );
    }
  }

  // Listar Medidas - 5 minutos
  const sendRequest_ListarMedidasCincoMinutos = async () => {
    setPendingRequests(pendingRequests + 1);

    var daysArr = [];
    const initialDate = dayjs(date).startOf("month");
    const endDate = initialDate.endOf("month");
    const totalDays = endDate.date() - 1;

    let i = 0;
    while (i <= totalDays) {
      const calculatedDate = initialDate.add(i, "day");
      daysArr.push(calculatedDate.format("YYYY-MM-DDTHH:mm:ss"));
      i++;
    }

    var resultArr = [];

    getIndividualResults_listarMedidasCincoMinutos(daysArr).then((res) => {
      if (res !== undefined && res.length > 0) {
        res.forEach((resValue, resIdx) => {
          if (resValue !== undefined && resValue.length > 0) {
            resValue.forEach((rs) => {
              resultArr.push(rs);
            });
          }
        });
        setMeasurementsValues(resultArr);
        setPendingRequests(pendingRequests - 1);
      }
    });
  };

  const getIndividualResults_listarMedidasCincoMinutos = async (dates) => {
    const requests = dates.map((d) => {
      return listarMedidasCincoMinutos(d).then((res) => {
        return res;
      });
    });

    return Promise.all(requests);
  };

  async function listarMedidasCincoMinutos(currentDate) {
    var responseData = await medicaoService.listarMedidasCincoMinutos(
      authData,
      scdeCode,
      currentDate
    );

    var totalPaginas = responseData.totalPaginas;
    var totalPaginasNumber = totalPaginas._text
      ? parseInt(totalPaginas._text.toString())
      : 0;

    var measurementsArr = [];

    if (totalPaginasNumber > 1) {
      for (
        let paginaCorrente = 1;
        paginaCorrente <= totalPaginasNumber;
        paginaCorrente++
      ) {
        var responseDataPaginated =
          await medicaoService.listarMedidasCincoMinutos(
            authData,
            scdeCode,
            currentDate,
            paginaCorrente
          );

        if (responseDataPaginated.code === 200) {
          const results = responseDataPaginated.data;
          results.forEach((r) => {
            var measurements = mapResponseToMeasurementData(r);
            measurementsArr.push(measurements);
          });
        }
      }
    } else {
      if (responseData.code === 200) {
        const results = responseData.data;
        results.forEach((r) => {
          var measurements = mapResponseToMeasurementData(r);
          measurementsArr.push(measurements);
        });
      }
    }

    return measurementsArr;
  }

  function mapResponseToMeasurementData(item) {
    const coletaMedicao =
      item["bov2:coletaMedicao"] !== undefined
        ? item["bov2:coletaMedicao"]["bov2:tipo"]["bov2:nome"]._text.toString()
        : "";
    const dataPesquisada =
      item["bov2:data"] !== undefined ? item["bov2:data"]._text.toString() : "";
    const energiaAtiva_ConsumoUnd =
      item["bov2:energiaAtiva"] !== undefined
        ? item["bov2:energiaAtiva"]["bov2:consumo"][
            "bov2:unidadeMedida"
          ]._text.toString()
        : "";
    var energiaAtiva_ConsumoValor =
      item["bov2:energiaAtiva"] !== undefined
        ? item["bov2:energiaAtiva"]["bov2:consumo"][
            "bov2:valor"
          ]._text.toString()
        : "";

    energiaAtiva_ConsumoValor = energiaAtiva_ConsumoValor.replace(".", ",");
    const energiaAtiva_GeracaoUnd =
      item["bov2:energiaAtiva"] !== undefined
        ? item["bov2:energiaAtiva"]["bov2:geracao"][
            "bov2:unidadeMedida"
          ]._text.toString()
        : "";
    var energiaAtiva_GeracaoValor =
      item["bov2:energiaAtiva"] !== undefined
        ? item["bov2:energiaAtiva"]["bov2:geracao"][
            "bov2:valor"
          ]._text.toString()
        : "";
    energiaAtiva_GeracaoValor = energiaAtiva_GeracaoValor.replace(".", ",");
    const energiaReativa_ConsumoUnd =
      item["bov2:energiaReativa"] !== undefined
        ? item["bov2:energiaReativa"]["bov2:consumo"][
            "bov2:unidadeMedida"
          ]._text.toString()
        : "";
    var energiaReativa_ConsumoValor =
      item["bov2:energiaReativa"] !== undefined
        ? item["bov2:energiaReativa"]["bov2:consumo"][
            "bov2:valor"
          ]._text.toString()
        : "";
    energiaReativa_ConsumoValor = energiaReativa_ConsumoValor.replace(".", ",");
    const energiaReativa_GeracaoUnd =
      item["bov2:energiaReativa"] !== undefined
        ? item["bov2:energiaReativa"]["bov2:geracao"][
            "bov2:unidadeMedida"
          ]._text.toString()
        : "";
    var energiaReativa_GeracaoValor =
      item["bov2:energiaReativa"] !== undefined
        ? item["bov2:energiaReativa"]["bov2:geracao"][
            "bov2:valor"
          ]._text.toString()
        : "";
    energiaReativa_GeracaoValor = energiaReativa_GeracaoValor.replace(".", ",");
    const medidor =
      item["bov2:medidor"] !== undefined
        ? item["bov2:medidor"]["bov2:codigo"]._text.toString()
        : "";
    const tipoEnergia =
      item["bov2:tipoEnergia"] !== undefined
        ? item["bov2:tipoEnergia"]["bov2:codigo"]._text.toString()
        : "";

    return {
      coletaMedicao,
      dataPesquisada,
      energiaAtiva_ConsumoUnd,
      energiaAtiva_ConsumoValor,
      energiaAtiva_GeracaoUnd,
      energiaAtiva_GeracaoValor,
      energiaReativa_ConsumoUnd,
      energiaReativa_ConsumoValor,
      energiaReativa_GeracaoUnd,
      energiaReativa_GeracaoValor,
      medidor,
      tipoEnergia,
    };
  }

  // Listar Medidas Finais
  const sendRequest_ListarMedidasFinais = async () => {
    setPendingRequests(pendingRequests + 1);

    const initialDate = dayjs(date).startOf("month");
    const endDate = initialDate.endOf("month");

    var results = await listarMedidasFinais(
      dayjs(initialDate).format("YYYY-MM-DDTHH:mm:ss"),
      dayjs(endDate).format("YYYY-MM-DDTHH:mm:ss")
    );

    setMeasurementsValues(results);
    setPendingRequests(pendingRequests - 1);
  };

  async function listarMedidasFinais(initialDate, endDate) {
    var response = await medicaoService.listarMedidasFinais(
      authData,
      scdeCode,
      initialDate,
      endDate
    );

    var measurementsArr = [];

    if (response.code === 200) {
      const results = response.data;
      results.forEach((r) => {
        var measurements = mapResponseToFinalMeasurementData(r);
        measurementsArr.push(measurements);
      });
    }

    return measurementsArr;
  }

  function mapResponseToFinalMeasurementData(item) {
    var consumoAtivo =
      item["out2:consumoAtivo"] !== undefined
        ? item["out2:consumoAtivo"]._text.toString()
        : "";
    consumoAtivo = consumoAtivo.replace(".", ",");
    var consumoReativo =
      item["out2:consumoReativo"] !== undefined
        ? item["out2:consumoReativo"]._text.toString()
        : "";
    consumoReativo = consumoReativo.replace(".", ",");
    var geracaoAtiva =
      item["out2:geracaoAtiva"] !== undefined
        ? item["out2:geracaoAtiva"]._text.toString()
        : "";
    geracaoAtiva = geracaoAtiva.replace(".", ",");
    var geracaoReativo =
      item["out2:geracaoReativo"] !== undefined
        ? item["out2:geracaoReativo"]._text.toString()
        : "";
    geracaoReativo = geracaoReativo.replace(".", ",");

    const periodo =
      item["out2:periodo"] !== undefined
        ? item["out2:periodo"]["out2:fim"]._text.toString()
        : "";
    const status =
      item["out2:status"] !== undefined
        ? item["out2:status"]._text.toString()
        : "";
    const subTipo =
      item["out2:subTipo"] !== undefined
        ? item["out2:subTipo"]._text.toString()
        : "";

    return {
      consumoAtivo,
      consumoReativo,
      geracaoAtiva,
      geracaoReativo,
      periodo,
      status,
      subTipo,
    };
  }

  /**
   * Listar Modelagem de Ativo
   * @returns
   */
  const sendRequest_ListarModelagemDeAtivo = async () => {
    setPendingRequests(pendingRequests + 1);

    const initialDate = dayjs(date).startOf("month");
    const endDate = dayjs();

    var modellingResponse = await ativosService.listarModelagemDeAtivo(
      authData,
      dayjs(initialDate).format("YYYY-MM-DDTHH:mm:ss"),
      dayjs(endDate).format("YYYY-MM-DDTHH:mm:ss")
    );

    if (modellingResponse.code !== 200) {
      setPendingRequests(pendingRequests - 1);
      return;
    }

    var totalPages = parseInt(modellingResponse.totalPaginas._text.toString());

    let results = [];

    for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
      var innerResults = await listarModelagens(
        dayjs(initialDate).format("YYYY-MM-DDTHH:mm:ss"),
        dayjs(endDate).format("YYYY-MM-DDTHH:mm:ss"),
        currentPage
      );
      innerResults.forEach((x) => results.push(x));
    }

    setModellingValues(results);
    setPendingRequests(pendingRequests - 1);
  };

  async function listarModelagens(initialDate, endDate, currentPage) {
    var response = await ativosService.listarModelagemDeAtivo(
      authData,
      initialDate,
      endDate,
      currentPage
    );

    var modellingArr = [];

    if (response.code === 200) {
      const results = response.data;
      results.forEach((r) => {
        var resourcesModelling = mapResponseToModellingData(r);
        modellingArr.push(resourcesModelling);
      });
    }

    return modellingArr;
  }

  function mapResponseToModellingData(item) {
    const codAtivoMedicao =
      item["bov2:ativoMedicao"] !== undefined
        ? item["bov2:ativoMedicao"]["bov2:codigo"]._text.toString()
        : "";
    let dataApta =
      item["bov2:dataApta"] !== undefined
        ? item["bov2:dataApta"]._text.toString()
        : "";
    dataApta = dataApta !== "" ? dayjs(dataApta).format("DD/MM/YYYY") : "";
    let dataAutorizada =
      item["bov2:dataAutorizada"] !== undefined
        ? item["bov2:dataAutorizada"]._text.toString()
        : "";
    dataAutorizada =
      dataAutorizada !== "" ? dayjs(dataAutorizada).format("DD/MM/YYYY") : "";
    const situacao =
      item["bov2:situacao"] !== undefined
        ? item["bov2:situacao"]["bov2:nome"]._text.toString()
        : "";
    const tipo =
      item["bov2:tipo"] !== undefined
        ? item["bov2:tipo"]["bov2:descricao"]._text.toString()
        : "";

    return {
      codAtivoMedicao,
      dataApta,
      dataAutorizada,
      situacao,
      tipo,
    };
  }

  /**
   * Listar Representados
   * @returns
   */
  const listarRepresentados = async () => {
    var responseData = await cadastrosService.listarRepresentacao(authData, 1);
    var totalPaginas = responseData.totalPaginas;
    var totalPaginasNumber = parseInt(totalPaginas._text.toString());

    var agentCodes = [];
    if (totalPaginasNumber > 1) {
      for (
        let paginaCorrente = 1;
        paginaCorrente <= totalPaginasNumber;
        paginaCorrente++
      ) {
        var responseDataPaginated = await cadastrosService.listarRepresentacao(
          authData,
          paginaCorrente
        );
        if (responseDataPaginated.code === 200) {
          const results = responseDataPaginated.data;
          var codes = await mapResponseToRepresentation(results);
          codes.forEach((x) => agentCodes.push(x));
        }
      }
    } else {
      if (responseData.code === 200) {
        const results = responseData.data;
        var codes = await mapResponseToRepresentation(results);
        codes.forEach((x) => agentCodes.push(x));
      }
    }

    console.log(agentCodes.length);

    return agentCodes;
  };

  async function mapResponseToRepresentation(representados) {
    var codes = [];
    var representado = "";
    var codigo = "";

    if (representados.length === undefined) {
      representado = representados["bov2:representado"];
      codigo = representado["bov2:id"]._text.toString();
      codes.push(codigo);
    } else {
      for (var rep of representados) {
        representado = rep["bov2:representado"];
        codigo = representado["bov2:id"]._text.toString();
        codes.push(codigo);
      }
    }

    return codes;
  }

  async function listarParticipantePorCodigo(
    agentCode,
    dataKey = "",
    fromRetryList = false
  ) {
    try {
      var key =
        dataKey !== ""
          ? dataKey
          : "participantes_representados_" + dayjs(date).format("DD/MM/YY");

      var responseData =
        await cadastrosService.listarParticipantesDeMercadoPorAgente(
          authData,
          dayjs(date).format("YYYY-MM-DDTHH:mm:ss"),
          agentCode
        );

      if (responseData.code === 200) {
        const participantes = responseData.data;

        var participantesData = [];
        if (participantes.length === undefined) {
          participantesData = [participantes];
        } else {
          participantesData = participantes;
        }

        Array.prototype.forEach.call(participantesData, async (item) => {
          mapResponseToParticipantsData(key, item);
        });

        if (fromRetryList) {
          removeParticipantFromRetryList(key, agentCode);
        }
      } else {
        if (fromRetryList) {
          updateParticipantInRetryList(agentCode, key);
        } else {
          addParticipantCodeToRetryList(
            key,
            agentCode,
            responseData.code,
            0,
            "listarParticipantes"
          );
        }
      }
    } catch (e) {
      console.log("Erro ao listar participantes");
      console.error(e);
    }
  }

  const sendRequest_FullAutomatic = async () => {
    var itemsProcessed = 0;

    if (onlyRepresentedAgents) {
      setPendingRequests(pendingRequests + 1);

      var responseData = await cadastrosService.listarRepresentacao(
        authData,
        1
      );
      var totalItens = responseData.totalItens;
      var totalItensNumber = parseInt(totalItens._text.toString());

      var representedAgentCodes = await listarRepresentados();

      while (totalItensNumber !== representedAgentCodes.length) {
        representedAgentCodes = await listarRepresentados();
      }

      var agentCode = authData.AuthCodigoPerfilAgente;

      if (!representedAgentCodes.includes(agentCode)) {
        representedAgentCodes.push(agentCode);
      }

      for (const code of representedAgentCodes) {
        await listarParticipantePorCodigo(code);
        itemsProcessed++;
        var totalAmount = representedAgentCodes.length;
        var amountDone = (itemsProcessed / totalAmount) * 100;
        setProgress(amountDone);
      }

      setPendingRequests(pendingRequests - 1);
    } else {
      var classesProcessed = 0;

      for (const cl of classes) {
        await sendRequest_ListarParticipantes(cl.id);
        classesProcessed++;
        var amountDone = (classesProcessed / classes.length) * 100;
        setProgress(amountDone);
      }
    }
  };

  const fileHandler = (event) => {
    let fileObj = event.target.files[0];

    //just pass the fileObj as parameter
    ExcelRenderer(fileObj, (err, resp) => {
      if (err) {
        console.log(err);
      } else {
        setColumns(resp.cols);
        setRows(resp.rows);
      }
    });
  };

  const handleSearchMethodChange = (event) => {
    setSearchMethod(event.target.value);
  };

  const handleParticipantSearchMethodChange = (event) => {
    setParticipantSearchMethod(event.target.value);
  };

  const sendRequest = () => {
    if (searchMethod === "Automático") {
      sendRequest_FullAutomatic();
    } else {
      switch (service) {
        case 1:
          chooseHowToListParticipants();
          break;
        case 2:
          sendRequest_ListarPerfis();
          break;
        case 3:
          sendRequest_ListarAtivosDeMedicao();
          break;
        case 4:
          sendRequest_ListarParcelasDeAtivo();
          break;
        case 5:
          sendRequest_ListarParcelasDeCarga();
          break;
        case 6:
          sendRequest_ListarMedidasCincoMinutos();
          break;
        case 7:
          sendRequest_ListarMedidasFinais();
          break;
        case 8:
          sendRequest_ListarTopologiasPorAtivo();
          break;
        case 9:
          sendRequest_ListarModelagemDeAtivo();
          break;
        default:
          sendRequest_ListarParticipantes();
          break;
      }
    }

    //fetchWebWorker();
  };

  const chooseFieldsToRender = () => {
    if (searchMethod === "Automático") {
      return <div>{renderFullAutomaticFields()}</div>;
    } else {
      return (
        <div>
          <Stack spacing={2}>
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
                  <MenuItem value={x.id} key={x.id}>
                    {x.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {decideServiceFiledsToRender()}
          </Stack>
        </div>
      );
    }
  };

  function decideServiceFiledsToRender() {
    const serviceId = parseInt(service);

    if (serviceId === 1) {
      return <div>{renderParticipantsFields()}</div>;
    } else if (serviceId === 2 || serviceId === 3) {
      return <div>{RenderProfileOrMeasurementFields(serviceId)}</div>;
    } else if (serviceId === 4) {
      return <div>{renderFractionalMeasurementFields()}</div>;
    } else if (serviceId === 5) {
      return <div>{renderLoadOrTopologyFields()}</div>;
    } else if (serviceId === 6 || serviceId === 7) {
      return <div>{renderMeasurementFields()}</div>;
    } else if (serviceId === 8) {
      return <div>{renderLoadOrTopologyFields()}</div>;
    } else if (serviceId === 9) {
      return <div>{renderModellingFields()}</div>;
    } else {
      return <div>{renderLoadOrTopologyFields()}</div>;
    }
  }

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
          <FormLabel id="demo-radio-buttons-group-label-x">
            Forma de busca
          </FormLabel>
          <RadioGroup
            row
            aria-labelledby="participant-radio-buttons-group-label"
            defaultValue="Automático"
            name="participant-radio-buttons-group"
            value={participantSearchMethod}
            onChange={handleParticipantSearchMethodChange}
          >
            <FormControlLabel
              value="Classe"
              control={<Radio />}
              label="Por classe"
            />
            <FormControlLabel
              value="Código"
              control={<Radio />}
              label="Por código"
            />
          </RadioGroup>
        </FormControl>
        {participantSearchMethod === "Classe" ? (
          <div>
            <FormControl sx={{ width: "100%" }}>
              <InputLabel id="class-simple-select-label">Classe</InputLabel>
              <Select
                labelId="class-simple-select-label"
                id="class-simple-select-2"
                value={category}
                label="Classe"
                onChange={handleCategoryChange}
              >
                {classes.map((x) => (
                  <MenuItem value={x.id} key={x.id}>
                    {x.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        ) : (
          <div>
            <input type="file" onChange={fileHandler.bind(this)} />
          </div>
        )}
      </Stack>
    );
  };

  function RenderProfileOrMeasurementFields(serviceIdx) {
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
          <InputLabel id="data-source-select-label-2">
            Fonte de dados
          </InputLabel>
          <Select
            labelId="data-source-select-label"
            id="data-source-simple-select-2"
            value={selectedDataSource}
            label="Fonte de dados"
            onChange={handleDataSourceChange}
          >
            {sortedDataSourceKeys.map((x) => (
              <MenuItem value={x} key={x}>
                {x}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    );
  }

  const renderFractionalMeasurementFields = () => {
    var sortedDataSourceKeys = [];
    sortedDataSourceKeys = dataSourceKeys.filter((item) =>
      item.includes("perfis")
    );

    return (
      <div>
        {searchMethod === "Manual" ? (
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
              <InputLabel id="parameter-select-label">
                Parâmetro de entrada
              </InputLabel>
              <Select
                labelId="data-source-select-label"
                id="data-source-simple-select-3"
                value={parameter}
                label="Parâmetro de entrada"
                onChange={handleParameterChange}
              >
                {parameters.map((x) => (
                  <MenuItem value={x.id} key={x.id}>
                    {x.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <input type="file" onChange={fileHandler.bind(this)} />
          </Stack>
        ) : (
          <Stack spacing={2}>
            <FormControl>
              <InputLabel id="data-source-select-label-4">
                Fonte de dados
              </InputLabel>
              <Select
                labelId="data-source-select-label"
                id="data-source-simple-select-4"
                value={selectedDataSource}
                label="Fonte de dados"
                onChange={handleDataSourceChange}
              >
                {sortedDataSourceKeys.map((x) => (
                  <MenuItem value={x} key={x}>
                    {x}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        )}
      </div>
    );
  };

  const renderFullAutomaticFields = () => {
    return (
      <div>
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={onlyRepresentedAgents}
                onChange={handleOnlyRepresentedAgentsSwitchChange}
              />
            }
            label="Apenas representados"
          />
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
        </Stack>
      </div>
    );
  };

  const renderMeasurementFields = () => {
    return (
      <Stack spacing={2}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Mês & ano"
            value={date}
            views={["year", "month"]}
            openTo="month"
            maxDate={dayjs()}
            onChange={(newValue) => {
              setDate(newValue);
            }}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>

        <TextField
          id="outlined-password-input"
          label="Cód Medidor"
          onChange={(event) => setScdeCode(event.target.value)}
        />
      </Stack>
    );
  };

  const renderModellingFields = () => {
    return (
      <Stack spacing={2}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Mês & ano"
            value={date}
            views={["year", "month"]}
            openTo="month"
            maxDate={dayjs()}
            onChange={(newValue) => {
              setDate(newValue);
            }}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>
      </Stack>
    );
  };

  const renderLoadOrTopologyFields = () => {
    var sortedDataSourceKeys = dataSourceKeys.filter((item) =>
      item.includes("parcelasDeAtivos")
    );

    return (
      <Stack spacing={2}>
        <FormControl>
          <InputLabel id="data-source-select-label-3">
            Fonte de dados
          </InputLabel>
          <Select
            labelId="data-source-select-label-4"
            id="data-source-simple-select-4"
            value={selectedDataSource}
            label="Fonte de dados"
            onChange={handleDataSourceChange}
          >
            {sortedDataSourceKeys.map((x) => (
              <MenuItem value={x} key={x}>
                {x}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    );
  };

  return (
    <Container className={styles.container}>
      <Typography variant="h5" mb={5}>
        Importar Dados
      </Typography>

      <Stack sx={{ width: "50%" }} spacing={2}>
        <FormControl>
          <FormLabel id="demo-radio-buttons-group-label-x">
            Método de busca
          </FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-radio-buttons-group-label"
            defaultValue="Automático"
            name="radio-buttons-group"
            value={searchMethod}
            onChange={handleSearchMethodChange}
          >
            <FormControlLabel
              value="Automático"
              control={<Radio />}
              label="Automático"
            />
            <FormControlLabel
              value="Semi Automático"
              control={<Radio />}
              label="Semi Automático"
            />
            <FormControlLabel
              value="Manual"
              control={<Radio />}
              label="Manual"
            />
          </RadioGroup>
        </FormControl>
        {chooseFieldsToRender()}
      </Stack>
      <Button variant="outlined" onClick={sendRequest} sx={{ marginTop: 2 }}>
        Enviar
      </Button>

      {retryKeys.length > 0 ? (
        <div>
          <Button
            variant="outlined"
            onClick={retryFaultyRequests}
            sx={{ marginTop: 7 }}
          >
            Reenviar dados faltantes
          </Button>
          <Button
            variant="outlined"
            onClick={removeExpiredData}
            sx={{ marginTop: 7, marginLeft: 5 }}
          >
            Remover dados expirados
          </Button>
        </div>
      ) : (
        <div></div>
      )}
      {measurementsValues.length > 0 ? (
        <div>
          <Button
            variant="outlined"
            onClick={exportMeasurementData}
            sx={{ marginTop: 7 }}
          >
            Exportar medições
          </Button>
        </div>
      ) : (
        <div></div>
      )}
      {modellingValues.length > 0 ? (
        <div>
          <Button
            variant="outlined"
            onClick={exportModellingData}
            sx={{ marginTop: 7 }}
          >
            Exportar modelagens
          </Button>
        </div>
      ) : (
        <div></div>
      )}

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            id="modal-modal-title-m"
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
            {progress > 0 ? (
              <div>
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
              </div>
            ) : (
              <div></div>
            )}
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
      <Snackbar
        open={openSuccessDialog}
        autoHideDuration={6000}
        onClose={handleSuccessDialogClose}
      >
        <Alert
          onClose={handleSuccessDialogClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          Requisição realizada com sucesso!
        </Alert>
      </Snackbar>

      <Snackbar
        open={openWarningDialog}
        autoHideDuration={6000}
        onClose={handleWarningDialogClose}
      >
        <Alert
          onClose={handleWarningDialogClose}
          severity="warning"
          sx={{ width: "100%" }}
        >
          {warningText}
        </Alert>
      </Snackbar>
    </Container>
  );
}
