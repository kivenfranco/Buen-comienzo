import { NextResponse } from "next/server";

const SPREADSHEET_ID = "17MlwQuAgBGFWJQBpSd7yAZZ3DHghc3uMIqNSTUU2Zf0";
const SHEET_NAME     = process.env.GOOGLE_SHEET_NAME ?? "Sheet1";
const SCRIPT_URL     =
  process.env.APPS_SCRIPT_URL ??
  "https://script.google.com/macros/s/AKfycbyDg8MaPx4GSnFb7HsDJqyMf54YWho_cUtdLkZ1grgV7kgo6bdRNZfVGuJSGI8Z5wq2EA/exec";

export async function GET() {
  const results: Record<string, unknown> = {};

  // ── 1. Test lectura del Sheet ──────────────────────────────────────────
  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;
    const csvRes = await fetch(csvUrl, { cache: "no-store" });
    const csvText = await csvRes.text();
    const firstLine = csvText.split("\n")[0];
    results.sheet_lectura = {
      ok:      csvRes.ok,
      status:  csvRes.status,
      headers: firstLine.slice(0, 200),
    };
  } catch (e: unknown) {
    results.sheet_lectura = { error: String(e) };
  }

  // ── 2. Test llamada al Apps Script ────────────────────────────────────
  try {
    const payload = JSON.stringify({
      spreadsheetId: SPREADSHEET_ID,
      sheetName:     SHEET_NAME,
      rowIndex:      2,               // fila de prueba (primera fila de datos)
      confirmacion:  "TEST_CONFIRMO",
      fecha:         new Date().toLocaleString("es-CO"),
    });

    const scriptRes = await fetch(SCRIPT_URL, {
      method:  "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body:    payload,
      redirect: "follow",
    });

    const scriptText = await scriptRes.text().catch(() => "(sin respuesta)");
    results.apps_script = {
      ok:       scriptRes.ok,
      status:   scriptRes.status,
      response: scriptText.slice(0, 500),
    };
  } catch (e: unknown) {
    results.apps_script = { error: String(e) };
  }

  return NextResponse.json({
    timestamp:      new Date().toISOString(),
    spreadsheetId:  SPREADSHEET_ID,
    sheetName:      SHEET_NAME,
    scriptUrl:      SCRIPT_URL.slice(0, 80) + "...",
    results,
  });
}

export const dynamic = "force-dynamic";
