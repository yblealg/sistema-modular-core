<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Liquidación Múltiple SNR - ORIP Barranquilla 2026</title>
    <style>
        :root { --primary: #27ae60; --dark: #2c3e50; --bg: #f4f7f6; }
        body { font-family: 'Segoe UI', sans-serif; margin: 0; display: flex; height: 100vh; background: var(--bg); }
        
        /* Sidebar */
        #sidebar { width: 260px; background: var(--dark); color: white; padding: 25px; flex-shrink: 0; }
        .user-info { font-size: 0.85rem; opacity: 0.9; line-height: 1.6; }
        
        /* Main Content */
        #main { flex-grow: 1; padding: 30px; overflow-y: auto; }
        .card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 20px; }
        
        /* Formulario Optimizado */
        .grid-form { display: grid; grid-template-columns: 100px 1fr 1fr 100px 150px; gap: 15px; align-items: flex-end; }
        .form-group { display: flex; flex-direction: column; }
        label { font-weight: bold; font-size: 0.75rem; margin-bottom: 5px; color: #7f8c8d; text-transform: uppercase; }
        input { padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; }
        input:focus { border-color: var(--primary); outline: none; }
        
        /* Tabla de Actos */
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { text-align: left; background: #f8f9fa; padding: 12px; border-bottom: 2px solid #eee; color: var(--dark); }
        td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
        .btn-add { background: var(--primary); color: white; border: none; padding: 11px; border-radius: 5px; cursor: pointer; font-weight: bold; }
        .btn-delete { background: #e74c3c; color: white; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; }
        .btn-edit { background: #3498db; color: white; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; margin-right: 5px; }

        /* Totales */
        .footer-liq { display: flex; justify-content: flex-end; margin-top: 20px; }
        .total-banner { background: var(--dark); color: var(--primary); padding: 15px 30px; border-radius: 8px; font-size: 24px; font-weight: bold; text-align: right; }
        .total-banner small { display: block; color: white; font-size: 12px; font-weight: normal; }
    </style>
</head>
<body>

<aside id="sidebar">
    <h2>SNR SIR</h2>
    <p>ORIP Barranquilla</p>
    <hr style="opacity: 0.2; margin: 20px 0;">
    <div class="user-info">
        <p>👤 <b>Yair B. Leal Guerra</b><br>Auxiliar Administrativo</p>
        <p>📅 <b>Res. 1726 / 2026</b><br>UVB: $12.110</p>
    </div>
</aside>

<main id="main">
    <div class="card">
        <h3 style="margin-top:0">Ingreso de Actos</h3>
        <div class="grid-form">
            <div class="form-group">
                <label>Código</label>
                <input type="number" id="txtCodigoActo" placeholder="Ej: 1" autofocus>
            </div>
            <div class="form-group">
                <label>Nombre del Acto</label>
                <input type="text" id="lblNombreActo" disabled placeholder="---">
            </div>
            <div class="form-group" id="divCuantia" style="visibility: hidden;">
                <label>Cuantía (Base)</label>
                <input type="number" id="txtCuantia" value="0">
            </div>
            <div class="form-group" id="divFolios" style="display: none;">
                <label>Folios</label>
                <input type="number" id="txtFolios" value="1" min="1">
            </div>
            <button class="btn-add" onclick="agregarActoALista()">+ AGREGAR</button>
        </div>
    </div>

    <div class="card">
        <h3>Resumen de Escritura / Trámite</h3>
        <table>
            <thead>
                <tr>
                    <th>Acto Registral</th>
                    <th>Cuantía</th>
                    <th>Folios</th>
                    <th>Valor (Inc. 2%)</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody id="cuerpoTablaActos">
                </tbody>
        </table>

        <div class="footer-liq">
            <div class="total-banner">
                <small>TOTAL A PAGAR (REDONDEADO)</small>
                <span id="totalLiquidacion">$ 0</span>
            </div>
        </div>
    </div>
</main>

<script>
    // Diccionario Completo abreviado para el ejemplo (Asegúrate de tener el tuyo completo)
    const DICCIONARIO_SIR = {
        "1": { acto: "VENTA", tarifa: "CON CUANTIA", folios: "NO" },
        "2": { acto: "HIPOTECA", tarifa: "CON CUANTIA", folios: "NO" },
        "7": { acto: "DIVISION MATERIAL", tarifa: "SIN CUANTIA", folios: "SI" },
        "8": { acto: "CANCELACION HIPOTECA", tarifa: "SIN CUANTIA", folios: "SI" },
        "12": { acto: "REPRODUCCION CONSTANCIA", tarifa: "FIJA", folios: "NO" },
        "18": { acto: "AFECTACION VIVIENDA FAMILIAR", tarifa: "SIN CUANTIA", folios: "SI" },
        "38": { acto: "VIVIENDA DE INTERES SOCIAL", tarifa: "ESPECIAL", folios: "NO" }
        // Agrega aquí los demás 1000+ códigos
    };

    let listaActosAsociados = [];

    // Listener para buscar el nombre al escribir el código
    document.getElementById('txtCodigoActo').addEventListener('input', function() {
        const info = DICCIONARIO_SIR[this.value];
        const lbl = document.getElementById('lblNombreActo');
        const dCuantia = document.getElementById('divCuantia');
        const dFolios = document.getElementById('divFolios');

        if(info) {
            lbl.value = info.acto;
            dCuantia.style.visibility = (info.tarifa === "CON CUANTIA" || info.tarifa === "ESPECIAL") ? "visible" : "hidden";
            dFolios.style.display = (info.folios === "SI") ? "flex" : "none";
        } else {
            lbl.value = "";
        }
    });

    function agregarActoALista() {
        const codigo = document.getElementById('txtCodigoActo').value;
        const cuantia = parseFloat(document.getElementById('txtCuantia').value) || 0;
        const folios = parseInt(document.getElementById('txtFolios').value) || 1;
        const info = DICCIONARIO_SIR[codigo];

        if (!info) return alert("Código no válido");

        // LÓGICA DE CÁLCULO 2026
        let derechos = 0;
        let vlrFolios = 0;

        if (info.tarifa === "CON CUANTIA") {
            if (cuantia <= 12852101) derechos = 53100;
            else if (cuantia <= 192778606) derechos = cuantia * 0.00911;
            else if (cuantia <= 334149656) derechos = cuantia * 0.01131;
            else derechos = cuantia * 0.01333;
        } 
        else if (info.tarifa === "SIN CUANTIA") {
            derechos = 29500;
            if (info.folios === "SI" && folios > 1) vlrFolios = (folios - 1) * 15300;
        }
        else if (info.tarifa === "ESPECIAL") { // Caso VIS
            derechos = (cuantia * 0.00911) * 0.5;
        }
        else if (info.tarifa === "FIJA") {
            derechos = (codigo === "12") ? 17500 : 29500;
        }

        let subtotal = derechos + vlrFolios;
        let conservacion = subtotal * 0.02;
        let totalActo = Math.ceil((subtotal + conservacion) / 100) * 100;

        listaActosAsociados.push({
            id: Date.now(),
            codigo,
            nombre: info.acto,
            cuantia,
            folios: (info.folios === "SI") ? folios : 1,
            total: totalActo
        });

        resetCampos();
        renderizarTabla();
    }

    function renderizarTabla() {
        const cuerpo = document.getElementById('cuerpoTablaActos');
        const totalLbl = document.getElementById('totalLiquidacion');
        cuerpo.innerHTML = "";
        let suma = 0;

        listaActosAsociados.forEach((item, index) => {
            suma += item.total;
            cuerpo.innerHTML += `
                <tr>
                    <td><b>${item.codigo}</b> - ${item.nombre}</td>
                    <td>${item.cuantia > 0 ? '$' + item.cuantia.toLocaleString() : 'N/A'}</td>
                    <td>${item.folios}</td>
                    <td><b>$ ${item.total.toLocaleString()}</b></td>
                    <td>
                        <button class="btn-edit" onclick="editarActo(${index})">✏️</button>
                        <button class="btn-delete" onclick="eliminarActo(${index})">🗑️</button>
                    </td>
                </tr>`;
        });
        totalLbl.textContent = "$ " + suma.toLocaleString();
    }

    function eliminarActo(index) {
        listaActosAsociados.splice(index, 1);
        renderizarTabla();
    }

    function editarActo(index) {
        const item = listaActosAsociados[index];
        document.getElementById('txtCodigoActo').value = item.codigo;
        document.getElementById('txtCuantia').value = item.cuantia;
        document.getElementById('txtFolios').value = item.folios;
        document.getElementById('txtCodigoActo').dispatchEvent(new Event('input'));
        listaActosAsociados.splice(index, 1);
        renderizarTabla();
    }

    function resetCampos() {
        document.getElementById('txtCodigoActo').value = "";
        document.getElementById('txtCuantia').value = "0";
        document.getElementById('txtFolios').value = "1";
        document.getElementById('lblNombreActo').value = "";
        document.getElementById('txtCodigoActo').focus();
    }
</script>
</body>
</html>