async function mapResponseToTableData(item, agentCode, idx) {
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
    var rowIdx = 1 + idx;
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
    rowData["id"] = 1 + idx;

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

export const apiMappings = {
  mapResponseToTableData,
};
