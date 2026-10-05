/**
 * repositorio.js - Archivo histórico, galería interactiva y visor Lightbox
 * Club Deportivo Amazonas (Malchinguí, Ecuador)
 */

            const SPREADSHEET_REPO_ID = "1GxnHehS9i4QAPCiyVlf3cWfmK1QWqWsQy8juukoZ754";
            const REPO_GID = "0";

            let repositorioDatos = [];
            let repositorioCargado = false;
            let equipoRepoActual = 'masculino';
            let categoriaRepoActual = 'todas';
            let anioRepoActual = 'todos';
            let busquedaRepoActual = '';
            let modoVistaRepoActual = 'grid'; // 'grid' | 'folders'
            let lightboxIndexActual = 0;
            let itemsActualmenteFiltrados = [];

            function renderizarSkeletonsRepo() {
                const grid = document.getElementById('repo-grid-dinamico');
                if (!grid) return;
                grid.innerHTML = Array.from({ length: 8 }).map(() => `
                    <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs animate-pulse">
                        <div class="w-full aspect-[4/3] bg-slate-200"></div>
                        <div class="p-3 space-y-2">
                            <div class="h-3 w-16 bg-slate-200 rounded"></div>
                            <div class="h-4 w-32 bg-slate-300 rounded"></div>
                        </div>
                    </div>
                `).join('');
            }

            function resolverImagenRepo(urlRaw, equipo, imgName) {
                const input = (urlRaw || imgName || '').trim();
                if (!input) return 'assets/img/branding/Amazonas PGN.png';

                // Google Drive
                const matchDrive1 = input.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                const matchDrive2 = input.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                const fileId = (matchDrive1 && matchDrive1[1]) || (matchDrive2 && matchDrive2[1]);
                if (fileId) return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;

                // URL externa o assets/
                if (input.startsWith('http://') || input.startsWith('https://') || input.startsWith('data:')) return input;
                if (input.startsWith('assets/')) return input;

                // Buscar dentro de assets/img/repositorio/<equipo>/<nombre>
                const eqFolder = (equipo === 'femenino' ? 'femenino' : (equipo === 'historico' ? 'historico' : 'masculino'));
                return `assets/img/repositorio/${eqFolder}/${input}`;
            }

            // Catálogo institucional oficial sincronizado con Google Sheets (Garantiza visualización 100% libre de errores offline o CORS)
            const SNAPSHOT_REPOSITORIO_OFICIAL = [
                ['Codigo', 'Equipo', 'Categoria', 'UrlImagen', 'Descripcion'],
                ['M_S_N_3002', 'Masculino', 'Segunda', 'Campeonato2da1.png', 'Segunda'],
                ['M_S_N_3001', 'Masculino', 'Segunda', 'Campeonato2da.jpg', 'Segunda'],
                ['M_S_2026_1021', 'Masculino', 'Máxima', 'CampeonatoMaxima262.jpg', 'Maxima'],
                ['M_S_2026_1020', 'Masculino', 'Máxima', 'CampeonatoMaxima261.jpg', 'Máxima'],
                ['M_S_2026_1019', 'Masculino', 'Máxima', 'CampeonatoMaxima26.jpg', 'Máxima'],
                ['M_S_2026_1018', 'Masculino', 'Máxima', 'CampeonatoMaxima253.jpg', 'Máxima'],
                ['M_S_2026_1017', 'Masculino', 'Máxima', 'CampeonatoMaxima252.jpg', 'Máxima'],
                ['M_S_2026_1016', 'Masculino', 'Máxima', 'CampeonatoMaxima251.jpg', 'Máxima'],
                ['M_S_2026_1015', 'Masculino', 'Máxima', 'CampeonatoMaxima25.jpg', 'Máxima'],
                ['M_S_2026_1014', 'Masculino', 'Máxima', 'CampeonatoMaxima241.jpg', 'Máxima'],
                ['M_S_2026_1013', 'Masculino', 'Máxima', 'CampeonatoMaxima24.jpg', 'Máxima'],
                ['M_S_2026_1012', 'Masculino', 'Máxima', 'CampeonatoMaxima232.jpg', 'Máxima'],
                ['M_S_2026_1011', 'Masculino', 'Máxima', 'CampeonatoMaxima231.jpg', 'Máxima'],
                ['M_S_2026_1010', 'Masculino', 'Máxima', 'CampeonatoMaxima23.jpg', 'Máxima'],
                ['M_S_2026_1009', 'Masculino', 'Máxima', 'CampeonatoMaxima2212.jpg', 'Máxima'],
                ['M_S_2026_1008', 'Masculino', 'Máxima', 'CampeonatoMaxima2211.jpg', 'Máxima'],
                ['M_S_2026_1007', 'Masculino', 'Máxima', 'CampeonatoMaxima226.jpg', 'Máxima'],
                ['M_S_2026_1006', 'Masculino', 'Máxima', 'CampeonatoMaxima227.jpg', 'Máxima'],
                ['M_S_2026_1005', 'Masculino', 'Máxima', 'CampeonatoMaxima228.jpg', 'Máxima'],
                ['M_S_2026_1004', 'Masculino', 'Máxima', 'CampeonatoMaxima226.jpg', 'Máxima'],
                ['M_S_2026_1003', 'Masculino', 'Máxima', 'CampeonatoMaxima226.jpg', 'Máxima'],
                ['M_S_2026_1002', 'Masculino', 'Máxima', 'CampeonatoMaxima223.jpg', 'Máxima'],
                ['M_S_2026_1001', 'Masculino', 'Máxima', 'CampeonatoMaxima22.png', 'Máxima'],
                ['M_P_N_2001', 'Masculino', 'Primera', 'Campeonato1ra.jpg', 'Primera'],
                ['H_H_N_5002', 'Historico', 'Histórico', 'Retro.jpg', 'Histórico'],
                ['H_H_N_5001', 'Historico', 'Histórico', 'Retro2.jpg', 'Histórico'],
                ['F_M_2026_4007', 'Femenino', 'Liga Malchinguí', 'Femenino261.jpg', 'Femenino'],
                ['F_M_2026_4006', 'Femenino', 'Liga Malchinguí', 'Femenino26.jpg', 'Femenino'],
                ['F_M_2026_4005', 'Femenino', 'Liga Malchinguí', 'Femenino251.jpg', 'Femenino'],
                ['F_M_2026_4004', 'Femenino', 'Liga Malchinguí', 'femenino25.jpg', 'Femenino'],
                ['F_M_2026_4003', 'Femenino', 'Copa consuelo', 'Femeninoconsuelo242.jpg', 'Femenino'],
                ['F_M_2026_4002', 'Femenino', 'Copa consuelo', 'Femeninoconsuelo241.jpg', 'Femenino'],
                ['F_M_2026_4001', 'Femenino', 'Copa consuelo', 'Femeninoconsuelo24.jpg', 'Femenino']
            ];

            function procesarFilasRepo(filas) {
                const resultado = [];

                for (let i = 1; i < filas.length; i++) {
                    const r = filas[i];
                    if (!r || r.length < 3 || !r.some(c => c && String(c).trim())) continue;

                    const codigo = String(r[0] || '').trim();
                    const eqRaw = String(r[1] || '').trim();
                    const catRaw = String(r[2] || '').trim();
                    const imgRaw = String(r[3] || '').trim();
                    const descRaw = String(r[4] || '').trim();

                    // Descomponer código según convención: [Equipo]_[Categoria]_[Año]_[Numero]
                    const parts = codigo.split('_');

                    // 1. Determinar Equipo
                    let equipo = 'masculino';
                    const prefEquipo = (parts[0] || '').toUpperCase();
                    if (prefEquipo === 'F' || eqRaw.toLowerCase().includes('fem')) {
                        equipo = 'femenino';
                    } else if (prefEquipo === 'H' || eqRaw.toLowerCase().includes('hist') || eqRaw.toLowerCase().includes('retro')) {
                        equipo = 'historico';
                    }

                    // 2. Determinar Categoría / Torneo
                    let categoria = catRaw;
                    if (equipo === 'masculino') {
                        const prefCat = (parts[1] || '').toUpperCase();
                        const numCode = (parts[3] || '').trim();
                        const catLower = (catRaw || '').toLowerCase();

                        // En el esquema institucional:
                        // - M_S_2026_10xx -> Máxima (letra S / serie 1000)
                        // - M_P_N_20xx    -> Primera (letra P / serie 2000)
                        // - M_S_N_30xx    -> Segunda (letra S / serie 3000)
                        if (catLower.includes('max') || numCode.startsWith('1') || (prefCat === 'S' && parts[2] === '2026') || (prefCat === 'S' && !catLower.includes('seg') && !numCode.startsWith('3'))) {
                            categoria = 'Máxima';
                        } else if (catLower.includes('seg') || numCode.startsWith('3')) {
                            categoria = 'Segunda';
                        } else if (catLower.includes('prim') || prefCat === 'P' || numCode.startsWith('2')) {
                            categoria = 'Primera';
                        } else if (prefCat === 'M') {
                            categoria = 'Máxima';
                        } else {
                            categoria = catRaw || 'Máxima';
                        }
                    } else if (equipo === 'femenino') {
                        // En femenino toma directamente la categoría registrada en el Sheet (ej: Liga Malchinguí, Copa consuelo)
                        categoria = catRaw || 'Torneo Oficial';
                    } else {
                        categoria = catRaw || 'Histórico';
                    }

                    // 3. Determinar Año (desde la 3ra sección del código)
                    // Si contiene 'N' significa sin año registrado
                    let anio = '';
                    if (parts.length >= 3) {
                        const pAnio = parts[2].trim().toUpperCase();
                        if (pAnio !== 'N' && /^\d{4}$/.test(pAnio)) {
                            anio = pAnio;
                        }
                    }

                    // 4. Descripción
                    const desc = descRaw || `${categoria} • C.D. Amazonas`;

                    // 5. Ruta de imagen (no se usa para deducir categorías ni años)
                    const url = resolverImagenRepo(imgRaw, equipo, imgRaw);

                    resultado.push({
                        id: codigo || `FOTO-${i}`,
                        codigo,
                        equipo,
                        categoria,
                        anio,
                        desc,
                        imgRaw,
                        url
                    });
                }

                return resultado;
            }

            function parsearCSVRepo(csvText) {
                const filas = parsearCSV(csvText);
                return procesarFilasRepo(filas);
            }

            function cargarRepositorioViaJSONP() {
                return new Promise((resolve, reject) => {
                    const callbackName = 'cdaCallbackRepo_' + Math.floor(Math.random() * 1000000);
                    const script = document.createElement('script');
                    const timer = setTimeout(() => {
                        try { delete window[callbackName]; } catch (e) {}
                        if (script.parentNode) script.parentNode.removeChild(script);
                        reject(new Error("Timeout al sincronizar Google Sheets por JSONP"));
                    }, 6000);

                    window[callbackName] = function(json) {
                        clearTimeout(timer);
                        try { delete window[callbackName]; } catch (e) {}
                        if (script.parentNode) script.parentNode.removeChild(script);

                        if (json && json.table && Array.isArray(json.table.rows)) {
                            const filas = [
                                ['Codigo', 'Equipo', 'Categoria', 'UrlImagen', 'Descripcion'],
                                ...json.table.rows.map(r => {
                                    if (!r || !Array.isArray(r.c)) return [];
                                    return r.c.map(cell => (cell && cell.v !== null && cell.v !== undefined) ? String(cell.v).trim() : '');
                                })
                            ];
                            resolve(filas);
                        } else {
                            reject(new Error("Formato JSONP no válido"));
                        }
                    };

                    script.src = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_REPO_ID}/gviz/tq?tqx=responseHandler:${callbackName}&gid=${REPO_GID}`;
                    script.onerror = () => {
                        clearTimeout(timer);
                        try { delete window[callbackName]; } catch (e) {}
                        if (script.parentNode) script.parentNode.removeChild(script);
                        reject(new Error("Error al cargar script de Google Sheets"));
                    };

                    document.head.appendChild(script);
                });
            }

            async function cargarRepositorioGoogleSheets() {
                if (repositorioCargado && repositorioDatos.length > 0) return;
                renderizarSkeletonsRepo();

                let filas = null;

                // 1. Intentar JSONP (Funciona 100% sin bloqueo CORS en file:///, localhost y web)
                try {
                    filas = await cargarRepositorioViaJSONP();
                } catch (errJsonp) {
                    console.warn("JSONP no disponible, probando fetch directo:", errJsonp.message);
                }

                // 2. Intentar fetch directo con endpoints de Google Sheets
                if (!filas) {
                    const endpoints = [
                        `https://docs.google.com/spreadsheets/d/${SPREADSHEET_REPO_ID}/gviz/tq?tqx=out:csv&gid=${REPO_GID}`,
                        `https://docs.google.com/spreadsheets/d/${SPREADSHEET_REPO_ID}/export?format=csv&gid=${REPO_GID}`
                    ];
                    for (const url of endpoints) {
                        try {
                            const res = await fetch(url);
                            if (res.ok) {
                                const csvText = await res.text();
                                if (csvText && csvText.includes(',')) {
                                    filas = parsearCSV(csvText);
                                    break;
                                }
                            }
                        } catch (e) {}
                    }
                }

                // 3. Respaldo institucional (garantiza visualización inmediata si no hay red)
                if (!filas || filas.length < 2) {
                    filas = SNAPSHOT_REPOSITORIO_OFICIAL;
                }

                try {
                    repositorioDatos = procesarFilasRepo(filas);
                    repositorioCargado = true;

                    actualizarContadoresEquiposRepo();
                    actualizarSubpestanasRepo();
                    renderizarRepositorio();
                } catch (error) {
                    console.error("Error al procesar repositorio:", error);
                    const grid = document.getElementById('repo-grid-dinamico');
                    if (grid) {
                        grid.innerHTML = `
                            <div class="col-span-full text-center py-12 space-y-3">
                                <p class="text-sm font-semibold text-slate-700">No se pudo sincronizar el repositorio en vivo.</p>
                                <button onclick="repositorioCargado=false; cargarRepositorioGoogleSheets()" class="px-4 py-2 bg-brand-green text-white text-xs font-bold rounded-lg hover:bg-brand-green-hover transition-colors shadow-sm">
                                    Reintentar Conexión
                                </button>
                            </div>
                        `;
                    }
                }
            }

            function actualizarContadoresEquiposRepo() {
                const countMasculino = repositorioDatos.filter(i => i.equipo === 'masculino').length;
                const countFemenino = repositorioDatos.filter(i => i.equipo === 'femenino').length;
                const countHistorico = repositorioDatos.filter(i => i.equipo === 'historico').length;

                const elM = document.getElementById('repo-count-masculino');
                const elF = document.getElementById('repo-count-femenino');
                const elH = document.getElementById('repo-count-historico');

                if (elM) elM.textContent = countMasculino;
                if (elF) elF.textContent = countFemenino;
                if (elH) elH.textContent = countHistorico;
            }

            function cambiarEquipoRepo(nuevoEquipo) {
                equipoRepoActual = nuevoEquipo;
                categoriaRepoActual = 'todas';
                anioRepoActual = 'todos';

                // Actualizar estilos botones de equipo
                const equipos = ['masculino', 'femenino', 'historico'];
                equipos.forEach(eq => {
                    const btn = document.getElementById(`repo-tab-${eq}`);
                    if (!btn) return;
                    if (eq === nuevoEquipo) {
                        if (eq === 'masculino') {
                            btn.className = 'px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 bg-brand-green text-white shadow-sm border border-brand-green';
                        } else if (eq === 'femenino') {
                            btn.className = 'px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 bg-pink-700 text-white shadow-sm border border-pink-700';
                        } else {
                            btn.className = 'px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 bg-brand-gold text-brand-dark shadow-sm border border-brand-gold';
                        }
                    } else {
                        btn.className = 'px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200';
                    }
                });

                actualizarSubpestanasRepo();
                renderizarRepositorio();
            }

            function actualizarSubpestanasRepo() {
                const subContainer = document.getElementById('repo-subpestanas-container');
                if (!subContainer) return;
                subContainer.innerHTML = '';

                // Obtener categorías únicas para este equipo
                const fotosEquipo = repositorioDatos.filter(i => i.equipo === equipoRepoActual);
                const categoriasMap = {};
                fotosEquipo.forEach(f => {
                    categoriasMap[f.categoria] = (categoriasMap[f.categoria] || 0) + 1;
                });

                const subCategorias = [
                    { id: 'todas', label: '📁 Todas las Fotos', count: fotosEquipo.length }
                ];

                if (equipoRepoActual === 'masculino') {
                    if (categoriasMap['Máxima']) subCategorias.push({ id: 'Máxima', label: '🏆 División Máxima', count: categoriasMap['Máxima'] });
                    if (categoriasMap['Primera']) subCategorias.push({ id: 'Primera', label: '🥇 Categoría Primera', count: categoriasMap['Primera'] });
                    if (categoriasMap['Segunda']) subCategorias.push({ id: 'Segunda', label: '🥈 Categoría Segunda', count: categoriasMap['Segunda'] });
                    Object.keys(categoriasMap).forEach(cat => {
                        if (!['Máxima', 'Primera', 'Segunda'].includes(cat)) {
                            subCategorias.push({ id: cat, label: `⚽ ${cat}`, count: categoriasMap[cat] });
                        }
                    });
                } else if (equipoRepoActual === 'femenino') {
                    Object.keys(categoriasMap).forEach(cat => {
                        subCategorias.push({ id: cat, label: `🌸 ${cat}`, count: categoriasMap[cat] });
                    });
                } else {
                    Object.keys(categoriasMap).forEach(cat => {
                        subCategorias.push({ id: cat, label: `📜 ${cat}`, count: categoriasMap[cat] });
                    });
                }

                subCategorias.forEach(sub => {
                    const btn = document.createElement('button');
                    const isActive = (categoriaRepoActual === sub.id);
                    btn.className = isActive
                        ? 'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs bg-brand-green text-white border border-brand-green flex items-center gap-1.5'
                        : 'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 flex items-center gap-1.5';
                    btn.innerHTML = `<span>${escapeHTML(sub.label)}</span><span class="text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'} px-1.5 py-0.5 rounded-full font-black">${sub.count}</span>`;
                    btn.onclick = () => cambiarCategoriaRepo(sub.id);
                    subContainer.appendChild(btn);
                });

                actualizarFiltrosAnioRepo();
            }

            function actualizarFiltrosAnioRepo() {
                const aniosContainer = document.getElementById('repo-filtro-anios-container');
                if (!aniosContainer) return;
                aniosContainer.innerHTML = '';

                // Filtrar según equipo y categoría actual
                const fotos = repositorioDatos.filter(i => {
                    if (i.equipo !== equipoRepoActual) return false;
                    if (categoriaRepoActual !== 'todas' && i.categoria !== categoriaRepoActual) return false;
                    return true;
                });

                const aniosDisponibles = Array.from(new Set(fotos.map(f => f.anio).filter(Boolean))).sort((a, b) => {
                    const nA = parseInt(a, 10);
                    const nB = parseInt(b, 10);
                    if (!isNaN(nA) && !isNaN(nB)) return nB - nA;
                    return b.localeCompare(a);
                });

                if (aniosDisponibles.length <= 1) return;

                const listaAnios = ['todos', ...aniosDisponibles];

                const label = document.createElement('span');
                label.className = 'text-[11px] font-bold text-slate-400 mr-1 uppercase tracking-wider';
                label.textContent = 'Edición / Año:';
                aniosContainer.appendChild(label);

                listaAnios.forEach(a => {
                    const btn = document.createElement('button');
                    const isActive = (anioRepoActual === a);
                    btn.className = isActive
                        ? 'px-2.5 py-0.5 rounded-md text-[11px] font-black transition-all bg-slate-800 text-white shadow-xs'
                        : 'px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all bg-white text-slate-600 hover:bg-slate-100 border border-slate-200';
                    btn.textContent = (a === 'todos' ? 'Todos los Años' : a);
                    btn.onclick = () => cambiarAnioRepo(a);
                    aniosContainer.appendChild(btn);
                });
            }

            function cambiarCategoriaRepo(cat) {
                categoriaRepoActual = cat;
                anioRepoActual = 'todos';
                actualizarSubpestanasRepo();
                renderizarRepositorio();
            }

            function cambiarAnioRepo(anio) {
                anioRepoActual = anio;
                actualizarFiltrosAnioRepo();
                renderizarRepositorio();
            }

            function cambiarModoVistaRepo(modo) {
                modoVistaRepoActual = modo;
                const btnGrid = document.getElementById('repo-view-grid');
                const btnFolders = document.getElementById('repo-view-folders');

                if (modo === 'grid') {
                    btnGrid.className = 'px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-white text-brand-dark shadow-xs border border-slate-200';
                    btnFolders.className = 'px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 transition-all border border-transparent';
                } else {
                    btnFolders.className = 'px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-white text-brand-dark shadow-xs border border-slate-200';
                    btnGrid.className = 'px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 transition-all border border-transparent';
                }

                renderizarRepositorio();
            }

            function filtrarPorBusquedaRepo() {
                const input = document.getElementById('repo-busqueda-input');
                const clearBtn = document.getElementById('repo-busqueda-clear');
                busquedaRepoActual = (input ? input.value : '').trim().toLowerCase();

                if (clearBtn) {
                    if (busquedaRepoActual) clearBtn.classList.remove('hidden');
                    else clearBtn.classList.add('hidden');
                }

                renderizarRepositorio();
            }

            function limpiarBusquedaRepo() {
                const input = document.getElementById('repo-busqueda-input');
                const clearBtn = document.getElementById('repo-busqueda-clear');
                if (input) input.value = '';
                if (clearBtn) clearBtn.classList.add('hidden');
                busquedaRepoActual = '';
                renderizarRepositorio();
            }

            function obtenerItemsFiltradosRepo() {
                return repositorioDatos.filter(item => {
                    if (item.equipo !== equipoRepoActual) return false;
                    if (categoriaRepoActual !== 'todas' && item.categoria !== categoriaRepoActual) return false;
                    if (anioRepoActual !== 'todos' && item.anio !== anioRepoActual) return false;

                    if (busquedaRepoActual) {
                        const blob = `${item.categoria} ${item.desc} ${item.anio} ${item.id} ${item.imgRaw}`.toLowerCase();
                        if (!blob.includes(busquedaRepoActual)) return false;
                    }

                    return true;
                });
            }

            function renderizarRepositorio() {
                const gridContainer = document.getElementById('repo-grid-dinamico');
                const foldersContainer = document.getElementById('repo-folders-view');
                if (!gridContainer || !foldersContainer) return;

                if (modoVistaRepoActual === 'folders') {
                    gridContainer.classList.add('hidden');
                    foldersContainer.classList.remove('hidden');
                    renderizarModoCarpetas(foldersContainer);
                } else {
                    foldersContainer.classList.add('hidden');
                    gridContainer.classList.remove('hidden');
                    renderizarModoGrid(gridContainer);
                }
            }

            function renderizarModoCarpetas(container) {
                container.innerHTML = '';
                const fotosEquipo = repositorioDatos.filter(i => i.equipo === equipoRepoActual);

                // Agrupar por categoría
                const carpetas = {};
                fotosEquipo.forEach(f => {
                    if (!carpetas[f.categoria]) carpetas[f.categoria] = [];
                    carpetas[f.categoria].push(f);
                });

                const nombres = Object.keys(carpetas);
                if (nombres.length === 0) {
                    container.innerHTML = `<div class="col-span-full text-center py-12 text-slate-500 text-xs">No hay álbumes disponibles en esta sección.</div>`;
                    return;
                }

                nombres.forEach(nombre => {
                    const grupo = carpetas[nombre];
                    const portada = grupo[0].url;
                    const tarjeta = document.createElement('div');
                    tarjeta.className = 'cda-album-stack border border-slate-200/80 overflow-hidden shadow-sm transition-all group cursor-pointer flex flex-col';
                    tarjeta.onclick = () => {
                        cambiarModoVistaRepo('grid');
                        cambiarCategoriaRepo(nombre);
                    };

                    tarjeta.innerHTML = `
                        <div class="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden">
                            <img src="${portada}" alt="${escapeHTML(nombre)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.src='assets/img/branding/Amazonas PGN.png'">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                                <span class="text-white text-xs font-black tracking-wider uppercase drop-shadow">${escapeHTML(nombre)}</span>
                                <span class="text-slate-200 text-[11px] font-medium">${grupo.length} Fotografías Oficiales</span>
                            </div>
                            <span class="absolute top-3 right-3 bg-brand-green/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                📁 Carpeta
                            </span>
                        </div>
                        <div class="p-4 flex items-center justify-between mt-auto bg-white border-t border-slate-100">
                            <span class="text-xs font-bold text-brand-green group-hover:underline">Explorar Álbum →</span>
                            <span class="text-[11px] text-slate-400">Ver todas</span>
                        </div>
                    `;
                    container.appendChild(tarjeta);
                });
            }

            function renderizarModoGrid(container) {
                container.innerHTML = '';
                itemsActualmenteFiltrados = obtenerItemsFiltradosRepo();

                if (itemsActualmenteFiltrados.length === 0) {
                    container.innerHTML = `
                        <div class="col-span-full text-center py-14 bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
                            <span class="text-3xl block">🔍</span>
                            <h4 class="font-bold text-slate-700 text-sm">No encontramos fotografías con estos criterios</h4>
                            <p class="text-xs text-slate-400">Intenta restablecer los filtros o buscar con otro término.</p>
                            <button onclick="limpiarBusquedaRepo(); cambiarCategoriaRepo('todas'); cambiarAnioRepo('todos');" class="mt-2 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors">
                                Restablecer Filtros
                            </button>
                        </div>
                    `;
                    return;
                }

                itemsActualmenteFiltrados.forEach((item, index) => {
                    const tarjeta = document.createElement('div');
                    tarjeta.className = 'cda-photo-card group relative cursor-pointer flex flex-col';
                    tarjeta.onclick = () => abrirLightboxRepo(index);

                    const badgeColor = (item.equipo === 'femenino' ? 'bg-pink-700' : (item.equipo === 'historico' ? 'bg-amber-600' : 'bg-brand-green'));

                    tarjeta.innerHTML = `
                        <div class="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden">
                            <img src="${item.url}" alt="${escapeHTML(item.desc)}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.src='assets/img/branding/Amazonas PGN.png'">
                            
                            <!-- Badges Superiores -->
                            <div class="absolute top-2 left-2 flex flex-wrap gap-1">
                                <span class="${badgeColor} text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow-sm">
                                    ${escapeHTML(item.categoria)}
                                </span>
                                ${item.anio ? `<span class="bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs">${escapeHTML(item.anio)}</span>` : ''}
                            </div>

                            <!-- Overlay Hover -->
                            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <span class="bg-white text-brand-dark px-3 py-1.5 rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                    🔍 Ampliar
                                </span>
                            </div>
                        </div>

                        <!-- Detalle inferior de la postal -->
                        <div class="p-3 flex flex-col justify-between flex-grow">
                            <p class="text-xs font-bold text-brand-dark line-clamp-2 group-hover:text-brand-green transition-colors">${escapeHTML(item.desc)}</p>
                            <div class="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-1.5 border-t border-slate-100">
                                <span class="font-semibold text-slate-700">${escapeHTML(item.categoria)}${item.anio ? ' • ' + escapeHTML(item.anio) : ''}</span>
                                <span class="font-bold text-brand-green">Ver postal →</span>
                            </div>
                        </div>
                    `;
                    container.appendChild(tarjeta);
                });
            }

            function abrirLightboxRepo(index) {
                if (!itemsActualmenteFiltrados || itemsActualmenteFiltrados.length === 0) return;
                lightboxIndexActual = index;
                actualizarLightboxContenido();

                const modal = document.getElementById('modal-imagen');
                if (modal) modal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            }

            function actualizarLightboxContenido() {
                if (!itemsActualmenteFiltrados || itemsActualmenteFiltrados.length === 0) return;
                const total = itemsActualmenteFiltrados.length;
                if (lightboxIndexActual < 0) lightboxIndexActual = total - 1;
                if (lightboxIndexActual >= total) lightboxIndexActual = 0;

                const item = itemsActualmenteFiltrados[lightboxIndexActual];
                const imgEl = document.getElementById('modal-img-src');
                const captionEl = document.getElementById('modal-caption');
                const tituloEl = document.getElementById('lightbox-titulo');
                const counterEl = document.getElementById('lightbox-counter');
                const badgeEl = document.getElementById('lightbox-badge-categoria');
                const btnDescargar = document.getElementById('lightbox-btn-descargar');
                const btnAbrir = document.getElementById('lightbox-btn-abrir');

                if (imgEl) imgEl.src = item.url;
                if (captionEl) captionEl.textContent = item.desc;
                if (tituloEl) {
                    tituloEl.textContent = `${item.categoria}${item.anio ? ' • Temporada ' + item.anio : ''}`;
                }
                if (counterEl) counterEl.textContent = `Fotografía ${lightboxIndexActual + 1} de ${total}`;
                if (badgeEl) badgeEl.textContent = item.categoria;

                if (btnDescargar) {
                    btnDescargar.href = item.url;
                    btnDescargar.setAttribute('download', `${item.categoria}_${item.anio || 'Amazonas'}.jpg`);
                }
                if (btnAbrir) {
                    btnAbrir.href = item.url;
                }
            }

            function navegarLightboxRepo(delta) {
                lightboxIndexActual += delta;
                actualizarLightboxContenido();
            }

            function cerrarModalRepo() {
                const modal = document.getElementById('modal-imagen');
                if (modal) modal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }

            // Atajos de teclado para el visor interactivo (Flechas y Escape)
            document.addEventListener('keydown', (e) => {
                const modal = document.getElementById('modal-imagen');
                if (!modal || modal.classList.contains('hidden')) return;

                if (e.key === 'Escape') {
                    cerrarModalRepo();
                } else if (e.key === 'ArrowLeft') {
                    navegarLightboxRepo(-1);
                } else if (e.key === 'ArrowRight') {
                    navegarLightboxRepo(1);
                }
            });

            // Soporte para gestos táctiles Swipe (deslizar izquierda/derecha) en móviles
            let repoTouchStartX = 0;
            let repoTouchEndX = 0;
            const modalRepoDom = document.getElementById('modal-imagen');
            if (modalRepoDom) {
                modalRepoDom.addEventListener('touchstart', (e) => {
                    if (e.changedTouches && e.changedTouches[0]) {
                        repoTouchStartX = e.changedTouches[0].screenX;
                    }
                }, { passive: true });

                modalRepoDom.addEventListener('touchend', (e) => {
                    if (e.changedTouches && e.changedTouches[0]) {
                        repoTouchEndX = e.changedTouches[0].screenX;
                        const diffX = repoTouchEndX - repoTouchStartX;
                        if (Math.abs(diffX) > 45) {
                            if (diffX < 0) {
                                navegarLightboxRepo(1); // Deslizar hacia la izquierda -> siguiente
                            } else {
                                navegarLightboxRepo(-1); // Deslizar hacia la derecha -> anterior
                            }
                        }
                    }
                }, { passive: true });
            }

            document.addEventListener('DOMContentLoaded', () => {
                cargarRepositorioGoogleSheets();
            });

// Exportar al ámbito global para eventos inline
window.cargarRepositorioGoogleSheets = cargarRepositorioGoogleSheets;
window.abrirLightboxRepo = abrirLightboxRepo;
window.abrirModalRepo = abrirLightboxRepo; // alias de compatibilidad
window.cerrarModalRepo = cerrarModalRepo;
window.navegarLightboxRepo = navegarLightboxRepo;
window.cambiarEquipoRepo = cambiarEquipoRepo;
window.cambiarCategoriaRepo = cambiarCategoriaRepo;
window.cambiarAnioRepo = cambiarAnioRepo;
window.cambiarModoVistaRepo = cambiarModoVistaRepo;
window.filtrarPorBusquedaRepo = filtrarPorBusquedaRepo;
window.limpiarBusquedaRepo = limpiarBusquedaRepo;
