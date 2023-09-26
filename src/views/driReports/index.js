import React, { useEffect, useState, useRef } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Autocomplete from "@mui/material/Autocomplete";
import { DataGrid } from "@mui/x-data-grid";
import CircularProgress from "@mui/material/CircularProgress";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { OutTable, ExcelRenderer } from "react-excel-renderer";
import exportFromJSON from "export-from-json";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import ListItemText from "@mui/material/ListItemText";
import OutlinedInput from "@mui/material/OutlinedInput";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import FormGroup from "@mui/material/FormGroup";
import Switch from "@mui/material/Switch";
import Paper from "@mui/material/Paper";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  PDFDownloadLink,
  pdf,
} from "@react-pdf/renderer";
import { driService } from "../../services/driService.ts";
import { cadastrosService } from "../../services/cadastrosService.ts";
import { db } from "../../database/db";
import { saveAs } from "file-saver";
import styles from "./styles.module.css";
import { constants } from "buffer";

export default function DriReportsView() {
  const [authData, setAuthData] = useState([]);
  const [date, setDate] = useState(dayjs());
  const [selectedAccountingEventCode, setSelectedAccountingEventCode] =
    useState("");
  const [selectedAccountingEventName, setSelectedAccountingEventName] =
    useState("");
  const [selectedReport, setSelectedReport] = useState("");
  const [participantCode, setParticipantCode] = useState("");
  const [accountingEvents, setAccountingEvents] = useState([]);
  const [reports, setReports] = useState([]);
  const [boards, setBoards] = useState([]);
  const [filteredBoards, setFilteredBoards] = useState([]);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [inputId, setInputId] = useState(1);
  const [uploadFileRows, setUploadFileRows] = useState([]);
  const [uploadFileColumns, setUploadFileColumns] = useState([]);
  const [selectedFileFormat, setSelectedFileFormat] = useState("csv");
  const [openDialog, setDialogOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [selectedBoardIds, setSelectedBoardIds] = useState([]);
  const [selectedBoardName, setSelectedBoarName] = useState([]);
  const [queryKeys, setQueryKeys] = useState([]);
  const [queryResultHeaders, setQueryResultHeaders] = useState([]);
  const [queryResultRows, setQueryResultRows] = useState([]);
  const [pdfSwitchChecked, setPdfSwitchChecked] = useState(false);
  const [allBoardsChecked, setAllBoardsChecked] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [participantsQueryCodes, setParticipantsQueryCodes] = useState([]);
  const [selectedReportParticipant, setSelectedReportParticipant] =
    useState("");
  const [selectedReportProfile, setSelectedReportProfile] = useState("");
  const [representedAgentsIds, setRepresentedAgentsIds] = useState([]);
  const [listAcronymChecked, setListAcronymChecked] = useState(false);
  const [acronomiesInfos, setAcronomiesInfos] = useState([]);
  const [loadingText, setLoadingText] = useState("");
  const [progress, setProgress] = useState(0);

  const dataGridEnd = useRef(null);

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

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

  // Create PDF styles
  const pdfStyles = StyleSheet.create({
    page: {
      backgroundColor: "white",
    },
    section: {
      margin: 5,
      padding: 5,
    },
    viewer: {
      width: "95%",
      height: window.innerHeight,
      marginTop: 15,
    },
    rowContainer: { display: "flex", flexDirection: "row" },
    blueLine: {
      backgroundColor: "#3399FF",
      width: 250,
      height: 2,
      marginTop: 2,
      marginBottom: 7,
    },
    reportTitleText: { fontSize: 17 },
    headerText: { fontSize: 12 },
    boardTitleText: { fontSize: 15 },
    biDimensionalCellText: { fontSize: 8, textAlign: "center" },
  });

  const inputTypes = [
    { id: 1, name: "Simples" },
    { id: 2, name: "Múltipla" },
    { id: 3, name: "Representados" },
  ];

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("authData"));
    if (data) {
      setAuthData(data);
    }

    async function fetchData() {
      var participantes = await db.participantes;
      if (participantes === undefined) {
        participantes = [];
      } else {
        participantes = await db.participantes.toArray();
      }

      setParticipants(participantes);
    }

    fetchData();
  }, []);

  const getAccountingEvents = async () => {
    setProgress(25);
    setLoadingText("Buscando eventos");
    setLoadingModalOpen(true);

    setAccountingEvents([]);
    setBoards([]);
    setSelectedAccountingEventCode("");
    setSelectedReport("");
    setRows([]);
    setColumns([]);
    setRequestSent(false);

    var responseData = await driService.listarDivulgacaoDeEventoContabil(
      authData,
      dayjs(date).format("YYYY").toString() +
        "-" +
        dayjs(date).format("MM").toString()
    );

    var totalPaginas = responseData.totalPaginas;
    var totalPaginasNumber = totalPaginas._text
      ? parseInt(totalPaginas._text.toString())
      : 0;

    var eventosContabeis = [];

    if (totalPaginasNumber > 1) {
      for (
        let paginaCorrente = 1;
        paginaCorrente <= totalPaginasNumber;
        paginaCorrente++
      ) {
        var responseDataPaginated =
          await driService.listarDivulgacaoDeEventoContabil(
            authData,
            dayjs(date).format("YYYY").toString() +
              "-" +
              dayjs(date).format("MM").toString(),
            paginaCorrente
          );

        if (responseDataPaginated.code === 200) {
          eventosContabeis = responseDataPaginated.data;

          if (eventosContabeis.length === undefined) {
            mapResponseToAccountingEvent(eventosContabeis);
          } else {
            for (const item of eventosContabeis) {
              mapResponseToAccountingEvent(item);
            }
          }
        }
      }
    } else {
      if (responseData.code === 200) {
        eventosContabeis = responseData.data;

        if (eventosContabeis.length === undefined) {
          mapResponseToAccountingEvent(eventosContabeis);
        } else {
          for (const item of eventosContabeis) {
            mapResponseToAccountingEvent(item);
          }
        }
      }
    }

    setProgress(100);
    handleLoadingModalClose();
  };

  const getReports = async (eventCode) => {
    setProgress(25);
    setLoadingText("Buscando relatórios");
    setLoadingModalOpen(true);
    var responseData = await driService.listarRelatoriosMapeados(
      authData,
      eventCode
    );

    var totalPaginas = responseData.totalPaginas;
    var totalPaginasNumber = totalPaginas._text
      ? parseInt(totalPaginas._text.toString())
      : 0;

    var relatorios = [];

    if (totalPaginasNumber > 1) {
      for (
        let paginaCorrente = 1;
        paginaCorrente <= totalPaginasNumber;
        paginaCorrente++
      ) {
        var responseDataPaginated = await driService.listarRelatoriosMapeados(
          authData,
          eventCode,
          paginaCorrente
        );

        if (responseDataPaginated.code === 200) {
          relatorios = responseDataPaginated.data;

          if (relatorios.length === undefined) {
            mapResponseToReport(relatorios);
          } else {
            for (const item of relatorios) {
              mapResponseToReport(item);
            }
          }
        }
      }
    } else {
      if (responseData.code === 200) {
        relatorios = responseData.data;

        if (relatorios.length === undefined) {
          mapResponseToReport(relatorios);
        } else {
          for (const item of relatorios) {
            mapResponseToReport(item);
          }
        }
      }
    }

    setProgress(100);
    handleLoadingModalClose();
  };

  const listarAcronimos = async () => {
    setProgress(25);
    setLoadingText("Buscando acrônimos");
    setLoadingModalOpen(true);
    var responseData = await driService.listarAcronimos(authData, 1);
    var totalPaginas = responseData.totalPaginas;
    var totalPaginasNumber = totalPaginas._text
      ? parseInt(totalPaginas._text.toString())
      : 0;

    var acronomiesList = [];
    if (totalPaginasNumber > 1) {
      for (
        let paginaCorrente = 1;
        paginaCorrente <= totalPaginasNumber;
        paginaCorrente++
      ) {
        var responseDataPaginated = await driService.listarAcronimos(
          authData,
          paginaCorrente
        );
        if (responseDataPaginated.code === 200) {
          const results = responseDataPaginated.data;
          var acronomys = await mapResponseToAcronomy(results);
          acronomys.forEach((x) => acronomiesList.push(x));
        }
      }
    } else {
      if (responseData.code === 200) {
        const results = responseData.data;
        var acronomys = await mapResponseToAcronomy(results);
        acronomys.forEach((x) => acronomiesList.push(x));
      }
    }

    setAcronomiesInfos(acronomiesList);
    setProgress(100);
    handleLoadingModalClose();
  };

  const listarRepresentados = async () => {
    setProgress(25);
    setLoadingText("Buscando representados");
    setLoadingModalOpen(true);
    var responseData = await cadastrosService.listarRepresentacao(authData, 1);
    var totalPaginas = responseData.totalPaginas;
    var totalPaginasNumber = totalPaginas._text
      ? parseInt(totalPaginas._text.toString())
      : 0;

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

    setRepresentedAgentsIds(agentCodes);
    setProgress(100);
    handleLoadingModalClose();
  };

  const handleAccountingEventChange = (value) => {
    setReports([]);
    setFilteredBoards([]);

    if (value === null) {
      return;
    }

    var eventCode = value.code;

    setRequestSent(false);
    setSelectedAccountingEventCode(eventCode);
    setSelectedAccountingEventName(value.label);
    getReports(eventCode);
  };

  const handleReportChange = (value) => {
    setRequestSent(false);

    if (value === null) {
      setFilteredBoards([]);
      return;
    }

    setSelectedReport(value);

    var selectedReportId = value.reportId;
    var availableBoards = boards.filter((x) => x.reportId === selectedReportId);
    setFilteredBoards(availableBoards);
  };

  const handleAllBoardsSwitchChange = () => {
    if (!allBoardsChecked) {
      var boardsCodes = filteredBoards.map((x) => x.boardId);
      setSelectedBoardIds(boardsCodes);
    }

    setAllBoardsChecked(!allBoardsChecked);
  };

  const handleListAcronymChange = () => {
    if (
      !listAcronymChecked &&
      acronomiesInfos !== undefined &&
      acronomiesInfos.length === 0
    ) {
      listarAcronimos();
    }

    setListAcronymChecked(!listAcronymChecked);
  };

  const handleMultiSelectBoardChange = (event) => {
    const {
      target: { value },
    } = event;

    setSelectedBoardIds(typeof value === "string" ? value.split(",") : value);
  };

  const handleInputTypeChange = (event) => {
    var actionId = parseInt(event.target.value);
    setInputId(actionId);

    if (
      actionId === 3 &&
      representedAgentsIds !== undefined &&
      representedAgentsIds.length === 0
    ) {
      listarRepresentados();
    }
  };

  const fileHandler = (event) => {
    let fileObj = event.target.files[0];

    //just pass the fileObj as parameter
    ExcelRenderer(fileObj, (err, resp) => {
      if (err) {
        console.log(err);
      } else {
        setUploadFileColumns(resp.cols);
        setUploadFileRows(resp.rows);
      }
    });
  };

  var qte = 0;

  const getMultipleResults = async (codes, boardId) => {
    var participantsCodes = [];
    var rowData = [];
    var columnData = [];
    var rowsValues = [];
    var idx = 1;

    setProgress(0);
    setLoadingText("Buscando resultados");
    setLoadingModalOpen(true);

    getIndividualResults(codes, boardId).then((res) => {
      if (res !== undefined && res.length > 0) {
        res.forEach((resValue, resIdx) => {
          if (
            (resValue !== undefined && resValue.rows !== undefined) ||
            (Array.isArray(resValue) && resValue.length > 0)
          ) {
            columnData = resValue.columns;
            rowsValues = resValue.rows;

            if (rowsValues !== undefined && rowsValues.length > 0) {
              if (rowsValues[0] !== undefined) {
                participantsCodes.push(rowsValues[0].col0);
                setParticipantsQueryCodes(participantsCodes);
              }

              for (var r of rowsValues) {
                r.id = idx;
                rowData.push(r);
                idx++;
              }
            }
          }

          if (resIdx === codes.length - 1) {
            if (rowData !== undefined && rowData.length > 0) {
              addReportData(rowData, columnData, boardId);
            }
          }
        });
      }

      qte++;
      console.log(qte);

      var requestsQuantity = selectedBoardIds.length;
      var amountDone = (qte / requestsQuantity) * 100;
      setProgress(amountDone);

      if (qte === selectedBoardIds.length) {
        setRequestSent(true);
        handleLoadingModalClose();
        scrollToBottom();
        qte = 0;
      }
    });
  };

  const getIndividualResults = async (codes, boardId) => {
    const requests = codes.map((code) => {
      return getResults(code, boardId).then((res) => {
        return res;
      });
    });

    return Promise.all(requests);
  };

  const sendRequest = async () => {
    setRows([]);
    setColumns([]);
    setQueryKeys([]);
    setQueryResultHeaders([]);
    setQueryResultRows([]);

    if (
      selectedAccountingEventCode === "" ||
      selectedBoardIds.length === 0 ||
      (participantCode === "" &&
        uploadFileRows.length === 0 &&
        representedAgentsIds.length === 0)
    ) {
      return;
    }

    if (inputId === 1) {
      setLoadingText("Buscando resultados");
      setLoadingModalOpen(true);
    }

    for (const boardId of selectedBoardIds) {
      var tableData,
        columnData,
        rowData = [];

      if (inputId === 1) {
        tableData = await getResults(participantCode, boardId);
        if (tableData !== undefined) {
          columnData = tableData.columns;
          rowData = tableData.rows;
          setParticipantsQueryCodes([participantCode]);

          if (rowData !== undefined && rowData.length > 0) {
            addReportData(rowData, columnData, boardId);
          }
        }
      } else if (inputId === 2) {
        var codes = uploadFileRows.map((x) => x[0]);
        getMultipleResults(codes, boardId);
      } else {
        getMultipleResults(representedAgentsIds, boardId);
      }
    }

    if (inputId === 1) {
      setRequestSent(true);
      handleLoadingModalClose();
      scrollToBottom();
    }
  };

  const getResults = async (agentCode, boardId) => {
    var responseData = await driService.listarResultadoDeRelatorio(
      authData,
      selectedAccountingEventCode,
      boardId,
      selectedReport.reportId,
      agentCode
    );

    if (responseData.code === 200) {
      const results = responseData.data;
      var tableData = await mapResponseToTableData(results, agentCode);
      return tableData;
    } else {
      return [];
    }
  };

  function addReportData(rowData, columnData, boardId) {
    var resultRowsArrClone = queryResultRows;
    resultRowsArrClone.push(rowData);
    setQueryResultRows(resultRowsArrClone);

    if (columnData !== undefined) {
      var resultHeaderArrClone = queryResultHeaders;
      resultHeaderArrClone.push(columnData);
      setQueryResultHeaders(resultHeaderArrClone);
    }

    var queryParams = {
      eventDate:
        dayjs(date).format("YYYY").toString() +
        "/" +
        dayjs(date).format("MM").toString(),
      eventName: selectedAccountingEventName,
      reportName: selectedReport.label,
      boardName: boards.find((x) => x.boardId === boardId).label,
    };
    var queryKeysArrClone = queryKeys;
    queryKeysArrClone.push(queryParams);
    setQueryKeys(queryKeysArrClone);
  }

  async function mapResponseToAcronomy(acronomy) {
    var acsDatas = [];

    for (var ac of acronomy) {
      const nome = ac["bov2:nome"]._text.toString();
      const descricao = ac["bov2:descricao"]._text.toString();
      const tipo = ac["bov2:tipo"]["bov2:descricao"]._text.toString();
      var acronomyData = { nome, descricao, tipo };
      acsDatas.push(acronomyData);
    }
    return acsDatas;
  }

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

  async function mapResponseToAccountingEvent(item) {
    const eventoContabil = item["bov2:eventoContabil"];
    const codigo = eventoContabil["bov2:codigo"]._text.toString();
    const nome = eventoContabil["bov2:nome"]._text.toString();

    var retrievedEvent = { code: codigo, label: nome };
    var eventsClone = accountingEvents;

    if (!accountingEvents.some((x) => x.code === codigo)) {
      eventsClone.push(retrievedEvent);
    }

    setAccountingEvents(eventsClone);
  }

  async function mapResponseToReport(item) {
    const reportId = item["bov2:id"]._text.toString();
    const reportName = item["bov2:nome"]._text.toString();
    const boards = item["bov2:quadros"]["bov2:quadro"];

    var retrievedReport = {
      reportId,
      label: reportName,
    };

    var reportsClone = reports;

    if (!reports.some((x) => x.reportId === reportId)) {
      reportsClone.push(retrievedReport);
    }

    setReports(reportsClone);

    if (boards.length === undefined) {
      mapResponseToBoard(boards, reportId, reportName);
    } else {
      for (var bd of boards) {
        mapResponseToBoard(bd, reportId, reportName);
      }
    }
  }

  async function mapResponseToBoard(item, reportId, reportName) {
    const boardId = item["bov2:id"]._text.toString();
    const boardName = item["bov2:nome"]._text.toString();
    const label = reportName + " | " + boardName;

    var retrievedBoard = {
      reportId,
      boardId,
      label,
    };
    var boardsClone = boards;

    if (!boards.some((x) => x.boardId === boardId)) {
      var count = boards.filter((x) => x.label === label).length;
      if (count > 0) {
        var repeatedTimes = count + 1;
        retrievedBoard.label = retrievedBoard.label + "(" + repeatedTimes + ")";
      }

      boardsClone.push(retrievedBoard);
    }

    setBoards(boardsClone);
  }

  async function mapResponseToTableData(item, agentCode) {
    const cabecalho = item["bov2:cabecalho"]._text.toString();
    const cabecalhoArr = cabecalho.split("','");
    const valores =
      item["bov2:valores"] !== undefined
        ? item["bov2:valores"]["bov2:valor"]
        : null;
    var rowsArr = [];
    var headerFields = [];
    var rowData = {};

    if (valores === null) {
      return;
    }

    const initalColumn = {
      field: "col0",
      headerName: "CÓDIGO DE AGENTE",
      minWidth: 200,
    };
    headerFields.push(initalColumn);

    var colIdx = 1;
    for (var headerField of cabecalhoArr) {
      const columnAttributes = {
        field: "col" + colIdx,
        headerName: headerField.replace(/'/g, ""),
        minWidth: 200,
      };
      headerFields.push(columnAttributes);
      colIdx++;
    }

    if (valores.length !== undefined) {
      var rowIdx = 1;
      for (var v of valores) {
        rowData = {};
        const valor = v._text.toString();
        var valorArr = valor.split("','");
        rowData["id"] = rowIdx;

        valorArr.unshift(agentCode);

        for (let i = 0; i < valorArr.length; i++) {
          const element = valorArr[i];

          rowData[headerFields[i].field] =
            i === 0 ? element : element.replace(/'/g, "").replace(/\./g, ",");
        }

        if (rowsArr.length === 0) {
          rowsArr = [rowData];
        } else {
          rowsArr.push(rowData);
        }
        rowIdx++;
      }
    } else {
      const valor = valores._text.toString();
      const valorArr = valor.split("','");
      rowData["id"] = 1;

      valorArr.unshift(agentCode);

      for (let i = 0; i < valorArr.length; i++) {
        const element = valorArr[i];
        rowData[headerFields[i].field] =
          i === 0 ? element : element.replace(/'/g, "").replace(/\./g, ",");
      }

      if (rowsArr.length === 0) {
        rowsArr = [rowData];
      } else {
        rowsArr.push(rowData);
      }
    }

    return { columns: headerFields, rows: rowsArr };
  }

  const handleChipClick = (idx, label) => {
    setLoadingText("Carregando quadros");
    setLoadingModalOpen(true);
    var headerToDisplay = queryResultHeaders[idx];
    var rowsToDisplay = queryResultRows[idx];

    setColumns(headerToDisplay);
    setRows(rowsToDisplay);
    setSelectedBoarName(label);
    handleLoadingModalClose();
  };

  const handleLoadingModalClose = (event, reason) => {
    if (reason === "backdropClick") {
      return;
    }
    setLoadingModalOpen(false);
  };

  const handleCancelDialog = () => {
    handleCloseDialog();
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleFileFormatChange = (event) => {
    setSelectedFileFormat(event.target.value);
  };

  const getExportData = () => {
    const correctedRows = [];
    rows.forEach((val) => correctedRows.push(Object.assign({}, val)));

    for (const rowData of correctedRows) {
      for (const col of columns) {
        rowData[col.headerName] = rowData[col.field];
        delete rowData[col.field];
        delete rowData["id"];
      }
    }

    return correctedRows;
  };

  const handleConfirmDialog = () => {
    setLoadingText("Exportando quadro");
    setLoadingModalOpen(true);

    var boardLabel = selectedBoardName.replace(" | ", "_");
    var fileName = selectedAccountingEventName + "_" + boardLabel;
    let exportType = "";

    if (selectedFileFormat === "csv") {
      exportType = exportFromJSON.types.csv;
    } else if (selectedFileFormat === "xls") {
      exportType = exportFromJSON.types.xls;
    } else {
      exportType = exportFromJSON.types.json;
    }

    exportFromJSON({ data: getExportData(), fileName, exportType });
    handleCloseDialog();
    handleLoadingModalClose();
  };

  const scrollToBottom = () => {
    dataGridEnd.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleReportParticipantChange = (event) => {
    const selectedParticipant = event.target.value;
    setSelectedReportParticipant(selectedParticipant);
  };

  const handleReportProfileChange = (event) => {
    const selectedProfile = event.target.value;
    setSelectedReportProfile(selectedProfile);
  };

  const savePDFs = () => {
    setLoadingText("Salvando PDFs");
    setLoadingModalOpen(true);

    for (var code of participantsQueryCodes) {
      var retrievedParticipant = participants.find(
        (x) => x.codigo === code.toString()
      );
      var profileMatches = [];

      if (profileMatches.length > 0) {
        profileMatches = getRetrievedProfiles().filter(
          (x) =>
            x.agentCode.toString() === retrievedParticipant.codigo.toString()
        );
        profileMatches = [...new Set(profileMatches)];
      }

      if (profileMatches.length === 0) {
        savePdfToFile(retrievedParticipant, retrievedParticipant.sigla);
      } else {
        for (var pf of profileMatches) {
          savePdfToFile(retrievedParticipant, pf.name);
        }
      }
    }
    handleLoadingModalClose();
  };

  const savePdfToFile = async (currentParticipant, profileName) => {
    var selectedQueryKey = queryKeys[0];
    const fileName = profileName + "_" + selectedQueryKey.eventName;

    const blob = await pdf(
      <PdfDocument
        eventData={selectedQueryKey}
        agentData={currentParticipant}
        profileName={profileName}
      />
    ).toBlob();
    saveAs(blob, fileName);
  };

  const handleShowAsPdfSwitchChange = () => {
    setPdfSwitchChecked(!pdfSwitchChecked);
  };

  function RenderReport() {
    var selectedQueryKey = queryKeys[0];

    return (
      <PDFViewer style={pdfStyles.viewer}>
        <PdfDocument
          eventData={selectedQueryKey}
          agentData={selectedReportParticipant}
          profileName={selectedReportProfile}
        />
      </PDFViewer>
    );
  }

  const PdfDocument = ({ eventData, agentData, profileName }) => (
    <Document>
      <Page size="A4" orientation="landscape" style={pdfStyles.page}>
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.reportTitleText}>{eventData.eventName}</Text>
        </View>
        <View style={pdfStyles.section}>
          <div
            style={{
              borderWidth: 1,
              borderStyle: "solid",
              padding: 5,
              width: 300,
            }}
          >
            <div style={pdfStyles.rowContainer}>
              <Text style={pdfStyles.headerText}>Ano/mês: </Text>
              <Text style={pdfStyles.headerText}>{eventData.eventDate}</Text>
            </div>
            <div style={{ marginTop: 3 }}>
              <div style={pdfStyles.rowContainer}>
                <Text style={pdfStyles.headerText}>Agente: </Text>
                <Text style={pdfStyles.headerText}>{agentData.sigla}</Text>
              </div>
            </div>
            <div style={{ marginTop: 3 }}>
              <div style={pdfStyles.rowContainer}>
                <Text style={pdfStyles.headerText}>Perfil: </Text>
                <Text style={pdfStyles.headerText}>{profileName}</Text>
              </div>
            </div>
          </div>
        </View>
        {queryKeys.map((x) =>
          RenderReportBoard(x, queryKeys.indexOf(x), agentData, profileName)
        )}
      </Page>
    </Document>
  );

  function RenderReportBoard(reportKeys, reportIdx, agentData, profileName) {
    var headerToDisplay = queryResultHeaders[reportIdx];
    var rowsToDisplay = queryResultRows[reportIdx];
    var filteredRowsToDisplay = rowsToDisplay.filter(
      (x) => x.col0.toString() === agentData.codigo.toString()
    );

    if (headerToDisplay[4].headerName.includes("PERFIL")) {
      var filteredRowsToDisplay = filteredRowsToDisplay.filter(
        (x) => x.col4.toString() === profileName.toString()
      );
    }

    if (filteredRowsToDisplay.length === 0) {
      return <div />;
    } else {
      return (
        <div>
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.boardTitleText}>{reportKeys.boardName}</Text>
            <div style={pdfStyles.blueLine} />
            {filteredRowsToDisplay.length > 1
              ? RenderBiDimensionalTableRow(
                  headerToDisplay.slice(2),
                  filteredRowsToDisplay
                )
              : headerToDisplay
                  .slice(2)
                  .map((x) =>
                    RenderUniDimensionalTableRow(x, filteredRowsToDisplay)
                  )}
          </View>
        </div>
      );
    }
  }

  function RenderBiDimensionalTableRow(headerToDisplay, rowsToDisplay) {
    return (
      <div>
        <div style={pdfStyles.rowContainer}>
          {headerToDisplay.map((h) => (
            <div
              style={{
                borderWidth: 1,
                borderStyle: "solid",
                width: h.headerName.length > 13 ? 300 : 200,
                height: 70,
                padding: 2,
                justifyContent: "center",
                alignContent: "center",
                backgroundColor: "#E0E0E0",
              }}
            >
              <Text style={pdfStyles.biDimensionalCellText}>
                {h.headerName}
              </Text>
            </div>
          ))}
        </div>

        {rowsToDisplay.map((rw) => (
          <div style={pdfStyles.rowContainer}>
            {headerToDisplay.map((x) => (
              <div
                style={{
                  borderWidth: 1,
                  borderStyle: "solid",
                  width: x.headerName.length > 13 ? 300 : 200,
                  minHeight: 30,
                  padding: 2,
                  justifyContent: "center",
                  alignContent: "center",
                }}
              >
                <Text style={pdfStyles.biDimensionalCellText}>
                  {rw[x.field]}
                </Text>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  function RenderUniDimensionalTableRow(col, rowsToDisplay) {
    return (
      <div>
        {rowsToDisplay.map((x) => (
          <div style={pdfStyles.rowContainer}>
            <Text
              style={{
                fontSize: 8,
                borderWidth: 1,
                borderStyle: "solid",
                width: 400,
                height: "auto",
                padding: 2,
              }}
            >
              {col.headerName}
            </Text>
            <Text
              style={{
                fontSize: 8,
                borderWidth: 1,
                borderStyle: "solid",
                width: 120,
                padding: 2,
                textAlign: "right",
              }}
            >
              {x[col.field]}
            </Text>
          </div>
        ))}
      </div>
    );
  }

  function getRetrievedProfiles() {
    var idxs = [];
    for (var hd of queryResultHeaders) {
      if (hd[4].headerName.includes("PERFIL")) {
        idxs.push(queryResultHeaders.indexOf(hd));
      }
    }

    var profilesArr = [];
    for (var i of idxs) {
      var results = queryResultRows[i];
      console.log(results);
      var profiles = results.map((x) => ({ name: x.col4, agentCode: x.col0 }));
      if (profilesArr.length === 0) {
        profilesArr = profiles;
      } else {
        profilesArr.concat(profiles);
      }
    }

    return [...new Set(profilesArr)];
  }

  function RenderAcronimiesInPdf() {
    return (
      <PDFViewer style={pdfStyles.viewer}>
        <Document>
          <Page size="A4" style={pdfStyles.page}>
            <View style={pdfStyles.section}>
              <Text style={pdfStyles.reportTitleText}>Acrônimos</Text>
              <div style={{ marginTop: 10 }}>
                {RenderAcronomyBoardHeader()}
                {acronomiesInfos.map((x) => RenderAcronomyBoard(x))}
              </div>
            </View>
          </Page>
        </Document>
      </PDFViewer>
    );
  }

  function RenderAcronomyBoardHeader() {
    return (
      <div style={pdfStyles.rowContainer}>
        <div
          style={{
            borderWidth: 1,
            borderStyle: "solid",
            width: 130,
            minHeight: 20,
            padding: 2,
            justifyContent: "center",
            alignContent: "center",
            backgroundColor: "#E0E0E0",
          }}
        >
          <Text style={pdfStyles.biDimensionalCellText}>Nome</Text>
        </div>
        <div
          style={{
            borderWidth: 1,
            borderStyle: "solid",
            width: 80,
            minHeight: 20,
            padding: 2,
            justifyContent: "center",
            alignContent: "center",
            backgroundColor: "#E0E0E0",
          }}
        >
          <Text style={pdfStyles.biDimensionalCellText}>Tipo</Text>
        </div>
        <div
          style={{
            borderWidth: 1,
            borderStyle: "solid",
            width: 200,
            minHeight: 20,
            padding: 2,
            justifyContent: "center",
            alignContent: "center",
            backgroundColor: "#E0E0E0",
          }}
        >
          <Text style={pdfStyles.biDimensionalCellText}>Descrição</Text>
        </div>
      </div>
    );
  }

  function RenderAcronomyBoard(acronomy) {
    return (
      <div style={pdfStyles.rowContainer}>
        <div
          style={{
            borderWidth: 1,
            borderStyle: "solid",
            width: 130,
            minHeight: 30,
            padding: 2,
            justifyContent: "center",
            alignContent: "center",
          }}
        >
          <Text style={pdfStyles.biDimensionalCellText}>{acronomy.nome}</Text>
        </div>
        <div
          style={{
            borderWidth: 1,
            borderStyle: "solid",
            width: 80,
            minHeight: 30,
            padding: 2,
            justifyContent: "center",
            alignContent: "center",
          }}
        >
          <Text style={pdfStyles.biDimensionalCellText}>{acronomy.tipo}</Text>
        </div>
        <div
          style={{
            borderWidth: 1,
            borderStyle: "solid",
            width: 200,
            minHeight: 30,
            padding: 2,
            justifyContent: "center",
            alignContent: "center",
          }}
        >
          <Text style={pdfStyles.biDimensionalCellText}>
            {acronomy.descricao}
          </Text>
        </div>
      </div>
    );
  }

  function RenderReportByParticipant() {
    var retrievedParticipants = [];

    for (var code of participantsQueryCodes) {
      var retrievedParticipant = participants.find(
        (x) => x.codigo.toString() === code.toString()
      );
      if (retrievedParticipant !== undefined) {
        retrievedParticipants.push(retrievedParticipant);
      }
    }

    var distinctProfiles = [];
    if (selectedReportParticipant !== "") {
      if (getRetrievedProfiles().length === 0) {
        if (retrievedParticipants.length > 1) {
          var allPosibleProfiles = [];
          retrievedParticipants.forEach((x) =>
            allPosibleProfiles.push(x.sigla)
          );
          distinctProfiles = allPosibleProfiles.filter(
            (x) => x === selectedReportParticipant.sigla
          );
        } else {
          distinctProfiles.push(selectedReportParticipant.sigla);
        }
      } else {
        distinctProfiles = getRetrievedProfiles()
          .filter(
            (x) =>
              x.agentCode.toString() ===
              selectedReportParticipant.codigo.toString()
          )
          .map((x) => x.name);
      }
      distinctProfiles = [...new Set(distinctProfiles)];
    }

    return (
      <div>
        <Stack spacing={2}>
          <FormControl sx={{ width: "50%", marginTop: 2 }}>
            <InputLabel id="agent-select-label">Agente</InputLabel>
            <Select
              labelId="agent-select-input-label"
              id="agent-simple-select"
              value={selectedReportParticipant}
              label="Agente"
              input={<OutlinedInput label="Agente" />}
              onChange={handleReportParticipantChange}
            >
              {retrievedParticipants.map((x) => (
                <MenuItem key={x.codigo} value={x}>
                  {x.sigla}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {selectedReportParticipant !== "" ? (
            <FormControl sx={{ width: "50%", marginTop: 2 }}>
              <InputLabel id="agent-select-label">Perfil</InputLabel>
              <Select
                labelId="agent-select-input-label"
                id="agent-simple-select"
                value={selectedReportProfile}
                label="Agente"
                input={<OutlinedInput label="Agente" />}
                onChange={handleReportProfileChange}
              >
                {distinctProfiles.map((x) => (
                  <MenuItem key={x} value={x}>
                    {x}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <div />
          )}
        </Stack>
      </div>
    );
  }

  const chooseFieldsToRender = (actionId) => {
    var option = parseInt(actionId);
    if (option === 1) {
      return (
        <div>
          <TextField
            id="outlined-participant-input"
            label="Cód Agente"
            type="number"
            onChange={(event) => setParticipantCode(event.target.value)}
            sx={{ width: 250 }}
          />
        </div>
      );
    } else if (option === 2) {
      return (
        <div>
          <input type="file" onChange={fileHandler.bind(this)} />
        </div>
      );
    } else {
      return <div></div>;
    }
  };

  return (
    <div>
      <Typography variant="h5" mb={5}>
        Relatórios do DRI
      </Typography>

      <Stack sx={{ marginTop: 2, width: "50%" }} spacing={2} direction="row">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Mês & ano"
            value={date}
            views={["year", "month"]}
            openTo="month"
            maxDate={dayjs()}
            onChange={(newValue) => {
              setAccountingEvents([]);
              setDate(newValue);
            }}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>

        <Button variant="outlined" onClick={getAccountingEvents}>
          Enviar
        </Button>
      </Stack>
      {accountingEvents.length > 0 ? (
        <div>
          <Divider sx={{ marginTop: 2, marginBottom: 2, width: "50%" }} />
          <Stack sx={{ width: "50%" }} spacing={2}>
            <Autocomplete
              disablePortal
              id="events-combo-box"
              options={accountingEvents}
              onChange={(event, value) => handleAccountingEventChange(value)}
              renderInput={(params) => <TextField {...params} label="Evento" />}
            />
          </Stack>
          {boards.length > 0 ? (
            <div>
              {" "}
              <Stack sx={{ width: "50%", marginTop: 2 }} spacing={2}>
                <Autocomplete
                  disablePortal
                  id="reports-combo-box"
                  options={reports}
                  onChange={(event, value) => handleReportChange(value)}
                  renderInput={(params) => (
                    <TextField {...params} label="Relatório" />
                  )}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={allBoardsChecked}
                      onChange={handleAllBoardsSwitchChange}
                    />
                  }
                  label="Usar todos os quadros"
                />
                {allBoardsChecked ? (
                  <div />
                ) : (
                  <FormControl>
                    <InputLabel id="demo-multiple-board-label">
                      Quadro(s)
                    </InputLabel>
                    <Select
                      labelId="demo-multiple-board-label"
                      id="multiple-board-select"
                      multiple
                      value={selectedBoardIds}
                      onChange={handleMultiSelectBoardChange}
                      input={<OutlinedInput label="label" />}
                      renderValue={(selected) => selected.join(", ")}
                      MenuProps={MenuProps}
                    >
                      {filteredBoards.map((x) => (
                        <MenuItem key={x.boardId} value={x.boardId}>
                          <Checkbox
                            checked={selectedBoardIds.indexOf(x.boardId) > -1}
                          />
                          <ListItemText primary={x.label} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
                <Paper elevation={3}>
                  <Stack spacing={1} sx={{ marginLeft: 1 }}>
                    <Typography variant="h7" mb={1} mt={1}>
                      Agente
                    </Typography>
                    <FormControl>
                      <FormLabel id="input-type-radio-buttons-label">
                        Tipo de entrada
                      </FormLabel>
                      <RadioGroup
                        row
                        aria-labelledby="input-radio-buttons-group-label"
                        defaultValue={inputTypes[1].id}
                        name="input-radio-buttons-group"
                        value={inputId}
                        onChange={handleInputTypeChange}
                      >
                        {inputTypes.map((x) => (
                          <FormControlLabel
                            key={x.id}
                            value={x.id}
                            control={<Radio />}
                            label={x.name}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                    {chooseFieldsToRender(inputId)}
                    <div style={{ marginBottom: 5 }} />
                  </Stack>
                </Paper>
              </Stack>
              <Button
                sx={{ marginTop: 5 }}
                variant="outlined"
                onClick={sendRequest}
              >
                Enviar
              </Button>
              <Divider sx={{ marginTop: 2, marginBottom: 1 }} />
              <Typography variant="h6">Acrônimos</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={listAcronymChecked}
                    onChange={handleListAcronymChange}
                  />
                }
                label="Listar acrônimos"
              />
              {listAcronymChecked && acronomiesInfos.length > 0 ? (
                RenderAcronimiesInPdf()
              ) : (
                <div />
              )}
              {queryKeys !== undefined && queryKeys.length > 0 ? (
                <div>
                  <Divider sx={{ marginTop: 2, marginBottom: 1 }} />
                  <Typography variant="h6">Resultados</Typography>
                  <Stack direction="row" spacing={1} sx={{ marginTop: 5 }}>
                    {queryKeys.map((x) => (
                      <Chip
                        key={queryKeys.indexOf(x)}
                        label={x.boardName}
                        variant="outlined"
                        onClick={() =>
                          handleChipClick(queryKeys.indexOf(x), x.boardName)
                        }
                        style={{
                          backgroundColor:
                            selectedBoardName === x.boardName
                              ? "lightGray"
                              : "white",
                        }}
                      />
                    ))}
                  </Stack>
                  {rows !== undefined && rows.length > 0 ? (
                    <div>
                      <DataGrid
                        rows={rows}
                        columns={columns}
                        sx={{ maxHeight: 440, marginTop: 2 }}
                      />
                      {rows !== undefined && rows.length > 0 ? (
                        <div style={{ marginTop: 7 }}>
                          <Button
                            variant="outlined"
                            onClick={() => setDialogOpen(true)}
                          >
                            Exportar quadro
                          </Button>
                        </div>
                      ) : (
                        <div />
                      )}
                    </div>
                  ) : (
                    <div />
                  )}
                  <FormControlLabel
                    sx={{ marginTop: 5 }}
                    control={
                      <Switch
                        checked={pdfSwitchChecked}
                        onChange={handleShowAsPdfSwitchChange}
                      />
                    }
                    label="Exibir relatório em formato PDF"
                  />
                  {pdfSwitchChecked ? (
                    <div style={{ marginTop: 5 }}>
                      {RenderReportByParticipant()}
                      {selectedReportParticipant !== "" &&
                      selectedReportProfile !== "" ? (
                        <div>{RenderReport()}</div>
                      ) : (
                        <div />
                      )}
                    </div>
                  ) : (
                    <div />
                  )}
                  <Button
                    sx={{ marginTop: 2 }}
                    variant="outlined"
                    onClick={() => savePDFs()}
                  >
                    Salvar relatórios em PDF
                  </Button>
                </div>
              ) : (
                <div />
              )}
            </div>
          ) : (
            <div />
          )}
        </div>
      ) : (
        <div />
      )}
      <div style={{ float: "left", clear: "both" }} ref={dataGridEnd} />

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
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Escolha o formato de arquivo para exportação dos dados
        </DialogTitle>
        <DialogContent>
          <FormControl>
            <FormLabel id="demo-radio-buttons-group-label">Formato</FormLabel>
            <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              defaultValue="csv"
              name="radio-buttons-group"
              value={selectedFileFormat}
              onChange={handleFileFormatChange}
            >
              <FormControlLabel value="csv" control={<Radio />} label="csv" />
              <FormControlLabel value="xls" control={<Radio />} label="xls" />
              <FormControlLabel value="json" control={<Radio />} label="json" />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDialog}>Cancelar</Button>
          <Button onClick={handleConfirmDialog} autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
