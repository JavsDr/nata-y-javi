// Recibe las confirmaciones y regalos del sitio y los guarda en esta planilla.
// Instalación: Extensiones → Apps Script → pegar este código → Implementar → Nueva implementación
// (tipo "Aplicación web", ejecutar como "Yo", acceso "Cualquier persona").

const HOJAS = {
  rsvp: { nombre: "Confirmaciones", cols: ["Fecha", "Nombre", "¿Va?", "Adultos", "Niños", "Restricción comida", "Canción", "Mensaje"] },
  regalo: { nombre: "Regalos", cols: ["Fecha", "Nombre", "Regalos", "Total (CLP)", "Mensaje"] },
};

function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  const tipo = d.tipo === "regalo" ? "regalo" : "rsvp";
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = ss.getSheetByName(HOJAS[tipo].nombre);
  if (!hoja) {
    hoja = ss.insertSheet(HOJAS[tipo].nombre);
    hoja.appendRow(HOJAS[tipo].cols);
    hoja.setFrozenRows(1);
    hoja.getRange(1, 1, 1, HOJAS[tipo].cols.length).setFontWeight("bold");
  }
  const fila = tipo === "rsvp"
    ? [new Date(), d.nombre, d.va ? "Sí" : "No", d.adultos, d.ninos, d.comida, d.cancion, d.mensaje]
    : [new Date(), d.nombre, d.regalos, d.total, d.mensaje];
  // evita que un texto que empiece con "=" se interprete como fórmula
  hoja.appendRow(fila.map(v => typeof v === "string" && /^[=+\-@]/.test(v) ? "'" + v : v));
  return ContentService.createTextOutput("ok");
}
