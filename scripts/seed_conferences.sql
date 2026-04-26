-- Script de sembrado de 15 conferencias para CONIITI 2026 (Versión Final Completa)
-- Fechas: 1, 2 y 3 de Octubre
-- Estructura: 5 sesiones por día

-- Día 1: 1 de Octubre
INSERT INTO agenda_sessions (id, titulo, descripcion, ponente, afiliacion, descripcion_ponente, foto_ponente_url, es_conferencista_principal, track, event_type, dia, hora_inicio, hora_fin, salon, modalidad, status_logistico, link_verificado, cupos_totales, inscritos)
VALUES 
(gen_random_uuid(), 'IA y el Futuro de la Humanidad', 'Exploración de los límites de la IA en la sociedad moderna.', 'Dr. Arrakis Sand', 'Giedi Prime Tech', 'Experto en especia y datos.', null, true, 'IA', 'CONFERENCE', '2026-10-01', '08:00', '09:30', 'SEDE 4', 'PRESENCIAL', 'NORMAL', false, 100, 0),
(gen_random_uuid(), 'Ciberseguridad en Redes Neuronales', 'Taller práctico sobre protección de modelos de ML.', 'Ing. Trinity Neo', 'Zion Network', 'Arquitecta de sistemas virtuales.', null, false, 'CIBERSEGURIDAD', 'WORKSHOP', '2026-10-01', '10:00', '11:30', 'P3_SALA_COMPT', 'PRESENCIAL', 'NORMAL', false, 30, 0),
(gen_random_uuid(), 'IoT en la Exploración Espacial', 'Cómo el IoT está habilitando la colonización de Marte.', 'Ellen Ripley', 'Weyland-Yutani', 'Consultora en bioseguridad espacial.', null, true, 'IOT', 'CONFERENCE', '2026-10-01', '12:00', '13:30', 'Torres', 'PRESENCIAL', 'NORMAL', false, 60, 0),
(gen_random_uuid(), 'Desarrollo de Software Multi-dimensional', 'Patrones de diseño para arquitecturas complejas.', 'Rick Sanchez', 'C-137 Research', 'Genio multi-dimensional.', null, false, 'DESARROLLO', 'PANEL', '2026-10-01', '14:00', '15:30', 'Paraninfo', 'PRESENCIAL', 'NORMAL', false, 80, 0),
(gen_random_uuid(), 'Ciencia de Datos en Ambientes Hostiles', 'Análisis de datos en situaciones de tiempo real extremo.', 'Sarah Connor', 'Resistance Lab', 'Especialista en IA y supervivencia.', null, true, 'DATOS', 'CONFERENCE', '2026-10-01', '16:00', '17:30', 'SEDE 4', 'PRESENCIAL', 'NORMAL', false, 40, 0);

-- Día 2: 2 de Octubre
INSERT INTO agenda_sessions (id, titulo, descripcion, ponente, afiliacion, descripcion_ponente, foto_ponente_url, es_conferencista_principal, track, event_type, dia, hora_inicio, hora_fin, salon, modalidad, status_logistico, link_verificado, cupos_totales, inscritos)
VALUES 
(gen_random_uuid(), 'Ethical Hacking: Vulnerabilidades Zero-Day', 'Demostración en vivo de ataques y defensas.', 'Kevin Mitnick Jr.', 'Global Cyber', 'Hacker ético de renombre.', null, false, 'CIBERSEGURIDAD', 'CONFERENCE', '2026-10-02', '08:00', '09:30', 'Paraninfo', 'PRESENCIAL', 'NORMAL', false, 120, 0),
(gen_random_uuid(), 'Edge Computing y 5G', 'La revolución del procesamiento en el borde.', 'Satya Nadella II', 'Microsoft Research', 'CEO de Microsoft del futuro.', null, true, 'INNOVACION', 'SYMPOSIUM', '2026-10-02', '10:00', '11:30', 'SEDE 4', 'HIBRIDO', 'NORMAL', false, 90, 0),
(gen_random_uuid(), 'Microservicios con Rust y Go', 'Comparativa de rendimiento y seguridad.', 'Linus Torvalds III', 'Kernel Found.', 'Creador del kernel planetario.', null, false, 'DESARROLLO', 'WORKSHOP', '2026-10-02', '12:00', '13:30', 'P3_SALA_COMPT', 'PRESENCIAL', 'NORMAL', false, 25, 0),
(gen_random_uuid(), 'Big Data en la Genómica', 'Análisis masivo de secuencias de ADN.', 'Dr. Ellie Sattler', 'InGen Bio', 'Paleobotánica y experta en datos.', null, true, 'DATOS', 'CONFERENCE', '2026-10-02', '14:00', '15:30', 'Torres', 'PRESENCIAL', 'NORMAL', false, 70, 0),
(gen_random_uuid(), 'Realidad Aumentada en la Educación', 'Nuevas fronteras del aprendizaje interactivo.', 'Mark Zuckerberg V', 'Meta Horizon', 'Visionario del metaverso.', null, false, 'INNOVACION', 'CONFERENCE', '2026-10-02', '16:00', '17:30', 'Paraninfo', 'VIRTUAL', 'NORMAL', false, 200, 0);

-- Día 3: 3 de Octubre
INSERT INTO agenda_sessions (id, titulo, descripcion, ponente, afiliacion, descripcion_ponente, foto_ponente_url, es_conferencista_principal, track, event_type, dia, hora_inicio, hora_fin, salon, modalidad, status_logistico, link_verificado, cupos_totales, inscritos)
VALUES 
(gen_random_uuid(), 'Robótica y Automatización Industrial', 'El impacto de la robótica en la manufactura 5.0.', 'Miles Dyson', 'Cyberdyne Systems', 'Arquitecto de sistemas avanzados.', null, true, 'INNOVACION', 'CONFERENCE', '2026-10-03', '08:00', '09:30', 'P3_SALA_COMPT', 'PRESENCIAL', 'NORMAL', false, 50, 0),
(gen_random_uuid(), 'Blockchain más allá de las Cripto', 'Gobernanza y trazabilidad descentralizada.', 'Satoshi Nakamoto X', 'BlockSec', 'Padre de la descentralización.', null, false, 'CIBERSEGURIDAD', 'CONFERENCE', '2026-10-03', '10:00', '11:30', 'Torres', 'PRESENCIAL', 'NORMAL', false, 80, 0),
(gen_random_uuid(), 'UX/UI para Interfaces Neuronales', 'Diseño de experiencias para BCI.', 'Jony Ive II', 'Apple Labs', 'Diseñador de hardware humano.', null, true, 'INNOVACION', 'PANEL', '2026-10-03', '12:00', '13:30', 'SEDE 4', 'PRESENCIAL', 'NORMAL', false, 150, 0),
(gen_random_uuid(), 'Sistemas de Recomendación de Próxima Gen', 'IA generativa aplicada al E-commerce.', 'Jeff Bezos VII', 'Amazon Prime', 'Magnate del comercio espacial.', null, false, 'IA', 'CONFERENCE', '2026-10-03', '14:00', '15:30', 'Paraninfo', 'VIRTUAL', 'NORMAL', false, 300, 0),
(gen_random_uuid(), 'Clausura: El Horizonte Tecnológico', 'Resumen y visión a futuro del congreso.', 'Staff CONIITI', 'Comité Organizador', 'Equipo organizador del evento.', null, false, 'INNOVACION', 'CONFERENCE', '2026-10-03', '16:00', '18:00', 'SEDE 4', 'HIBRIDO', 'NORMAL', false, 500, 0);
