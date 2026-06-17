// Prueba de concepto del parser de "Hojas de trabajo".
// Logica pura, sin dependencias. Ejecutar: node scripts/parse.mjs
//
// Objetivo: demostrar que el correo (texto pegado) se puede convertir
// de forma confiable en una estructura que luego se imprime.

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

// Una fila se parte por TAB o por 2+ espacios (asi sobrevive a single-spaces
// internos como "Inicio servicio" o "R1_RUTA_DEMO_NM_ (1001)").
function splitRow(line) {
  return line
    .split(/\t|\s{2,}/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function parse(texto) {
  const lineas = texto.split(/\r?\n/).map((l) => l.trim());
  const resultado = { conductor: null, dias: [], avisos: [] };
  let dia = null;
  let trabajo = null;

  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i];
    if (!linea) continue;

    if (!resultado.conductor) {
      const m = linea.match(reHeaderDriver);
      if (m) {
        resultado.conductor = { id: m[1], nombre: m[2].trim() };
        continue;
      }
    }

    let m;
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
      if (dia) dia.asignacion = { tipo: "SERVICIO", codigo: m[1], amplitud: m[2], produccion: m[3] };
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
      // Fila normal: [hora, tipo, vehiculo, parada, servicio]
      // Fila final:  ["HH:MM:SS - HH:MM:SS", "Fin de relevo", ...]
      const hora = c[0];
      const tarea = {
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

    // Linea de cuerpo de DESC (literalmente "DESC") u otra: ignorar salvo que
    // parezca una fila perdida.
    if (/^DESC$/i.test(linea)) continue;
    if (reRowStart.test(linea)) resultado.avisos.push(`Fila sin trabajo activo: "${linea}"`);
  }
  return resultado;
}

// --------- Prueba contra datos reales (incluye DESC, 2 trabajos, standby, fin de relevo) ---------
const muestra = `100245 - CONDUCTOR DE PRUEBA

FECHA: Lunes 06/04/2026
ASIGNACION: DESC
DESC

FECHA: Martes 07/04/2026
ASIGNACION: DESC
DESC

FECHA: Miércoles 08/04/2026
ASIGNACION: KE900101 AMPLITUD: 09:45:30 PRODUCCION: 08:50:00
Trabajo 1 (03:30:30 - 09:06:45)
Hora Inicio    Tipo de tarea    Vehículo    Parada inicio    Servicio Vehículo
03:30:30    Inicio servicio    -    PATIO DEMO SUR    -
03:35:30    Vacío    2    PATIO DEMO SUR    KE9990002
03:40:30    R1_RUTA_DEMO_NM_ (1001)    2    ESTACIÓN CENTRAL_R1    KE9990002
04:06:00    STANDBY    -    ESTACIÓN CENTRAL_R1    -
09:05:45 - 09:06:45    Fin de relevo    -    ESTACIÓN CENTRAL_R1    -
Trabajo 2 (10:02:15 - 13:16:00)
Hora Inicio    Tipo de tarea    Vehículo    Parada inicio    Servicio Vehículo
10:02:15    Relevo    -    ESTACIÓN CENTRAL_R1    -
10:05:15    R1_RUTA_DEMO_NM_ (1001)    5    ESTACIÓN CENTRAL_R1    KE9990005
13:15:00 - 13:16:00    Fin de relevo    -    ESTACIÓN CENTRAL_R1    -`;

const r = parse(muestra);
console.log("Conductor:", r.conductor);
console.log("Dias parseados:", r.dias.length);
for (const d of r.dias) {
  const a =
    d.asignacion?.tipo === "DESC"
      ? "DESC"
      : `${d.asignacion?.codigo} (amp ${d.asignacion?.amplitud})`;
  console.log(`  ${d.diaSemana} ${d.fecha} -> ${a}, trabajos: ${d.trabajos.length}`);
  for (const t of d.trabajos) {
    const vehs = [...new Set(t.tareas.map((x) => x.vehiculo).filter(Boolean))].join(",");
    console.log(`     Trabajo ${t.numero} ${t.inicio}-${t.fin} | ${t.tareas.length} tareas | vehiculos: ${vehs || "-"}`);
  }
}
console.log("Avisos:", r.avisos.length ? r.avisos : "ninguno");
