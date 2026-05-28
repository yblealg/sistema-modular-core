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
    const codigoInput = document.getElementById('txtCodigoActo');
    const codigo = codigoInput.value.trim();
    const cuantiaInput = parseFloat(document.getElementById('txtCuantia').value) || 0;
    const foliosInput = parseInt(document.getElementById('txtFolios').value) || 1;
    
    if (typeof DICCIONARIO_SIR === 'undefined') {
        alert("Error: Diccionario SIR no cargado.");
        return;
    }

    const infoActo = DICCIONARIO_SIR[codigo];

    if (!infoActo) {
        alert("Código SIR no válido.");
        return;
    }

    let derechos = 0;
    let aplicarImpuesto = true; 

    if (codigo === "888") {
        derechos = cuantiaInput;
        aplicarImpuesto = false; 
    } 
    else if (infoActo.tarifa === "CON CUANTIA") {
        if (cuantiaInput <= 0) {
            alert("Los actos con cuantía requieren un valor base.");
            return;
        }
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

    let vlrFolios = (infoActo.folios === "SI" && foliosInput > 1) ? (foliosInput - 1) * VALOR_FOLIO_ADIC : 0;
    let subtotal = derechos + vlrFolios;
    let totalFinal = (!aplicarImpuesto || subtotal === 0) ? subtotal : Math.ceil((subtotal * 1.02) / 100) * 100;

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
    if(confirm("¿Eliminar este acto?")) {
        listaActosAsociados.splice(index, 1);
        renderizarTabla();
    }
}

function editarActo(index) {
    const acto = listaActosAsociados[index];
    document.getElementById('txtCodigoActo').value = acto.codigo;
    document.getElementById('txtCuantia').value = acto.cuantia;
    document.getElementById('txtFolios').value = acto.folios;
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

function borrarLiquidacionTotal() {
    if (listaActosAsociados.length > 0 && confirm("¿Borrar toda la liquidación?")) {
        listaActosAsociados = [];
        renderizarTabla();
        limpiarCampos();
    }
}

/**
 * FUNCIÓN EXPORTAR PDF UNIFICADA Y CORREGIDA
 */
function exportarPDF() {
    if (listaActosAsociados.length === 0) {
        alert("No hay actos para exportar.");
        return;
    }

    // 1. Guardar en Base de Datos
    const datosTramite = {
        solicitante: document.getElementById('txtSolicitante')?.value.toUpperCase() || "NO REPORTADO",
        identificacion: document.getElementById('txtIdSolicitante')?.value || "N/A",
        matricula: document.getElementById('txtMatriculaNum')?.value || "000",
        escritura: document.getElementById('txtEscritura')?.value || "N/A",
        notaria: document.getElementById('txtNotaria')?.value || "N/A",
        actos: listaActosAsociados,
        total: listaActosAsociados.reduce((acc, item) => acc + item.total, 0)
    };

    let nuevoRadicado = "N/A";
    if (typeof guardarTramite === 'function') {
        nuevoRadicado = guardarTramite(datosTramite);
    }

    // 2. Generar PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'letter');

    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text("SUPERINTENDENCIA DE NOTARIADO Y REGISTRO", 105, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text("ORIP Barranquilla - Liquidación de Derechos de Registro", 105, 21, { align: 'center' });
    doc.text(`RADICADO: ${nuevoRadicado} | Fecha: ${new Date().toLocaleString()}`, 105, 27, { align: 'center' });

    const columnas = ["Código", "Acto / Concepto", "Base / Cuantía", "Total Item"];
    const filas = listaActosAsociados.map(item => [
        item.codigo,
        item.nombre,
        item.cuantia > 0 ? `$ ${item.cuantia.toLocaleString('es-CO')}` : "N/A",
        `$ ${item.total.toLocaleString('es-CO')}`
    ]);

    doc.autoTable({
        startY: 35,
        head: [columnas],
        body: filas,
        theme: 'striped',
        headStyles: { fillColor: [44, 62, 80], halign: 'center' },
        columnStyles: { 3: { halign: 'right' } }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL A PAGAR: $ ${datosTramite.total.toLocaleString('es-CO')}`, 200, finalY, { align: 'right' });

    doc.save(`Liq_${datosTramite.matricula}_${nuevoRadicado}.pdf`);
    alert(`Guardado con éxito. Radicado: ${nuevoRadicado}`);
}

// Validación en tiempo real
document.getElementById('txtCodigoActo').addEventListener('input', function() {
    const codigo = this.value.trim();
    const labelNombre = document.getElementById('lblNombreActo');
    if (typeof DICCIONARIO_SIR !== 'undefined' && DICCIONARIO_SIR[codigo]) {
        labelNombre.textContent = DICCIONARIO_SIR[codigo].acto;
        labelNombre.style.color = "#2c3e50";
    } else if (codigo.length > 0) {
        labelNombre.textContent = "⚠️ CÓDIGO NO REGISTRADO";
        labelNombre.style.color = "#e74c3c";
    } else {
        labelNombre.textContent = "Esperando código...";
        labelNombre.style.color = "#7f8c8d";
    }
});