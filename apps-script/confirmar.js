/**
 * INSTRUCCIONES DE INSTALACIÓN:
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Abre el Google Sheet
 * 2. Menú: Extensiones → Apps Script
 * 3. Borra todo el contenido que aparece y pega este código completo
 * 4. Click en "Guardar" (ícono de disquete)
 * 5. Menú: Implementar → Nueva implementación
 *    - Tipo: "Aplicación web"
 *    - Ejecutar como: "Yo (tu cuenta)"
 *    - Quién tiene acceso: "Cualquier persona"
 * 6. Click "Implementar" → Autoriza cuando pregunte
 * 7. Copia la URL que aparece (termina en /exec)
 * 8. En Netlify → Site configuration → Environment variables
 *    Agrega: APPS_SCRIPT_URL = (la URL copiada)
 * ─────────────────────────────────────────────────────────────────────────────
 */

function doPost(e) {
  try {
    var data         = JSON.parse(e.postData.contents);
    var spreadsheetId = data.spreadsheetId;
    var sheetName    = data.sheetName || "Sheet1";
    var rowIndex     = parseInt(data.rowIndex);
    var confirmacion = data.confirmacion || "CONFIRMÓ";
    var fecha        = data.fecha || new Date().toLocaleString("es-CO");

    var ss    = SpreadsheetApp.openById(spreadsheetId);
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      return jsonResponse({ success: false, error: "Hoja no encontrada: " + sheetName });
    }

    // Obtener encabezados de la primera fila
    var lastCol = sheet.getLastColumn();
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

    // Buscar columnas de confirmación y fecha
    var confirmCol = -1;
    var fechaCol   = -1;

    for (var i = 0; i < headers.length; i++) {
      var h = String(headers[i]).trim().toLowerCase();
      if (h === "confirmacion_asistencia") confirmCol = i + 1; // 1-based
      if (h === "fecha_confirmacion")      fechaCol   = i + 1;
    }

    // Crear columnas si no existen
    if (confirmCol === -1) {
      confirmCol = lastCol + 1;
      sheet.getRange(1, confirmCol).setValue("confirmacion_asistencia");
      lastCol++;
    }
    if (fechaCol === -1) {
      fechaCol = lastCol + 1;
      sheet.getRange(1, fechaCol).setValue("fecha_confirmacion");
    }

    // Escribir en la fila del participante
    sheet.getRange(rowIndex, confirmCol).setValue(confirmacion);
    sheet.getRange(rowIndex, fechaCol).setValue(fecha);

    // Forzar guardado
    SpreadsheetApp.flush();

    return jsonResponse({ success: true, row: rowIndex });

  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function doGet(e) {
  return jsonResponse({ status: "Apps Script Buen Comienzo activo ✓" });
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
