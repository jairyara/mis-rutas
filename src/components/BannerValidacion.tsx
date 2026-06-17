import type { Validacion } from "../parser/validar";

const ICONO: Record<Validacion["nivel"], string> = {
  ok: "✓",
  aviso: "⚠",
  error: "✕",
};

export default function BannerValidacion({ validacion }: { validacion: Validacion }) {
  const { nivel, titulo, detalles, lineas } = validacion;
  return (
    <div className={`banner banner-${nivel} no-print`} role="status">
      <div className="banner-titulo">
        <span className="banner-icono">{ICONO[nivel]}</span>
        {titulo}
      </div>
      {detalles.length > 0 && (
        <ul className="banner-detalles">
          {detalles.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      )}
      {lineas.length > 0 && (
        <details className="banner-lineas">
          <summary>Ver líneas que no se entendieron</summary>
          <ul>
            {lineas.map((l, i) => (
              <li key={i}>
                <code>{l}</code>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
