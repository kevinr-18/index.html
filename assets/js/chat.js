/**
 * chat.js - Asistente virtual institucional Drak con la mascota oficial del club
 * Club Deportivo Amazonas (Malchinguí, Ecuador)
 */

        function preguntarChatRapido(texto) {
            const inputField = document.getElementById('chat-input');
            if (inputField) {
                inputField.value = texto;
                enviarMensajeChat();
            }
        }

        function toggleChat() {
            const chatWidget = document.getElementById('ai-chatbot-widget');
            const btnAbrir = document.getElementById('btn-abrir-chat');
            if (chatWidget.classList.contains('hidden')) {
                chatWidget.classList.remove('hidden');
                chatWidget.classList.add('flex');
                btnAbrir.classList.add('scale-0');
                setTimeout(() => document.getElementById('chat-input').focus(), 200);
            } else {
                chatWidget.classList.add('hidden');
                chatWidget.classList.remove('flex');
                btnAbrir.classList.remove('scale-0');
            }
        }

        let chatHistory = [];
        let ultimoMensajeChatTimestamp = 0;
        // Clave opcional. Si se deja vacía, el motor institucional responde localmente
        const apiKey = "";

        // Sanitización para prevenir ataques XSS o inyección de scripts en el chat
        function sanitizarHTML(str) {
            if (!str) return '';
            const temp = document.createElement('div');
            temp.textContent = str;
            return temp.innerHTML;
        }

        async function enviarMensajeChat() {
            const inputField = document.getElementById('chat-input');
            const mensaje = inputField.value.trim();
            if (!mensaje) return;

            // Rate-limiting local para evitar inundación de mensajes en el chat
            const ahora = Date.now();
            if (ahora - ultimoMensajeChatTimestamp < 1200) {
                return;
            }
            ultimoMensajeChatTimestamp = ahora;

            inputField.value = '';
            agregarMensajeUI(mensaje, 'user');
            hacerScrollChat();

            // Si hay API Key configurada, consulta a Gemini; de lo contrario, activa el motor institucional local
            if (apiKey && apiKey.trim() !== "") {
                chatHistory.push({ role: "user", parts: [{ text: mensaje }] });

                const systemPrompt = `Eres el dragón asistente y embajador oficial del "Club Deportivo Amazonas" de Malchinguí (fundado el 12 de febrero de 1987 por Don Carlos Eliécer Rodríguez). El club tiene 5 estrellas en su escudo, compite en Categoría Máxima y Femenina, y hace de local en el Estadio Cancha 7 "Carlos Eliécer Rodríguez". Responde de forma cordial, formal e institucional.`;

                const payload = {
                    contents: chatHistory,
                    systemInstruction: { parts: [{ text: systemPrompt }] }
                };

                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

                try {
                    let response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    if (!response.ok) throw new Error();
                    const result = await response.json();
                    const candidato = result.candidates?.[0];
                    if (candidato && candidato.content?.parts?.[0]?.text) {
                        const texto = candidato.content.parts[0].text;
                        agregarMensajeUI(texto, 'bot');
                        chatHistory.push({ role: "model", parts: [{ text: texto }] });
                    }
                } catch (e) {
                    responderMotorInstitucional(mensaje);
                }
            } else {
                // Respuesta instantánea mediante base de conocimiento interna del club
                setTimeout(() => {
                    responderMotorInstitucional(mensaje);
                }, 350);
            }
            hacerScrollChat();
        }

        function responderMotorInstitucional(pregunta) {
            const q = pregunta.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            let respuesta = "";

            if (q.includes("historia") || q.includes("fundad") || q.includes("origen") || q.includes("carlos")) {
                respuesta = "El Club Deportivo Amazonas fue fundado el 12 de febrero de 1987 en el Barrio El Hospital de Malchinguí por iniciativa de Don Carlos Eliécer Rodríguez Navarrete y sus hijos. Cuenta con 5 estrellas en su escudo logradas a lo largo de su trayectoria.";
            } else if (q.includes("estadio") || q.includes("sede") || q.includes("donde juegan") || q.includes("cancha")) {
                respuesta = "Jugamos de local en el Estadio Cancha 7 'Carlos Eliécer Rodríguez', ubicado en el Barrio El Hospital, en Malchinguí. ¡Será un honor recibirte en las gradas!";
            } else if (q.includes("tienda") || q.includes("camiseta") || q.includes("precio") || q.includes("comprar") || q.includes("polo") || q.includes("chaqueta")) {
                respuesta = "En nuestra Tienda Oficial puedes encargar la Camiseta Oficial '26 ($14,99), la Chaqueta Deportiva Retro ($24,99) o la Camisa Polo ($15,99). Cada pedido es personalizado y el 100% de los beneficios apoya al club.";
            } else if (q.includes("plantilla") || q.includes("jugador") || q.includes("equipo") || q.includes("nomina")) {
                respuesta = "Puedes consultar las nóminas actualizadas del equipo Masculino, Femenino y Leyendas directamente en la sección 'Plantilla' del menú superior, sincronizada en tiempo real con los registros oficiales.";
            } else if (q.includes("directiv") || q.includes("dirigent") || q.includes("presidente") || q.includes("patricio")) {
                respuesta = "La dirigencia del equipo masculino está encabezada por Patricio Rodríguez, Ramiro Rodríguez, Daniel Rodríguez, Orlando Rodríguez, José Luis Rodríguez y Manuel Heredia. En la categoría femenina, la dirección está a cargo de Sandra Reyes.";
            } else if (q.includes("contacto") || q.includes("telefono") || q.includes("whatsapp") || q.includes("correo")) {
                respuesta = "Puedes escribirnos directamente a nuestro WhatsApp oficial: +593 98 155 6626 (https://wa.me/593981556626), por correo a cdamazonass@gmail.com o a través del formulario de Contacto.";
            } else if (q.includes("sponsor") || q.includes("patrocini") || q.includes("aliad")) {
                respuesta = "Contamos con el respaldo de nuestros Aliados Estratégicos como JAG DENTAL y Comercial TORRES. Si deseas sumarte como patrocinador oficial, puedes solicitar los planes en la sección de Contacto.";
            } else {
                respuesta = "Con gusto te oriento. Puedes consultarme sobre la historia de nuestra institución, la nómina de jugadores, la tienda de indumentaria, los patrocinadores o comunicarte directamente a cdamazonass@gmail.com.";
            }

            agregarMensajeUI(respuesta, 'bot');
            hacerScrollChat();
        }

        function agregarMensajeUI(texto, emisor) {
            const contenedor = document.getElementById('chat-mensajes');
            const div = document.createElement('div');
            const textoSeguro = sanitizarHTML(texto).replace(/\n/g, '<br>');
            
            if (emisor === 'user') {
                div.className = "flex justify-end";
                div.innerHTML = `<div class="bg-brand-green text-white p-2.5 rounded-2xl rounded-tr-none shadow-sm max-w-[85%] text-xs leading-relaxed">${textoSeguro}</div>`;
            } else {
                div.className = "flex items-start space-x-2";
                div.innerHTML = `
                    <img src="assets/img/branding/Mascota.png" alt="Avatar" class="h-6 w-6 rounded-full bg-brand-green/20 object-cover object-top border border-brand-gold/40 flex-shrink-0 mt-0.5">
                    <div class="bg-white text-brand-dark p-2.5 rounded-2xl rounded-tl-none shadow-sm max-w-[85%] border border-slate-200 text-xs leading-relaxed">${textoSeguro}</div>
                `;
            }
            
            contenedor.appendChild(div);
        }

        function hacerScrollChat() {
            const contenedor = document.getElementById('chat-mensajes');
            contenedor.scrollTop = contenedor.scrollHeight;
        }


// Exportar al ámbito global para eventos inline del chat
window.preguntarChatRapido = preguntarChatRapido;
window.toggleChat = toggleChat;
window.enviarMensajeChat = enviarMensajeChat;
