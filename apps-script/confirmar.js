// INSTRUCCIONES PARA ACTUALIZAR:
// 1. Abre el Apps Script (Extensions > Apps Script en el Sheet)
// 2. Borra todo y pega este codigo
// 3. Guardar
// 4. Implementar > Administrar implementaciones > editar el lapiz
// 5. En "Version" selecciona "Nueva version"
// 6. Guardar - usa la misma URL, no necesitas cambiar nada en Netlify

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var spreadsheetId = data.spreadsheetId;
    var rowIndex = parseInt(data.rowIndex);
    var confirmacion = data.confirmacion || "CONFIRMO";
    var fecha = data.fecha || new Date().toLocaleString("es-CO");

    var ss = SpreadsheetApp.openById(spreadsheetId);

    // Usar SIEMPRE la primera hoja, sin importar el nombre
    var sheet = ss.getSheets()[0];

    var lastCol = sheet.getLastColumn();
    if (lastCol < 1) lastCol = 1;

    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

    var confirmCol = -1;
    var fechaCol = -1;

    for (var i = 0; i < headers.length; i++) {
      var h = String(headers[i]).trim().toLowerCase();
      if (h === "confirmacion_asistencia") {
        confirmCol = i + 1;
      }
      if (h === "fecha_confirmacion") {
        fechaCol = i + 1;
      }
    }

    if (confirmCol === -1) {
      confirmCol = lastCol + 1;
      sheet.getRange(1, confirmCol).setValue("confirmacion_asistencia");
      lastCol = lastCol + 1;
    }

    if (fechaCol === -1) {
      fechaCol = lastCol + 1;
      sheet.getRange(1, fechaCol).setValue("fecha_confirmacion");
    }

    sheet.getRange(rowIndex, confirmCol).setValue(confirmacion);
    sheet.getRange(rowIndex, fechaCol).setValue(fecha);

    SpreadsheetApp.flush();

    return jsonResponse({
      success: true,
      row: rowIndex,
      sheet: sheet.getName(),
      confirmCol: confirmCol,
      fechaCol: fechaCol
    });

  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function doGet(e) {
  var ss = SpreadsheetApp.openById("17MlwQuAgBGFWJQBpSd7yAZZ3DHghc3uMIqNSTUU2Zf0");
  var sheet = ss.getSheets()[0];
  return jsonResponse({
    status: "activo",
    primeraHoja: sheet.getName(),
    totalFilas: sheet.getLastRow()
  });
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
