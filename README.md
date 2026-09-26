# Club Deportivo Amazonas • Sitio Web Oficial

Sitio web institucional del **Club Deportivo Amazonas**, fundado el **12 de febrero de 1987** en el Barrio El Hospital de la parroquia de Malchinguí, Pichincha, Ecuador.

---

## 📁 Estructura del Proyecto

```text
cda-sitio-oficial/
│
├── index.html                      # Aplicación web principal (SPA)
├── README.md                       # Documentación del repositorio
│
└── assets/                         # Recursos estáticos
    ├── css/                        # Hojas de estilo personalizadas
    │   └── styles.css              # Reglas CSS (TCG shimmer, hero, animaciones)
    │
    └── img/                        # Galería multimedia estructurada
        ├── branding/               # Identidad institucional
        │   ├── Amazonas PGN.png    # Escudo oficial del club
        │   └── Mascota.png         # Mascota oficial (Dragón Drak)
        │
        ├── noticias/               # Fotografías e infografías de noticias
        │   ├── Estadio CER.jpg     # Labores en el estadio "Carlos Eliécer Rodríguez"
        │   └── NoticiaSponsor.png  # Gráfico de patrocinio oficial
        │
        ├── plantilla/              # Tarjetas y nómina de jugadores
        │   ├── Generico/           # Silueta oficial para jugadores
        │   ├── masculino/          # Fotografías locales equipo masculino
        │   ├── femenino/           # Fotografías locales equipo femenino
        │   └── leyendas/           # Fotografías leyendas históricas
        │
        ├── repositorio/            # Memoria gráfica y archivo histórico
        │   ├── masculino/          # Fotos campeonatos categoría Máxima (2022-2026)
        │   ├── femenino/           # Archivo fotográfico categoría femenina
        │   └── historico/          # Fundación 1987, torneos 1ra, 2da y época retro
        │
        ├── tienda/                 # Indumentaria oficial para venta
        │   ├── Camisetao26.png     # Camiseta titular temporada 2026
        │   ├── Camisap.png         # Camisa polo oficial
        │   └── Chaquetadr.png      # Chaqueta deportiva retro
        │
        └── aliados/                # Logos de patrocinadores oficiales
            ├── jagdental.png       # JAG DENTAL (Sponsor Premium)
            └── torres.png          # Comercial TORRES (Insumos bioagrícolas)
```

---

## ⚡ Características Principales

* **Trading Cards Coleccionables (TCG):** Sistema interactivo estilo Ultimate Team con valoración general (OVR) y estadísticas (Ritmo, Tiro, Pase, Regate, Defensa) sincronizadas en tiempo real desde Google Sheets.
* **Caché en Memoria:** Navegación instantánea entre pestañas de plantillas sin latencia de red.
* **Repositorio Gráfico con Filtros:** Visualizador de fotografías históricas con filtrado dinámico por categoría y año, y modal *lightbox* accesible por teclado (`Esc`).
* **Formulario de Contacto Funcional:** Integrado con el servicio Web3Forms para recepción directa de correos en `cdamazonass@gmail.com` con validación y confirmación animada.
* **Asistente Virtual Drak:** Chatbot institucional con accesos rápidos y respuestas sobre historia, directiva, estadio y tienda.
* **Diseño Responsivo:** Adaptado para teléfonos móviles, tablets y computadoras de escritorio mediante Tailwind CSS.

---

## 🛠️ Tecnologías Utilizadas

* **HTML5 Semántico**
* **Tailwind CSS (CDN)**
* **Google Fonts:** *Playfair Display* & *Inter*
* **Vanilla JavaScript (ES6+):** Fetch API, DOM scripting reactivo y Web3Forms
* **Google Sheets API:** Gestión dinámica de nómina y archivo fotográfico

---

## 📜 Licencia & Derechos

© 2026 Club Deportivo Amazonas. Todos los derechos reservados.  
Malchinguí, Pichincha, Ecuador.
