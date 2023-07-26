import React, { useEffect, useState } from "react";
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
import { DataGrid } from "@mui/x-data-grid";
import { driService } from "../../services/driService.ts";

export default function DriReportsView() {
  const [authData, setAuthData] = useState([]);
  const [date, setDate] = useState(dayjs());
  const [selectedReportId, setSelectedReportId] = useState();
  const [selectedBoardId, setSelectedBoardId] = useState();
  const [participantCode, setParticipantCode] = useState();
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);

  const reports = [
    { id: 70, name: "Liquidação de Energia de Reserva", code: "029000" },
    { id: 49, name: "Apuração de votos", code: "006000" },
    { id: 51, name: "Contabilização", code: "001000" },
  ];

  const boards = [
    { id: 1, name: "Q1" },
    { id: 2, name: "Q2" },
    { id: 3, name: "Q3" },
    { id: 4, name: "Q4" },
  ];

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("authData"));
    if (data) {
      setAuthData(data);
    }
  }, []);

  const handleReportChange = (event) => {
    const reportId = event.target.value;
    setSelectedReportId(reportId);
  };

  const handleBoardChange = (event) => {
    const boardId = event.target.value;
    setSelectedBoardId(boardId);
  };

  const sendRequest = async () => {
    if (
      selectedReportId === "" ||
      selectedBoardId === "" ||
      participantCode === ""
    ) {
      return;
    }

    var selectedReport = reports.find((x) => x.id === selectedReportId);

    var responseData = await driService.listarResultadoDeRelatorio(
      authData,
      dayjs(date).format("YYYY").toString() +
        dayjs(date).format("MM").toString() +
        selectedReport.code,
      "251",
      selectedReport.id,
      participantCode
    );

    if (responseData.code === 200) {
      const results = responseData.data;
      mapResponseToTableData(results);
      console.log(results);
    }
  };

  async function mapResponseToTableData(item) {
    const cabecalho = item["bov2:cabecalho"]._text.toString();
    const cabecalhoArr = cabecalho.split(",");
    const valores = item["bov2:valores"]["bov2:valor"];
    var rowsArr = [];
    var headerFields = [];

    console.log(cabecalhoArr);

    var colIdx = 1;
    for (const headerField of cabecalhoArr) {
      const columnAttributes = {
        field: "col" + colIdx,
        headerName: headerField.replace(/\'/g, ""),
        minWidth: 200,
      };
      headerFields.push(columnAttributes);
      colIdx++;
    }
    setColumns(headerFields);
    //console.log(headerFields);

    if (valores.length !== undefined) {
      var rowIdx = 1;
      for (const v of valores) {
        const valor = v._text.toString();
        const valorArr = valor.split(",");
        const rowData = {};
        rowData["id"] = rowIdx;

        for (let i = 0; i < valorArr.length; i++) {
          const element = valorArr[i];
          rowData[headerFields[i].field] = element.replace(/\'/g, "");
        }

        rowsArr.push(rowData);
        rowIdx++;
      }
    } else{
      const valor = valores._text.toString();
      const valorArr = valor.split(",");
      const rowData = {};
      rowData["id"] = 1;

      for (let i = 0; i < valorArr.length; i++) {
        const element = valorArr[i];
        rowData[headerFields[i].field] = element.replace(/\'/g, "");
      }

      rowsArr.push(rowData);
    }

    setRows(rowsArr);
  }

  return (
    <div>
      <Typography variant="h5" mb={5}>
        Relatórios do DRI
      </Typography>
      <Stack sx={{ width: "50%" }} spacing={2}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Mês & ano"
            value={date}
            views={["year", "month"]}
            maxDate={dayjs()}
            onChange={(newValue) => {
              setDate(newValue);
            }}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>
        <FormControl>
          <InputLabel id="report-select-label">Relatório</InputLabel>
          <Select
            labelId="report-select-options"
            id="report-select-"
            value={selectedReportId}
            label="Relatório"
            onChange={handleReportChange}
          >
            {reports.map((x) => (
              <MenuItem value={x.id} key={x.id}>
                {x.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel id="board-select-label">Quadro</InputLabel>
          <Select
            labelId="board-select-options"
            id="board-select-"
            value={selectedBoardId}
            label="Quadro"
            onChange={handleBoardChange}
          >
            {boards.map((x) => (
              <MenuItem value={x.id} key={x.id}>
                {x.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          id="outlined-participant-input"
          label="Cód Agente"
          type="number"
          onChange={(event) => setParticipantCode(event.target.value)}
        />
      </Stack>
      <Button variant="outlined" onClick={sendRequest} sx={{ marginTop: 2 }}>
        Enviar
      </Button>
      <DataGrid
        rows={rows}
        columns={columns}
        sx={{ maxHeight: 440, marginTop: 5 }}
      />
    </div>
  );
}
