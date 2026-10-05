/**
 * app.js - Orquestador principal, navegación SPA, menú responsivo y ciclo de vida de la aplicación
 * Club Deportivo Amazonas (Malchinguí, Ecuador - Fundado en 1987)
 */

function mostrarSeccion(idSeccion, updateHash = true) {
    const main = document.querySelector('main');
    if (!main) return;
    
    const secciones = Array.from(main.children).filter(child => child.tagName === 'SECTION' && child.id !== '');

    secciones.forEach(sec => {
        sec.classList.add('hidden');
        sec.classList.remove('block');
    });

    const seccionMostrar = document.getElementById(idSeccion);
    if (seccionMostrar) {
        seccionMostrar.classList.remove('hidden');
        seccionMostrar.classList.add('block');
    }

    const enlaces = document.querySelectorAll('#menu-principal a');
    enlaces.forEach(enlace => {
        enlace.classList.remove('text-brand-white', 'bg-white/15', 'font-bold');
    });
    
    const enlaceActivo = document.getElementById('nav-' + idSeccion);
    if (enlaceActivo) {
        enlaceActivo.classList.add('text-brand-white', 'bg-white/15', 'font-bold');
    }

    // Cerrar menú móvil y backdrop si estuviera abierto
    if (typeof toggleMenu === 'function') {
        toggleMenu(false);
    }
    
    // Actualizar URL sin forzar scroll indeseado en la carga inicial
    if (updateHash) {
        if (history.replaceState) {
            history.replaceState(null, null, '#' + idSeccion);
        } else {
            location.hash = '#' + idSeccion;
        }
    }

    // Sincronizaciones bajo demanda para secciones dinámicas
    if (idSeccion === 'tienda' && typeof cargarTiendaGoogleSheets === 'function') {
        if (typeof tiendaCargada === 'undefined' || !tiendaCargada || (Array.isArray(tiendaProductos) && tiendaProductos.length === 0)) {
            cargarTiendaGoogleSheets();
        }
    }

    if (idSeccion === 'galeria' && typeof cargarRepositorioGoogleSheets === 'function') {
        if (typeof repositorioCargado === 'undefined' || !repositorioCargado || (Array.isArray(repositorioDatos) && repositorioDatos.length === 0)) {
            cargarRepositorioGoogleSheets();
        }
    }
    
    window.scrollTo({ top: 0, behavior: 'instant' });
}

function toggleMenu(forceState) {
    const menu = document.getElementById('menu-principal');
    const backdrop = document.getElementById('menu-backdrop');
    const iconOpen = document.getElementById('icon-menu-open');
    const iconClose = document.getElementById('icon-menu-close');
    const btn = document.getElementById('btn-toggle-menu');

    if (!menu) return;
    const isCurrentlyOpen = !menu.classList.contains('hidden');
    const willOpen = (typeof forceState === 'boolean') ? forceState : !isCurrentlyOpen;

    if (willOpen) {
        menu.classList.remove('hidden');
        if (backdrop) backdrop.classList.remove('hidden');
        if (iconOpen) iconOpen.classList.add('hidden');
        if (iconClose) iconClose.classList.remove('hidden');
        if (btn) btn.setAttribute('aria-expanded', 'true');
    } else {
        menu.classList.add('hidden');
        if (backdrop) backdrop.classList.add('hidden');
        if (iconOpen) iconOpen.classList.remove('hidden');
        if (iconClose) iconClose.classList.add('hidden');
        if (btn) btn.setAttribute('aria-expanded', 'false');
    }
}

// Cierre general con tecla Escape para todos los modales del sistema
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (typeof toggleMenu === 'function') toggleMenu(false);
        if (typeof cerrarModalFichaJugador === 'function') cerrarModalFichaJugador();
        if (typeof cerrarModalProducto === 'function') cerrarModalProducto();
        if (typeof cerrarModalCarrito === 'function') cerrarModalCarrito();
        if (typeof cerrarModalRepo === 'function') cerrarModalRepo();
        if (typeof cerrarModalLegal === 'function') cerrarModalLegal();
        if (typeof cerrarModalConfigCookies === 'function') cerrarModalConfigCookies();
        if (typeof cerrarToast === 'function') cerrarToast();
    }
});

// Control de subpestañas internas (ej. Plantilla Masculino/Femenino/Leyendas)
function mostrarSubPestaña(seccionPadre, tipo) {
    const contenidos = document.querySelectorAll(`.${seccionPadre}-content`);
    contenidos.forEach(c => {
        c.classList.remove('block');
        c.classList.add('hidden');
    });
    
    const contenidoMostrar = document.getElementById(`${seccionPadre}-${tipo}`);
    if (contenidoMostrar) {
        contenidoMostrar.classList.remove('hidden');
        contenidoMostrar.classList.add('block');
    }
    
    const botones = document.querySelectorAll(`.${seccionPadre}-btn`);
    botones.forEach(b => {
        b.classList.remove('bg-brand-green', 'text-brand-white', 'shadow-subtle');
        b.classList.add('bg-slate-100', 'text-slate-700', 'hover:bg-slate-200');
    });
    
    const botonActivo = document.getElementById(`btn-${seccionPadre}-${tipo}`);
    if (botonActivo) {
        botonActivo.classList.remove('bg-slate-100', 'text-slate-700', 'hover:bg-slate-200');
        botonActivo.classList.add('bg-brand-green', 'text-brand-white', 'shadow-subtle');
    }
}

// Soporte para botones Atrás/Adelante del navegador
window.addEventListener('popstate', () => {
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        mostrarSeccion(hash, false);
    } else {
        mostrarSeccion('sobre-el-club', false);
    }
});

// Inicialización general en DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash.substring(1);
    
    if (hash && document.getElementById(hash)) {
        mostrarSeccion(hash, false);
    } else {
        mostrarSeccion('sobre-el-club', false);
    }

    // Inicializar controles de seguridad, captcha y estado anti-spam del formulario
    if (typeof verificarEstadoSeguridadInicial === 'function') {
        verificarEstadoSeguridadInicial();
    }

    // Inicializar controles de cookies y privacidad RGPD / LOPDP
    if (typeof CDA_COOKIES !== 'undefined' && typeof CDA_COOKIES.iniciar === 'function') {
        CDA_COOKIES.iniciar();
    }
});

// Exportar al ámbito global para eventos inline
window.mostrarSeccion = mostrarSeccion;
window.toggleMenu = toggleMenu;
window.mostrarSubPestaña = mostrarSubPestaña;
