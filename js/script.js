// Variable global para almacenar los actos de la liquidación actual
let listaActosAsociados = [];

// Función para AGREGAR un acto a la tabla
function agregarActoALista() {
    const codigo = document.getElementById('txtCodigoActo').value.trim();
    const cuantiaInput = document.getElementById('txtCuantia').value;
    const infoActo = DICCIONARIO_SIR[codigo];

    // validaciones básicas
    if (!infoActo) {
        alert("Por favor ingrese un código de acto válido.");
        return;
    }

    if (infoActo.tarifa === "CON CUANTIA" && (!cuantiaInput || cuantiaInput <= 0)) {
        alert("Este acto requiere una cuantía mayor a cero.");
        return;
    }

    // Lógica de cálculo (Ejemplo base: 5x1000 para cuantía o tarifa fija)
    let valorDerechos = 0;
    const TARIFA_MINIMA_2026 = 53100; // Valor base ORIP 2026

    if (infoActo.tarifa === "CON CUANTIA") {
        // Cálculo de milaje (0.5%)
        valorDerechos = Math.max(TARIFA_MINIMA_2026, cuantiaInput * 0.005);
    } else {
        valorDerechos = TARIFA_MINIMA_2026;
    }

    // Creamos el objeto del acto
    const nuevoActo = {
        id: Date.now(), // ID único para poder editar/eliminar
        codigo: codigo,
        nombre: infoActo.acto,
        cuantia: cuantiaInput || 0,
        total: valorDerechos
    };

    // Lo guardamos en nuestra lista
    listaActosAsociados.push(nuevoActo);

    // Limpiamos campos y refrescamos la tabla
    document.getElementById('txtCodigoActo').value = "";
    document.getElementById('txtCuantia').value = "";
    document.getElementById('lblNombreActo').textContent = "Esperando código...";
    
    renderizarTabla();
}

// Función para DIBUJAR la tabla con botones de Editar y Eliminar
function renderizarTabla() {
    const cuerpoTabla = document.getElementById('cuerpoTablaActos');
    const labelTotal = document.getElementById('totalLiquidacion');
    cuerpoTabla.innerHTML = "";
    let sumaTotal = 0;

    listaActosAsociados.forEach((acto, index) => {
        sumaTotal += acto.total;
        
        const fila = `
            <tr>
                <td>${acto.codigo} - ${acto.nombre}</td>
                <td>${acto.cuantia > 0 ? '$' + Number(acto.cuantia).toLocaleString() : 'N/A'}</td>
                <td>$${acto.total.toLocaleString()}</td>
                <td>
                    <button onclick="editarActo(${index})" class="btn-edit">✏️</button>
                    <button onclick="eliminarActo(${index})" class="btn-delete">🗑️</button>
                </td>
            </tr>
        `;
        cuerpoTabla.innerHTML += fila;
    });

    labelTotal.textContent = sumaTotal.toLocaleString();
}

// Función para ELIMINAR
function eliminarActo(index) {
    if(confirm("¿Seguro que desea eliminar este acto?")) {
        listaActosAsociados.splice(index, 1);
        renderizarTabla();
    }
}

// Función para EDITAR (Modificar)
function editarActo(index) {
    const acto = listaActosAsociados[index];
    
    // Devolvemos los datos a los campos de arriba
    document.getElementById('txtCodigoActo').value = acto.codigo;
    document.getElementById('txtCuantia').value = acto.cuantia;
    
    // Eliminamos el registro viejo para que al dar "Agregar" se guarde el nuevo
    listaActosAsociados.splice(index, 1);
    renderizarTabla();
    
    // Ponemos el foco en el código para que el usuario corrija
    document.getElementById('txtCodigoActo').focus();
}