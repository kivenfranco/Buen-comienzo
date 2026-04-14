// INSTRUCCIONES:
// 1. Abre el Google Sheet
// 2. Menu: Extensiones > Apps Script
// 3. Borra todo y pega este codigo
// 4. Guardar (icono disquete)
// 5. Implementar > Nueva implementacion
//    - Tipo: Aplicacion web
//    - Ejecutar como: Yo
//    - Quien tiene acceso: Cualquier persona
// 6. Implementar > Autorizar
// 7. Copia la URL que termina en /exec y ponla en APPS_SCRIPT_URL

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var spreadsheetId = data.spreadsheetId;
    var sheetName = data.sheetName || "Sheet1";
    var rowIndex = parseInt(data.rowIndex);
    var confirmacion = data.confirmacion || "CONFIRMO";
    var fecha = data.fecha || new Date().toLocaleString("es-CO");

    var ss = SpreadsheetApp.openById(spreadsheetId);

    // Intentar por nombre, si no existe usar la primera hoja
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.getSheets()[0];
    }

    var lastCol = sheet.getLastColumn();
    if (lastCol === 0) lastCol = 1;

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

    return jsonResponse({ success: true, row: rowIndex, sheet: sheet.getName() });

  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function doGet(e) {
  return jsonResponse({ status: "Apps Script Buen Comienzo activo" });
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
