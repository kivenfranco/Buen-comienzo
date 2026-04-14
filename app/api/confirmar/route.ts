import { NextRequest, NextResponse } from "next/server";
import { confirmarAsistencia } from "@/lib/sheets";

export async function POST(request: NextRequest) {
  try {
    const body     = await request.json();
    const rowIndex = Number(body?.rowIndex);

    if (!Number.isInteger(rowIndex) || rowIndex < 2) {
      return NextResponse.json(
        { success: false, message: "Índice de fila inválido." },
        { status: 400 }
      );
    }

    await confirmarAsistencia(rowIndex);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[confirmar] Error:", error);
    return NextResponse.json(
      { success: false, message: "No se pudo registrar la confirmación." },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
