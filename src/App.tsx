import { useMemo, useState } from "react";
import { parse } from "./parser/parse";
import { validar } from "./parser/validar";
import VistaProgramacion from "./components/VistaProgramacion";
import BannerValidacion from "./components/BannerValidacion";
import "./App.css";

const EJEMPLO_URL = `${import.meta.env.BASE_URL}ejemplo-correo.txt`;

function App() {
  const [texto, setTexto] = useState("");

  const data = useMemo(() => (texto.trim() ? parse(texto) : null), [texto]);
  const validacion = useMemo(() => (data ? validar(data) : null), [data]);
  const hayDatos = !!data && data.dias.length > 0;

  async function cargarEjemplo() {
    try {
      const res = await fetch(EJEMPLO_URL);
      setTexto(await res.text());
    } catch {
      alert("No se pudo cargar el ejemplo. Intenta descargarlo y pegarlo a mano.");
    }
  }

  return (
    <main className="container">
      <div className="no-print">
        <h1>Mis Turnos</h1>

        <p className="instruccion">Pega aquí el correo de programación de la semana.</p>
        <p className="ayuda-ejemplo">
          ¿No tienes un correo a mano?{" "}
          <button type="button" className="enlace" onClick={cargarEjemplo}>
            Cargar ejemplo
          </button>{" "}
          o{" "}
          <a href={EJEMPLO_URL} download>
            descargar el .txt
          </a>{" "}
          <span className="nota-ejemplo">(datos ficticios)</span>
        </p>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.currentTarget.value)}
          placeholder="Pega el mensaje completo del correo..."
          rows={10}
        />
        <div className="acciones">
          {hayDatos && (
            <button className="btn-imprimir" onClick={() => window.print()}>
              Imprimir / Guardar PDF
            </button>
          )}
          {texto && <button onClick={() => setTexto("")}>Limpiar</button>}
        </div>

        {validacion && <BannerValidacion validacion={validacion} />}
      </div>

      {hayDatos && <VistaProgramacion data={data} />}
    </main>
  );
}

export default App;
