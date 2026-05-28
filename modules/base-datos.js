/**
 * SISTEMA DE PERSISTENCIA - ORIP BARRANQUILLA
 */

// Función para generar el número de radicado consecutivo
function generarRadicado() {
    const hoy = new Date().toISOString().split('T')[0].replace(/-/g, '');
    let contador = parseInt(localStorage.getItem('contador_snr')) || 1;
    
    // Formato: LR-FECHA-CONSECUTIVO (Ej: LR-20260528-001)
    const radicado = `LR-${hoy}-${String(contador).padStart(3, '0')}`;
    
    // Aumentar contador para el próximo
    localStorage.setItem('contador_snr', contador + 1);
    return radicado;
}

// Función para guardar el trámite
function guardarTramite(datos) {
    const radicado = generarRadicado();
    const paquete = {
        ...datos,
        radicado: radicado,
        fechaSistema: new Date().toLocaleString()
    };

    // Guardar en el almacenamiento del navegador (LocalStorage)
    localStorage.setItem(radicado, JSON.stringify(paquete));
    
    // También guardamos una lista de índices para el historial
    let historial = JSON.parse(localStorage.getItem('historial_snr')) || [];
    historial.push({ radicado, solicitante: datos.solicitante, total: datos.total });
    localStorage.setItem('historial_snr', JSON.stringify(historial));

    return radicado;
}