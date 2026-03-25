// modules/liquidador.js

export function init(container) {
    container.innerHTML = `
        <div style="animation: fadeIn 0.5s; background: white; padding: 25px; border-radius: 15px; shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #2c3e50; border-bottom: 2px solid #1abc9c; padding-bottom: 10px;">
                Liquidador de Actos SNR
            </h2>
            <p style="color: #7f8c8d;">Ingrese el valor base para calcular el impuesto (0.5%):</p>
            
            <div style="margin-top: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: bold;">Valor del Acto ($):</label>
                <input type="number" id="valorActo" placeholder="Ej: 5000000" 
                       style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px;">
                
                <button id="btnCalcular" 
                        style="width: 100%; margin-top: 15px; padding: 12px; background: #1abc9c; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;">
                    Realizar Liquidación
                </button>
            </div>
            
            <div id="areaResultado" style="margin-top: 25px; padding: 15px; border-radius: 8px; display: none;">
                <span id="textoResultado" style="font-size: 18px; color: #2c3e50;"></span>
            </div>
        </div>
    `;

    // Lógica del botón
    const btn = document.getElementById('btnCalcular');
    btn.onclick = () => {
        const valor = document.getElementById('valorActo').value;
        const resultadoDiv = document.getElementById('areaResultado');
        const texto = document.getElementById('textoResultado');

        if (valor > 0) {
            const calculo = valor * 0.005; // 0.5% de ejemplo
            resultadoDiv.style.display = 'block';
            resultadoDiv.style.background = '#e8f8f5';
            texto.innerHTML = `<strong>Total a Liquidar:</strong> $${calculo.toLocaleString('es-CO')}`;
        } else {
            alert("Por favor, ingrese un valor mayor a cero.");
        }
    };
}