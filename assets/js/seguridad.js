/**
 * seguridad.js - Control anti-spam, hCaptcha, cooldown temporal y envío seguro Web3Forms
 * Club Deportivo Amazonas (Malchinguí, Ecuador)
 */

        // SISTEMA DE SEGURIDAD Y CONTROL ANTI-SPAM
        // ==========================================
        const SEGURIDAD_CONFIG = {
            COOLDOWN_MS: 5 * 60 * 1000,      // 5 minutos de espera entre envíos por dispositivo
            MAX_ENVIOS_DIARIOS: 3             // Máximo 3 consultas al día por dispositivo para proteger la cuota
        };

        let intervaloCooldown = null;

        function resetearCaptcha() {
            if (typeof hcaptcha !== 'undefined' && hcaptcha && typeof hcaptcha.reset === 'function') {
                try { hcaptcha.reset(); } catch (err) {}
            }
            const errorCaptcha = document.getElementById('captcha-error');
            if (errorCaptcha) errorCaptcha.classList.add('hidden');
        }

        function generarNuevoCaptcha() {
            resetearCaptcha();
        }

        function obtenerEnviosHoy() {
            const hoy = new Date().toISOString().split('T')[0];
            try {
                const data = JSON.parse(localStorage.getItem('cda_envios_hoy') || '{}');
                if (data.fecha === hoy) return data.count || 0;
            } catch (e) {}
            return 0;
        }

        function registrarEnvioExitoso() {
            const ahora = Date.now();
            const hoy = new Date().toISOString().split('T')[0];
            const enviosHoy = obtenerEnviosHoy() + 1;
            
            try {
                localStorage.setItem('cda_ultimo_envio', ahora.toString());
                localStorage.setItem('cda_envios_hoy', JSON.stringify({ fecha: hoy, count: enviosHoy }));
            } catch (e) {}
            
            iniciarContadorCooldown(SEGURIDAD_CONFIG.COOLDOWN_MS);
        }

        function iniciarContadorCooldown(milisegundosRestantes) {
            const btnSubmit = document.getElementById('btn-enviar-contacto');
            const alertaCooldown = document.getElementById('contacto-cooldown-alerta');
            const contadorEl = document.getElementById('cooldown-contador');
            
            if (intervaloCooldown) clearInterval(intervaloCooldown);
            
            if (btnSubmit) btnSubmit.disabled = true;
            if (alertaCooldown) alertaCooldown.classList.remove('hidden');

            let tiempoRestante = Math.ceil(milisegundosRestantes / 1000);

            function actualizarTexto() {
                const minutos = Math.floor(tiempoRestante / 60);
                const segundos = tiempoRestante % 60;
                const texto = minutos > 0 ? `${minutos}m ${segundos < 10 ? '0' : ''}${segundos}s` : `${segundos}s`;
                
                if (contadorEl) contadorEl.textContent = texto;
                if (btnSubmit) {
                    btnSubmit.innerHTML = `<span>⏳ Pausa anti-spam (${texto})</span>`;
                }
            }

            actualizarTexto();

            intervaloCooldown = setInterval(() => {
                tiempoRestante--;
                if (tiempoRestante <= 0) {
                    clearInterval(intervaloCooldown);
                    intervaloCooldown = null;
                    if (alertaCooldown) alertaCooldown.classList.add('hidden');
                    if (btnSubmit) {
                        btnSubmit.disabled = false;
                        btnSubmit.innerHTML = 'Enviar Mensaje Seguro';
                    }
                } else {
                    actualizarTexto();
                }
            }, 1000);
        }

        function verificarEstadoSeguridadInicial() {
            generarNuevoCaptcha();

            // 1. Contador de caracteres en tiempo real
            const textareaMensaje = document.getElementById('contacto-mensaje');
            const contadorChars = document.getElementById('contador-caracteres');
            if (textareaMensaje && contadorChars) {
                textareaMensaje.addEventListener('input', () => {
                    contadorChars.textContent = `${textareaMensaje.value.length} / 1200`;
                });
            }

            // 2. Limpieza de avisos de validación al interactuar
            const inputEmail = document.getElementById('contacto-email');
            const inputTelefono = document.getElementById('contacto-telefono');
            const avisoVacio = document.getElementById('contacto-aviso-vacio');
            const limpiarAvisoVacio = () => {
                if (avisoVacio) avisoVacio.classList.add('hidden');
            };
            if (inputEmail) inputEmail.addEventListener('input', limpiarAvisoVacio);
            if (inputTelefono) inputTelefono.addEventListener('input', limpiarAvisoVacio);

            const inputCaptcha = document.getElementById('contacto-captcha');
            const errorCaptcha = document.getElementById('captcha-error');
            if (inputCaptcha) {
                inputCaptcha.addEventListener('input', () => {
                    if (errorCaptcha) errorCaptcha.classList.add('hidden');
                });
            }

            // 3. Revisar si hay cooldown activo en localStorage
            try {
                const ultimoEnvio = parseInt(localStorage.getItem('cda_ultimo_envio') || '0', 10);
                if (ultimoEnvio) {
                    const transcurrido = Date.now() - ultimoEnvio;
                    if (transcurrido < SEGURIDAD_CONFIG.COOLDOWN_MS) {
                        iniciarContadorCooldown(SEGURIDAD_CONFIG.COOLDOWN_MS - transcurrido);
                        return;
                    }
                }

                // 4. Revisar si se alcanzó el límite diario
                const enviosHoy = obtenerEnviosHoy();
                if (enviosHoy >= SEGURIDAD_CONFIG.MAX_ENVIOS_DIARIOS) {
                    const btnSubmit = document.getElementById('btn-enviar-contacto');
                    const alertaCooldown = document.getElementById('contacto-cooldown-alerta');
                    if (btnSubmit) {
                        btnSubmit.disabled = true;
                        btnSubmit.innerHTML = '<span>Límite diario alcanzado</span>';
                    }
                    if (alertaCooldown) {
                        alertaCooldown.classList.remove('hidden');
                        alertaCooldown.innerHTML = `🛡️ <strong>Límite diario alcanzado:</strong> Has enviado el máximo de consultas permitidas hoy (${SEGURIDAD_CONFIG.MAX_ENVIOS_DIARIOS}). Si necesitas atención urgente, escríbenos directamente a <strong>cdamazonass@gmail.com</strong>.`;
                    }
                }
            } catch (e) {}
        }

        async function enviarFormularioContacto(e) {
            e.preventDefault();
            const form = e.target;
            const btnSubmit = document.getElementById('btn-enviar-contacto');
            const avisoVacio = document.getElementById('contacto-aviso-vacio');
            const errorCaptcha = document.getElementById('captcha-error');

            // 1. Detección silenciosa de Bot (Honeypot)
            if (form.botcheck && form.botcheck.checked) {
                console.warn("Bot detectado en trampa honeypot.");
                mostrarToast('Mensaje Recibido', 'Tu solicitud ha sido procesada.');
                form.reset();
                return;
            }

            // 2. Control de Cooldown y Límites Diarios
            try {
                const ultimoEnvio = parseInt(localStorage.getItem('cda_ultimo_envio') || '0', 10);
                if (ultimoEnvio) {
                    const transcurrido = Date.now() - ultimoEnvio;
                    if (transcurrido < SEGURIDAD_CONFIG.COOLDOWN_MS) {
                        iniciarContadorCooldown(SEGURIDAD_CONFIG.COOLDOWN_MS - transcurrido);
                        mostrarToast('Envío en Pausa', 'Debes esperar unos minutos antes de volver a enviar un mensaje.');
                        return;
                    }
                }
                if (obtenerEnviosHoy() >= SEGURIDAD_CONFIG.MAX_ENVIOS_DIARIOS) {
                    mostrarToast('Límite Diario Alcanzado', 'Has alcanzado el límite de consultas por hoy. Escríbenos directamente a cdamazonass@gmail.com.');
                    return;
                }
            } catch (err) {}

            // 2.1 Verificación de Consentimiento Obligatorio de Privacidad (RGPD / LOPDP)
            const checkLegal = document.getElementById('contacto-consentimiento-legal');
            const avisoConsentimiento = document.getElementById('contacto-aviso-consentimiento');
            if (!checkLegal || !checkLegal.checked) {
                if (avisoConsentimiento) avisoConsentimiento.classList.remove('hidden');
                if (checkLegal) {
                    checkLegal.focus();
                    checkLegal.classList.add('ring-2', 'ring-red-500');
                    setTimeout(() => checkLegal.classList.remove('ring-2', 'ring-red-500'), 3000);
                }
                mostrarToast('Consentimiento Requerido', 'Debes marcar la casilla aceptando la Política de Privacidad y el Aviso Legal para enviar tu mensaje.');
                return;
            }
            if (avisoConsentimiento) avisoConsentimiento.classList.add('hidden');

            // 3. Validación de campos de contacto (Email O Teléfono)
            const inputNombre = document.getElementById('contacto-nombre');
            const inputEmail = document.getElementById('contacto-email');
            const inputTelefono = document.getElementById('contacto-telefono');
            const textareaMensaje = document.getElementById('contacto-mensaje');

            const nombre = (inputNombre.value || '').trim();
            const email = (inputEmail.value || '').trim();
            const telefono = (inputTelefono.value || '').trim();
            const mensaje = (textareaMensaje.value || '').trim();

            if (!email && !telefono) {
                if (avisoVacio) avisoVacio.classList.remove('hidden');
                inputEmail.focus();
                return;
            }
            if (avisoVacio) avisoVacio.classList.add('hidden');

            if (mensaje.length < 10) {
                mostrarToast('Mensaje muy breve', 'Por favor detalla tu consulta con al menos 10 caracteres.');
                textareaMensaje.focus();
                return;
            }

            // 4. Verificación de hCaptcha Oficial (Anti-Spam Web3Forms)
            const formData = new FormData(form);
            const hCaptchaResponse = formData.get('h-captcha-response');
            if (!hCaptchaResponse) {
                if (errorCaptcha) errorCaptcha.classList.remove('hidden');
                mostrarToast('Verificación Requerida', 'Por favor completa la casilla de verificación de seguridad (hCaptcha) antes de enviar.');
                return;
            }
            if (errorCaptcha) errorCaptcha.classList.add('hidden');

            // 5. Preparar envío seguro a Web3Forms
            const originalText = btnSubmit.innerHTML;
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = `
                <span class="inline-flex items-center gap-2">
                    <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Validando y enviando...
                </span>
            `;

            // Consentimiento legal y preferencias comerciales
            const checkMarketing = document.getElementById('contacto-consentimiento-marketing');
            const aceptoMarketing = checkMarketing && checkMarketing.checked;
            formData.set('consentimiento_legal', 'Aceptado (RGPD / LOPDP Ecuador)');
            formData.set('consentimiento_marketing', aceptoMarketing ? 'Aceptado (Comunicaciones comerciales y novedades)' : 'No aceptado');

            // Si el usuario no proporcionó correo electrónico pero sí teléfono:
            // Asignamos un correo remitente seguro para que Web3Forms acepte la petición
            if (!email && telefono) {
                formData.set('email', 'contacto.telefono@cdamazonas.com');
                formData.set('subject', `📱 Consulta por Teléfono/WhatsApp: ${telefono} (${nombre})`);
            } else if (email && telefono) {
                formData.set('subject', `Nuevo Mensaje Web - ${nombre} (Tel: ${telefono})`);
            }

            // Formato ordenado del mensaje que llega al correo oficial del club
            const infoContacto = [
                `👤 REMITENTE: ${nombre}`,
                email ? `📧 CORREO ELECTRÓNICO: ${email}` : `📧 CORREO: (No proporcionado - Prefiere contacto telefónico)`,
                telefono ? `📱 TELÉFONO / WHATSAPP: ${telefono}` : `📱 TELÉFONO: (No proporcionado)`,
                `📜 PRIVACIDAD: Aceptó Política de Privacidad y Aviso Legal (Obligatorio)`,
                `📢 COMUNICACIONES: ${aceptoMarketing ? 'SÍ (Aceptó recibir novedades y promociones)' : 'NO (Solo respuesta a esta consulta)'}`,
                `📅 FECHA Y HORA: ${new Date().toLocaleString('es-EC', { timeZone: 'America/Guayaquil' })}`,
                `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
                `💬 MENSAJE:`,
                mensaje
            ].join('\n');

            formData.set('message', infoContacto);
            formData.set('phone', telefono || 'No proporcionado');

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    registrarEnvioExitoso();
                    form.reset();
                    resetearCaptcha();
                    const canalRespuesta = telefono && !email ? 'a tu número de WhatsApp / teléfono' : 'a tu medio de contacto';
                    mostrarToast('¡Mensaje Enviado con Éxito!', `Muchas gracias, ${nombre}. Tu consulta fue entregada a la dirigencia de C.D. Amazonas y te responderemos pronto ${canalRespuesta}.`);
                } else {
                    resetearCaptcha();
                    throw new Error(data.message || 'Error en la respuesta del servicio');
                }
            } catch (error) {
                console.error('Error al enviar formulario:', error);
                resetearCaptcha();
                mostrarToast('Aviso de Contacto', error.message || 'No se pudo completar el envío en este momento. Por favor comunícate directamente a cdamazonass@gmail.com.');
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = originalText;
            }
        }


// Exportar al ámbito global para eventos inline y formularios
window.SEGURIDAD_CONFIG = SEGURIDAD_CONFIG;
window.resetearCaptcha = resetearCaptcha;
window.generarNuevoCaptcha = generarNuevoCaptcha;
window.obtenerEnviosHoy = obtenerEnviosHoy;
window.registrarEnvioExitoso = registrarEnvioExitoso;
window.iniciarContadorCooldown = iniciarContadorCooldown;
window.verificarEstadoSeguridadInicial = verificarEstadoSeguridadInicial;
window.enviarFormularioContacto = enviarFormularioContacto;
