/**
 * tienda.js - Tienda oficial, catálogo de indumentaria y carrito en LocalStorage
 * Club Deportivo Amazonas (Malchinguí, Ecuador)
 */

            const SPREADSHEET_TIENDA_ID = "1GxnHehS9i4QAPCiyVlf3cWfmK1QWqWsQy8juukoZ754";
            const TIENDA_GID = "436016728";
            // Número y enlace oficial de WhatsApp del Club
            const WHATSAPP_CLUB_NUMERO = "593981556626";
            const WHATSAPP_CLUB_ENLACE = "https://wa.me/593981556626";

            let tiendaProductos = [];
            let tiendaCargada = false;
            let categoriaTiendaActual = 'todos';
            let productoModalActual = null;
            let tallaModalSeleccionada = '';
            let cantidadModal = 1;
            let carritoTienda = [];

            try {
                carritoTienda = JSON.parse(localStorage.getItem('cda_carrito_tienda') || '[]');
            } catch (e) {
                carritoTienda = [];
            }

            function renderizarSkeletonsTienda() {
                const grid = document.getElementById('tienda-grid-dinamico');
                if (!grid) return;
                grid.innerHTML = Array.from({ length: 3 }).map(() => `
                    <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm animate-pulse flex flex-col justify-between h-[450px]">
                        <div class="w-full h-56 bg-slate-200 rounded-xl mb-4"></div>
                        <div class="space-y-2 mb-4">
                            <div class="h-3 w-20 bg-slate-200 rounded"></div>
                            <div class="h-5 w-44 bg-slate-300 rounded"></div>
                            <div class="h-3 w-full bg-slate-100 rounded"></div>
                        </div>
                        <div class="flex gap-2 mb-4">
                            <div class="h-7 w-8 bg-slate-200 rounded-lg"></div>
                            <div class="h-7 w-8 bg-slate-200 rounded-lg"></div>
                            <div class="h-7 w-8 bg-slate-200 rounded-lg"></div>
                        </div>
                        <div class="h-10 w-full bg-slate-200 rounded-xl"></div>
                    </div>
                `).join('');
            }

            const SNAPSHOT_TIENDA_OFICIAL = [
                ['Columna','id (Clave única)','producto','categoria','descripcion_corta','imagen_principal','imagen_secundaria','tallas','precio_regular','precio_descuento','stock_estado','destacado','etiqueta_badge','activo'],
                ['1','AMZ-CAM-01','Camiseta Oficial Titular 2026','Indumentaria','Poliester, completamente sublimado.','Camisetao26.png','Camisetao26.png','S, M, L, XL, 2XL','15.99','12.99','Bajo pedido','SI','Nueva Temporada','SI'],
                ['2','AMZ-POL-01','Camisa Polo Oficial','Indumentaria','Poliester, utilizando tejidos de punto','Camisap.png','Camisap.png','S, M, L, XL, 2XL','16.99','13.99','Bajo pedido','NO','Nueva Temporada','SI'],
                ['3','AMZ-CHA-01','Chaqueta Deportiva Retro','Indumentaria','Materiales sintéticos de trama cerrada que bloquean el paso del aire y mantienen la ligereza','Chaquetadr.png','Chaquetadr.png','M, L, XL, 2XL','49.99','26.99','Bajo pedido','NO','Nueva Temporada','SI']
            ];

            function cargarTiendaViaJSONP() {
                return new Promise((resolve, reject) => {
                    const callbackName = 'cdaCallbackTienda_' + Math.floor(Math.random() * 1000000);
                    const script = document.createElement('script');
                    const timer = setTimeout(() => {
                        try { delete window[callbackName]; } catch (e) {}
                        if (script.parentNode) script.parentNode.removeChild(script);
                        reject(new Error("Timeout al sincronizar Google Sheets Tienda por JSONP"));
                    }, 6000);

                    window[callbackName] = function(json) {
                        clearTimeout(timer);
                        try { delete window[callbackName]; } catch (e) {}
                        if (script.parentNode) script.parentNode.removeChild(script);

                        if (json && json.table && Array.isArray(json.table.rows)) {
                            const filas = [
                                ['Columna', 'id', 'producto', 'categoria', 'descripcion_corta', 'imagen_principal', 'imagen_secundaria', 'tallas', 'precio_regular', 'precio_descuento', 'stock_estado', 'destacado', 'etiqueta_badge', 'activo'],
                                ...json.table.rows.map(r => {
                                    if (!r || !Array.isArray(r.c)) return [];
                                    return r.c.map(cell => (cell && cell.v !== null && cell.v !== undefined) ? String(cell.v).trim() : '');
                                })
                            ];
                            resolve(filas);
                        } else {
                            reject(new Error("Formato JSONP Tienda no válido"));
                        }
                    };

                    script.src = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_TIENDA_ID}/gviz/tq?tqx=responseHandler:${callbackName}&gid=${TIENDA_GID}`;
                    script.onerror = () => {
                        clearTimeout(timer);
                        try { delete window[callbackName]; } catch (e) {}
                        if (script.parentNode) script.parentNode.removeChild(script);
                        reject(new Error("Error al cargar script de Google Sheets Tienda"));
                    };

                    document.head.appendChild(script);
                });
            }

            async function cargarTiendaGoogleSheets() {
                if (tiendaCargada && tiendaProductos.length > 0) return;
                renderizarSkeletonsTienda();
                actualizarBadgeCarrito();

                let filas = null;

                // 1. Intentar JSONP (100% compatible sin bloqueo CORS)
                try {
                    filas = await cargarTiendaViaJSONP();
                } catch (errJsonp) {
                    console.warn("JSONP Tienda no disponible, probando fetch directo:", errJsonp.message);
                }

                // 2. Intentar fetch directo con endpoints de Google Sheets
                if (!filas) {
                    const endpoints = [
                        `https://docs.google.com/spreadsheets/d/${SPREADSHEET_TIENDA_ID}/gviz/tq?tqx=out:csv&gid=${TIENDA_GID}`,
                        `https://docs.google.com/spreadsheets/d/${SPREADSHEET_TIENDA_ID}/export?format=csv&gid=${TIENDA_GID}`
                    ];
                    for (const url of endpoints) {
                        try {
                            const resp = await fetch(url);
                            if (resp.ok) {
                                const csvText = await resp.text();
                                if (csvText && csvText.includes(',')) {
                                    filas = parsearCSV(csvText);
                                    break;
                                }
                            }
                        } catch (e) {}
                    }
                }

                // 3. Fallback de respaldo institucional oficial (garantiza visualización inmediata)
                if (!filas || filas.length < 2) {
                    filas = SNAPSHOT_TIENDA_OFICIAL;
                }

                try {
                    tiendaProductos = procesarFilasTienda(filas);
                    tiendaCargada = true;

                    if (tiendaProductos.length === 0) {
                        tiendaProductos = procesarFilasTienda(SNAPSHOT_TIENDA_OFICIAL);
                    }

                    actualizarFiltrosCategoriasTienda();
                    renderizarTienda();
                } catch (error) {
                    console.error("Error al procesar catálogo de Tienda:", error);
                    tiendaProductos = procesarFilasTienda(SNAPSHOT_TIENDA_OFICIAL);
                    actualizarFiltrosCategoriasTienda();
                    renderizarTienda();
                }
            }

            function resolverImagenTienda(urlRaw, id, producto) {
                if (!urlRaw || typeof urlRaw !== 'string') urlRaw = '';
                urlRaw = urlRaw.trim();
                const matchDrive1 = urlRaw.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                const matchDrive2 = urlRaw.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                const fileId = (matchDrive1 && matchDrive1[1]) || (matchDrive2 && matchDrive2[1]);
                if (fileId) return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;

                if ((urlRaw.startsWith('http://') || urlRaw.startsWith('https://')) && !urlRaw.includes('...')) {
                    return urlRaw;
                }
                if (urlRaw.startsWith('assets/')) return urlRaw;

                const idUpper = (id || '').toUpperCase();
                const nom = (producto || '').toLowerCase();

                if (idUpper.includes('CHA') || nom.includes('chaqueta') || nom.includes('chompa') || nom.includes('retro')) {
                    return 'assets/img/tienda/Chaquetadr.png';
                }
                if (idUpper.includes('POL') || nom.includes('polo')) {
                    return 'assets/img/tienda/Camisap.png';
                }
                if (idUpper.includes('CAM') || nom.includes('camiseta') || nom.includes('titular')) {
                    return 'assets/img/tienda/Camisetao26.png';
                }

                if (urlRaw && !urlRaw.includes('...') && !urlRaw.toLowerCase().includes('principal')) {
                    return `assets/img/tienda/${urlRaw}`;
                }

                return 'assets/img/tienda/Camisetao26.png';
            }

            function limpiarPrecioTienda(val) {
                if (!val) return 0;
                const limpio = val.toString().replace('$', '').replace(/\s/g, '').replace(',', '.');
                const num = parseFloat(limpio);
                return isNaN(num) ? 0 : num;
            }

            function procesarFilasTienda(filas) {
                const resultado = [];

                for (let i = 1; i < filas.length; i++) {
                    const c = filas[i];
                    if (!c || c.length < 3 || !c.some(x => x && String(x).trim())) continue;

                    const id = String(c[1] || `AMZ-PROD-${i}`).trim();
                    let nombre = String(c[2] || 'Producto Oficial').trim();

                    if (id === 'AMZ-POL-01' && (nombre.toLowerCase().includes('camiseta') && !nombre.toLowerCase().includes('polo'))) {
                        nombre = 'Camisa Polo Oficial';
                    } else if (id === 'AMZ-CHA-01' && (nombre.toLowerCase().includes('camiseta') && !nombre.toLowerCase().includes('chaqueta'))) {
                        nombre = 'Chaqueta Deportiva Retro';
                    }

                    const categoria = String(c[3] || 'Indumentaria').trim();
                    const descripcion = String(c[4] || 'Indumentaria oficial conmemorativa de C.D. Amazonas. Confección de alta calidad con escudo bordado.').trim();
                    const imgPrincipal = resolverImagenTienda(String(c[5] || ''), id, nombre);
                    const imgSecundaria = (c[6] && !String(c[6]).includes('...') && !String(c[6]).toLowerCase().includes('secundaria')) ? resolverImagenTienda(String(c[6]), id, nombre) : '';

                    const tallasRaw = String(c[7] || 'S, M, L, XL, 2XL').trim();
                    const tallas = tallasRaw.split(',').map(t => t.trim()).filter(Boolean);

                    const precioReg = limpiarPrecioTienda(c[8]);
                    const precioDesc = limpiarPrecioTienda(c[9]);
                    const precioFinal = precioDesc > 0 ? precioDesc : (precioReg > 0 ? precioReg : 14.99);
                    const tieneDescuento = precioDesc > 0 && precioReg > precioDesc;
                    const pctDescuento = tieneDescuento ? Math.round(((precioReg - precioDesc) / precioReg) * 100) : 0;

                    let stock = String(c[10] || 'Disponible').trim();
                    let stockEstado = 'Disponible';
                    if (stock.toLowerCase().includes('bajo')) {
                        stockEstado = 'Bajo Pedido';
                    } else if (stock.toLowerCase().includes('agotado') && !stock.toLowerCase().includes('disponible')) {
                        stockEstado = 'Agotado';
                    }

                    const destacado = String(c[11] || '').trim().toUpperCase() === 'SI';
                    const badge = String(c[12] || '').trim() || (destacado ? 'Destacado' : (tieneDescuento ? `${pctDescuento}% OFF` : 'Oficial'));
                    const activo = String(c[13] || '').trim().toUpperCase() !== 'NO';

                    if (activo) {
                        resultado.push({
                            id,
                            nombre,
                            categoria,
                            descripcion,
                            imgPrincipal,
                            imgSecundaria,
                            tallas: tallas.length > 0 ? tallas : ['Única'],
                            tallaSeleccionada: tallas[0] || 'M',
                            precioReg,
                            precioDesc,
                            precioFinal,
                            tieneDescuento,
                            pctDescuento,
                            stockEstado,
                            destacado,
                            badge
                        });
                    }
                }
                return resultado;
            }

            function parsearCSVTienda(csvText) {
                const filas = parsearCSV(csvText);
                return procesarFilasTienda(filas);
            }

            function actualizarFiltrosCategoriasTienda() {
                const container = document.getElementById('tienda-categorias-container');
                if (!container) return;

                const categorias = ['Todos'];
                tiendaProductos.forEach(p => {
                    if (p.categoria && !categorias.includes(p.categoria)) {
                        categorias.push(p.categoria);
                    }
                });

                container.innerHTML = categorias.map(cat => {
                    const esActivo = cat.toLowerCase() === categoriaTiendaActual.toLowerCase();
                    const btnClass = esActivo 
                        ? 'bg-brand-green text-white shadow-xs' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700';
                    const catSegura = escapeHTML(cat);
                    return `
                        <button onclick="seleccionarCategoriaTienda('${catSegura.replace(/'/g, "\\'")}')" class="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${btnClass}">
                            ${catSegura}
                        </button>
                    `;
                }).join('');
            }

            function seleccionarCategoriaTienda(cat) {
                categoriaTiendaActual = cat.toLowerCase();
                actualizarFiltrosCategoriasTienda();
                renderizarTienda();
            }

            function filtrarProductosTienda() {
                renderizarTienda();
            }

            function seleccionarTallaProducto(prodId, talla, btnEl) {
                const prod = tiendaProductos.find(p => p.id === prodId);
                if (prod) {
                    prod.tallaSeleccionada = talla;
                    const parent = btnEl.parentElement;
                    if (parent) {
                        parent.querySelectorAll('button').forEach(b => {
                            b.className = 'px-2.5 py-0.5 text-[11px] font-bold rounded border bg-white text-slate-700 border-slate-300 hover:border-brand-green';
                        });
                        btnEl.className = 'px-2.5 py-0.5 text-[11px] font-bold rounded border bg-brand-green text-white border-brand-green shadow-xs';
                    }
                }
            }

            function renderizarTienda() {
                const grid = document.getElementById('tienda-grid-dinamico');
                if (!grid) return;

                const query = (document.getElementById('tienda-buscador')?.value || '').toLowerCase().trim();

                const filtrados = tiendaProductos.filter(p => {
                    const matchCat = categoriaTiendaActual === 'todos' || p.categoria.toLowerCase() === categoriaTiendaActual;
                    const matchQuery = !query || p.nombre.toLowerCase().includes(query) || p.descripcion.toLowerCase().includes(query) || p.id.toLowerCase().includes(query);
                    return matchCat && matchQuery;
                });

                if (filtrados.length === 0) {
                    grid.innerHTML = `
                        <div class="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
                            <span class="text-4xl block mb-2">🔍</span>
                            <h4 class="font-serif font-bold text-brand-dark text-base mb-1">No se encontraron productos</h4>
                            <p class="text-xs text-slate-500">Prueba ajustando el término de búsqueda o seleccionando otra categoría.</p>
                        </div>
                    `;
                    return;
                }

                grid.innerHTML = filtrados.map(prod => {
                    let stockBadge = '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">● En Stock</span>';
                    if (prod.stockEstado === 'Bajo Pedido') {
                        stockBadge = '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">⏳ Bajo Pedido</span>';
                    } else if (prod.stockEstado === 'Agotado') {
                        stockBadge = '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">✕ Agotado</span>';
                    }

                    const esAgotado = prod.stockEstado === 'Agotado';
                    const idSeguro = encodeURIComponent(prod.id);

                    return `
                        <div class="cda-product-card group flex flex-col justify-between overflow-hidden">
                            
                            <!-- Cabecera de Imagen y Badges -->
                            <div class="relative bg-gradient-to-b from-slate-50 to-slate-100/60 p-6 flex items-center justify-center h-64 overflow-hidden border-b border-slate-100">
                                <span class="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-gold text-brand-dark shadow-xs z-10">
                                    ${escapeHTML(prod.badge)}
                                </span>
                                <div class="absolute top-3 right-3 z-10">
                                    ${stockBadge}
                                </div>
                                <img src="${prod.imgPrincipal}" alt="${escapeHTML(prod.nombre)}" loading="lazy" class="max-h-full max-w-full object-contain drop-shadow-md group-hover:scale-108 transition-transform duration-500" onerror="this.src='assets/img/branding/Amazonas PGN.png'">
                            </div>

                            <!-- Contenido del Producto -->
                            <div class="p-5 flex flex-col flex-grow justify-between">
                                <div>
                                    <div class="flex items-center justify-between gap-2 mb-1.5">
                                        <span class="text-[10px] font-black uppercase tracking-widest text-brand-green">${escapeHTML(prod.categoria)}</span>
                                        <span class="text-[10px] font-mono text-slate-400 font-medium">${escapeHTML(prod.id)}</span>
                                    </div>
                                    <h4 class="font-serif text-lg font-black text-brand-dark group-hover:text-brand-green transition-colors leading-snug mb-2 cursor-pointer" onclick="abrirModalProducto('${idSeguro}')">
                                        ${escapeHTML(prod.nombre)}
                                    </h4>
                                    <p class="text-xs text-slate-600 font-light leading-relaxed line-clamp-2 mb-4">
                                        ${escapeHTML(prod.descripcion)}
                                    </p>

                                    <!-- Selector de Tallas Rápido -->
                                    <div class="mb-4">
                                        <span class="block text-[11px] font-bold text-slate-500 mb-1.5">Talla:</span>
                                        <div class="flex flex-wrap gap-1.5" id="tallas-${escapeHTML(prod.id)}">
                                            ${prod.tallas.map((t, idx) => {
                                                const esSel = (prod.tallaSeleccionada === t) || (!prod.tallaSeleccionada && idx === 0);
                                                const btnSt = esSel 
                                                    ? 'bg-brand-green text-white border-brand-green shadow-xs' 
                                                    : 'bg-white text-slate-700 border-slate-300 hover:border-brand-green';
                                                const tSegura = escapeHTML(t);
                                                return `
                                                    <button type="button" onclick="seleccionarTallaProducto('${idSeguro}', '${tSegura.replace(/'/g, "\\'")}', this)" class="px-2.5 py-0.5 text-[11px] font-bold rounded border transition-all ${btnSt}">
                                                        ${tSegura}
                                                    </button>
                                                `;
                                            }).join('')}
                                        </div>
                                    </div>
                                </div>

                                <!-- Precios y Botones de Acción -->
                                <div class="pt-3 border-t border-slate-100">
                                    <div class="flex items-baseline justify-between mb-3">
                                        <div class="flex items-baseline gap-2">
                                            <span class="text-xl font-black text-brand-dark tracking-tight">$${prod.precioFinal.toFixed(2)}</span>
                                            ${prod.tieneDescuento ? `<span class="text-xs text-slate-400 line-through">$${prod.precioReg.toFixed(2)}</span>` : ''}
                                        </div>
                                        ${prod.tieneDescuento ? `<span class="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">-${prod.pctDescuento}%</span>` : ''}
                                    </div>

                                    <div class="grid grid-cols-2 gap-2">
                                        <button onclick="pedirProductoDirectoWhatsApp('${idSeguro}')" ${esAgotado ? 'disabled' : ''} class="w-full cda-btn-whatsapp text-white py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed">
                                            <span>💬 Pedir</span>
                                        </button>
                                        <button onclick="abrirModalProducto('${idSeguro}')" class="w-full bg-slate-100 hover:bg-brand-dark hover:text-white text-slate-700 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1">
                                            <span>Detalles →</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }

            function abrirModalProducto(prodId) {
                const prod = tiendaProductos.find(p => p.id === prodId);
                if (!prod) return;

                productoModalActual = prod;
                tallaModalSeleccionada = prod.tallaSeleccionada || prod.tallas[0] || 'M';
                cantidadModal = 1;

                document.getElementById('modal-prod-img').src = prod.imgPrincipal;
                document.getElementById('modal-prod-badge').textContent = prod.badge;
                document.getElementById('modal-prod-cat').textContent = prod.categoria;
                document.getElementById('modal-prod-id').textContent = `Código Ref: ${prod.id}`;
                document.getElementById('modal-prod-titulo').textContent = prod.nombre;
                document.getElementById('modal-prod-desc').textContent = prod.descripcion;

                document.getElementById('modal-prod-precio').textContent = `$${prod.precioFinal.toFixed(2)}`;
                const elReg = document.getElementById('modal-prod-precio-reg');
                const elDesc = document.getElementById('modal-prod-descuento');
                if (prod.tieneDescuento) {
                    elReg.textContent = `$${prod.precioReg.toFixed(2)}`;
                    elReg.classList.remove('hidden');
                    elDesc.textContent = `-${prod.pctDescuento}% OFF`;
                    elDesc.classList.remove('hidden');
                } else {
                    elReg.classList.add('hidden');
                    elDesc.classList.add('hidden');
                }

                const elStock = document.getElementById('modal-prod-stock');
                if (prod.stockEstado === 'Disponible') {
                    elStock.className = 'text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200';
                    elStock.textContent = '● En Stock';
                } else if (prod.stockEstado === 'Bajo Pedido') {
                    elStock.className = 'text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200';
                    elStock.textContent = '⏳ Bajo Pedido';
                } else {
                    elStock.className = 'text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200';
                    elStock.textContent = '✕ Agotado';
                }

                const contTallas = document.getElementById('modal-prod-tallas');
                contTallas.innerHTML = prod.tallas.map(t => {
                    const sel = t === tallaModalSeleccionada;
                    const st = sel ? 'bg-brand-green text-white border-brand-green shadow-xs' : 'bg-white text-slate-700 border-slate-300 hover:border-brand-green';
                    const tSegura = escapeHTML(t);
                    return `
                        <button type="button" onclick="seleccionarTallaModal('${tSegura.replace(/'/g, "\\'")}', this)" class="btn-talla-modal px-3 py-1 text-xs font-bold rounded-lg border transition-all ${st}">
                            ${tSegura}
                        </button>
                    `;
                }).join('');

                actualizarSubtotalModal();

                const modal = document.getElementById('modal-producto-tienda');
                modal.classList.remove('hidden');
                modal.classList.add('flex');
                document.body.style.overflow = 'hidden';
            }

            function cerrarModalProducto() {
                const modal = document.getElementById('modal-producto-tienda');
                modal.classList.add('hidden');
                modal.classList.remove('flex');
                document.body.style.overflow = 'auto';
            }

            function seleccionarTallaModal(talla, btn) {
                tallaModalSeleccionada = talla;
                if (productoModalActual) productoModalActual.tallaSeleccionada = talla;
                document.querySelectorAll('.btn-talla-modal').forEach(b => {
                    b.className = 'btn-talla-modal px-3 py-1 text-xs font-bold rounded-lg border bg-white text-slate-700 border-slate-300 hover:border-brand-green';
                });
                btn.className = 'btn-talla-modal px-3 py-1 text-xs font-bold rounded-lg border bg-brand-green text-white border-brand-green shadow-xs';
            }

            function ajustarCantidadModal(delta) {
                cantidadModal = Math.max(1, cantidadModal + delta);
                document.getElementById('modal-prod-cantidad').textContent = cantidadModal;
                actualizarSubtotalModal();
            }

            function actualizarSubtotalModal() {
                if (!productoModalActual) return;
                const subtotal = productoModalActual.precioFinal * cantidadModal;
                document.getElementById('modal-prod-subtotal').textContent = `$${subtotal.toFixed(2)}`;
            }

            function generarEnlaceWhatsApp(mensaje) {
                const enlace = (WHATSAPP_CLUB_ENLACE || WHATSAPP_CLUB_NUMERO || "").trim();
                if (enlace.includes('/qr/')) {
                    return enlace.startsWith('http') ? enlace : `https://wa.me/qr/${enlace.replace(/.*\/qr\//, '')}`;
                }
                const numLimpio = enlace.replace(/[^0-9]/g, '');
                const msgEncoded = encodeURIComponent(mensaje || "");
                if (numLimpio) {
                    return `https://wa.me/${numLimpio}?text=${msgEncoded}`;
                }
                return "https://wa.me/qr/T2Q4XLSSFVWLM1";
            }

            function ejecutarAccionWhatsApp(mensaje) {
                const url = generarEnlaceWhatsApp(mensaje);
                const esQR = url.includes('/qr/');
                
                // Si es un enlace QR, WhatsApp no auto-completa el texto via URL, copiamos al portapapeles
                if (esQR && mensaje && navigator.clipboard && navigator.clipboard.writeText) {
                    try {
                        navigator.clipboard.writeText(mensaje).catch(() => {});
                    } catch (e) {}
                    if (typeof mostrarToast === 'function') {
                        mostrarToast('WhatsApp Oficial Amazonas', 'Abriendo chat oficial... Hemos copiado el detalle de tu pedido al portapapeles para que lo puedas pegar en el chat.');
                    }
                }
                
                window.open(url, '_blank', 'noopener,noreferrer');
            }

            function pedirProductoDirectoWhatsApp(prodId) {
                const prod = tiendaProductos.find(p => p.id === prodId);
                if (!prod) return;
                const talla = prod.tallaSeleccionada || prod.tallas[0] || 'M';
                const msg = `¡Hola Club Deportivo Amazonas! Deseo encargar el siguiente producto oficial:\n\n👕 Producto: ${prod.nombre}\n🏷️ Código: ${prod.id}\n📏 Talla: ${talla}\n💰 Precio: $${prod.precioFinal.toFixed(2)}\n\n¿Por favor me indican los métodos de pago y cómo coordinamos la entrega?`;
                ejecutarAccionWhatsApp(msg);
            }

            function pedirProductoModalWhatsApp() {
                if (!productoModalActual) return;
                const prod = productoModalActual;
                const subtotal = prod.precioFinal * cantidadModal;
                const msg = `¡Hola Club Deportivo Amazonas! Deseo ordenar el siguiente producto oficial:\n\n👕 Producto: ${prod.nombre}\n🏷️ Código: ${prod.id}\n📏 Talla: ${tallaModalSeleccionada}\n📦 Cantidad: ${cantidadModal}\n💰 Total Estimado: $${subtotal.toFixed(2)}\n\n¿Por favor me indican los datos de transferencia y fecha de entrega?`;
                ejecutarAccionWhatsApp(msg);
            }

            function pedirPersonalizacionWhatsApp() {
                const msg = "¡Hola Club Deportivo Amazonas! Deseo consultar sobre la indumentaria oficial con estampado personalizado (nombre y dorsal). ¿Cómo podemos coordinarlo?";
                ejecutarAccionWhatsApp(msg);
            }

            function consultarPorFormularioModal() {
                if (!productoModalActual) return;
                const prod = productoModalActual;
                cerrarModalProducto();
                mostrarSeccion('contacto');
                const textarea = document.getElementById('contacto-mensaje');
                if (textarea) {
                    textarea.value = `Hola directiva de C.D. Amazonas, deseo realizar una consulta sobre el producto "${prod.nombre}" (Código: ${prod.id}) en talla ${tallaModalSeleccionada}, cantidad: ${cantidadModal}.`;
                    textarea.focus();
                }
            }

            function agregarAlCarritoDesdeModal() {
                if (!productoModalActual) return;
                agregarAlCarrito(productoModalActual.id, tallaModalSeleccionada, cantidadModal);
                cerrarModalProducto();
                abrirModalCarrito();
            }

            function agregarAlCarrito(prodId, talla, cantidad) {
                const prod = tiendaProductos.find(p => p.id === prodId);
                if (!prod) return;

                const indexExistente = carritoTienda.findIndex(item => item.id === prodId && item.talla === talla);
                if (indexExistente !== -1) {
                    carritoTienda[indexExistente].cantidad += cantidad;
                } else {
                    carritoTienda.push({
                        id: prod.id,
                        nombre: prod.nombre,
                        precio: prod.precioFinal,
                        img: prod.imgPrincipal,
                        talla: talla,
                        cantidad: cantidad
                    });
                }

                guardarCarrito();
                actualizarBadgeCarrito();
                mostrarToast('Añadido a tu Pedido', `${prod.nombre} (Talla: ${talla}) se agregó a tu pedido.`);
            }

            function guardarCarrito() {
                try {
                    localStorage.setItem('cda_carrito_tienda', JSON.stringify(carritoTienda));
                } catch (e) {}
            }

            function actualizarBadgeCarrito() {
                const totalItems = carritoTienda.reduce((acc, item) => acc + (item.cantidad || 0), 0);
                
                // Badge en la página de Tienda
                const badge = document.getElementById('tienda-badge-carrito');
                if (badge) {
                    badge.textContent = totalItems;
                    badge.classList.remove('cda-cart-badge-bounce');
                    void badge.offsetWidth;
                    badge.classList.add('cda-cart-badge-bounce');
                }

                // Badge en la barra de navegación superior fija
                const navBadge = document.getElementById('nav-cart-badge');
                if (navBadge) {
                    navBadge.textContent = totalItems;
                    if (totalItems > 0) {
                        navBadge.classList.remove('hidden');
                        navBadge.classList.add('flex');
                    } else {
                        navBadge.classList.add('hidden');
                        navBadge.classList.remove('flex');
                    }
                }
            }

            function modificarCantidadCarrito(index, delta) {
                if (!carritoTienda[index]) return;
                const nuevaCant = (carritoTienda[index].cantidad || 1) + delta;
                if (nuevaCant <= 0) {
                    eliminarItemCarrito(index);
                    return;
                }
                carritoTienda[index].cantidad = Math.min(99, nuevaCant);
                guardarCarrito();
                actualizarBadgeCarrito();
                abrirModalCarrito();
            }

            function obtenerItemValidado(rawItem) {
                if (!rawItem) return null;
                const prodReal = tiendaProductos.find(p => p.id === rawItem.id);
                const precioReal = (prodReal && typeof prodReal.precioFinal === 'number' && prodReal.precioFinal > 0)
                    ? prodReal.precioFinal
                    : (typeof rawItem.precio === 'number' && rawItem.precio > 0 ? rawItem.precio : 0);
                const nombreReal = prodReal ? prodReal.nombre : (rawItem.nombre || 'Producto Oficial');
                const imgReal = prodReal ? prodReal.imgPrincipal : (rawItem.img || 'assets/img/branding/Amazonas PGN.png');
                const cantReal = Math.max(1, Math.min(99, parseInt(rawItem.cantidad, 10) || 1));
                const tallaReal = rawItem.talla ? String(rawItem.talla).trim() : 'M';
                return {
                    id: rawItem.id,
                    nombre: nombreReal,
                    precio: precioReal,
                    img: imgReal,
                    talla: tallaReal,
                    cantidad: cantReal
                };
            }

            function abrirModalCarrito() {
                const modal = document.getElementById('modal-carrito-tienda');
                const container = document.getElementById('carrito-items-container');
                const totalEl = document.getElementById('carrito-total-precio');

                if (carritoTienda.length === 0) {
                    container.innerHTML = `
                        <div class="py-12 text-center text-slate-500">
                            <span class="text-4xl block mb-2">🛒</span>
                            <p class="font-bold text-sm text-brand-dark mb-1">Tu pedido está vacío</p>
                            <p class="text-xs text-slate-400">Selecciona algún producto de la tienda para comenzar.</p>
                        </div>
                    `;
                    totalEl.textContent = '$0.00';
                } else {
                    let total = 0;
                    container.innerHTML = carritoTienda.map((rawItem, idx) => {
                        const item = obtenerItemValidado(rawItem);
                        const subtotal = item.precio * item.cantidad;
                        total += subtotal;
                        return `
                            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                                <div class="flex items-center gap-3">
                                    <div class="w-12 h-12 bg-white rounded-lg p-1 border border-slate-200 flex items-center justify-center flex-shrink-0">
                                        <img src="${item.img}" alt="${escapeHTML(item.nombre)}" class="max-h-full max-w-full object-contain">
                                    </div>
                                    <div>
                                        <h5 class="text-xs font-bold text-brand-dark leading-tight">${escapeHTML(item.nombre)}</h5>
                                        <p class="text-[11px] text-slate-500">Talla: <strong class="text-brand-dark">${escapeHTML(item.talla)}</strong></p>
                                        <div class="flex items-center gap-2 mt-1">
                                            <div class="flex items-center bg-white border border-slate-300 rounded-md">
                                                <button onclick="modificarCantidadCarrito(${idx}, -1)" class="w-5 h-5 flex items-center justify-center text-slate-700 hover:bg-slate-100 font-bold text-xs" title="Reducir cantidad">−</button>
                                                <span class="text-xs font-black px-1.5 min-w-[1.2rem] text-center text-brand-dark">${item.cantidad}</span>
                                                <button onclick="modificarCantidadCarrito(${idx}, 1)" class="w-5 h-5 flex items-center justify-center text-slate-700 hover:bg-slate-100 font-bold text-xs" title="Aumentar cantidad">+</button>
                                            </div>
                                            <span class="text-xs font-black text-brand-green">$${subtotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onclick="eliminarItemCarrito(${idx})" class="text-slate-400 hover:text-red-500 p-1.5 transition-colors text-sm" title="Eliminar artículo">
                                    🗑️
                                </button>
                            </div>
                        `;
                    }).join('');
                    totalEl.textContent = `$${total.toFixed(2)}`;
                }

                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }

            function cerrarModalCarrito() {
                const modal = document.getElementById('modal-carrito-tienda');
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }

            function eliminarItemCarrito(index) {
                carritoTienda.splice(index, 1);
                guardarCarrito();
                actualizarBadgeCarrito();
                abrirModalCarrito();
            }

            function vaciarCarrito() {
                carritoTienda = [];
                guardarCarrito();
                actualizarBadgeCarrito();
                abrirModalCarrito();
            }

            function enviarPedidoCompletoWhatsApp() {
                if (carritoTienda.length === 0) {
                    mostrarToast('Pedido Vacío', 'Agrega algún producto antes de enviar tu pedido.');
                    return;
                }

                let total = 0;
                const lineas = carritoTienda.map((rawItem, i) => {
                    const item = obtenerItemValidado(rawItem);
                    const sub = item.precio * item.cantidad;
                    total += sub;
                    return `${i + 1}. ${item.nombre} (Talla: ${item.talla}) x ${item.cantidad} = $${sub.toFixed(2)}`;
                });

                const mensaje = [
                    '¡Hola Club Deportivo Amazonas! Deseo realizar el siguiente pedido oficial:',
                    '',
                    ...lineas,
                    '━━━━━━━━━━━━━━━━━━━━━━━━',
                    `TOTAL ESTIMADO: $${total.toFixed(2)}`,
                    '',
                    '¿Por favor me confirman disponibilidad de tallas y datos para la transferencia bancaria?'
                ].join('\n');

                ejecutarAccionWhatsApp(mensaje);
            }

            function enviarPedidoCompletoFormulario() {
                if (carritoTienda.length === 0) {
                    mostrarToast('Pedido Vacío', 'Agrega algún producto antes de enviar tu pedido.');
                    return;
                }

                let total = 0;
                const lineas = carritoTienda.map((rawItem, i) => {
                    const item = obtenerItemValidado(rawItem);
                    const sub = item.precio * item.cantidad;
                    total += sub;
                    return `${i + 1}. ${item.nombre} (Talla: ${item.talla}) x ${item.cantidad} = $${sub.toFixed(2)}`;
                });

                const resumen = [
                    'Hola dirigentes de C.D. Amazonas, deseo realizar el siguiente pedido oficial desde la web:',
                    '',
                    ...lineas,
                    '━━━━━━━━━━━━━━━━━━━━━━━━',
                    `TOTAL ESTIMADO: $${total.toFixed(2)}`
                ].join('\n');

                cerrarModalCarrito();
                mostrarSeccion('contacto');
                const textarea = document.getElementById('contacto-mensaje');
                if (textarea) {
                    textarea.value = resumen;
                    textarea.focus();
                }
            }

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    cerrarModalProducto();
                    cerrarModalCarrito();
                }
            });

            document.addEventListener('DOMContentLoaded', () => {
                actualizarBadgeCarrito();
                cargarTiendaGoogleSheets();
            });

// Exportar al ámbito global para eventos inline
window.cargarTiendaGoogleSheets = cargarTiendaGoogleSheets;
window.seleccionarCategoriaTienda = seleccionarCategoriaTienda;
window.filtrarProductosTienda = filtrarProductosTienda;
window.abrirModalProducto = abrirModalProducto;
window.cerrarModalProducto = cerrarModalProducto;
window.seleccionarTallaModal = seleccionarTallaModal;
window.seleccionarTallaProducto = seleccionarTallaProducto;
window.ajustarCantidadModal = ajustarCantidadModal;
window.modificarCantidadModal = ajustarCantidadModal; // alias
window.agregarAlCarritoDesdeModal = agregarAlCarritoDesdeModal;
window.agregarAlCarrito = agregarAlCarrito;
window.abrirModalCarrito = abrirModalCarrito;
window.cerrarModalCarrito = cerrarModalCarrito;
window.modificarCantidadCarrito = modificarCantidadCarrito;
window.eliminarItemCarrito = eliminarItemCarrito;
window.eliminarDelCarrito = eliminarItemCarrito; // alias
window.vaciarCarrito = vaciarCarrito;
window.actualizarBadgeCarrito = actualizarBadgeCarrito;
window.pedirProductoModalWhatsApp = pedirProductoModalWhatsApp;
window.pedirPersonalizacionWhatsApp = pedirPersonalizacionWhatsApp;
window.consultarPorFormularioModal = consultarPorFormularioModal;
window.enviarPedidoCompletoWhatsApp = enviarPedidoCompletoWhatsApp;
window.enviarPedidoCompletoFormulario = enviarPedidoCompletoFormulario;
