# Mis Turnos

App web para organizar la programación semanal de un conductor: se pega el
correo de "Hojas de trabajo" tal cual y la app lo organiza y genera una hoja
lista para imprimir (o guardar como PDF desde el navegador).

Stack: React + TypeScript + Vite. Se despliega como sitio estático / PWA.

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # build de producción (carpeta dist/)
npm run preview  # previsualizar el build
```

## Prueba del parser

`scripts/parse.mjs` valida la lógica de parseo contra una semana real:

```bash
node scripts/parse.mjs
```
