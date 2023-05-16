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
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
//import { makeStyles } from "@mui/material/styles";
import styles from "./styles.module.css";
import { cadastrosService } from "../../services/cadastrosService.ts";
import { ativosService } from "../../services/ativosService.ts";
import { workers } from "../../webWorkers/workers.js";
import WebWorker from "../../webWorkers/workerSetup";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../database/db";
import { setWeekYearWithOptions } from "date-fns/fp";

export default function DataSyncView(): React$Element<*> {
  const [authData, setAuthData] = useState([]);
  const [dataSourceKeys, setDataSourceKeys] = useState([]);
  const [retryKeys, setRetryKeys] = useState([]);
  const [parameter, setParameter] = useState("");
  const [searchMethod, setSearchMethod] = useState("Automático");
  const [selectedDataSource, setSelectedDataSource] = useState("");
  const [dataSourceItems, setDataSourceItems] = useState([]);
  const [service, setService] = useState("");
  const [category, setCategory] = useState("");
  const [pendingRequests, setPendingRequests] = useState(0);
  const [progress, setProgress] = useState(0);
  const [openSuccesDialog, setSuccesDialogOpen] = useState(false);
  const [openWarningDialog, setWarningDialogOpen] = useState(false);
  const [warningText, setWarningText] = useState("");
  const [date, setDate] = useState(dayjs());
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const timerRef = useRef(null);

  const servicos = [
    { id: 1, name: "Listar participantes de mercado" },
    { id: 2, name: "Listar perfis" },
    { id: 3, name: "Listar ativos de medição" },
    { id: 4, name: "Listar parcelas de ativos" },
    { id: 5, name: "Listar parcelas de carga" },
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

    setSuccesDialogOpen(false);
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
    } else {
      var selectedResource = ativosMedicao.filter(
        (x) => x.key === selectedDataSourceKey
      );
      console.log(selectedResource.length);
      setDataSourceItems(selectedResource);
    }
  };

  const handleParameterChange = (event) => {
    setParameter(event.target.value);
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

    if (totalPages === null) {
      setWarningText(
        "Não foram retornados agentes para os parâmetros informados"
      );
      setPendingRequests(pendingRequests - 1);
      setWarningDialogOpen(true);
      return;
    }

    console.log(totalPages);
    const categoryName = classes.find((x) => x.id === category).name;
    const key =
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

    listarParticipantes(key, totalPages, date, category);
  };

  async function listarParticipantes(
    key,
    totalPages,
    date,
    category,
    fromRetryList = false
  ) {
    try {
      const initialPage = fromRetryList ? totalPages - 1 : 1;
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

          Array.prototype.forEach.call(
            participantes,
            async (item, index, array) => {
              const cnpj =
                item["bov2:parte"]["bov2:pessoaJuridica"][
                  "bov2:identificacoes"
                ] !== undefined
                  ? item["bov2:parte"]["bov2:pessoaJuridica"][
                      "bov2:identificacoes"
                    ]["bov2:identificacao"]["bov2:numero"]._text.toString()
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
              const situacao =
                item["bov2:situacao"]["bov2:descricao"]._text.toString();

              await addParticipante(
                key,
                cnpj,
                nomeEmpresarial,
                situacao,
                sigla,
                codigo,
                periodoVigencia
              );
            }
          );
        } else {
          if (responseData.code !== 500) {
            if (!fromRetryList) {
              addParticipantsPageToRetryList(
                key,
                responseData.data,
                responseData.code,
                0,
                "listarParticipantes"
              );
            }
          } else {
            if (fromRetryList) {
              removeParticipantsPageFromRetryList(key, currentPage);
            }
          }
        }

        itemsProcessed++;
        var amountDone = (currentPage / totalPages) * 100;
        setProgress(amountDone);
        console.log(currentPage);
        if (currentPage === totalPages) {
          setPendingRequests(pendingRequests - 1);
          setProgress(0);
          setSuccesDialogOpen(true);
        }
      }
    } catch (e) {
      console.log("Erro ao listar participantes");
      console.error(e);
    }
  }

  async function addParticipante(
    key,
    cnpj,
    nomeEmpresarial,
    situacao,
    sigla,
    codigo,
    periodoVigencia
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
      });
    } catch (error) {
      console.log(`Failed to add ${nomeEmpresarial}: ${error}`);
    }
  }

  async function addParticipantsPageToRetryList(
    key,
    page,
    errorCode,
    attempts,
    serviceFailed
  ) {
    try {
      const retryKey = "retry_" + key;
      const retryParticipant = {
        page,
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

  const sendRequest_ListarPerfis = async () => {
    const key = selectedDataSource.replace("participantes", "perfis");
    console.log(key);

    db.perfis
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

    if (dataSourceItems === null) {
      setPendingRequests(pendingRequests - 1);
      return;
    }

    console.log("Total: " + dataSourceItems.length);
    var codAgentes = dataSourceItems.map((x) => x.codigo);
    listarPerfis(key, codAgentes);
  };

  async function listarPerfis(key, sourceItems, fromRetryList = false) {
    try {
      var itemsProcessed = 0;
      setPendingRequests(pendingRequests + 1);

      const requestsQuantity = sourceItems.length;

      const chunckSize = sourceItems.length >= 100 ? 100 : sourceItems.length;
      const sourceItemsChunks = new Array(
        Math.ceil(sourceItems.length / chunckSize)
      )
        .fill()
        .map((_) => {
          return sourceItems.splice(0, chunckSize);
        });

      sourceItemsChunks.forEach(async (chunckItems) => {
        for (const codAgente of chunckItems) {
          var responseData = await cadastrosService.listarPerfis(
            authData,
            codAgente
          );
          itemsProcessed++;

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
              removeProfileFromRetryList(key, codAgente);
            }
          } else {
            if (responseData.code !== 500) {
              if (!fromRetryList) {
                addParticipanteToRetryList(
                  key,
                  codAgente,
                  responseData.code,
                  0,
                  "listarPerfis"
                );
              }
            } else {
              if (fromRetryList) {
                removeProfileFromRetryList(key, codAgente);
              }
            }
          }
          console.log(itemsProcessed);
          var amountDone = (itemsProcessed / requestsQuantity) * 100;
          setProgress(amountDone);
          if (requestsQuantity > 0 && itemsProcessed === requestsQuantity) {
            console.log("Arr: " + requestsQuantity);
            setPendingRequests(pendingRequests - 1);
            setProgress(0);
            setSuccesDialogOpen(true);
          }
        }
      });
    } catch (e) {
      console.log("Erro ao listar perfis");
      console.error(e);
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

  async function addParticipanteToRetryList(
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

    db.ativosMedicao
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

    if (dataSourceItems === null) {
      setPendingRequests(pendingRequests - 1);
      return;
    }

    console.log("Total: " + dataSourceItems.length);
    var codPerfis = dataSourceItems.map((x) => x.codPerfil);
    listarAtivos(key, codPerfis);
  };

  async function listarAtivos(key, sourceItems, fromRetryList = false) {
    try {
      var itemsProcessed = 0;
      setPendingRequests(pendingRequests + 1);

      const requestsQuantity = sourceItems.length;

      const chunckSize = sourceItems.length >= 100 ? 100 : sourceItems.length;
      const sourceItemsChunks = new Array(
        Math.ceil(sourceItems.length / chunckSize)
      )
        .fill()
        .map((_) => {
          return sourceItems.splice(0, chunckSize);
        });

      sourceItemsChunks.forEach(async (chunckItems) => {
        for (const codPerfil of chunckItems) {
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
                  removeResourceFromRetryList(key, codPerfil);
                }
              } else {
                if (responseDataPaginated.code !== 500) {
                  if (!fromRetryList) {
                    addPerfilToRetryList(
                      key,
                      codPerfil,
                      responseDataPaginated.code,
                      0,
                      "listarAtivosDeMedicao"
                    );
                  }
                } else {
                  if (fromRetryList) {
                    removeResourceFromRetryList(key, codPerfil);
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
                removeResourceFromRetryList(key, codPerfil);
              }
            } else {
              if (responseData.code !== 500) {
                if (!fromRetryList) {
                  addPerfilToRetryList(
                    key,
                    codPerfil,
                    responseData.code,
                    0,
                    "listarAtivosDeMedicao"
                  );
                }
              } else {
                if (fromRetryList) {
                  removeResourceFromRetryList(key, codPerfil);
                }
              }
            }
          }

          console.log(itemsProcessed);
          var amountDone = (itemsProcessed / requestsQuantity) * 100;
          setProgress(amountDone);
          if (requestsQuantity > 0 && itemsProcessed === requestsQuantity) {
            console.log("Arr: " + requestsQuantity);
            setPendingRequests(pendingRequests - 1);
            setProgress(0);
            setSuccesDialogOpen(true);
          }
        }
      });
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

  async function addPerfilToRetryList(
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

  const retryFaultyRequests = async () => {
    if (retryKeys.length === 0) return;

    retryKeys.forEach((key) => {
      let retryData = JSON.parse(localStorage.getItem(key));

      if (key.includes("participantes")) {
        setPendingRequests(pendingRequests + 1);
        const pages = retryData.map((x) => x.page);
        const searchDate = retryData.map((x) => x.date)[0];
        const searchCategory = retryData.map((x) => x.category)[0];
        listarParticipantes(
          key.substring(6),
          pages,
          searchDate,
          searchCategory,
          true
        );
      } else if (key.includes("perfis")) {
        const codAgentes = retryData.map((x) => x.codAgente);
        listarPerfis(key.substring(6), codAgentes, true);
      } else if (key.includes("ativos")) {
        const codPerfis = retryData.map((x) => x.codPerfil);
        listarAtivos(key.substring(6), codPerfis, true);
      } else {
        return;
      }
    });
  };

  const removeProfileFromRetryList = (key, codAgente) => {
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

  const removeResourceFromRetryList = (key, codPerfil) => {
    const retryKey = "retry_" + key;
    let retryData = JSON.parse(localStorage.getItem(retryKey));
    console.log("removeResourceFromRetryList");

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

  const sendRequest_ListarParcelasDeAtivo = async () => {
    const key =
      "buscaCustommizada_parcelasDeAtivos_" + dayjs(date).format("DD/MM/YY");
    console.log(key);

    var codMedidores = rows.map((x) => x[0]);
    listarParcelasDeAtivos(key, codMedidores);
  };

  async function listarParcelasDeAtivos(
    key,
    sourceItems,
    fromRetryList = false
  ) {
    try {
      var itemsProcessed = 0;
      setPendingRequests(pendingRequests + 1);

      const requestsQuantity = sourceItems.length;

      const chunckSize = sourceItems.length >= 100 ? 100 : sourceItems.length;
      const sourceItemsChunks = new Array(
        Math.ceil(sourceItems.length / chunckSize)
      )
        .fill()
        .map((_) => {
          return sourceItems.splice(0, chunckSize);
        });

      sourceItemsChunks.forEach(async (chunckItems) => {
        for (const codMedidor of chunckItems) {
          var responseData =
            await ativosService.listarParcelasDeAtivosDeMedicao(
              authData,
              codMedidor,
              dayjs(date).format("YYYY-MM-DDTHH:mm:ss")
            );

          itemsProcessed++;

          if (responseData.code === 200) {
            var parcelaAtivos = responseData.data;

            if (parcelaAtivos.length === undefined) {
              mapResponseToPartialMeasurementData(
                key,
                codMedidor,
                parcelaAtivos
              );
            } else {
              Array.prototype.forEach.call(parcelaAtivos, async (item) => {
                mapResponseToPartialMeasurementData(key, codMedidor, item);
              });
            }
          }

          var amountDone = (itemsProcessed / requestsQuantity) * 100;
          setProgress(amountDone);
          if (requestsQuantity > 0 && itemsProcessed === requestsQuantity) {
            console.log("Arr: " + requestsQuantity);
            setPendingRequests(pendingRequests - 1);
            setProgress(0);
            setSuccesDialogOpen(true);
          }
        }
      });
    } catch (e) {
      console.log("Erro ao listar parcelas de ativos");
      console.error(e);
    }
  }

  async function mapResponseToPartialMeasurementData(key, codMedidor, item) {
    const codParcelaAtivo = item["bov2:codigo"]._text.toString();
    const nome = item["bov2:nome"]._text.toString();
    const codPerfil =
      item["bov2:participanteMercado"]["bov2:perfis"]["bov2:perfil"][
        "bov2:codigo"
      ]._text.toString();
    const idSubmercado = item["bov2:submercado"]["bov2:id"]._text.toString();
    const cnpj = item["bov2:identificacao"]["bov2:numero"]._text.toString();
    const situacao = item["bov2:status"]["bov2:descricao"]._text.toString();
    const vigencia = item["bov2:vigencia"]["bov2:inicio"]._text.toString();
    var periodoVigencia = dayjs(vigencia).format("DD/MM/YYYY");

    await addParcelaDeAtivo(
      key,
      codParcelaAtivo,
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

  const sendRequest_ListarParcelasDeCarga = async () => {};

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
        sendRequest_ListarParcelasDeAtivo();
        break;
      default:
        sendRequest_ListarParticipantes();
        break;
    }

    //fetchWebWorker();
  };

  const chooseFieldsToRender = () => {
    const serviceId = parseInt(service);

    if (serviceId === 1) {
      return <div>{renderParticipantsFields()}</div>;
    } else if (serviceId === 2 || serviceId === 3) {
      return <div>{RenderProfileOrMeasurementFields(serviceId)}</div>;
    } else if (serviceId === 4) {
      return <div>{renderFractionalMeasurementFields()}</div>;
    } else {
      return <div>{renderLoadFields()}</div>;
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
  }

  const renderFractionalMeasurementFields = () => {
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
                id="data-source-simple-select"
                value={parameter}
                label="Parâmetro de entrada"
                onChange={handleParameterChange}
              >
                {parameters.map((x) => (
                  <MenuItem value={x.id}>{x.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <input type="file" onChange={fileHandler.bind(this)} />
          </Stack>
        ) : (
          <Stack spacing={2}>
            <FormControl>
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
          </Stack>
        )}
      </div>
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
          <FormLabel id="demo-radio-buttons-group-label">
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
              value="Manual"
              control={<Radio />}
              label="Manual"
            />
          </RadioGroup>
        </FormControl>
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

      {retryKeys.length > 0 ? (
        <div>
          <Button
            variant="outlined"
            onClick={retryFaultyRequests}
            sx={{ marginTop: 7 }}
          >
            Reenviar dados faltantes
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
            id="modal-modal-title"
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
      <Snackbar
        open={openSuccesDialog}
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
