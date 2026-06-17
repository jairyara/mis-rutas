import type { Dia, Programacion, Trabajo } from "../parser/types";

function vehiculosDelTrabajo(t: Trabajo): string {
  const v = [...new Set(t.tareas.map((x) => x.vehiculo).filter(Boolean))];
  return v.join(", ");
}

function TablaTrabajo({ trabajo }: { trabajo: Trabajo }) {
  return (
    <div className="trabajo">
      <h4>
        Trabajo {trabajo.numero}{" "}
        <span className="rango-horas">
          ({trabajo.inicio} – {trabajo.fin})
        </span>
        {vehiculosDelTrabajo(trabajo) && (
          <span className="vehiculos"> · Vehículo(s): {vehiculosDelTrabajo(trabajo)}</span>
        )}
      </h4>
      <table>
        <thead>
          <tr>
            <th>Hora</th>
            <th>Tarea</th>
            <th className="col-veh">Veh.</th>
            <th>Parada inicio</th>
            <th>Servicio</th>
          </tr>
        </thead>
        <tbody>
          {trabajo.tareas.map((tarea, i) => (
            <tr key={i} className={tarea.tipo.toUpperCase() === "STANDBY" ? "standby" : ""}>
              <td className="nowrap">{tarea.hora}</td>
              <td>{tarea.tipo}</td>
              <td className="veh">{tarea.vehiculo ?? "—"}</td>
              <td>{tarea.parada}</td>
              <td>{tarea.servicio ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CardDia({ dia }: { dia: Dia }) {
  const esDesc = dia.asignacion?.tipo === "DESC";
  return (
    <section className={`dia ${esDesc ? "dia-desc" : ""}`}>
      <header className="dia-header">
        <h3>
          {dia.diaSemana} {dia.fecha}
        </h3>
        {dia.asignacion?.tipo === "DESC" && <span className="badge desc">DESCANSO</span>}
        {dia.asignacion?.tipo === "SERVICIO" && (
          <span className="badge servicio">
            {dia.asignacion.codigo} · Amplitud {dia.asignacion.amplitud} · Producción{" "}
            {dia.asignacion.produccion}
          </span>
        )}
      </header>
      {dia.trabajos.map((t) => (
        <TablaTrabajo key={t.numero} trabajo={t} />
      ))}
    </section>
  );
}

export default function VistaProgramacion({ data }: { data: Programacion }) {
  return (
    <div className="programacion">
      {data.conductor && (
        <div className="conductor">
          <strong>{data.conductor.nombre}</strong> · ID {data.conductor.id}
        </div>
      )}

      {data.dias.map((dia, i) => (
        <CardDia key={i} dia={dia} />
      ))}
    </div>
  );
}
