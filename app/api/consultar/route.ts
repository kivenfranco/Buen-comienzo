import { NextRequest, NextResponse } from "next/server";
import { buscarParticipante, confirmarAsistencia } from "@/lib/sheets";

// Sanitize: only allow digits, max 15 chars
function sanitizeId(raw: string): string | null {
  const cleaned = raw.replace(/\D/g, "").slice(0, 15);
  return cleaned.length >= 5 ? cleaned : null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawId = String(body?.identificacion ?? "");

    const identificacion = sanitizeId(rawId);
    if (!identificacion) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Por favor ingresa un número de identificación válido (mínimo 5 dígitos).",
        },
        { status: 400 }
      );
    }

    const participante = await buscarParticipante(identificacion);

    if (!participante) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No encontramos información asociada a este documento. Verifica e inténtalo nuevamente.",
        },
        { status: 404 }
      );
    }

    // Await confirmation so Netlify doesn't cut execution before it finishes
    try {
      await confirmarAsistencia(participante.rowIndex);
    } catch (err) {
      console.error("[confirmarAsistencia] Error al actualizar hoja:", err);
    }

    return NextResponse.json({
      success: true,
      data: {
        nombreCompleto: participante.nombreCompleto,
        nombreSede:     participante.nombreSede,
        tipoPaquete:    participante.tipoPaquete,
        horaCitacion:   participante.horaCitacion,
        identificacion: participante.identificacion,
      },
    });
  } catch (error) {
    console.error("[consultar] Error inesperado:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          "Ocurrió un error al consultar la información. Por favor intenta más tarde.",
      },
      { status: 500 }
    );
  }
}

// Disable caching so every request hits the live sheet
export const dynamic = "force-dynamic";
