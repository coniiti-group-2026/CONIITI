const contentSections = {
    memorias: [
        {
            id: 'mem-2026-1',
            title: 'Memorias CONIITI 2026',
            year: 2026,
            description: 'Compilado oficial de ponencias, talleres y resultados destacados del congreso.',
            image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
            link_url: 'https://coniiti.ucatolica.edu.co/',
        },
        {
            id: 'mem-2025-1',
            title: 'Memorias CONIITI 2025',
            year: 2025,
            description: 'Edicion anterior con resultados de investigacion en software, datos e innovacion aplicada.',
            image_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80',
            link_url: 'https://coniiti.ucatolica.edu.co/',
        },
    ],
    comite: [
        {
            id: 'com-1',
            title: 'Dra. Lina Moreno',
            subtitle: 'Presidencia del comite cientifico',
            description: 'Coordina la evaluacion academica y la articulacion internacional del evento.',
            image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=700&q=80',
        },
        {
            id: 'com-2',
            title: 'Ing. Mauricio Perez',
            subtitle: 'Coordinacion logistica',
            description: 'Responsable de la operacion integral de agenda, auditorios y experiencia de asistentes.',
            image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80',
        },
    ],
    autores: [
        {
            id: 'aut-1',
            title: 'Semillero AI Systems',
            subtitle: 'Universidad Catolica de Colombia',
            description: 'Equipo de investigadores enfocado en sistemas inteligentes, agentes autonomos y aprendizaje aplicado.',
            image_url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=700&q=80',
        },
        {
            id: 'aut-2',
            title: 'Grupo DataLab',
            subtitle: 'Red de analitica e innovacion',
            description: 'Autores invitados con trabajos en ciencia de datos, IA responsable y automatizacion industrial.',
            image_url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=700&q=80',
        },
    ],
    galerias: [
        {
            id: 'gal-1',
            title: 'Apertura plenaria',
            description: 'Inicio oficial del congreso con invitados internacionales y comunidad academica.',
            image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
        },
        {
            id: 'gal-2',
            title: 'Networking y poster sessions',
            description: 'Espacios de intercambio entre estudiantes, industria y grupos de investigacion.',
            image_url: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1200&q=80',
        },
    ],
};


export function getContentSection(section) {
    return contentSections[section] ?? [];
}
