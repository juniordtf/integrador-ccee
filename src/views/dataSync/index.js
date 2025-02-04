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
import { dbPersistance } from "./dbPersistance.ts";
import { apiMappings } from "./apiMappings.ts";
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
  const [inputFieldType, setInputFieldType] = useState("Simples");
  const [dateType, setDateType] = useState("Mês completo");
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
  const [excelFileName, setExcelFileName] = useState("");
  const [scdeCode, setScdeCode] = useState("");
  const [measurementsValues, setMeasurementsValues] = useState([]);
  const [modellingValues, setModellingValues] = useState([]);
  const [onlyRepresentedAgents, setOnlyRepresentedAgents] = useState(false);
  const [webWorker, setWebWorker] = useState(null);
  const [genericFaultyRequests, setGenericFaultyRequests] = useState([]);
  const [requestSent, setRequestSent] = useState(false);

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
    webWorker.postMessage(test);
  };

  const fetchWebWorker_createRetryProfilesList = (key, codAgentes) => {
    const msPayload = {
      key,
      codAgentes,
    };

    webWorker.postMessage(msPayload);
  };

  useEffect(() => {
    //localStorage.clear();

    const worker = new WebWorker(workers.createProfilesRetryList);

    if (webWorker === null) {
      setWebWorker(worker);
    }

    async function fetchData() {
      var genericRequestData = await db.genericFaultyRequest;
      if (genericRequestData === undefined) {
        genericRequestData = [];
      } else {
        genericRequestData = await db.genericFaultyRequest.toArray();
      }

      setGenericFaultyRequests(genericRequestData);

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
      var modelagens = await db.modelagem;
      if (modelagens === undefined) {
        modelagens = [];
      } else {
        modelagens = await db.modelagem.toArray();
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

      if (modelagens.length > 0) {
        dataSources = dataSources.concat(
          modelagens.map(function (v) {
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

    async function sendRequest() {
      await retryFaultyRequests();
      setRequestSent(false);
    }

    if (requestSent) {
      sendRequest();
    }

    worker.addEventListener("message", (event) => {
      console.log("Done!");
    });
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
    var modelagens = await db.modelagem;
    if (modelagens === undefined) {
      modelagens = [];
    } else {
      modelagens = await db.modelagem.toArray();
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
    } else if (
      modelagens.length > 0 &&
      modelagens.filter((x) => x.key === selectedDataSourceKey).length > 0
    ) {
      var selectedModellingData = modelagens.filter(
        (x) => x.key === selectedDataSourceKey
      );
      console.log(selectedModellingData.length);
      setDataSourceItems(selectedModellingData);
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

      sourceData.forEach((code) => {
        dbPersistance.addGenericFaultyRequest(
          key,
          code,
          0,
          "",
          0,
          0,
          "listarParticipantes",
          0
        );
      });

      // for (const code of sourceData) {
      //   await listarParticipantePorCodigo(code, key);
      //   itemsProcessed++;
      //   var totalAmount = sourceData.length;
      //   var amountDone = (itemsProcessed / totalAmount) * 100;
      //   setProgress(amountDone);
      // }
      setSuccessDialogOpen(true);
    }
  };

  /**
   * Listar Participantes
   * @returns
   */
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

    for (let index = 1; index <= totalPages; index++) {
      dbPersistance.addGenericFaultyRequest(
        key,
        cat,
        index,
        dayjs(date).format("YYYY-MM-DDTHH:mm:ss"),
        0,
        0,
        "listarParticipantes",
        0
      );
    }

    // var done = await listarParticipantes(
    //   key,
    //   totalPages,
    //   date,
    //   cat,
    //   false,
    //   isAutomatic
    // );

    // if (done) {
    //   setPendingRequests(pendingRequests - 1);
    //   setProgress(0);

    //   var catInArr = classes.find((x) => x.id === cat);

    //   if (classes.indexOf(catInArr) + 1 === classes.length) {
    //     setSuccessDialogOpen(true);
    //   }
    // }

    setPendingRequests(pendingRequests - 1);
    setProgress(0);
  };

  async function listarParticipantes(
    key,
    totalPages,
    queryDate,
    category,
    fromRetryList,
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
          queryDate,
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
            apiMappings.mapResponseToParticipantsData(key, item);
          });
        }

        let agentPagesInRetryList = genericFaultyRequests.filter(
          (x) =>
            x.requestCode === category &&
            x.key === key &&
            x.additionalRequestCode === currentPage
        );

        if (agentPagesInRetryList.length === 0) return;

        agentPagesInRetryList.forEach((res) => {
          dbPersistance.updateGenericFaultyRequest(
            category,
            res.id,
            responseData.code,
            res.attempts + 1
          );
        });

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

  const sendRequest_ListarPerfis = async () => {
    setPendingRequests(pendingRequests + 1);
    let key = [];

    if (selectedDataSource.includes("participantes")) {
      key = selectedDataSource.replace("participantes", "perfis");
    } else {
      key = selectedDataSource.replace("parcelasDeAtivos", "perfis");
    }
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

          if (selectedDataSource.includes("participantes")) {
            var codAgentes = dataSourceItems.map((x) => x.codigo);

            codAgentes.forEach((code) => {
              dbPersistance.addGenericFaultyRequest(
                key,
                code,
                0,
                "",
                0,
                0,
                "listarPerfis",
                0
              );
            });
          } else {
            var codPerfis = dataSourceItems.map((x) => x.codPerfil);

            codPerfis.forEach((code) => {
              dbPersistance.addGenericFaultyRequest(
                key,
                "",
                code,
                "",
                0,
                0,
                "listarPerfis",
                0
              );
            });
          }

          //fetchWebWorker_createRetryProfilesList(key, codAgentes);

          // await listarPerfis(key, codAgentes);
          setPendingRequests(pendingRequests - 1);
          setSuccessDialogOpen(true);
          setProgress(0);
        }
      });
  };

  async function listarPerfis(key, sourceItems, additinalSourceItems) {
    try {
      if (sourceItems.length > 0 && sourceItems[0] !== "") {
        await listProfileByAgentCode(key, sourceItems);
      } else {
        await listProfileByProfileCode(key, additinalSourceItems);
      }
    } catch (e) {
      console.log("Erro ao listar perfis");
      console.error(e);
    }
  }

  async function listProfileByAgentCode(key, sourceItems) {
    var itemsProcessed = 0;
    const requestsQuantity = sourceItems.length;

    for (const codAgente of sourceItems) {
      var responseData = await cadastrosService.listarPerfis(
        authData,
        codAgente,
        ""
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
            "",
            paginaCorrente
          );

          handleProfileResponseData(responseDataPaginated, key, codAgente, "");
        }
      } else {
        handleProfileResponseData(responseData, key, codAgente, "");
      }

      var amountDone = (itemsProcessed / requestsQuantity) * 100;
      setProgress(amountDone);
    }
  }

  async function listProfileByProfileCode(key, additinalSourceItems) {
    var itemsProcessed = 0;
    const requestsQuantity = additinalSourceItems.length;

    for (const codPerfil of additinalSourceItems) {
      var responseData = await cadastrosService.listarPerfis(
        authData,
        "",
        codPerfil
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
            "",
            codPerfil,
            paginaCorrente
          );

          handleProfileResponseData(responseDataPaginated, key, "", codPerfil);
        }
      } else {
        handleProfileResponseData(responseData, key, "", codPerfil);
      }

      var amountDone = (itemsProcessed / requestsQuantity) * 100;
      setProgress(amountDone);
    }
  }

  function handleProfileResponseData(responseData, key, codAgente, codPerfil) {
    if (responseData.code === 200) {
      var perfis = responseData.data;

      if (perfis.length === undefined) {
        apiMappings.mapResponseToProfileData(key, perfis);
      } else {
        Array.prototype.forEach.call(perfis, async (item) => {
          apiMappings.mapResponseToProfileData(key, item);
        });
      }
    }

    let agentsInRetryList = genericFaultyRequests.filter(
      (x) =>
        (x.requestCode === codAgente ||
          x.additionalRequestCode === codPerfil) &&
        x.key === key
    );

    if (agentsInRetryList.length === 0) return;

    agentsInRetryList.forEach((res) => {
      dbPersistance.updateGenericFaultyRequest(
        codAgente,
        res.id,
        responseData.code,
        res.attempts + 1
      );
    });
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

          codPerfis.forEach((code) => {
            dbPersistance.addGenericFaultyRequest(
              key,
              code,
              0,
              "",
              0,
              0,
              "listarAtivosDeMedicao",
              0
            );
          });

          await listarAtivos(key, codPerfis);
          setPendingRequests(pendingRequests - 1);
          setSuccessDialogOpen(true);
          setProgress(0);
        }
      });
  };

  async function listarAtivos(key, sourceItems) {
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
                apiMappings.mapResponseToResourceData(key, codPerfil, ativos);
              } else {
                Array.prototype.forEach.call(ativos, async (item) => {
                  apiMappings.mapResponseToResourceData(key, codPerfil, item);
                });
              }
            }
          }
        } else {
          var ativos = responseData.data;
          if (responseData.code === 200) {
            if (ativos.length === undefined) {
              apiMappings.mapResponseToResourceData(key, codPerfil, ativos);
            } else {
              Array.prototype.forEach.call(ativos, async (item) => {
                apiMappings.mapResponseToResourceData(key, codPerfil, item);
              });
            }
          }
        }

        let resourcesInRetryList = genericFaultyRequests.filter(
          (x) => x.requestCode === codPerfil && x.key === key
        );

        if (resourcesInRetryList.length === 0) return;

        resourcesInRetryList.forEach((res) => {
          dbPersistance.updateGenericFaultyRequest(
            codPerfil,
            res.id,
            responseData.code,
            res.attempts + 1
          );
        });

        console.log(itemsProcessed);
        var amountDone = (itemsProcessed / requestsQuantity) * 100;
        setProgress(amountDone);
      }
    } catch (e) {
      console.log("Erro ao listar ativos");
      console.error(e);
    }
  }

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
      if (dataSourceItems === null) {
        setPendingRequests(pendingRequests - 1);
        return;
      }

      if (selectedDataSource.includes("modelagens")) {
        sourceData = dataSourceItems.map((x) => x.codAtivoMedicao);
        selectedParameter = 3;
        key =
          selectedDataSource.substring(0, 10) +
          "_parcelasDeAtivos_" +
          selectedDataSource.substring(11);

        let modellingDate =
          selectedDataSource.substring(11, 13) +
          "-01-" +
          selectedDataSource.substring(14);
        formDate = dayjs(modellingDate).format("YYYY-MM-DDTHH:mm:ss");
      } else {
        sourceData = dataSourceItems.map((x) => x.codPerfil);
        selectedParameter = 4;
        key = selectedDataSource.replace("perfis", "parcelasDeAtivos");
        console.log(key);
        var date = selectedDataSource.substring(selectedDataSource.length - 5);
        formDate =
          "20" +
          date.substring(date.length - 2) +
          "-" +
          date.substring(0, 2) +
          "-01";
        formDate = dayjs(formDate).format("YYYY-MM-DDTHH:mm:ss");
      }
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

          sourceData.forEach(async (code) => {
            dbPersistance.addGenericFaultyRequest(
              key,
              code,
              0,
              formDate,
              selectedParameter,
              0,
              "listarParcelasDeAtivo",
              0
            );
          });

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
    selectedParameter
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
              item
            );
          }
        } else {
          handlePartialResourceResponseData(
            responseData,
            key,
            codMedidor,
            item
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
    item
  ) {
    if (responseData.code === 200) {
      var parcelaAtivos = responseData.data;

      if (parcelaAtivos.length === undefined) {
        apiMappings.mapResponseToPartialMeasurementData(
          key,
          codMedidor,
          parcelaAtivos
        );
      } else {
        Array.prototype.forEach.call(parcelaAtivos, async (x) => {
          apiMappings.mapResponseToPartialMeasurementData(key, codMedidor, x);
        });
      }
    }

    let partialResourcesInRetryList = genericFaultyRequests.filter(
      (x) => x.requestCode === item && x.key === key
    );

    if (partialResourcesInRetryList.length === 0) return;

    partialResourcesInRetryList.forEach((res) => {
      dbPersistance.updateGenericFaultyRequest(
        item,
        res.id,
        responseData.code,
        res.attempts + 1
      );
    });
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

          dataSourceItems.forEach((x) => {
            dbPersistance.addGenericFaultyRequest(
              key,
              x.codAtivoMedicao,
              x.codPerfil,
              formDate,
              0,
              0,
              "listarParcelasDeCarga",
              0
            );
          });

          //await listarParcelasDeCarga(key, dataSourceItems, formDate);
          setPendingRequests(pendingRequests - 1);
          setProgress(0);
          setSuccessDialogOpen(true);
        }
      });
  };

  async function listarParcelasDeCarga(key, dataSourceItems, searchDate) {
    try {
      var itemsProcessed = 0;
      const requestsQuantity = dataSourceItems.length;
      console.log(requestsQuantity);

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

            handlePartialLoadResponseData(responseDataPaginated, key, item);
          }
        } else {
          handlePartialLoadResponseData(responseData, key, item);
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

  function handlePartialLoadResponseData(responseData, key, item) {
    if (responseData.code === 200) {
      var parcelaCarga = responseData.data;

      if (parcelaCarga.length === undefined) {
        apiMappings.mapResponseToPartialLoadData(key, parcelaCarga);
      } else {
        Array.prototype.forEach.call(parcelaCarga, async (x) => {
          apiMappings.mapResponseToPartialLoadData(key, x);
        });
      }
    }

    let resourcesInRetryList = genericFaultyRequests.filter(
      (x) =>
        x.requestCode === item.codAtivoMedicao &&
        x.additionalRequestCode === item.codPerfil &&
        x.key === key
    );

    if (resourcesInRetryList.length === 0) return;

    resourcesInRetryList.forEach((res) => {
      dbPersistance.updateGenericFaultyRequest(
        item.codAtivoMedicao,
        res.id,
        responseData.code,
        res.attempts + 1
      );
    });
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

          dataSourceItems.forEach((x) => {
            dbPersistance.addGenericFaultyRequest(
              key,
              x.codAtivoMedicao,
              x.codPerfil,
              formDate,
              0,
              0,
              "listarTopologiasPorAtivo",
              0
            );
          });

          //await listarTopologias(key, dataSourceItems, formDate);
          setPendingRequests(pendingRequests - 1);
          setProgress(0);
          setSuccessDialogOpen(true);
        }
      });
  };

  async function listarTopologias(key, dataSourceItems, searchDate) {
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

            handleTopologyResponseData(responseDataPaginated, key, item);
          }
        } else {
          handleTopologyResponseData(responseData, key, item);
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

  function handleTopologyResponseData(responseData, key, item) {
    if (responseData.code === 200) {
      var parcelaCarga = responseData.data;

      if (parcelaCarga.length === undefined) {
        apiMappings.mapResponseToTopologyData(key, parcelaCarga);
      } else {
        Array.prototype.forEach.call(parcelaCarga, async (x) => {
          apiMappings.mapResponseToTopologyData(key, x);
        });
      }
    }

    let resourcesInRetryList = genericFaultyRequests.filter(
      (x) =>
        x.requestCode === item.codAtivoMedicao &&
        x.additionalRequestCode === item.codPerfil &&
        x.key === key
    );

    console.log(resourcesInRetryList.length);

    if (resourcesInRetryList.length === 0) return;

    resourcesInRetryList.forEach((res) => {
      dbPersistance.updateGenericFaultyRequest(
        item.codAtivoMedicao,
        res.id,
        responseData.code,
        res.attempts + 1
      );
    });
  }

  // Listar Medidas - 5 minutos
  const sendRequest_ListarMedidasCincoMinutos = async () => {
    setPendingRequests(pendingRequests + 1);
    const dateInFinalHour = date.endOf("day");

    if (inputFieldType === "Simples" && dateType === "Mês completo") {
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

      getIndividualResults_listarMedidasCincoMinutos(daysArr, scdeCode).then(
        (res) => {
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
        }
      );
    } else if (inputFieldType === "Simples" && dateType === "Data específica") {
      let results = await listarMedidasCincoMinutos(
        dateInFinalHour.format("YYYY-MM-DDTHH:mm:ss"),
        scdeCode
      );
      setMeasurementsValues(results);
      setPendingRequests(pendingRequests - 1);
    } else if (
      inputFieldType === "Múltipla" &&
      dateType === "Data específica"
    ) {
      const sourceData = rows.map((x) => x[0]);
      let itemsProcessed = 0;
      let totalAmount = sourceData.length;
      let results = [];

      for (const medScde of sourceData) {
        let innerResults = await listarMedidasCincoMinutos(
          dateInFinalHour.format("YYYY-MM-DDTHH:mm:ss"),
          medScde.trim()
        );
        itemsProcessed++;
        var amountDone = (itemsProcessed / totalAmount) * 100;
        setProgress(amountDone);

        if (results.length === 0) results = innerResults;
        else results = results.concat(innerResults);
      }

      setMeasurementsValues(results);
      setPendingRequests(pendingRequests - 1);
    } else {
    }
  };

  const getIndividualResults_listarMedidasCincoMinutos = async (
    dates,
    codMedidor
  ) => {
    const requests = dates.map((d) => {
      return listarMedidasCincoMinutos(d, codMedidor).then((res) => {
        return res;
      });
    });

    return Promise.all(requests);
  };

  async function listarMedidasCincoMinutos(currentDate, codMedidor) {
    var responseData = await medicaoService.listarMedidasCincoMinutos(
      authData,
      codMedidor,
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
            codMedidor,
            currentDate,
            paginaCorrente
          );

        if (responseDataPaginated.code === 200) {
          const results = responseDataPaginated.data;

          if (results.length > 0) {
            results.forEach((r) => {
              var measurements = apiMappings.mapResponseToMeasurementData(r);
              measurementsArr.push(measurements);
            });
          }
        }
      }
    } else {
      if (responseData.code === 200) {
        const results = responseData.data;

        if (results.length > 0) {
          results.forEach((r) => {
            var measurements = apiMappings.mapResponseToMeasurementData(r);
            measurementsArr.push(measurements);
          });
        }
      }
    }

    return measurementsArr;
  }

  // Listar Medidas Finais
  const sendRequest_ListarMedidasFinais = async () => {
    setPendingRequests(pendingRequests + 1);

    const initialDate = dayjs(date).startOf("month");
    const endDate = initialDate.endOf("month");
    let results = [];

    if (inputFieldType === "Simples") {
      results = await listarMedidasFinais(
        scdeCode,
        dayjs(initialDate).format("YYYY-MM-DDTHH:mm:ss"),
        dayjs(endDate).format("YYYY-MM-DDTHH:mm:ss")
      );
    } else {
      const sourceData = rows.map((x) => x[0]);
      let itemsProcessed = 0;
      let totalAmount = sourceData.length;

      for (const medScde of sourceData) {
        let innerResults = await listarMedidasFinais(
          medScde,
          dayjs(initialDate).format("YYYY-MM-DDTHH:mm:ss"),
          dayjs(endDate).format("YYYY-MM-DDTHH:mm:ss")
        );
        itemsProcessed++;
        var amountDone = (itemsProcessed / totalAmount) * 100;
        setProgress(amountDone);

        if (results.length === 0) results = innerResults;
        else results = results.concat(innerResults);
      }
    }

    setMeasurementsValues(results);
    setPendingRequests(pendingRequests - 1);
  };

  async function listarMedidasFinais(scde, initialDate, endDate) {
    var response = await medicaoService.listarMedidasFinais(
      authData,
      scde,
      initialDate,
      endDate
    );

    var measurementsArr = [];

    if (response.code === 200) {
      const results = response.data;
      results.forEach((r) => {
        var measurements = apiMappings.mapResponseToFinalMeasurementData(r);
        measurementsArr.push(measurements);
      });
    }

    return measurementsArr;
  }

  /**
   * Listar Modelagem de Ativo
   * @returns
   */
  const sendRequest_ListarModelagemDeAtivo = async () => {
    setPendingRequests(pendingRequests + 1);

    const initialDate = dayjs(date).startOf("month");
    const endDate = dayjs(date).endOf("month");

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
    const key = "modelagens_" + date.format("MM-YYYY");
    let results = [];

    for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
      var innerResults = await listarModelagens(
        key,
        dayjs(initialDate).format("YYYY-MM-DDTHH:mm:ss"),
        dayjs(endDate).format("YYYY-MM-DDTHH:mm:ss"),
        currentPage
      );
      innerResults.forEach((x) => results.push(x));
    }

    setModellingValues(results);
    setPendingRequests(pendingRequests - 1);
  };

  async function listarModelagens(key, initialDate, endDate, currentPage) {
    var response = await ativosService.listarModelagemDeAtivo(
      authData,
      initialDate,
      endDate,
      currentPage
    );

    var modellingArr = [];

    if (response.code === 200) {
      const results = response.data;
      var resourcesModelling = [];

      if (results.length > 0) {
        results.forEach((r) => {
          resourcesModelling = apiMappings.mapResponseToModellingData(key, r);
          modellingArr.push(resourcesModelling);
        });
      } else {
        resourcesModelling = apiMappings.mapResponseToModellingData(
          key,
          results
        );
        modellingArr.push(resourcesModelling);
      }
    }

    return modellingArr;
  }

  /**
   * Listar Representados
   * @returns
   */
  const listarRepresentados = async () => {
    var responseData = await cadastrosService.listarRepresentacao(authData, 1);
    var totalPaginas = responseData.totalPaginas
      ? responseData.totalPaginas
      : 0;
    var totalPaginasNumber = parseInt(totalPaginas?._text.toString());

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
          var codes = await apiMappings.mapResponseToRepresentation(results);
          codes.forEach((x) => agentCodes.push(x));
        }
      }
    } else {
      if (responseData.code === 200) {
        const results = responseData.data;
        var codes = await apiMappings.mapResponseToRepresentation(results);
        codes.forEach((x) => agentCodes.push(x));
      }
    }

    return agentCodes;
  };

  async function listarParticipantePorCodigo(
    agentCode,
    searchDate,
    dataKey = ""
  ) {
    try {
      var key =
        dataKey !== ""
          ? dataKey
          : "participantes_representados_" + dayjs(date).format("DD/MM/YY");

      var responseData =
        await cadastrosService.listarParticipantesDeMercadoPorAgente(
          authData,
          searchDate,
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
          apiMappings.mapResponseToParticipantsData(key, item);
        });
      }

      let agentsInRetryList = genericFaultyRequests.filter(
        (x) => x.requestCode === agentCode && x.key === key
      );

      if (agentsInRetryList.length === 0) return;

      agentsInRetryList.forEach((res) => {
        dbPersistance.updateGenericFaultyRequest(
          agentCode,
          res.id,
          responseData.code,
          res.attempts + 1
        );
      });
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

      if (parseInt(responseData.code) !== 200) {
        console.log("Error ao listar representados");
        return;
      }

      var totalItens = responseData.totalItens;
      var totalItensNumber = parseInt(totalItens._text.toString());

      var representedAgentCodes = await listarRepresentados();

      while (totalItensNumber !== representedAgentCodes.length) {
        representedAgentCodes = await listarRepresentados();
        console.log(representedAgentCodes.length);
      }

      var agentCode = authData.AuthCodigoPerfilAgente;

      if (!representedAgentCodes.includes(agentCode)) {
        representedAgentCodes.push(agentCode);
      }

      const key =
        "participantes_representados_" + dayjs(date).format("DD/MM/YY");
      const formDate = dayjs(date).format("YYYY-MM-DDTHH:mm:ss");

      representedAgentCodes.forEach((code) => {
        dbPersistance.addGenericFaultyRequest(
          key,
          code,
          0,
          formDate,
          0,
          0,
          "listarParticipantes",
          0
        );
      });

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

  const retryFaultyRequests = async () => {
    await proccessFaultyRequestList();
    setSuccessDialogOpen(true);
  };

  async function proccessFaultyRequestList() {
    setPendingRequests(pendingRequests + 1);

    let amountDone = 0;
    let itemsProcessed = 0;
    let requestsQuantity = genericFaultyRequests.length;

    for (const request of genericFaultyRequests) {
      if (request.apiCode === 200) {
        continue;
      }

      if (request.key.includes("participantes_representados")) {
        await listarParticipantePorCodigo(
          request.requestCode,
          request.searchDate,
          request.key
        );
      } else if (request.key.includes("participantes")) {
        await listarParticipantes(
          request.key,
          request.additionalRequestCode,
          request.searchDate,
          request.requestCode,
          true,
          false
        );
      } else if (request.key.includes("perfis")) {
        await listarPerfis(
          request.key,
          [request.requestCode],
          [request.additionalRequestCode]
        );
      } else if (request.key.includes("parcelasDeAtivos")) {
        await listarParcelasDeAtivos(
          request.key,
          [request.requestCode],
          request.searchDate,
          request.parameter
        );
      } else if (request.key.includes("parcelasDeCarga")) {
        let partialLoadMap = {};
        partialLoadMap["codPerfil"] = request.additionalRequestCode;
        partialLoadMap["codAtivoMedicao"] = request.requestCode;

        await listarParcelasDeCarga(
          request.key,
          [partialLoadMap],
          request.searchDate
        );
      } else if (request.key.includes("topologias")) {
        let topologyMap = {};
        topologyMap["codPerfil"] = request.additionalRequestCode;
        topologyMap["codAtivoMedicao"] = request.requestCode;

        await listarTopologias(request.key, [topologyMap], request.searchDate);
      } else if (request.key.includes("ativos")) {
        await listarAtivos(request.key, [request.requestCode]);
      } else {
        continue;
      }

      itemsProcessed++;
      amountDone = (itemsProcessed / requestsQuantity) * 100;
      setProgress(amountDone);
    }

    setPendingRequests(0);
  }

  const removeExpiredData = async () => {
    await removeFaultyRequests();
    setSuccessDialogOpen(true);
  };

  async function removeFaultyRequests() {
    let removes = genericFaultyRequests.filter(
      (z) => z.apiCode === 200 || (z.apiCode === 500 && z.attempts > 0)
    );

    console.log(removes.length);

    for (const expiredData of removes) {
      dbPersistance.deleteGenericFaultyRequest(
        expiredData.requestCode,
        expiredData.id
      );
    }
  }

  const exportMeasurementData = async () => {
    var medService =
      servicos.id === 6 ? "medidasCincoMinutos" : "medidasFinais";
    var medName =
      inputFieldType === "Simples" ? scdeCode : excelFileName.toString();
    var fileName = medService + "_" + medName;
    let exportType = exportFromJSON.types.xls;

    exportFromJSON({ data: measurementsValues, fileName, exportType });
  };

  const exportModellingData = async () => {
    var fileName =
      "modelagens_" + parseInt(date.month() + 1) + "-" + date.year();
    let exportType = exportFromJSON.types.xls;

    exportFromJSON({ data: modellingValues, fileName, exportType });
  };

  const fileHandler = (event) => {
    let fileObj = event.target.files[0];

    //just pass the fileObj as parameter
    ExcelRenderer(fileObj, (err, resp) => {
      if (err) {
        console.log(err);
      } else {
        let name = fileObj.name;
        setExcelFileName(name.substring(0, name.length - 5));
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

  const handleInputFieldTypeChange = (event) => {
    setInputFieldType(event.target.value);
  };

  const handleDateTypeChange = (event) => {
    setDateType(event.target.value);
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
    } else if (serviceId === 2) {
      return <div>{RenderProfileFields()}</div>;
    } else if (serviceId === 3) {
      return <div>{RenderMeasurementFields()}</div>;
    } else if (serviceId === 4) {
      return <div>{renderFractionalMeasurementFields()}</div>;
    } else if (serviceId === 5) {
      return <div>{renderLoadOrTopologyFields()}</div>;
    } else if (serviceId === 6) {
      return <div>{renderFiveMinutesMeasurementFields()}</div>;
    } else if (serviceId === 7) {
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

  function RenderProfileFields() {
    var sortedDataSourceKeys = [];
    sortedDataSourceKeys = dataSourceKeys.filter(
      (item) =>
        item.includes("participantes") || item.includes("parcelasDeAtivos")
    );

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

  function RenderMeasurementFields() {
    var sortedDataSourceKeys = [];

    sortedDataSourceKeys = dataSourceKeys.filter((item) =>
      item.includes("perfis")
    );

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
    sortedDataSourceKeys = dataSourceKeys.filter(
      (item) => item.includes("perfis") || item.includes("modelagens")
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
        <FormControl>
          <FormLabel id="demo-radio-buttons-group-label-x">
            Tipo de entrada
          </FormLabel>
          <RadioGroup
            row
            aria-labelledby="participant-radio-buttons-group-label"
            defaultValue="Automático"
            name="participant-radio-buttons-group"
            value={inputFieldType}
            onChange={handleInputFieldTypeChange}
          >
            <FormControlLabel
              value="Simples"
              control={<Radio />}
              label="Simples"
            />
            <FormControlLabel
              value="Múltipla"
              control={<Radio />}
              label="Múltipla"
            />
          </RadioGroup>
        </FormControl>
        {inputFieldType === "Simples" ? (
          <div>
            <TextField
              id="outlined-password-input"
              label="Cód Medidor"
              onChange={(event) => setScdeCode(event.target.value)}
            />
          </div>
        ) : (
          <div>
            <input type="file" onChange={fileHandler.bind(this)} />
          </div>
        )}
      </Stack>
    );
  };

  const renderFiveMinutesMeasurementFields = () => {
    return (
      <Stack spacing={2}>
        <FormControl>
          <FormLabel id="radio-buttons-group-label-x2">Tipo de data</FormLabel>
          <RadioGroup
            row
            aria-labelledby="date-type-radio-buttons-group-label"
            defaultValue="Mês completo"
            name="date-type-radio-buttons-group"
            value={dateType}
            onChange={handleDateTypeChange}
          >
            <FormControlLabel
              value="Data específica"
              control={<Radio />}
              label="Data específica"
            />
            <FormControlLabel
              value="Mês completo"
              control={<Radio />}
              label="Mês completo"
            />
          </RadioGroup>
        </FormControl>
        {dateType === "Mês completo" ? (
          <div>
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
          </div>
        ) : (
          <div>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Data"
                value={date}
                views={["day", "month", "year"]}
                openTo="day"
                maxDate={dayjs()}
                onChange={(newValue) => {
                  setDate(newValue);
                }}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
          </div>
        )}

        <FormControl>
          <FormLabel id="demo-radio-buttons-group-label-x">
            Tipo de entrada
          </FormLabel>
          <RadioGroup
            row
            aria-labelledby="participant-radio-buttons-group-label"
            defaultValue="Automático"
            name="participant-radio-buttons-group"
            value={inputFieldType}
            onChange={handleInputFieldTypeChange}
          >
            <FormControlLabel
              value="Simples"
              control={<Radio />}
              label="Simples"
            />
            <FormControlLabel
              value="Múltipla"
              control={<Radio />}
              label="Múltipla"
            />
          </RadioGroup>
        </FormControl>
        {inputFieldType === "Simples" ? (
          <div>
            <TextField
              id="outlined-password-input"
              label="Cód Medidor"
              onChange={(event) => setScdeCode(event.target.value)}
            />
          </div>
        ) : (
          <div>
            <input type="file" onChange={fileHandler.bind(this)} />
          </div>
        )}
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

      {genericFaultyRequests.length > 0 ? (
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
