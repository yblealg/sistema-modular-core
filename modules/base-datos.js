console.log("✅ base-datos.js cargado correctamente");

function generarRadicado() {
    const hoy = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const contador = Math.floor(Math.random() * 1000); 
    return `LR-${hoy}-${contador}`;
}

function guardarTramite(datos) {
    console.log("Intentando guardar datos:", datos);
    const radicado = generarRadicado();
    return radicado;
}