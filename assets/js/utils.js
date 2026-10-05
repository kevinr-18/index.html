/**
 * utils.js - Utilidades transversales y funciones auxiliares
 * Club Deportivo Amazonas (Malchinguí, Ecuador)
 */

// 1. Sanitizador global seguro contra inyecciones XSS
function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function sanitizarHTML(str) {
    return escapeHTML(str);
}

// 2. Resolución universal e inteligente de imágenes: Google Drive, rutas locales y diccionarios
function resolverUrlImagen(urlRaw, opciones = {}) {
    if (!urlRaw || typeof urlRaw !== 'string') return '';
    urlRaw = urlRaw.trim();
    if (!urlRaw) return '';

    // 1. Enlaces compartidos de Google Drive (ej: /file/d/ID/view o ?id=ID)
    const matchDrive1 = urlRaw.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    const matchDrive2 = urlRaw.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    const fileId = (matchDrive1 && matchDrive1[1]) || (matchDrive2 && matchDrive2[1]);
    if (fileId) {
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    }

    // 2. URLs externas completas o datos en base64
    if (urlRaw.startsWith('http://') || urlRaw.startsWith('https://') || urlRaw.startsWith('data:')) {
        return urlRaw;
    }

    // 3. Ya incluye prefijo de carpeta assets/
    if (urlRaw.startsWith('assets/')) {
        return urlRaw;
    }
    if (urlRaw.startsWith('./assets/') || urlRaw.startsWith('/assets/')) {
        return urlRaw.replace(/^\.?\//, '');
    }

    // 4. Recursos del club y siluetas genéricas
    if (urlRaw.includes('Jugador_Generico')) return 'assets/img/plantilla/' + urlRaw;
    if (urlRaw.includes('Portero_Generico')) return 'assets/img/plantilla/' + urlRaw;
    if (urlRaw.includes('Amazonas PGN') || urlRaw.includes('Escudo')) return 'assets/img/branding/' + urlRaw;
    if (urlRaw.includes('Mascota')) return 'assets/img/branding/' + urlRaw;

    // 5. Columna Carpeta explícita de Google Sheets (si está configurada)
    if (opciones.carpeta && typeof opciones.carpeta === 'string' && opciones.carpeta.trim()) {
        let c = opciones.carpeta.trim().replace(/\\/g, '/');
        if (!c.endsWith('/')) c += '/';
        if (c.endsWith(urlRaw)) return c;
        return c + urlRaw;
    }

    // 6. Diccionario de mapeo directo para el repositorio gráfico
    const MAPA_IMAGENES = {
        '1.png': 'assets/img/repositorio/historico/1.png',
        '2.png': 'assets/img/repositorio/historico/2.png',
        'Retro.jpg': 'assets/img/repositorio/historico/Retro.jpg',
        'Retro1.jpg': 'assets/img/repositorio/historico/Retro2.jpg',
        'Retro2.jpg': 'assets/img/repositorio/historico/Retro2.jpg',
        'Campeonato1ra.jpg': 'assets/img/repositorio/masculino/Campeonato1ra.jpg',
        'Campeonato2da.jpg': 'assets/img/repositorio/masculino/Campeonato2da.jpg',
        'Campeonato2da1.png': 'assets/img/repositorio/masculino/Campeonato2da1.png',
        'femenino25.jpg': 'assets/img/repositorio/femenino/femenino25.jpg',
        'Femenino251.jpg': 'assets/img/repositorio/femenino/Femenino251.jpg',
        'Femenino252.jpg': 'assets/img/repositorio/femenino/Femenino252.jpg',
        'Femenino26.jpg': 'assets/img/repositorio/femenino/Femenino26.jpg',
        'Femenino261.jpg': 'assets/img/repositorio/femenino/Femenino261.jpg',
        'Femeninoconsuelo24.jpg': 'assets/img/repositorio/femenino/Femeninoconsuelo24.jpg',
        'Femeninoconsuelo241.jpg': 'assets/img/repositorio/femenino/Femeninoconsuelo241.jpg',
        'Femeninoconsuelo242.jpg': 'assets/img/repositorio/femenino/Femeninoconsuelo242.jpg',
        'Femeninoconsuelo243.jpg': 'assets/img/repositorio/femenino/Femeninoconsuelo243.jpg',
        'CampeonatoMaxima22.png': 'assets/img/repositorio/masculino/CampeonatoMaxima22.png',
        'CampeonatoMaxima223.jpg': 'assets/img/repositorio/masculino/CampeonatoMaxima223.jpg',
        'CampeonatoMaxima226.jpg': 'assets/img/repositorio/masculino/CampeonatoMaxima226.jpg',
        'CampeonatoMaxima227.jpg': 'assets/img/repositorio/masculino/CampeonatoMaxima227.jpg',
        'CampeonatoMaxima228.jpg': 'assets/img/repositorio/masculino/CampeonatoMaxima228.jpg',
        'CampeonatoMaxima2211.jpg': 'assets/img/repositorio/masculino/CampeonatoMaxima2211.jpg',
        'CampeonatoMaxima2212.jpg': 'assets/img/repositorio/masculino/CampeonatoMaxima2212.jpg',
        'CampeonatoMaxima23.jpg': 'assets/img/repositorio/masculino/CampeonatoMaxima23.jpg',
        'CampeonatoMaxima231.jpg': 'assets/img/repositorio/masculino/CampeonatoMaxima231.jpg',
        'CampeonatoMaxima232.jpg': 'assets/img/repositorio/masculino/CampeonatoMaxima232.jpg',
        'CampeonatoMaxima24.jpg': 'assets/img/repositorio/masculino/CampeonatoMaxima24.jpg',
        'CampeonatoMaxima241.jpg': 'assets/img/repositorio/masculino/CampeonatoMaxima241.jpg',
        'CampeonatoMaxima25.jpg': 'assets/img/repositorio/masculino/CampeonatoMaxima25.jpg',
        'CampeonatoMaxima251.jpg': 'assets/img/repositorio/masculino/CampeonatoMaxima251.jpg',
        'CampeonatoMaxima252.jpg': 'assets/img/repositorio/masculino/CampeonatoMaxima252.jpg',
        'CampeonatoMaxima253.jpg': 'assets/img/repositorio/masculino/CampeonatoMaxima253.jpg',
        'CampeonatoMaxima26.jpg': 'assets/img/repositorio/masculino/CampeonatoMaxima26.jpg',
        'CampeonatoMaxima261.jpg': 'assets/img/repositorio/masculino/CampeonatoMaxima261.jpg',
        'CampeonatoMaxima262.jpg': 'assets/img/repositorio/masculino/CampeonatoMaxima262.jpg'
    };

    if (MAPA_IMAGENES[urlRaw]) return MAPA_IMAGENES[urlRaw];

    // 7. Deducción según sección de plantilla
    if (opciones.seccion === 'plantilla' || opciones.tipoTab) {
        const tab = (opciones.tipoTab || 'masculino').toLowerCase();
        if (tab.includes('fem')) return `assets/img/plantilla/femenino/${urlRaw}`;
        if (tab.includes('leyen')) return `assets/img/plantilla/leyendas/${urlRaw}`;
        return `assets/img/plantilla/masculino/${urlRaw}`;
    }

    // 8. Deducción según categoría de equipo en repositorio
    const eq = (opciones.equipo || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    if (eq.includes('fem')) return `assets/img/repositorio/femenino/${urlRaw}`;
    if (eq.includes('hist') || eq.includes('retro')) return `assets/img/repositorio/historico/${urlRaw}`;
    if (eq.includes('masc')) return `assets/img/repositorio/masculino/${urlRaw}`;

    return urlRaw;
}

function formatearUrlImagen(url, opciones = {}) {
    return resolverUrlImagen(url, opciones);
}

// 3. Modales de Notificación / Toast Institucional
function mostrarToast(titulo, mensaje) {
    const modal = document.getElementById('toast-modal');
    const titleEl = document.getElementById('toast-title');
    const msgEl = document.getElementById('toast-msg');
    if (titleEl) titleEl.textContent = titulo;
    if (msgEl) msgEl.textContent = mensaje;
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function cerrarToast() {
    const modal = document.getElementById('toast-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// Exportar al ámbito global para compatibilidad con eventos inline
window.escapeHTML = escapeHTML;
window.sanitizarHTML = sanitizarHTML;
window.resolverUrlImagen = resolverUrlImagen;
window.formatearUrlImagen = formatearUrlImagen;
window.mostrarToast = mostrarToast;
window.cerrarToast = cerrarToast;
