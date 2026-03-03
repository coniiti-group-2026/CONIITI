// Configuración interactiva de la red ("puntos unidos") de tsParticles
export const loginParticlesConfig = {
    fullScreen: { enable: false, zIndex: 0 },
    particles: {
        number: { value: 60, density: { enable: true, value_area: 800 } },
        color: { value: "#1F69B6" }, // Azul CONIITI
        shape: { type: "circle" },
        opacity: { value: 0.5, random: false },
        size: { value: 3, random: true },
        links: {
            enable: true,
            distance: 150,
            color: "#1F69B6",
            opacity: 0.4,
            width: 1
        },
        move: {
            enable: true,
            speed: 1.5,
            direction: "none",
            random: false,
            straight: false,
            out_mode: "out",
            bounce: false,
        }
    },
    interactivity: {
        detect_on: "canvas",
        events: {
            onhover: { enable: true, mode: "grab" },
            onclick: { enable: true, mode: "push" },
            resize: true
        },
        modes: {
            grab: { distance: 200, links: { opacity: 0.8 } },
            push: { particles_nb: 4 }
        }
    },
    retina_detect: true,
    background: {
        color: "#ffffff"
    }
};
