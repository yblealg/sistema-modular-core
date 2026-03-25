// shell/main.js
const modules = [
    { 
        id: 'liquidador', 
        name: 'Liquidador SNR', 
        path: '../modules/liquidador.js' 
    }
];

const menu = document.getElementById('menu');
const canvas = document.getElementById('app-canvas');

// Función para cargar módulos dinámicamente
async function loadModule(module) {
    try {
        // Importante: La ruta se resuelve desde la ubicación de este archivo JS
        const mod = await import(module.path);
        
        // Limpiamos el tablero antes de cargar el nuevo módulo
        canvas.innerHTML = ''; 
        
        // Ejecutamos la función de inicio del módulo
        mod.init(canvas);
        
    } catch (error) {
        canvas.innerHTML = `
            <div style="color: #e74c3c; padding: 20px; border: 1px solid #e74c3c; border-radius: 8px; background: #fdf2f2;">
                <h3>Error de Conexión</h3>
                <p>No se pudo cargar el componente "${module.name}".</p>
                <small>Detalle: ${error.message}</small>
            </div>
        `;
        console.error("Error cargando el módulo:", error);
    }
}

// Generar botones de menú automáticamente
modules.forEach(mod => {
    const btn = document.createElement('button');
    btn.className = 'module-btn';
    btn.innerText = mod.name;
    btn.onclick = () => loadModule(mod);
    menu.appendChild(btn);
});