import { NextRequest, NextResponse } from "next/server";
import { getAllParticipantes } from "@/lib/sheets";

export async function GET(request: NextRequest) {
  // Protección mínima por clave en query param
  const pwd     = request.nextUrl.searchParams.get("pwd");
  const envPwd  = process.env.DASHBOARD_PASSWORD;

  if (envPwd && pwd !== envPwd) {
    return NextResponse.json(
      { success: false, message: "Acceso no autorizado." },
      { status: 401 }
    );
  }

  try {
    const participantes = await getAllParticipantes();

    const confirmados = participantes.filter(
      (p) => p.confirmacionAsistencia.trim().toUpperCase() === "CONFIRMÓ"
    );
    const pendientes = participantes.filter(
      (p) => p.confirmacionAsistencia.trim().toUpperCase() !== "CONFIRMÓ"
    );

    return NextResponse.json({
      success: true,
      stats: {
        total:       participantes.length,
        confirmados: confirmados.length,
        pendientes:  pendientes.length,
        porcentaje:
          participantes.length > 0
            ? Math.round((confirmados.length / participantes.length) * 100)
            : 0,
      },
      participantes,
    });
  } catch (error) {
    console.error("[dashboard] Error:", error);
    return NextResponse.json(
      { success: false, message: "Error al obtener los datos." },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
