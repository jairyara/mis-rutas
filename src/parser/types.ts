export interface Conductor {
  id: string;
  nombre: string;
}

export type Asignacion =
  | { tipo: "DESC" }
  | { tipo: "SERVICIO"; codigo: string; amplitud: string; produccion: string };

export interface Tarea {
  /** Hora de inicio "HH:MM:SS", o un rango "HH:MM:SS - HH:MM:SS" en la fila final. */
  hora: string;
  /** true si `hora` es un rango (fila "Fin de relevo"). */
  rango: boolean;
  tipo: string;
  /** Número corto del vehículo (1-10) o null si no aplica. */
  vehiculo: string | null;
  parada: string;
  /** Código de servicio del vehículo (KE...) o null. */
  servicio: string | null;
}

export interface Trabajo {
  numero: number;
  inicio: string;
  fin: string;
  tareas: Tarea[];
}

export interface Dia {
  diaSemana: string;
  fecha: string;
  asignacion: Asignacion | null;
  trabajos: Trabajo[];
}

export interface Programacion {
  conductor: Conductor | null;
  dias: Dia[];
  /** Líneas que el parser no entendió: se muestran para no perder datos en silencio. */
  avisos: string[];
}
