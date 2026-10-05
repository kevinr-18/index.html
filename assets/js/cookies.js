/**
 * cookies.js - Centro de preferencias de cookies y modales legales RGPD / LOPDP
 * Club Deportivo Amazonas (Malchinguí, Ecuador)
 */

        // GESTIÓN DE COOKIES Y CUMPLIMIENTO LEGAL (RGPD / LOPDP)
        // ==========================================
        const CDA_COOKIES = {
            STORAGE_KEY: 'cda_cookie_consent',
            
            getConsent() {
                try {
                    const raw = localStorage.getItem(this.STORAGE_KEY);
                    return raw ? JSON.parse(raw) : null;
                } catch (e) {
                    return null;
                }
            },

            hasAnswered() {
                const c = this.getConsent();
                return !!(c && c.timestamp);
            },

            setConsent(opts) {
                const consent = {
                    timestamp: Date.now(),
                    tecnicas: true,
                    analiticas: !!opts.analiticas,
                    preferencias: !!opts.preferencias
                };
                try {
                    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(consent));
                } catch (e) {
                    console.warn('No se pudo guardar la configuración de cookies en LocalStorage:', e);
                }
                this.aplicarConsentimiento(consent);
                this.ocultarBanner();
                return consent;
            },

            aceptarTodas() {
                this.setConsent({ analiticas: true, preferencias: true });
                this.cerrarConfig();
                mostrarToast('Preferencias Guardadas', 'Has aceptado todas las cookies. ¡Gracias por apoyar la experiencia digital de C.D. Amazonas!');
            },

            rechazarNoEsenciales() {
                this.setConsent({ analiticas: false, preferencias: false });
                this.cerrarConfig();
                mostrarToast('Preferencias Guardadas', 'Solo se mantendrán activas las cookies técnicas y de seguridad necesarias para la web.');
            },

            configurar() {
                this.ocultarBanner();
                abrirModalConfigCookies();
            },

            guardarPreferencias() {
                const an = document.getElementById('cookie-opt-analiticas');
                const pref = document.getElementById('cookie-opt-preferencias');
                this.setConsent({
                    analiticas: an ? an.checked : false,
                    preferencias: pref ? pref.checked : false
                });
                this.cerrarConfig();
                mostrarToast('Preferencias Actualizadas', 'Tus preferencias de cookies y privacidad han sido guardadas correctamente.');
            },

            cerrarConfig() {
                cerrarModalConfigCookies();
            },

            ocultarBanner() {
                const banner = document.getElementById('cda-cookie-banner');
                if (banner) banner.classList.add('hidden');
            },

            aplicarConsentimiento(consent) {
                if (consent && consent.analiticas) {
                    window['cda_analiticas_permitidas'] = true;
                    window.dispatchEvent(new CustomEvent('cda:analiticas:activadas'));
                } else {
                    window['cda_analiticas_permitidas'] = false;
                    window.dispatchEvent(new CustomEvent('cda:analiticas:desactivadas'));
                }
            },

            iniciar() {
                const consent = this.getConsent();
                if (!consent) {
                    setTimeout(() => {
                        const banner = document.getElementById('cda-cookie-banner');
                        if (banner) banner.classList.remove('hidden');
                    }, 500);
                } else {
                    this.aplicarConsentimiento(consent);
                }
            }
        };

        function abrirModalConfigCookies() {
            const modal = document.getElementById('modal-config-cookies');
            const consent = CDA_COOKIES.getConsent() || { analiticas: false, preferencias: false };
            const chkAn = document.getElementById('cookie-opt-analiticas');
            const chkPref = document.getElementById('cookie-opt-preferencias');
            if (chkAn) chkAn.checked = !!consent.analiticas;
            if (chkPref) chkPref.checked = !!consent.preferencias;
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
        }

        function cerrarModalConfigCookies() {
            const modal = document.getElementById('modal-config-cookies');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        }

        function abrirModalLegal(seccion = 'privacidad') {
            const modal = document.getElementById('modal-documento-legal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
                cambiarTabLegal(seccion);
            }
        }

        function cerrarModalLegal() {
            const modal = document.getElementById('modal-documento-legal');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        }

        function cambiarTabLegal(tabId) {
            const tabs = ['privacidad', 'aviso', 'cookies'];
            tabs.forEach(t => {
                const content = document.getElementById(`legal-content-${t}`);
                const btn = document.getElementById(`tab-btn-legal-${t}`);
                if (content) {
                    if (t === tabId) {
                        content.classList.remove('hidden');
                    } else {
                        content.classList.add('hidden');
                    }
                }
                if (btn) {
                    if (t === tabId) {
                        btn.className = 'tab-btn-legal px-4 py-2.5 text-xs font-bold border-b-2 border-brand-green text-brand-green bg-emerald-50/50 transition-all whitespace-nowrap';
                    } else {
                        btn.className = 'tab-btn-legal px-4 py-2.5 text-xs font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-800 transition-all whitespace-nowrap';
                    }
                }
            });
            const scrollCont = document.getElementById('legal-scroll-container');
            if (scrollCont) scrollCont.scrollTop = 0;
        }


// Exportar al ámbito global para eventos inline y footer
window.CDA_COOKIES = CDA_COOKIES;
window.abrirModalConfigCookies = abrirModalConfigCookies;
window.cerrarModalConfigCookies = cerrarModalConfigCookies;
window.abrirModalLegal = abrirModalLegal;
window.cerrarModalLegal = cerrarModalLegal;
window.cambiarTabLegal = cambiarTabLegal;
