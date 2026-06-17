import { useMemo, useState } from "react";
import { parse } from "./parser/parse";
import VistaProgramacion from "./components/VistaProgramacion";
import "./App.css";

function App() {
  const [texto, setTexto] = useState("");

  const data = useMemo(() => (texto.trim() ? parse(texto) : null), [texto]);
  const hayDatos = data && data.dias.length > 0;

  return (
    <main className="container">
      <div className="no-print">
        <h1>Mis Turnos</h1>

        <p className="instruccion">Pega aquí el correo de programación de la semana.</p>
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
      </div>

      {hayDatos && <VistaProgramacion data={data} />}
    </main>
  );
}

export default App;
