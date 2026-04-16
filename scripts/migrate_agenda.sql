-- Script de Migración Estructural: Agenda Normalizada (Speakers) - v2
-- Objetivo: Alinear la base de datos con el modelo de objetos que usa speaker_id

BEGIN;

-- 1. Asegurar la tabla de ponentes con el DEFAULT correcto
-- Si ya existe, nos aseguramos de que el ID tenga el default de UUID
CREATE TABLE IF NOT EXISTS speakers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    afiliacion VARCHAR(255) NOT NULL DEFAULT '',
    descripcion TEXT,
    foto_url VARCHAR(1000),
    es_principal BOOLEAN NOT NULL DEFAULT false
);

-- Forzar el default si la tabla ya existía sin él
ALTER TABLE speakers ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 2. Crear un índice de unicidad para evitar duplicados durante la migración
CREATE UNIQUE INDEX IF NOT EXISTS uix_speaker_nombre_afiliacion ON speakers (nombre, afiliacion);

-- 3. Agregar la columna de llave foránea a agenda_sessions
ALTER TABLE agenda_sessions ADD COLUMN IF NOT EXISTS speaker_id UUID;

-- 4. Migrar los ponentes únicos desde la tabla plana a la tabla normalizada
-- Usamos COALESCE para evitar problemas con nulos en la combinación nombre/afiliación
INSERT INTO speakers (nombre, afiliacion, descripcion, es_principal)
SELECT DISTINCT 
    ponente, 
    COALESCE(afiliacion, ''), 
    MAX(descripcion_ponente), 
    bool_or(es_conferencista_principal)
FROM agenda_sessions
GROUP BY ponente, afiliacion
ON CONFLICT (nombre, afiliacion) DO NOTHING;

-- 5. Vincular las sesiones con sus nuevos IDs de ponente
UPDATE agenda_sessions as s
SET speaker_id = sp.id
FROM speakers as sp
WHERE s.ponente = sp.nombre 
  AND COALESCE(s.afiliacion, '') = sp.afiliacion;

-- 6. Hacer obligatoria la columna speaker_id
ALTER TABLE agenda_sessions ALTER COLUMN speaker_id SET NOT NULL;

-- 7. Agregar la restricción de llave foránea
-- Borramos la anterior si existía para evitar duplicados
ALTER TABLE agenda_sessions DROP CONSTRAINT IF EXISTS fk_agenda_sessions_speaker;
ALTER TABLE agenda_sessions 
    ADD CONSTRAINT fk_agenda_sessions_speaker 
    FOREIGN KEY (speaker_id) REFERENCES speakers(id);

COMMIT;
