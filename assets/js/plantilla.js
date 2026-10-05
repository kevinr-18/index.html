/**
 * plantilla.js - Nómina oficial, estadísticas y Trading Cards coleccionables
 * Club Deportivo Amazonas (Malchinguí, Ecuador)
 */

            const SPREADSHEET_ID = "1EXz8vjq4cILNs_w2S4BLydKToN_arlejavhTKvcwByY";
            const GIDS_CONFIG = {
                masculino: { plantilla: "687593249", cuerpo: "1175652707" },
                femenino: { plantilla: "192660410", cuerpo: "804737150" },
                leyendas: { plantilla: "571554949", cuerpo: null }
            };
            // Resolución universal e inteligente de imágenes: Google Drive, rutas locales, subcarpetas y nombres de archivo
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

            // Alias compatible con llamadas existentes
            function formatearUrlImagen(url, opciones = {}) {
                return resolverUrlImagen(url, opciones);
            }
            // Renderiza Skeleton Loaders anatómicos de Trading Cards
            function renderizarSkeletonsTradingCards(container) {
                container.innerHTML = `
                    <div class="space-y-8 animate-pulse">
                        <div class="h-7 w-48 bg-slate-200 rounded-md"></div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                            ${Array.from({ length: 10 }).map(() => `
                                <div class="rounded-2xl p-1 bg-slate-200 border border-slate-300/60 shadow-md">
                                    <div class="bg-slate-100 rounded-[14px] p-3 flex flex-col justify-between h-[390px]">
                                        <div class="flex justify-between items-center mb-2">
                                            <div class="h-6 w-12 bg-slate-300 rounded"></div>
                                            <div class="h-5 w-14 bg-slate-300 rounded-full"></div>
                                        </div>
                                        <div class="h-44 bg-slate-200 rounded-xl mb-3 flex items-center justify-center">
                                            <div class="w-16 h-16 rounded-full bg-slate-300/60"></div>
                                        </div>
                                        <div class="space-y-2 mb-3">
                                            <div class="h-3 w-20 bg-slate-300 rounded mx-auto"></div>
                                            <div class="h-5 w-32 bg-slate-300 rounded mx-auto"></div>
                                        </div>
                                        <div class="grid grid-cols-5 gap-1 pt-2 border-t border-slate-200">
                                            <div class="h-9 bg-slate-200 rounded"></div>
                                            <div class="h-9 bg-slate-200 rounded"></div>
                                            <div class="h-9 bg-slate-200 rounded"></div>
                                            <div class="h-9 bg-slate-200 rounded"></div>
                                            <div class="h-9 bg-slate-200 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
            const cachePlantillas = {};

            async function cargarDatosPlantilla(tipoTab) {
                const container = document.getElementById('plantilla-dinamica-container');

                // Si los datos de esta categoría ya están en caché, renderizar de inmediato sin latencia
                if (cachePlantillas[tipoTab]) {
                    renderizarPlantillaCompleta(cachePlantillas[tipoTab].csvPlantilla, cachePlantillas[tipoTab].csvCuerpo, tipoTab, container);
                    return;
                }

                renderizarSkeletonsTradingCards(container);
                const config = GIDS_CONFIG[tipoTab];
                if (!config) return;
                try {
                    const urlPlantilla = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${config.plantilla}`;
                    const respPlantilla = await fetch(urlPlantilla);
                    if (!respPlantilla.ok) throw new Error("Error al conectar con Google Sheets");
                    const csvPlantilla = await respPlantilla.text();
                    let csvCuerpo = "";
                    if (config.cuerpo) {
                        try {
                            const urlCuerpo = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${config.cuerpo}`;
                            const respCuerpo = await fetch(urlCuerpo);
                            if (respCuerpo.ok) csvCuerpo = await respCuerpo.text();
                        } catch (e) {
                            console.warn("No se pudo cargar el cuerpo técnico:", e);
                        }
                    }
                    cachePlantillas[tipoTab] = { csvPlantilla, csvCuerpo };
                    renderizarPlantillaCompleta(csvPlantilla, csvCuerpo, tipoTab, container);
                } catch (error) {
                    console.error("Error en la sincronización:", error);
                    container.innerHTML = `
                        <div class="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center max-w-xl mx-auto shadow-sm">
                            <span class="text-3xl block mb-2">⚠️</span>
                            <h4 class="font-serif font-bold text-brand-dark text-base mb-1">Sincronización en proceso</h4>
                            <p class="text-xs text-slate-600 mb-4">No se pudo obtener la nómina en vivo en este momento. Verifica que las hojas de cálculo de Google Sheets tengan permisos públicos de lectura.</p>
                            <button onclick="cargarDatosPlantilla('${tipoTab}')" class="px-4 py-2 bg-brand-green text-white text-xs font-bold rounded-lg hover:bg-brand-green-hover transition-colors">Reintentar Conexión</button>
                        </div>
                    `;
                }
            }
            // Parser CSV seguro que respeta celdas con comillas y comas
            function parsearCSV(csvText) {
                const lineas = csvText.split(/\r?\n/);
                return lineas.map(linea => {
                    const valores = [];
                    let dentroDeComillas = false;
                    let valorActual = '';
                    for (let i = 0; i < linea.length; i++) {
                        const char = linea[i];
                        if (char === '"') {
                            if (dentroDeComillas && linea[i+1] === '"') {
                                valorActual += '"';
                                i++;
                            } else {
                                dentroDeComillas = !dentroDeComillas;
                            }
                        } else if (char === ',' && !dentroDeComillas) {
                            valores.push(valorActual.trim());
                            valorActual = '';
                        } else {
                            valorActual += char;
                        }
                    }
                    valores.push(valorActual.trim());
                    return valores;
                });
            }
            function abreviarPosicion(pos) {
                if (!pos) return 'JUG';
                const p = pos.toUpperCase();
                if (p.includes('ARQ') || p.includes('POR')) return 'POR';
                if (p.includes('DEF') || p.includes('LATERAL') || p.includes('CENTRAL')) return 'DEF';
                if (p.includes('MED') || p.includes('VOL') || p.includes('PIV')) return 'MED';
                if (p.includes('DEL') || p.includes('EXT') || p.includes('PUN')) return 'DEL';
                return 'JUG';
            }
            function renderizarPlantillaCompleta(csvPlantilla, csvCuerpo, tipoTab, container) {
                container.innerHTML = '';
                // 1. Procesar Cuerpo Técnico si existe
                if (csvCuerpo) {
                    const filasCuerpo = parsearCSV(csvCuerpo);
                    let idxCuerpo = 0;
                    for (let i = 0; i < filasCuerpo.length; i++) {
                        const rowStr = filasCuerpo[i].join(' ').toLowerCase();
                        if (rowStr.includes('nombre') || rowStr.includes('nombres')) {
                            idxCuerpo = i + 1;
                            break;
                        }
                    }
                    const tecnicos = [];
                    for (let i = idxCuerpo; i < filasCuerpo.length; i++) {
                        const cols = filasCuerpo[i];
                        if (cols && cols.length >= 2 && (cols[1] || cols[2])) {
                            tecnicos.push({
                                nombre: cols[1] || '',
                                apellido: cols[2] || '',
                                cargo: cols[3] || 'Cuerpo Técnico',
                                fotoUrl: resolverUrlImagen(cols[4] || '', { seccion: 'plantilla', tipoTab })
                            });
                        }
                    }
                    if (tecnicos.length > 0) {
                        const divCuerpo = document.createElement('div');
                        divCuerpo.className = 'max-w-4xl mx-auto bg-slate-900 text-white p-6 sm:p-7 rounded-2xl border border-brand-green/40 mb-12 shadow-xl';
                        divCuerpo.innerHTML = `
                            <div class="text-center mb-6">
                                <span class="text-[10px] font-black uppercase tracking-widest text-brand-gold block">Estrategia & Liderazgo</span>
                                <h4 class="font-serif text-xl sm:text-2xl font-black text-white">Cuerpo Técnico Oficial</h4>
                                <div class="w-12 h-0.5 bg-brand-gold mx-auto mt-2"></div>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-${Math.min(tecnicos.length, 3)} gap-4 text-center">
                                ${tecnicos.map(t => `
                                    <div class="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 hover:border-brand-green/60 transition-colors flex flex-col items-center">
                                        <div class="w-20 h-20 rounded-full overflow-hidden mb-3 bg-brand-dark border-2 border-brand-gold shadow-md">
                                            <img src="${t.fotoUrl || 'assets/img/plantilla/masculino/Jugador_Generico.png'}" alt="${escapeHTML(t.nombre)} ${escapeHTML(t.apellido)}" loading="lazy" class="w-full h-full object-cover" onerror="this.src='assets/img/plantilla/masculino/Jugador_Generico.png'">
                                        </div>
                                        <span class="text-[10px] font-black tracking-wider uppercase text-brand-gold bg-brand-gold/15 px-2 py-0.5 rounded-full mb-1.5">${escapeHTML(t.cargo || 'Dirección Técnica')}</span>
                                        <span class="text-sm font-bold text-white">${escapeHTML(t.nombre)} ${escapeHTML(t.apellido)}</span>
                                    </div>
                                `).join('')}
                            </div>
                        `;
                        container.appendChild(divCuerpo);
                    }
                }
                // 2. Procesar Nómina de Jugadores / Leyendas
                const filasPlantilla = parsearCSV(csvPlantilla);
                let idxPlantilla = 0;
                for (let i = 0; i < filasPlantilla.length; i++) {
                    const textoFila = filasPlantilla[i].join(' ').toLowerCase();
                    if (textoFila.includes('nombre') || textoFila.includes('apellido') || textoFila.includes('dorsal') || textoFila.includes('ritmo') || textoFila.includes('defensa') || textoFila.includes('cedula') || textoFila.includes('cédula')) {
                        idxPlantilla = i + 1;
                        break;
                    }
                }
                const categoriasJugadores = {
                    'PORTERO': [],
                    'DEFENSA': [],
                    'MEDIOCAMPISTA': [],
                    'DELANTERO': [],
                    'OTROS': []
                };
                for (let i = idxPlantilla; i < filasPlantilla.length; i++) {
                    const cols = filasPlantilla[i];
                    if (!cols || cols.length < 4) continue;
                    // MAPEO EXACTO SEGÚN ESTRUCTURA DE GOOGLE SHEETS:
                    // Col A (idx 0): ID / Num
                    // Col B (idx 1): Dorsal
                    const numCamiseta = (cols[1] && cols[1].trim() !== '') ? cols[1].trim() : '•';
                    // Col C (idx 2): Ritmo (RIT)
                    const rit = (cols[2] && cols[2].trim() !== '' && !isNaN(cols[2].trim())) ? cols[2].trim() : '75';
                    // Col D (idx 3): Nombres
                    const nombres = (cols[3] || '').trim();
                    // Col E (idx 4): Apellidos
                    const apellidos = (cols[4] || '').trim();
                    // Col F (idx 5): Fecha de Nacimiento
                    const fechaNac = (cols[5] && cols[5].trim() !== '') ? cols[5].trim() : 'No registrada';
                    // Col G (idx 6): Observación / Rol
                    const observacion = (cols[6] && cols[6].trim() !== '') ? cols[6].trim() : 'Nacional';
                    // Col H (idx 7): Tiro (TIR)
                    const tir = (cols[7] && cols[7].trim() !== '' && !isNaN(cols[7].trim())) ? cols[7].trim() : '70';
                    // Col I (idx 8): Pase (PAS)
                    const pas = (cols[8] && cols[8].trim() !== '' && !isNaN(cols[8].trim())) ? cols[8].trim() : '72';
                    // Col J (idx 9): Defensa (DEF)
                    let def = (cols[9] && cols[9].trim() !== '' && !isNaN(cols[9].trim())) ? cols[9].trim() : '70';
                    // Col K (idx 10): Regate (REG)
                    const reg = (cols[10] && cols[10].trim() !== '' && !isNaN(cols[10].trim())) ? cols[10].trim() : '74';
                    // Col L (idx 11): Foto URL (con soporte para enlaces de Google Drive, rutas relativas y nombres de archivo)
                    const fotoUrl = resolverUrlImagen(cols[11] || '', { seccion: 'plantilla', tipoTab });
                    // Col M (idx 12): Posición
                    let posicionRaw = (cols[12] && cols[12].trim() !== '') ? cols[12].trim() : '';
                    // Comprobación inteligente por si las columnas J (DEF) y M (Posición) se intercambiaron
                    if (isNaN(def) && !isNaN(posicionRaw) && posicionRaw !== '') {
                        const temp = posicionRaw;
                        posicionRaw = cols[9].trim();
                        def = temp;
                    }
                    const posicion = (posicionRaw || 'MEDIOCAMPISTA').toUpperCase();
                    if (!nombres && !apellidos) continue;
                    // Cálculo del OVR (Overall Rating) promedio de las 5 estadísticas
                    const ovr = Math.round((Number(rit) + Number(tir) + Number(pas) + Number(reg) + Number(def)) / 5);
                    const jugadorObj = {
                        num: numCamiseta,
                        nombres,
                        apellidos,
                        fechaNac,
                        observacion,
                        posicion,
                        fotoUrl,
                        rit,
                        tir,
                        pas,
                        reg,
                        def,
                        ovr
                    };
                    if (posicion.includes('ARQUERO') || posicion.includes('PORTERO') || posicion.includes('ARQ') || posicion.includes('POR')) {
                        categoriasJugadores['PORTERO'].push(jugadorObj);
                    } else if (posicion.includes('DEF') || posicion.includes('LATERAL') || posicion.includes('CENTRAL')) {
                        categoriasJugadores['DEFENSA'].push(jugadorObj);
                    } else if (posicion.includes('MEDIO') || posicion.includes('VOLANTE') || posicion.includes('PIV') || posicion.includes('EXTREMO') || posicion.includes('CENTRO')) {
                        categoriasJugadores['MEDIOCAMPISTA'].push(jugadorObj);
                    } else if (posicion.includes('DEL') || posicion.includes('PUNTA') || posicion.includes('ATACANTE')) {
                        categoriasJugadores['DELANTERO'].push(jugadorObj);
                    } else {
                        categoriasJugadores['OTROS'].push(jugadorObj);
                    }
                }
                const seccionesOrden = [
                    { key: 'PORTERO', title: 'Porteros / Arqueros' },
                    { key: 'DEFENSA', title: 'Defensas' },
                    { key: 'MEDIOCAMPISTA', title: 'Mediocampistas' },
                    { key: 'DELANTERO', title: 'Delanteros' },
                    { key: 'OTROS', title: 'Otros Registros' }
                ];
                let hayRegistros = false;
                seccionesOrden.forEach(sec => {
                    const lista = categoriasJugadores[sec.key];
                    if (lista && lista.length > 0) {
                        hayRegistros = true;
                        const divSec = document.createElement('div');
                        divSec.className = 'mb-14';
                        let titleBorderClass = 'border-brand-green text-brand-green';
                        if (tipoTab === 'femenino') titleBorderClass = 'border-brand-rose text-brand-rose';
                        if (tipoTab === 'leyendas') titleBorderClass = 'border-brand-gold text-brand-gold';
                        divSec.innerHTML = `
                            <div class="flex items-center gap-3 mb-6">
                                <span class="w-2.5 h-7 bg-current ${titleBorderClass} rounded-full"></span>
                                <h4 class="font-serif text-xl sm:text-2xl font-black text-brand-dark tracking-tight">${sec.title}</h4>
                                <span class="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">${lista.length}</span>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-6" id="grid-${tipoTab}-${sec.key}"></div>
                        `;
                        container.appendChild(divSec);
                        const grid = divSec.querySelector(`#grid-${tipoTab}-${sec.key}`);
                        lista.forEach(j => {
                            const tarjeta = document.createElement('div');
                            // Configuración visual según Tab (Masculino, Femenino o Leyendas)
                            let borderGradient = 'from-emerald-500 via-emerald-800 to-[#046a38]';
                            let cardBg = 'bg-gradient-to-b from-[#112318] via-[#09150e] to-[#040a07]';
                            let shadowHover = 'hover:shadow-tcg-green';
                            let posBadgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40';
                            let ovrColor = 'text-emerald-400';
                            let dorsalBg = 'bg-emerald-600/30 text-white border-emerald-400/30';
                            let statBarColor = 'bg-emerald-500';
                            if (tipoTab === 'femenino') {
                                borderGradient = 'from-pink-400 via-rose-700 to-[#f179c5]';
                                cardBg = 'bg-gradient-to-b from-[#24101e] via-[#160812] to-[#0b0309]';
                                shadowHover = 'hover:shadow-tcg-rose';
                                posBadgeColor = 'bg-pink-500/20 text-pink-300 border-pink-400/40';
                                ovrColor = 'text-pink-400';
                                dorsalBg = 'bg-pink-600/30 text-white border-pink-400/30';
                                statBarColor = 'bg-pink-500';
                            } else if (tipoTab === 'leyendas') {
                                borderGradient = 'from-amber-300 via-yellow-600 to-[#d4af37]';
                                cardBg = 'bg-gradient-to-b from-[#251b08] via-[#171104] to-[#0a0701]';
                                shadowHover = 'hover:shadow-tcg-gold';
                                posBadgeColor = 'bg-amber-400/20 text-brand-gold border-brand-gold/50';
                                ovrColor = 'text-brand-gold';
                                dorsalBg = 'bg-amber-500/30 text-brand-gold border-amber-400/40';
                                statBarColor = 'bg-brand-gold';
                            }
                            const esArquero = (j.posicion || '').toUpperCase().includes('ARQ') || (j.posicion || '').toUpperCase().includes('POR');
                            const fallbackFoto = esArquero ? 'assets/img/plantilla/masculino/Portero_Generico.png' : 'assets/img/plantilla/masculino/Jugador_Generico.png';
                            const imagenFinal = (j.fotoUrl && j.fotoUrl.trim() !== '') ? j.fotoUrl : fallbackFoto;
                            const posAbrev = abreviarPosicion(j.posicion);
                            // Estructura de la Trading Card de Alta Gama
                            const legendGlow = (tipoTab === 'leyendas') ? 'tcg-legend-glow ' : '';
                            tarjeta.className = `tcg-shimmer-effect ${legendGlow}group relative rounded-2xl p-[2px] bg-gradient-to-b ${borderGradient} shadow-xl ${shadowHover} transition-all duration-300 cursor-pointer flex flex-col hover:scale-[1.02]`;
                            tarjeta.setAttribute('title', 'Toca para ver ficha técnica detallada');
                            tarjeta.onclick = () => abrirModalFichaJugador(j, tipoTab);
                            tarjeta.innerHTML = `
                                <div class="${cardBg} rounded-[14px] p-3.5 flex flex-col justify-between h-full relative z-10 text-white overflow-hidden">
                                    
                                    <!-- Cabecera de la Trading Card: OVR, Posición y Dorsal -->
                                    <div class="flex justify-between items-center pb-2.5 mb-2.5 border-b border-white/10">
                                        <div class="flex items-center gap-1.5">
                                            <span class="text-lg font-black font-sans tracking-tight ${ovrColor} drop-shadow">${escapeHTML(j.ovr)}</span>
                                            <span class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${posBadgeColor}">
                                                ${escapeHTML(posAbrev)}
                                            </span>
                                        </div>
                                        <div class="flex items-center gap-1">
                                            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">DORSAL</span>
                                            <span class="text-xs font-black px-2 py-0.5 rounded-md border ${dorsalBg}">
                                                #${escapeHTML(j.num)}
                                            </span>
                                        </div>
                                    </div>
                                    <!-- Retrato del Jugador Integrado con Marco Biselado -->
                                    <div class="relative h-44 sm:h-48 w-full rounded-xl overflow-hidden bg-gradient-to-b from-black/40 via-black/20 to-black/70 border border-white/10 flex items-center justify-center p-1 mb-3">
                                        <img src="${imagenFinal}" alt="${escapeHTML(j.nombres)} ${escapeHTML(j.apellidos)}" loading="lazy" class="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105" onerror="this.src='${fallbackFoto}'; this.classList.remove('object-cover'); this.classList.add('object-contain', 'p-2');">
                                        <div class="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/90 to-transparent pointer-events-none"></div>
                                        <img src="assets/img/branding/Amazonas PGN.png" class="absolute bottom-1 right-1.5 h-5 w-auto opacity-30 pointer-events-none" alt="Escudo Watermark">
                                    </div>
                                    <!-- Identificación del Jugador (Nombre y APELLIDO EN MAYÚSCULAS) -->
                                    <div class="text-center mb-3">
                                        <p class="text-[11px] font-medium text-slate-300 truncate tracking-wide">${escapeHTML(j.nombres || 'Jugador')}</p>
                                        <h5 class="text-sm sm:text-base font-black font-serif text-white tracking-wide uppercase truncate drop-shadow-sm">
                                            ${escapeHTML(j.apellidos || j.nombres)}
                                        </h5>
                                        <div class="flex items-center justify-center gap-2 mt-1 text-[10px] text-slate-400">
                                            <span class="truncate">📅 ${escapeHTML(j.fechaNac)}</span>
                                            <span>•</span>
                                            <span class="truncate font-medium text-slate-300">📍 ${escapeHTML(j.observacion)}</span>
                                        </div>
                                    </div>
                                    <!-- Rejilla de Atributos Deportivos (0-99): RIT | TIR | PAS | REG | DEF -->
                                    <div class="pt-2 border-t border-white/10 bg-black/40 -mx-3.5 -mb-3.5 p-3 rounded-b-[14px]">
                                        <div class="grid grid-cols-5 gap-1 text-center">
                                            
                                            <!-- RIT (Col C) -->
                                            <div class="bg-white/5 py-1 px-0.5 rounded border border-white/5 flex flex-col items-center">
                                                <span class="text-[8px] font-extrabold text-slate-400 uppercase tracking-tighter">RIT</span>
                                                <span class="text-xs font-black text-white">${escapeHTML(j.rit)}</span>
                                                <div class="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                                                    <div class="h-full ${statBarColor}" style="width: ${Math.min(100, Math.max(0, Number(j.rit) || 0))}%"></div>
                                                </div>
                                            </div>
                                            <!-- TIR (Col H) -->
                                            <div class="bg-white/5 py-1 px-0.5 rounded border border-white/5 flex flex-col items-center">
                                                <span class="text-[8px] font-extrabold text-slate-400 uppercase tracking-tighter">TIR</span>
                                                <span class="text-xs font-black text-white">${escapeHTML(j.tir)}</span>
                                                <div class="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                                                    <div class="h-full ${statBarColor}" style="width: ${Math.min(100, Math.max(0, Number(j.tir) || 0))}%"></div>
                                                </div>
                                            </div>
                                            <!-- PAS (Col I) -->
                                            <div class="bg-white/5 py-1 px-0.5 rounded border border-white/5 flex flex-col items-center">
                                                <span class="text-[8px] font-extrabold text-slate-400 uppercase tracking-tighter">PAS</span>
                                                <span class="text-xs font-black text-white">${escapeHTML(j.pas)}</span>
                                                <div class="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                                                    <div class="h-full ${statBarColor}" style="width: ${Math.min(100, Math.max(0, Number(j.pas) || 0))}%"></div>
                                                </div>
                                            </div>
                                            <!-- REG (Col K) -->
                                            <div class="bg-white/5 py-1 px-0.5 rounded border border-white/5 flex flex-col items-center">
                                                <span class="text-[8px] font-extrabold text-slate-400 uppercase tracking-tighter">REG</span>
                                                <span class="text-xs font-black text-white">${escapeHTML(j.reg)}</span>
                                                <div class="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                                                    <div class="h-full ${statBarColor}" style="width: ${Math.min(100, Math.max(0, Number(j.reg) || 0))}%"></div>
                                                </div>
                                            </div>
                                            <!-- DEF (Col J) -->
                                            <div class="bg-white/5 py-1 px-0.5 rounded border border-white/5 flex flex-col items-center">
                                                <span class="text-[8px] font-extrabold text-slate-400 uppercase tracking-tighter">DEF</span>
                                                <span class="text-xs font-black text-white">${escapeHTML(j.def)}</span>
                                                <div class="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                                                    <div class="h-full ${statBarColor}" style="width: ${Math.min(100, Math.max(0, Number(j.def) || 0))}%"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
                            grid.appendChild(tarjeta);
                        });
                    }
                });
                if (!hayRegistros) {
                    container.innerHTML = `
                        <div class="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
                            <img src="assets/img/branding/Amazonas PGN.png" class="h-16 w-auto mx-auto mb-3 opacity-40" alt="CDA">
                            <h4 class="font-serif font-bold text-slate-600 text-sm">No se encontraron registros de jugadores en esta nómina.</h4>
                        </div>
                    `;
                }
            }
            function cambiarPlantillaTab(tipoTab) {
                const tabs = [
                    { id: 'masculino', bg: 'bg-brand-green text-white shadow-tcg-green border-2 border-brand-green' },
                    { id: 'femenino', bg: 'bg-brand-rose text-white shadow-tcg-rose border-2 border-brand-rose' },
                    { id: 'leyendas', bg: 'bg-gradient-to-r from-brand-gold to-yellow-500 text-brand-dark shadow-tcg-gold border-2 border-yellow-300' }
                ];
                tabs.forEach(t => {
                    const btn = document.getElementById(`btn-tab-${t.id}`);
                    if (btn) {
                        if (t.id === tipoTab) {
                            btn.className = `plantilla-tab-btn px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 ${t.bg} scale-105`;
                        } else {
                            btn.className = 'plantilla-tab-btn px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-brand-dark shadow-sm';
                        }
                    }
                });
                cargarDatosPlantilla(tipoTab);
            }

            function abrirModalFichaJugador(j, tipoTab) {
                if (!j) return;
                const modal = document.getElementById('modal-ficha-jugador');
                if (!modal) return;

                const fallbackFoto = (tipoTab === 'femenino') 
                    ? 'assets/img/plantilla/femenino/default_femenino.png' 
                    : (tipoTab === 'leyendas' ? 'assets/img/plantilla/leyendas/default_leyendas.png' : 'assets/img/plantilla/masculino/default_masculino.png');
                const fotoFinal = (j.fotoUrl && j.fotoUrl.trim() !== '') ? j.fotoUrl : fallbackFoto;

                const fotoEl = document.getElementById('modal-jugador-foto');
                if (fotoEl) fotoEl.src = fotoFinal;

                const ovrEl = document.getElementById('modal-jugador-ovr');
                if (ovrEl) ovrEl.textContent = escapeHTML(j.ovr || '80');

                const posEl = document.getElementById('modal-jugador-pos');
                if (posEl) posEl.textContent = escapeHTML(abreviarPosicion(j.posicion));

                const dorsalEl = document.getElementById('modal-jugador-dorsal');
                if (dorsalEl) dorsalEl.textContent = '#' + escapeHTML(j.num || '0');

                const nomEl = document.getElementById('modal-jugador-nombres');
                if (nomEl) nomEl.textContent = escapeHTML(j.nombres || '');

                const apeEl = document.getElementById('modal-jugador-apellidos');
                if (apeEl) apeEl.textContent = escapeHTML(j.apellidos || j.nombres || 'Jugador');

                const fecEl = document.getElementById('modal-jugador-fecha');
                if (fecEl) fecEl.textContent = `📅 Fecha Nac: ${escapeHTML(j.fechaNac || 'No registrada')}`;

                const obsEl = document.getElementById('modal-jugador-obs');
                if (obsEl) obsEl.textContent = `📍 Origen: ${escapeHTML(j.observacion || 'Malchinguí')}`;

                const stats = [
                    { id: 'rit', val: Number(j.rit) || 0 },
                    { id: 'tir', val: Number(j.tir) || 0 },
                    { id: 'pas', val: Number(j.pas) || 0 },
                    { id: 'reg', val: Number(j.reg) || 0 },
                    { id: 'def', val: Number(j.def) || 0 },
                ];

                const barColor = (tipoTab === 'femenino') ? 'bg-pink-500' : (tipoTab === 'leyendas' ? 'bg-amber-400' : 'bg-emerald-500');

                stats.forEach(s => {
                    const valEl = document.getElementById(`modal-stat-${s.id}-val`);
                    const barEl = document.getElementById(`modal-stat-${s.id}-bar`);
                    if (valEl) valEl.textContent = s.val;
                    if (barEl) {
                        barEl.className = `h-full ${barColor} transition-all duration-500`;
                        barEl.style.width = `${Math.min(100, Math.max(0, s.val))}%`;
                    }
                });

                modal.classList.remove('hidden');
                modal.classList.add('flex');
                document.body.style.overflow = 'hidden';
            }

            function cerrarModalFichaJugador() {
                const modal = document.getElementById('modal-ficha-jugador');
                if (modal) {
                    modal.classList.add('hidden');
                    modal.classList.remove('flex');
                }
                document.body.style.overflow = 'auto';
            }

// Exportar al ámbito global para eventos inline
window.cargarDatosPlantilla = cargarDatosPlantilla;
window.cambiarPlantillaTab = cambiarPlantillaTab;
window.abrirModalFichaJugador = abrirModalFichaJugador;
window.cerrarModalFichaJugador = cerrarModalFichaJugador;
window.renderizarSkeletonsTradingCards = renderizarSkeletonsTradingCards;
