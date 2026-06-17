import type { Dia, Programacion, Tarea, Trabajo } from "./types";

const TIME = "\\d{2}:\\d{2}:\\d{2}";
const reHeaderDriver = /^(\d{4,})\s*-\s*(.+)$/;
const reFecha = /^FECHA:\s*(\S+)\s+(\d{1,2}\/\d{1,2}\/\d{4})$/i;
const reAsigDesc = /^ASIGNACION:\s*DESC$/i;
const reAsig = new RegExp(
  `^ASIGNACION:\\s*(\\S+)\\s+AMPLITUD:\\s*(${TIME})\\s+PRODUCCION:\\s*(${TIME})$`,
  "i",
);
const reTrabajo = new RegExp(`^Trabajo\\s+(\\d+)\\s*\\((${TIME})\\s*-\\s*(${TIME})\\)$`, "i");
const reCabeceraTabla = /^Hora\s+Inicio/i;
const reRowStart = new RegExp(`^(${TIME})`);

/**
 * Parte una fila por TAB o por 2+ espacios. Así sobrevive a single-spaces
 * internos como "Inicio servicio" o "9-11_FRANJA_SECA_NM_ (2645)", y tolera
 * que el correo llegue con espacios en vez de tabuladores.
 */
function splitRow(line: string): string[] {
  return line
    .split(/\t|\s{2,}/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function parse(texto: string): Programacion {
  const lineas = texto.split(/\r?\n/).map((l) => l.trim());
  const resultado: Programacion = { conductor: null, dias: [], avisos: [] };
  let dia: Dia | null = null;
  let trabajo: Trabajo | null = null;

  for (const linea of lineas) {
    if (!linea) continue;

    if (!resultado.conductor) {
      const m = linea.match(reHeaderDriver);
      if (m) {
        resultado.conductor = { id: m[1], nombre: m[2].trim() };
        continue;
      }
    }

    let m: RegExpMatchArray | null;
    if ((m = linea.match(reFecha))) {
      dia = { diaSemana: m[1], fecha: m[2], asignacion: null, trabajos: [] };
      trabajo = null;
      resultado.dias.push(dia);
      continue;
    }
    if (reAsigDesc.test(linea)) {
      if (dia) dia.asignacion = { tipo: "DESC" };
      continue;
    }
    if ((m = linea.match(reAsig))) {
      if (dia)
        dia.asignacion = {
          tipo: "SERVICIO",
          codigo: m[1],
          amplitud: m[2],
          produccion: m[3],
        };
      continue;
    }
    if ((m = linea.match(reTrabajo))) {
      trabajo = { numero: Number(m[1]), inicio: m[2], fin: m[3], tareas: [] };
      if (dia) dia.trabajos.push(trabajo);
      continue;
    }
    if (reCabeceraTabla.test(linea)) continue;

    if (reRowStart.test(linea) && trabajo) {
      const c = splitRow(linea);
      const hora = c[0];
      const tarea: Tarea = {
        hora,
        rango: hora.includes(" - "),
        tipo: c[1] ?? "",
        vehiculo: c[2] && c[2] !== "-" ? c[2] : null,
        parada: c[3] ?? "",
        servicio: c[4] && c[4] !== "-" ? c[4] : null,
      };
      trabajo.tareas.push(tarea);
      continue;
    }

    // Cuerpo literal "DESC" de un día de descanso: se ignora a propósito.
    if (/^DESC$/i.test(linea)) continue;
    // Cualquier otra cosa que parezca una fila perdida se reporta, no se descarta.
    if (reRowStart.test(linea)) resultado.avisos.push(`Fila sin trabajo activo: "${linea}"`);
  }

  return resultado;
}
