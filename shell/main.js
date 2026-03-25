// shell/main.js
const modules = [
    { id: 'liquidador', name: 'Liquidador SNR', path: '../modules/liquidador.js' }
];

const menu = document.getElementById('menu');
const canvas = document.getElementById('app-canvas');

async function loadModule(module) {
    try {
        const mod = await import(module.path);
        mod.init(canvas);
    } catch (error) {
        canvas.innerHTML = `<h3>Error</h3><p>No se pudo cargar el módulo. Revisa la consola.</p>`;
        console.error(error);
    }
}

// Esta es la parte que "dibuja" los botones en el Menú SNR
modules.forEach(mod => {
    const btn = document.createElement('button');
    btn.className = 'module-btn';
    btn.innerText = mod.name;
    btn.onclick = () => loadModule(mod);
    menu.appendChild(btn);
});