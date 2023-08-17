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
import { driService } from "../../services/driService.ts";
import exportFromJSON from "export-from-json";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import styles from "./styles.module.css";
import { constants } from "buffer";

export default function DriReportsView() {
  const [authData, setAuthData] = useState([]);
  const [date, setDate] = useState(dayjs());
  const [selectedAccountingEventCode, setSelectedAccountingEventCode] =
    useState("");
  const [selectedAccountingEventName, setSelectedAccountingEventName] =
    useState("");
  const [selectedBoard, setSelectedBoard] = useState("");
  const [participantCode, setParticipantCode] = useState("");
  const [accountingEvents, setAccountingEvents] = useState([]);
  const [boards, setBoards] = useState([]);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [inputId, setInputId] = useState(1);
  const [uploadFileRows, setUploadFileRows] = useState([]);
  const [uploadFileColumns, setUploadFileColumns] = useState([]);
  const [selectedFileFormat, setSelectedFileFormat] = useState("csv");
  const [openDialog, setDialogOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [exportData, setExportData] = useState([]);

  const dataGridEnd = useRef(null);

  const inputTypes = [
    { id: 1, name: "Simples" },
    { id: 2, name: "Múltipla" },
  ];

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("authData"));
    if (data) {
      setAuthData(data);
    }
  }, []);

  const getAccountingEvents = async () => {
    setLoadingModalOpen(true);

    setAccountingEvents([]);
    setBoards([]);
    setSelectedAccountingEventCode("");
    setSelectedBoard("");
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

    handleLoadingModalClose();
  };

  const getReports = async (eventCode) => {
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

    handleLoadingModalClose();
  };

  const handleAccountingEventChange = (value) => {
    if (value === null) {
      return;
    }

    var eventCode = value.code;

    setRequestSent(false);
    setSelectedAccountingEventCode(eventCode);
    setSelectedAccountingEventName(value.label);
    getReports(eventCode);
  };

  const handleBoardChange = (value) => {
    setRequestSent(false);
    setSelectedBoard(value);
  };

  const handleInputTypeChange = (event) => {
    setInputId(parseInt(event.target.value));
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

  const sendRequest = async () => {
    setLoadingModalOpen(true);
    setRows([]);

    if (
      selectedAccountingEventCode === "" ||
      selectedBoard === "" ||
      (participantCode === "" && uploadFileRows.length === 0)
    ) {
      handleLoadingModalClose();
      return;
    }

    var rowData = [];

    if (inputId === 1) {
      rowData = await getResults(participantCode);
    } else {
      var codes = uploadFileRows.map((x) => x[0]);
      var idx = 1;
      for (const code of codes) {
        var res = await getResults(code);
        for (const r of res) {
          r.id = idx;
          rowData.push(r);
          idx++;
        }
      }
    }

    if (rowData !== undefined && rowData.length > 0) {
      setRequestSent(true);
    }

    setRows(rowData);
    handleLoadingModalClose();
    scrollToBottom();
  };

  const getResults = async (agentCode) => {
    var responseData = await driService.listarResultadoDeRelatorio(
      authData,
      selectedAccountingEventCode,
      selectedBoard.boardId,
      selectedBoard.reportId,
      agentCode
    );

    if (responseData.code === 200) {
      const results = responseData.data;
      var rowData = await mapResponseToTableData(results, agentCode);
      return rowData;
    } else {
      return [];
    }
  };

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

    if (boards.length === undefined) {
      mapResponseToBoard(boards, reportId, reportName);
    } else {
      for (const bd of boards) {
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
    for (const headerField of cabecalhoArr) {
      const columnAttributes = {
        field: "col" + colIdx,
        headerName: headerField.replace(/'/g, ""),
        minWidth: 200,
      };
      headerFields.push(columnAttributes);
      colIdx++;
    }
    setColumns(headerFields);

    if (valores.length !== undefined) {
      var rowIdx = 1;
      for (const v of valores) {
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

    return rowsArr;
  }

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

  const handleExportData = () => {
    setLoadingModalOpen(true);

    var correctedRows = rows;

    for (const rowData of correctedRows) {
      for (const col of columns) {
        rowData[col.headerName] = rowData[col.field];
        delete rowData[col.field];
        delete rowData["id"];
      }
    }

    setExportData(correctedRows);
    handleLoadingModalClose();
    setDialogOpen(true);
  };

  const handleConfirmDialog = () => {
    setLoadingModalOpen(true);
    var fileName = selectedAccountingEventName + "_" + selectedBoard.label;
    let exportType = "";

    if (selectedFileFormat === "csv") {
      exportType = exportFromJSON.types.csv;
    } else if (selectedFileFormat === "xls") {
      exportType = exportFromJSON.types.xls;
    } else {
      exportType = exportFromJSON.types.json;
    }

    exportFromJSON({ data: exportData, fileName, exportType });
    handleCloseDialog();
    handleLoadingModalClose();
  };

  const scrollToBottom = () => {
    dataGridEnd.current?.scrollIntoView({ behavior: "smooth" });
    console.log(dataGridEnd.current);
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
                  id="boards-combo-box"
                  options={boards}
                  onChange={(event, value) => handleBoardChange(value)}
                  renderInput={(params) => (
                    <TextField {...params} label="Relatório | Quadro" />
                  )}
                />
                <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
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
                {inputId === 1 ? (
                  <TextField
                    id="outlined-participant-input"
                    label="Cód Agente"
                    type="number"
                    onChange={(event) => setParticipantCode(event.target.value)}
                  />
                ) : (
                  <input type="file" onChange={fileHandler.bind(this)} />
                )}
              </Stack>
              <Stack
                sx={{ width: "50%", marginTop: 5 }}
                spacing={2}
                direction="row"
              >
                <Button variant="outlined" onClick={sendRequest}>
                  Enviar
                </Button>

                {rows !== undefined && rows.length > 0 ? (
                  <div>
                    <Button
                      variant="outlined"
                      onClick={() => handleExportData()}
                    >
                      Exportar
                    </Button>
                  </div>
                ) : (
                  <div />
                )}
              </Stack>
              {rows !== undefined && rows.length > 0 ? (
                <div>
                  <DataGrid
                    rows={rows}
                    columns={columns}
                    ref={dataGridEnd}
                    sx={{ maxHeight: 440, marginTop: 5 }}
                  />
                  <div
                    style={{ float: "left", clear: "both" }}
                    ref={dataGridEnd}
                  />
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
            Buscando resultados
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
