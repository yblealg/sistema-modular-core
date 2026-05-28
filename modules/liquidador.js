/**
 * LÓGICA DE LIQUIDACIÓN SNR - ORIP BARRANQUILLA
 * Actualizado según Resolución 1726 de 2026
 */

let listaActosAsociados = [];

// Constantes de Ley 2026
const VALOR_SIN_CUANTIA = 29500;
const VALOR_FOLIO_ADIC = 15300;
const TARIFA_MIN_CUANTIA = 53100;

/**
 * Agrega un acto a la lista aplicando la matemática del SIR
 */
function agregarActoALista() {
    const codigo = document.getElementById('txtCodigoActo').value.trim();
    const cuantiaInput = parseFloat(document.getElementById('txtCuantia').value) || 0;
    const foliosInput = parseInt(document.getElementById('txtFolios').value) || 1;
    const infoActo = DICCIONARIO_SIR[codigo];

    // Validaciones
    if (!infoActo) {
        alert("Código SIR no válido.");
        return;
    }

    let derechos = 0;
    let aplicarImpuesto = true; // Por defecto todos pagan el 2%

    // --- LÓGICA ESPECIAL PARA EL CÓDIGO 888 ---
    if (codigo === "888") {
        derechos = cuantiaInput; // Valor neto manual
        aplicarImpuesto = false; // No le sumamos el 2% de conservación
    } 
    // --- LÓGICA PARA LOS DEMÁS ACTOS ---
    else if (infoActo.tarifa === "CON CUANTIA") {
        if (cuantiaInput <= 0) {
            alert("Los actos con cuantía requieren un valor base.");
            return;
        }
        // Rangos 2026
        if (cuantiaInput <= 12852101) derechos = TARIFA_MIN_CUANTIA;
        else if (cuantiaInput <= 192778606) derechos = cuantiaInput * 0.00911;
        else if (cuantiaInput <= 334149656) derechos = cuantiaInput * 0.01131;
        else if (cuantiaInput <= 494798857) derechos = cuantiaInput * 0.01260;
        else derechos = cuantiaInput * 0.01333;
    } 
    else if (infoActo.tarifa === "ESPECIAL") {
        derechos = (cuantiaInput * 0.00911) * 0.5;
        if (derechos < 26550) derechos = 26550; 
    }
    else if (infoActo.tarifa === "SIN CUANTIA" || infoActo.tarifa === "FIJA") {
        derechos = (codigo === "12") ? 17500 : (infoActo.valor || VALOR_SIN_CUANTIA);
    }

    // 2. Cálculo de Folios Adicionales
    let vlrFolios = 0;
    if (infoActo.folios === "SI" && foliosInput > 1) {
        vlrFolios = (foliosInput - 1) * VALOR_FOLIO_ADIC;
    }

    // 3. Subtotal + Conservación Documental (Solo si aplica) + Redondeo
    let subtotal = derechos + vlrFolios;
    let totalFinal;

    if (!aplicarImpuesto || subtotal === 0) {
        totalFinal = subtotal; // El 888 pasa derecho sin sumarle nada
    } else {
        totalFinal = Math.ceil((subtotal * 1.02) / 100) * 100;
    }

    listaActosAsociados.push({
        id: Date.now(),
        codigo: codigo,
        nombre: infoActo.acto,
        cuantia: cuantiaInput,
        folios: (infoActo.folios === "SI") ? foliosInput : 1,
        total: totalFinal
    });

    limpiarCampos();
    renderizarTabla();
}

/**
 * Dibuja la tabla en el HTML
 */
function renderizarTabla() {
    const cuerpoTabla = document.getElementById('cuerpoTablaActos');
    const labelTotal = document.getElementById('totalLiquidacion');
    
    if(!cuerpoTabla) return;

    cuerpoTabla.innerHTML = "";
    let granTotal = 0;

    listaActosAsociados.forEach((acto, index) => {
        granTotal += acto.total;
        
        cuerpoTabla.innerHTML += `
            <tr>
                <td><b>${acto.codigo}</b> - ${acto.nombre}</td>
                <td>${acto.cuantia > 0 ? '$' + acto.cuantia.toLocaleString('es-CO') : 'N/A'}</td>
                <td>${acto.folios}</td>
                <td>$ ${acto.total.toLocaleString('es-CO')}</td>
                <td>
                    <button onclick="editarActo(${index})" class="btn-edit">✏️</button>
                    <button onclick="eliminarActo(${index})" class="btn-delete">🗑️</button>
                </td>
            </tr>
        `;
    });

    if(labelTotal) labelTotal.textContent = "$ " + granTotal.toLocaleString('es-CO');
}

function eliminarActo(index) {
    if(confirm("¿Eliminar este acto de la liquidación?")) {
        listaActosAsociados.splice(index, 1);
        renderizarTabla();
    }
}

function editarActo(index) {
    const acto = listaActosAsociados[index];
    document.getElementById('txtCodigoActo').value = acto.codigo;
    document.getElementById('txtCuantia').value = acto.cuantia;
    document.getElementById('txtFolios').value = acto.folios;
    
    // Disparar el evento input para actualizar el nombre del acto en la UI
    document.getElementById('txtCodigoActo').dispatchEvent(new Event('input'));
    
    listaActosAsociados.splice(index, 1);
    renderizarTabla();
}

function limpiarCampos() {
    document.getElementById('txtCodigoActo').value = "";
    document.getElementById('txtCuantia').value = "0";
    document.getElementById('txtFolios').value = "1";
    document.getElementById('lblNombreActo').textContent = "Esperando código...";
    document.getElementById('txtCodigoActo').focus();
}

/**
 * Limpia toda la liquidación actual (Botón CLS)
 */
function borrarLiquidacionTotal() {
    if (listaActosAsociados.length === 0) return;

    if (confirm("¿Está seguro de que desea borrar toda la liquidación?")) {
        listaActosAsociados = []; // Vacía el arreglo
        renderizarTabla();        // Refresca la tabla (quedará vacía)
        limpiarCampos();          // Coloca los inputs en cero y da foco al código
    }
}

function exportarPDF() {
    if (liquidacion.length === 0) {
        alert("No hay actos para exportar.");
        return;
    }

    // --- 1. GUARDAR EN BASE DE DATOS Y GENERAR RADICADO ---
    // Capturamos los datos de los inputs del HTML
    const datosTramite = {
        solicitante: document.getElementById('txtSolicitante')?.value || "NO REPORTADO",
        identificacion: document.getElementById('txtIdSolicitante')?.value || "N/A",
        matricula: document.getElementById('txtMatriculaNum')?.value || "SIN NÚMERO",
        escritura: document.getElementById('txtEscritura')?.value || "N/A",
        notaria: document.getElementById('txtNotaria')?.value || "N/A",
        actos: liquidacion,
        total: liquidacion.reduce((acc, item) => acc + item.total, 0)
    };

    // Llamamos a la función de base-datos.js para obtener el radicado
    const nuevoRadicado = guardarTramite(datosTramite);

    // --- 2. INICIAR GENERACIÓN DE PDF ---
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'letter');

    // Encabezado Institucional
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text("SUPERINTENDENCIA DE NOTARIADO Y REGISTRO", 105, 15, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text("Oficina de Registro de Instrumentos Públicos de Barranquilla", 105, 21, { align: 'center' });
    
    // Insertar el Radicado Interno (esto le da validez a tu consulta posterior)
    doc.setFont(undefined, 'bold');
    doc.text(`RADICADO INTERNO: ${nuevoRadicado}`, 105, 28, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(`Fecha de Liquidación: ${new Date().toLocaleString()}`, 200, 35, { align: 'right' });

    // Línea divisoria
    doc.setLineWidth(0.5);
    doc.line(10, 38, 200, 38);

    // --- 3. PREPARAR TABLA DE ACTOS ---
    const columnas = ["Código", "Acto / Concepto", "Base / Cuantía", "Total Item"];
    const filas = liquidacion.map(item => [
        item.cod,
        item.acto,
        item.base > 0 ? `$ ${item.base.toLocaleString('es-CO')}` : "N/A",
        `$ ${item.total.toLocaleString('es-CO')}`
    ]);

    doc.autoTable({
        startY: 45,
        head: [columnas],
        body: filas,
        theme: 'striped',
        headStyles: { fillColor: [44, 62, 80], halign: 'center' },
        styles: { fontSize: 9 },
        columnStyles: { 3: { halign: 'right' } }
    });

    // --- 4. TOTAL Y PIE DE PÁGINA ---
    const granTotal = datosTramite.total;
    const finalY = doc.lastAutoTable.finalY + 15;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL DERECHOS DE REGISTRO: $ ${granTotal.toLocaleString('es-CO')}`, 200, finalY, { align: 'right' });

    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text("Este documento es una liquidación informativa y no constituye un recibo de pago oficial.", 10, 260);
    doc.text(`Generado por: Yair B. Leal Guerra - Administrativo SNR Barranquilla`, 10, 265);

    // Guardar el archivo con el número de matrícula y el radicado
    doc.save(`Liq_${datosTramite.matricula}_${nuevoRadicado}.pdf`);
    
    alert(`Trámite guardado y PDF generado.\nRadicado: ${nuevoRadicado}`);
}

    // Crear la tabla en el PDF
    doc.autoTable({
        startY: 35,
        head: [columnas],
        body: filas,
        theme: 'striped',
        headStyles: { fillColor: [44, 62, 80] } // Azul oscuro SNR
    });

    // Total al final de la tabla
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL GENERAL: $${granTotal.toLocaleString('es-CO')}`, 200, finalY, { align: 'right' });

    // Pie de página
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text("Generado por: Sistema de Liquidación SNR - Yair B. Leal Guerra", 10, 285);

    // Descargar el archivo
    doc.save(`liquidacion_${Date.now()}.pdf`);
}


/**
 * Validación en tiempo real del Código SIR
 * Se dispara cada vez que escribes en el campo de código
 */
document.getElementById('txtCodigoActo').addEventListener('input', function() {
    const codigo = this.value.trim();
    const labelNombre = document.getElementById('lblNombreActo');
    
    // 1. Si el código existe en el DICCIONARIO_SIR
    if (DICCIONARIO_SIR[codigo]) {
        labelNombre.textContent = DICCIONARIO_SIR[codigo].acto;
        labelNombre.style.color = "#2c3e50"; // Color azul oscuro institucional
        labelNombre.style.fontWeight = "bold";
    } 
    // 2. Si el campo tiene algo pero no coincide con nada
    else if (codigo.length > 0) {
        labelNombre.textContent = "⚠️ CÓDIGO INEXISTENTE EN SIR";
        labelNombre.style.color = "#e74c3c"; // Rojo de alerta
        labelNombre.style.fontWeight = "bold";
    } 
    // 3. Si el campo está vacío
    else {
        labelNombre.textContent = "Esperando código...";
        labelNombre.style.color = "#7f8c8d"; // Gris neutro
        labelNombre.style.fontWeight = "normal";
    }
});