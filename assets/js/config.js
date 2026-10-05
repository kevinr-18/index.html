/**
 * config.js - Configuración global institucional y diseño de C.D. Amazonas
 * Club Deportivo Amazonas (Malchinguí, Ecuador - Fundado en 1987)
 */

// 1. Configuración del motor Tailwind CSS
if (typeof tailwind !== 'undefined') {
    tailwind.config = {
        theme: {
            extend: {
                colors: {
                    'brand-green': {
                        DEFAULT: '#046a38',
                        hover: '#03522b',
                        light: '#078848',
                        surface: '#f0f7f3',
                    },
                    'brand-white': '#ffffff',
                    'brand-dark': {
                        DEFAULT: '#1a1a1a',
                        surface: '#242424',
                        deep: '#121212',
                    },
                    'brand-gold': {
                        DEFAULT: '#d4af37',
                        muted: 'rgba(212, 175, 55, 0.2)',
                        border: 'rgba(212, 175, 55, 0.45)',
                    },
                    'brand-rose': {
                        DEFAULT: '#f179c5',
                        muted: 'rgba(241, 121, 197, 0.12)',
                        border: 'rgba(241, 121, 197, 0.35)',
                        text: '#a82c79',
                    }
                },
                fontFamily: {
                    serif: ['"Playfair Display"', 'Georgia', 'serif'],
                    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                },
                boxShadow: {
                    'subtle': '0 2px 10px rgba(0, 0, 0, 0.04)',
                    'card': '0 4px 20px -2px rgba(0, 0, 0, 0.06)',
                    'card-hover': '0 14px 30px -4px rgba(4, 106, 56, 0.10)',
                    'badge-gold': '0 0 12px rgba(212, 175, 55, 0.25)',
                    'tcg-green': '0 12px 30px -6px rgba(16, 185, 129, 0.45), 0 0 15px rgba(4, 106, 56, 0.35)',
                    'tcg-rose': '0 12px 30px -6px rgba(244, 63, 94, 0.45), 0 0 15px rgba(241, 121, 197, 0.35)',
                    'tcg-gold': '0 12px 30px -6px rgba(245, 158, 11, 0.5), 0 0 18px rgba(212, 175, 55, 0.4)',
                }
            }
        }
    };
}

// 2. Parámetros institucionales compartidos
const CDA_CONFIG = {
    CLUB_NOMBRE: 'Club Deportivo Amazonas',
    CLUB_FUNDACION: 1987,
    LOCALIDAD: 'Barrio El Hospital, Malchinguí, Pedro Moncayo, Pichincha, Ecuador',
    EMAIL_OFICIAL: 'cdamazonass@gmail.com',
    WHATSAPP_NUMERO: '593981556626',
    WHATSAPP_ENLACE: 'https://wa.me/593981556626',
    REDES: {
        FACEBOOK: 'https://www.facebook.com/share/1DDN5HnVQF/',
        INSTAGRAM: 'https://www.instagram.com/cd_amazonas?stkn=eWx1Njk0MDI1dXM='
    }
};

window.CDA_CONFIG = CDA_CONFIG;
