// modules/peticiones.js

export function init(container) {
    container.innerHTML = `
        <div class="welcome-card" style="animation: fadeIn 0.5s ease;">
            <h2 style="color: #2c3e50; border-bottom: 2px solid #1abc9c; padding-bottom: 10px;">
                📝 Gestor de Peticiones - SNR
            </h2>
            <p>Generación automática de respuestas basadas en normatividad vigente.</p>
            
            <div style="background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                <label><b>Tipo de Trámite:</b></label>
                <select id="tipoPeticion" style="width: 100%; padding: 12px; margin: 10px 0 20px 0; border: 1px solid #ccc; border-radius: 5px;">
                    <option value="">-- Seleccione una opción --</option>
                    <option value="gravamen">Levantamiento de Gravamen (Dto 184/2008 - Atlántico)</option>
                    <option value="error_sujeto">Corrección de Identidad / Sujeto</option>
                    <option value="despacho">Respuesta a Despacho Judicial</option>
                </select>

                <div id="camposDinamicos" style="display:none;">
                    <input type="text" id="nombreUsuario" placeholder="Nombre completo del solicitante" style="width: 96%; padding: 10px; margin-bottom: 10px; border: 1px solid #ddd;">
                    <input type="text" id="numeroTurno" placeholder="Número de Turno / Radicado" style="width: 96%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd;">
                    
                    <button id="btnGenerar" style="width: 100%; padding: 12px; background: #1abc9c; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
                        GENERAR TEXTO DE RESPUESTA
                    </button>
                </div>
            </div>

            <div id="resultadoBusqueda" style="display:none; margin-top:25px;">
                <h3>Borrador Sugerido:</h3>
                <div id="textoRespuesta" style="background: #f4f7f6; padding: 20px; border-left: 5px solid #34495e; white-space: pre-wrap; font-family: 'Courier New', Courier, monospace; color: #333;">
                </div>
                <button id="btnCopiar" style="margin-top:10px; padding: 8px 15px; background: #34495e; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    📋 Copiar al Portapapeles
                </button>
            </div>
        </div>
    `;

    // Lógica del módulo
    const select = document.getElementById('tipoPeticion');
    const campos = document.getElementById('camposDinamicos');
    const btnGen = document.getElementById('btnGenerar');
    const resDiv = document.getElementById('resultadoBusqueda');
    const textoRes = document.getElementById('textoRespuesta');

    select.onchange = () => {
        campos.style.display = select.value ? 'block' : 'none';
        resDiv.style.display = 'none';
    };

    btnGen.onclick = () => {
        const nombre = document.getElementById('nombreUsuario').value;
        const turno = document.getElementById('numeroTurno').value;
        const tipo = select.value;

        if (!nombre || !turno) {
            alert("Por favor, llena el nombre y el turno.");
            return;
        }

        let plantilla = "";

        if (tipo === "gravamen") {
            plantilla = `BARRANQUILLA, ATLÁNTICO.\n\nSeñor(a): ${nombre.toUpperCase()}\nReferencia: Respuesta a Turno No. ${turno}\n\nEn atención a su solicitud de levantamiento de gravamen, esta oficina procede a informar que, revisado el folio de matrícula inmobiliaria y conforme a lo estipulado en el DECRETO 184 DE 2008 (Gobernación del Atlántico), se ha verificado el cumplimiento de los requisitos legales para la cancelación de la medida cautelar...`;
        } else if (tipo === "error_sujeto") {
            plantilla = `BARRANQUILLA, ATLÁNTICO.\n\nAsunto: Corrección de datos - Turno ${turno}\n\nSe procede a realizar la corrección en el sistema registral respecto a la identidad del sujeto ${nombre}, verificando la documentación aportada y procediendo a la actualización en la base de datos del SIR...`;
        } else {
            plantilla = `Respuesta generada para el turno ${turno} a nombre de ${nombre}.`;
        }

        textoRes.innerText = plantilla;
        resDiv.style.display = 'block';
    };

    document.getElementById('btnCopiar').onclick = () => {
        navigator.clipboard.writeText(textoRes.innerText);
        alert("¡Texto copiado!");
    };
}