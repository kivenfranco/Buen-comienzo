// INSTRUCCIONES:
// 1. Abre el Google Sheet
// 2. Menu: Extensiones > Apps Script
// 3. Borra todo y pega este codigo
// 4. Guardar (icono disquete)
// 5. Implementar > Nueva implementacion
//    - Tipo: Aplicacion web
//    - Ejecutar como: Yo
//    - Quién tiene acceso: Cualquier persona
// 6. Click Implementar > Autorizar
// 7. Copia la URL que termina en /exec
// 8. En Netlify agrega variable: APPS_SCRIPT_URL = esa URL

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var spreadsheetId = data.spreadsheetId;
    var sheetName = data.sheetName || "Sheet1";
    var rowIndex = parseInt(data.rowIndex);
    var confirmacion = data.confirmacion || "CONFIRMO";
    var fecha = data.fecha || new Date().toLocaleString("es-CO");

    var ss = SpreadsheetApp.openById(spreadsheetId);
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      return jsonResponse({ success: false, error: "Hoja no encontrada: " + sheetName });
    }

    var lastCol = sheet.getLastColumn();
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

    return jsonResponse({ success: true, row: rowIndex });

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
