import type { Programacion } from "./types";

export type Nivel = "ok" | "aviso" | "error";

export interface Validacion {
  nivel: Nivel;
  titulo: string;
  detalles: string[];
  /** Líneas concretas que no se entendieron (para mostrarlas al usuario). */
  lineas: string[];
}

/**
 * Evalúa el texto pegado contra lo que el parser logró entender y devuelve un
 * estado con mensajes claros para un usuario no técnico:
 *  - error: no parece una programación (datos que no corresponden).
 *  - aviso: se reconoció algo, pero falta información o el formato cambió.
 *  - ok: todo se entendió.
 */
export function validar(data: Programacion): Validacion {
  // Nada reconocido: lo pegado no corresponde a una programación.
  if (data.dias.length === 0) {
    return {
      nivel: "error",
      titulo: "Esto no parece la programación de la semana.",
      detalles: [
        "Pega el correo completo de las “Hojas de trabajo”, tal como te llega, sin recortar.",
        "Debe incluir líneas como “FECHA: Lunes 15/06/2026” y “ASIGNACION: …”.",
      ],
      lineas: [],
    };
  }

  const detalles: string[] = [];

  const sinAsignacion = data.dias.filter((d) => !d.asignacion);
  if (sinAsignacion.length) {
    detalles.push(
      `${sinAsignacion.length} día(s) sin “ASIGNACION” reconocida ` +
        `(${sinAsignacion.map((d) => `${d.diaSemana} ${d.fecha}`).join(", ")}). ` +
        "¿Quedó cortado el correo?",
    );
  }

  const tablasVacias = data.dias.filter(
    (d) =>
      d.asignacion?.tipo === "SERVICIO" && d.trabajos.some((t) => t.tareas.length === 0),
  );
  if (tablasVacias.length) {
    detalles.push(
      `${tablasVacias.length} día(s) tienen trabajos pero sin tareas legibles: ` +
        "es probable que el correo se haya pegado con el formato dañado.",
    );
  }

  if (!data.conductor) {
    detalles.push("No se detectó el nombre del conductor al inicio del correo.");
  }

  if (data.avisos.length) {
    detalles.push(`${data.avisos.length} línea(s) no se entendieron (ver abajo).`);
  }

  if (detalles.length === 0) {
    const dias = data.dias.length;
    return {
      nivel: "ok",
      titulo: `Programación reconocida: ${dias} día${dias === 1 ? "" : "s"}.`,
      detalles: [],
      lineas: [],
    };
  }

  return {
    nivel: "aviso",
    titulo: "Revisa: puede faltar información o el formato cambió.",
    detalles,
    lineas: data.avisos,
  };
}
