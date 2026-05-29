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
    try {
        const radicado = generarRadicado();
        
        // Verificación de seguridad: si no hay datos, crear un paquete vacío
        const paquete = {
            solicitante: datos?.solicitante || "ANÓNIMO",
            total: datos?.total || 0,
            radicado: radicado,
            fechaSistema: new Date().toLocaleString(),
            ...datos
        };

        localStorage.setItem(radicado, JSON.stringify(paquete));
        
        let historial = JSON.parse(localStorage.getItem('historial_snr')) || [];
        historial.push({ radicado, solicitante: paquete.solicitante, total: paquete.total });
        localStorage.setItem('historial_snr', JSON.stringify(historial));

        return radicado;
    } catch (e) {
        console.error("Error crítico en base-datos.js:", e);
        // Si todo falla, devolvemos un radicado de emergencia para que el PDF NO se detenga
        return "ERROR-" + Math.floor(Math.random() * 1000);
    }
}