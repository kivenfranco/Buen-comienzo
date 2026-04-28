/**
 * lib/sheets.ts
 *
 * LECTURA  → URL pública CSV de Google Sheets (sheet público, sin credenciales)
 * ESCRITURA → Google Apps Script Web App (sin credenciales, publicado como "Anyone")
 */

const SPREADSHEET_ID =
  process.env.GOOGLE_SPREADSHEET_ID ??
  "17MlwQuAgBGFWJQBpSd7yAZZ3DHghc3uMIqNSTUU2Zf0";

const SHEET_NAME = process.env.GOOGLE_SHEET_NAME ?? "Sheet1";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ParticipanteData {
  rowIndex:               number;
  identificacion:         string;
  nombreCompleto:         string;
  nombreSede:             string;
  tipoPaquete:            string;
  horaCitacion:           string;
  confirmacionAsistencia: string;
  fechaConfirmacion:      string;
}

// ─── CSV parser ───────────────────────────────────────────────────────────────
// Maneja campos con comas, comillas y saltos de línea dentro de comillas.

function parseCSV(raw: string): string[][] {
  const rows: string[][] = [];
  let row: string[]      = [];
  let field              = "";
  let inQuotes           = false;
  let i                  = 0;

  while (i < raw.length) {
    const ch   = raw[i];
    const next = raw[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i += 2;
      } else if (ch === '"') {
        inQuotes = false;
        i++;
      } else {
        field += ch;
        i++;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
      } else if (ch === ",") {
        row.push(field);
        field = "";
        i++;
      } else if (ch === "\r" && next === "\n") {
        row.push(field);
        rows.push(row);
        row   = [];
        field = "";
        i += 2;
      } else if (ch === "\n" || ch === "\r") {
        row.push(field);
        rows.push(row);
        row   = [];
        field = "";
        i++;
      } else {
        field += ch;
        i++;
      }
    }
  }

  if (field || row.length) {
    row.push(field);
    if (row.some((c) => c !== "")) rows.push(row);
  }

  return rows;
}

// ─── Normalize header names ───────────────────────────────────────────────────

function norm(h: string): string {
  return h
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// ─── Fetch sheet as 2D array ──────────────────────────────────────────────────

async function fetchSheetValues(): Promise<string[][]> {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(
      `No se pudo leer el Google Sheet (HTTP ${res.status}). Verifica que el sheet sea público.`
    );
  }

  const csv = await res.text();
  return parseCSV(csv);
}

// ─── Parse rows into typed objects ────────────────────────────────────────────

function parseRows(rawRows: string[][]): ParticipanteData[] {
  if (rawRows.length < 2) return [];

  const headers = rawRows[0].map(norm);

  const get = (row: string[], key: string) => {
    const idx = headers.indexOf(norm(key));
    return idx >= 0 ? (row[idx] ?? "").trim() : "";
  };

  return rawRows
    .slice(1)
    .map((row, i) => {
      const nombreCompleto = [
        get(row, "primer_nombre_participante"),
        get(row, "segundo_nombre_participante"),
        get(row, "primer_apellido_participante"),
        get(row, "segundo_apellido_participante"),
      ]
        .filter(Boolean)
        .join(" ");

      return {
        rowIndex:               i + 2,
        identificacion:         get(row, "identificacion_participante"),
        nombreCompleto,
        nombreSede:             get(row, "nombre_sede"),
        tipoPaquete:            get(row, "TIPO PAQUETE"),
        horaCitacion:           get(row, "HORA"),
        confirmacionAsistencia: get(row, "confirmacion_asistencia"),
        fechaConfirmacion:      get(row, "fecha_confirmacion"),
      };
    })
    .filter((p) => p.identificacion !== "");
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function buscarParticipante(
  identificacion: string
): Promise<ParticipanteData | null> {
  const raw           = await fetchSheetValues();
  const participantes = parseRows(raw);
  return participantes.find((p) => p.identificacion === identificacion.trim()) ?? null;
}

export async function getAllParticipantes(): Promise<ParticipanteData[]> {
  const raw = await fetchSheetValues();
  return parseRows(raw);
}

// ─── Write via Apps Script Web App ────────────────────────────────────────────
// El Apps Script está publicado como "Anyone can access" → no requiere credenciales.
// Si APPS_SCRIPT_URL no está configurada, la confirmación se omite silenciosamente.

export async function confirmarAsistencia(rowIndex: number): Promise<void> {
  const scriptUrl =
    process.env.APPS_SCRIPT_URL ??
    "https://script.google.com/macros/s/AKfycbx5OCm2OGZJvXagvESHLO8D5errzPQvfXQsZVvbQ14utlWHertiwcBwMMqfF4TXmXoAHA/exec";

  const now = new Intl.DateTimeFormat("es-CO", {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone:  "America/Bogota",
  }).format(new Date());

  const payload = JSON.stringify({
    spreadsheetId: SPREADSHEET_ID,
    sheetName:     SHEET_NAME,
    rowIndex,
    confirmacion:  "CONFIRMO",
    fecha:         now,
  });

  // Content-Type: text/plain evita el preflight CORS y el problema de redirect
  // donde Google Apps Script convierte el POST en GET perdiendo el body.
  const res = await fetch(scriptUrl, {
    method:  "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body:    payload,
    redirect: "follow",
  });

  const responseText = await res.text().catch(() => "");
  console.log("[confirmar] Apps Script response:", res.status, responseText);

  if (!res.ok && res.status !== 302) {
    throw new Error(`Apps Script respondió ${res.status}: ${responseText}`);
  }
}
