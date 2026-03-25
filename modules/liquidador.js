// modules/liquidador.js

export function init(container) {
    // 1. CARGAR O INICIALIZAR EL CONTADOR DE TURNOS
    let ultimoTurno = localStorage.getItem('ultimo_turno_snr') || "00000";
    let siguienteCorrelativo = (parseInt(ultimoTurno) + 1).toString().padStart(5, '0');
    let prefijoTurno = `2026-040-6-${siguienteCorrelativo}`;

    container.innerHTML = `
        <div class="liquidador-container" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; animation: fadeIn 0.4s ease;">
            <div style="background: #2c3e50; color: white; padding: 15px; border-radius: 8px 8px 0 0; display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin:0; font-size: 1.2rem;">🚀 Liquidador Experto SNR - Barranquilla</h2>
                <span id="reloj" style="font-family: monospace; background: #34495e; padding: 5px 10px; border-radius: 4px;"></span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 20px; background: #fff; border: 1px solid #ddd; border-top: none;">
                <div style="border-right: 1px solid #eee; padding-right: 20px;">
                    <label><b>Próximo Turno:</b></label>
                    <input type="text" id="turnoDisplay" value="${prefijoTurno}" disabled style="width:100%; padding:10px; margin-bottom:15px; background:#f9f9f9; border:1px solid #ccc; font-weight:bold; color:#d35400;">

                    <label><b>Valor del Acto (Contrato):</b></label>
                    <input type="number" id="valActo" placeholder="$ 0" style="width:100%; padding:10px; margin-bottom:15px; border:1px solid #1abc9c;">

                    <label><b>Avalúo Catastral:</b></label>
                    <input type="number" id="valAvaluo" placeholder="$ 0" style="width:100%; padding:10px; margin-bottom:15px; border:1px solid #1abc9c;">
                    
                    <label><b>Nivel de Cobro (Tarifa):</b></label>
                    <select id="tarifaTipo" style="width:100%; padding:10px; margin-bottom:15px;">
                        <option value="NORMAL">Tarifa Plena (Normal)</option>
                        <option value="VIS">Interés Social (VIS)</option>
                        <option value="VIP">Interés Prioritario (VIP/Exento)</option>
                    </select>
                </div>

                <div id="panelCalculo" style="background: #f4f7f6; padding: 15px; border-radius: 8px; border-left: 5px solid #2ecc71;">
                    <h3 style="margin-top:0;">Previsualización:</h3>
                    <p>Base Gravable: <b id="resBase">$ 0</b></p>
                    <p>Rango Detectado: <span id="resRango">-</span></p>
                    <hr>
                    <p>Derechos Base: <b id="resDer">$ 0</b></p>
                    <p>Conservación (2%): <b id="resCons">$ 0</b></p>
                    <div style="font-size: 1.5rem; color: #27ae60; margin-top: 10px;">
                        TOTAL: <b id="resTotal">$ 0</b>
                    </div>
                    <button id="btnGrabar" style="width:100%; margin-top:20px; padding:15px; background:#27ae60; color:white; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">
                        💾 GRABAR Y GENERAR TURNO
                    </button>
                </div>
            </div>

            <div style="margin-top:20px;">
                <h3>Historial de Turnos Grabados (2026)</h3>
                <div id="historialContainer" style="max-height: 300px; overflow-y: auto; border: 1px solid #ddd;">
                    <table style="width:100%; border-collapse:collapse; background:white;">
                        <thead style="background:#ecf0f1; position: sticky; top: 0;">
                            <tr>
                                <th style="padding:10px; border:1px solid #ddd;">Turno</th>
                                <th style="padding:10px; border:1px solid #ddd;">Base</th>
                                <th style="padding:10px; border:1px solid #ddd;">Total</th>
                                <th style="padding:10px; border:1px solid #ddd;">Acción</th>
                            </tr>
                        </thead>
                        <tbody id="tablaCuerpo"></tbody>
                    </table>
                </div>
                <button id="btnExportarExcel" style="margin-top:10px; padding:8px 15px; background:#34495e; color:white; border:none; cursor:pointer;">📥 Descargar Excel</button>
            </div>
        </div>
    `;

    // --- LÓGICA DE CÁLCULO ---
    const inputs = ['valActo', 'valAvaluo', 'tarifaTipo'];
    inputs.forEach(id => document.getElementById(id).addEventListener('input', calcular));

    function calcular() {
        let acto = parseFloat(document.getElementById('valActo').value) || 0;
        let avaluo = parseFloat(document.getElementById('valAvaluo').value) || 0;
        let tipo = document.getElementById('tarifaTipo').value;
        
        // Regla Art. 5: El mayor entre los dos
        let base = Math.max(acto, avaluo);
        let derechos = 0;
        let rangoText = "Rango 1";

        if (tipo === "NORMAL") {
            if (base <= 12852101) {
                derechos = 53100;
                rangoText = "Rango 1 (Fijo)";
            } else if (base <= 192778606) {
                derechos = base * 0.00911;
                rangoText = "Rango 2 (9.11/1000)";
            } else if (base <= 334149656) {
                derechos = base * 0.01131;
                rangoText = "Rango 3 (11.31/1000)";
            } else if (base <= 494798857) {
                derechos = base * 0.01260;
                rangoText = "Rango 4 (12.60/1000)";
            } else {
                derechos = base * 0.01333;
                rangoText = "Rango 5 (13.33/1000)";
            }
        } else if (tipo === "VIS") {
            derechos = base * 0.005; // Tarifa VIS ejemplo
            rangoText = "Tarifa Especial VIS";
        } else {
            derechos = 0;
            rangoText = "Exento / VIP";
        }

        let conservacion = derechos * 0.02;
        let total = derechos + conservacion;

        // Mostrar en pantalla
        document.getElementById('resBase').innerText = `$ ${base.toLocaleString('es-CO')}`;
        document.getElementById('resRango').innerText = rangoText;
        document.getElementById('resDer').innerText = `$ ${Math.round(derechos).toLocaleString('es-CO')}`;
        document.getElementById('resCons').innerText = `$ ${Math.round(conservacion).toLocaleString('es-CO')}`;
        document.getElementById('resTotal').innerText = `$ ${Math.round(total).toLocaleString('es-CO')}`;

        return { turno: prefijoTurno, base, total, derechos, conservacion };
    }

    // --- GRABAR EN HISTORIAL ---
    document.getElementById('btnGrabar').onclick = () => {
        const datos = calcular();
        if (datos.base === 0) return alert("Ingrese valores para liquidar.");

        let historial = JSON.parse(localStorage.getItem('historial_liquidaciones') || "[]");
        historial.unshift({
            turno: prefijoTurno,
            fecha: new Date().toLocaleString(),
            base: datos.base,
            total: datos.total
        });

        localStorage.setItem('historial_liquidaciones', JSON.stringify(historial));
        localStorage.setItem('ultimo_turno_snr', siguienteCorrelativo);
        
        alert(`Turno ${prefijoTurno} grabado con éxito.`);
        location.reload(); // Para actualizar contador y tabla
    };

    // --- RENDERIZAR TABLA ---
    const cargarTabla = () => {
        let historial = JSON.parse(localStorage.getItem('historial_liquidaciones') || "[]");
        const cuerpo = document.getElementById('tablaCuerpo');
        cuerpo.innerHTML = historial.map(reg => `
            <tr>
                <td style="padding:8px; border:1px solid #ddd; font-family:monospace;">${reg.turno}</td>
                <td style="padding:8px; border:1px solid #ddd;">$${reg.base.toLocaleString()}</td>
                <td style="padding:8px; border:1px solid #ddd; font-weight:bold;">$${Math.round(reg.total).toLocaleString()}</td>
                <td style="padding:8px; border:1px solid #ddd; text-align:center;">
                    <button onclick="window.print()" style="cursor:pointer;">🖨️ PDF</button>
                </td>
            </tr>
        `).join('');
    };

    cargarTabla();
    
    // Reloj
    setInterval(() => {
        document.getElementById('reloj').innerText = new Date().toLocaleTimeString();
    }, 1000);
}