import { google } from "googleapis";

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeHeader(h: string): string {
  return h
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function columnLetter(n: number): string {
  let result = "";
  while (n > 0) {
    n--;
    result = String.fromCharCode(65 + (n % 26)) + result;
    n      = Math.floor(n / 26);
  }
  return result;
}

// ─── READ via API Key (sheet must be public / shared with viewer) ─────────────
// Si el sheet está publicado o compartido como "cualquiera con el enlace puede ver",
// solo se necesita GOOGLE_API_KEY para leer. Sin Service Account.

async function fetchSheetValues(): Promise<string[][]> {
  const apiKey        = process.env.GOOGLE_API_KEY;
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;
  const sheetName     = encodeURIComponent(
    process.env.GOOGLE_SHEET_NAME ?? "Sheet1"
  );

  if (!apiKey) {
    throw new Error(
      "Falta GOOGLE_API_KEY en las variables de entorno. Necesaria para leer el Sheet."
    );
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;
  const res  = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error leyendo Google Sheets: ${res.status} ${err}`);
  }

  const json = await res.json();
  return (json.values ?? []) as string[][];
}

// ─── Parse rows → typed objects ───────────────────────────────────────────────

function parseRows(rawRows: string[][]): {
  headers: string[];
  participantes: ParticipanteData[];
} {
  if (rawRows.length === 0) return { headers: [], participantes: [] };

  const headers    = rawRows[0].map(normalizeHeader);
  const dataRows   = rawRows.slice(1);

  const get = (row: string[], key: string) =>
    (row[headers.indexOf(normalizeHeader(key))] ?? "").trim();

  const participantes: ParticipanteData[] = dataRows.map((row, i) => {
    const nombreCompleto = [
      get(row, "primer_nombre_participante"),
      get(row, "segundo_nombre_participante"),
      get(row, "primer_apellido_participante"),
      get(row, "segundo_apellido_participante"),
    ]
      .filter(Boolean)
      .join(" ");

    return {
      rowIndex:               i + 2, // 1-based header + 1
      identificacion:         get(row, "identificacion_participante"),
      nombreCompleto,
      nombreSede:             get(row, "nombre_sede"),
      tipoPaquete:            get(row, "TIPO PAQUETE"),
      horaCitacion:           get(row, "HORA DE CITACION"),
      confirmacionAsistencia: get(row, "confirmacion_asistencia"),
      fechaConfirmacion:      get(row, "fecha_confirmacion"),
    };
  });

  return { headers, participantes };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Busca un participante por identificación exacta */
export async function buscarParticipante(
  identificacion: string
): Promise<ParticipanteData | null> {
  const rawRows = await fetchSheetValues();
  const { participantes } = parseRows(rawRows);

  return (
    participantes.find(
      (p) => p.identificacion === identificacion.trim()
    ) ?? null
  );
}

/** Retorna todos los participantes (para el dashboard) */
export async function getAllParticipantes(): Promise<ParticipanteData[]> {
  const rawRows = await fetchSheetValues();
  const { participantes } = parseRows(rawRows);
  // Excluir filas sin identificación
  return participantes.filter((p) => p.identificacion !== "");
}

// ─── WRITE via Service Account ────────────────────────────────────────────────
// Para escribir en el sheet se necesita un Service Account aunque el sheet sea público.

function getAuthClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key   = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !key) {
    throw new Error(
      "Faltan GOOGLE_SERVICE_ACCOUNT_EMAIL o GOOGLE_PRIVATE_KEY para escribir en el Sheet."
    );
  }

  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

/** Marca confirmacion_asistencia = CONFIRMÓ y registra fecha/hora */
export async function confirmarAsistencia(rowIndex: number): Promise<void> {
  const auth          = getAuthClient();
  const sheets        = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;
  const sheetName     = process.env.GOOGLE_SHEET_NAME ?? "Sheet1";

  // Obtener headers para localizar columnas
  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!1:1`,
  });

  const headerRow        = ((headerRes.data.values ?? [[]])[0] ?? []) as string[];
  const normalizedHdrs   = headerRow.map(normalizeHeader);
  const lastCol          = headerRow.length;

  let confirmCol = normalizedHdrs.indexOf(normalizeHeader("confirmacion_asistencia"));
  let fechaCol   = normalizedHdrs.indexOf(normalizeHeader("fecha_confirmacion"));

  const updates: { range: string; values: string[][] }[] = [];

  // Crear columnas si no existen
  if (confirmCol === -1) {
    confirmCol = lastCol;
    updates.push({
      range:  `${sheetName}!${columnLetter(confirmCol + 1)}1`,
      values: [["confirmacion_asistencia"]],
    });
  }
  if (fechaCol === -1) {
    fechaCol = Math.max(lastCol, confirmCol + 1);
    if (fechaCol === confirmCol) fechaCol++;
    updates.push({
      range:  `${sheetName}!${columnLetter(fechaCol + 1)}1`,
      values: [["fecha_confirmacion"]],
    });
  }

  const now = new Intl.DateTimeFormat("es-CO", {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone:  "America/Bogota",
  }).format(new Date());

  updates.push(
    {
      range:  `${sheetName}!${columnLetter(confirmCol + 1)}${rowIndex}`,
      values: [["CONFIRMÓ"]],
    },
    {
      range:  `${sheetName}!${columnLetter(fechaCol + 1)}${rowIndex}`,
      values: [[now]],
    }
  );

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: "RAW",
      data: updates.map((u) => ({ range: u.range, values: u.values })),
    },
  });
}
