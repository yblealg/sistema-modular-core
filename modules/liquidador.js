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

    if (infoActo.tarifa === "CON CUANTIA" && cuantiaInput <= 0) {
        alert("Los actos con cuantía requieren un valor base.");
        return;
    }

    // 1. Cálculo de Derechos de Registro (Fórmulas progresivas 2026)
    let derechos = 0;
    if (infoActo.tarifa === "CON CUANTIA") {
        if (cuantiaInput <= 12852101) {
            derechos = TARIFA_MIN_CUANTIA;
        } else if (cuantiaInput <= 192778606) {
            derechos = cuantiaInput * 0.00911;
        } else if (cuantiaInput <= 334149656) {
            derechos = cuantiaInput * 0.01131;
        } else if (cuantiaInput <= 494798857) {
            derechos = cuantiaInput * 0.01260;
        } else {
            derechos = cuantiaInput * 0.01333;
        }
    } 
    else if (infoActo.tarifa === "ESPECIAL") { // Caso VIS
        derechos = (cuantiaInput * 0.00911) * 0.5;
        if (derechos < 26550) derechos = 26550; 
    }
    else if (infoActo.tarifa === "SIN CUANTIA" || infoActo.tarifa === "FIJA") {
        derechos = (codigo === "12") ? 17500 : VALOR_SIN_CUANTIA;
    }

    // 2. Cálculo de Folios Adicionales
    let vlrFolios = 0;
    if (infoActo.folios === "SI" && foliosInput > 1) {
        vlrFolios = (foliosInput - 1) * VALOR_FOLIO_ADIC;
    }

    // 3. Subtotal + Conservación Documental (2%) + Redondeo al centenar
    let subtotal = derechos + vlrFolios;
    let totalConImpuesto = subtotal * 1.02;
    let totalRedondeado = Math.ceil(totalConImpuesto / 100) * 100;

    // Guardar en la lista
    listaActosAsociados.push({
        id: Date.now(),
        codigo: codigo,
        nombre: infoActo.acto,
        cuantia: cuantiaInput,
        folios: (infoActo.folios === "SI") ? foliosInput : 1,
        total: totalRedondeado
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
/**
 * Borra toda la liquidación y resetea la tabla a cero
 */
function borrarLiquidacionTotal() {
    // Si no hay nada en la tabla, solo limpiamos los campos de texto
    if (listaActosAsociados.length === 0) {
        limpiarCampos();
        return;
    }

    // Confirmación para evitar borrados accidentales
    if (confirm("¿Desea borrar todos los actos cargados?")) {
        listaActosAsociados = []; // Vaciamos la lista global
        renderizarTabla();        // Refrescamos la tabla para que se vea vacía
        limpiarCampos();          // Ponemos los inputs en blanco
    }
}

/**
 * Deja los inputs listos para la siguiente liquidación
 */
function limpiarCampos() {
    document.getElementById('txtCodigoActo').value = "";
    document.getElementById('txtCuantia').value = "0";
    // Si el div de folios existe, lo reseteamos a 1
    if (document.getElementById('txtFolios')) {
        document.getElementById('txtFolios').value = "1";
    }
    document.getElementById('lblNombreActo').textContent = "Esperando código...";
    document.getElementById('txtCodigoActo').focus();
}