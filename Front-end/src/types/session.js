/**
 * ===================================
 * Tipos de Datos de Sesión — Contrato API
 * ===================================
 *
 * Este archivo define la estructura de un objeto Sesión y
 * todos los enums / constantes relacionados. Cuando el backend (FastAPI)
 * sea implementado, estos tipos servirán como contrato entre
 * frontend y backend.
 */

/** @enum {string} */
export const SESSION_STATUS = Object.freeze({
  NORMAL: 'Normal',
  CAMBIO_SALON: 'Cambio de Salón',
  RETRASADO: 'Retrasado',
});

/** @enum {string} */
export const SESSION_MODALITY = Object.freeze({
  PRESENCIAL: 'Presencial',
  VIRTUAL: 'Virtual',
  HIBRIDO: 'Híbrido',
});

/** @enum {string} */
export const SESSION_TRACK = Object.freeze({
  IA: 'Inteligencia Artificial',
  CIBERSEGURIDAD: 'Ciberseguridad',
  IOT: 'Internet de las Cosas',
  DESARROLLO: 'Desarrollo de Software',
  DATOS: 'Ciencia de Datos',
  INNOVACION: 'Innovación y Tendencias',
});

/** @enum {string} */
export const SESSION_EVENT_TYPE = Object.freeze({
  CONFERENCE: 'Conferencia',
  WORKSHOP: 'Taller',
  SYMPOSIUM: 'Simposio',
  PANEL: 'Panel'
});

/** @enum {string} */
export const SESSION_ROOMS = Object.freeze({
  AUDITORIO_CE4: 'Auditorio CE4',
  SALA_MULTIPLE: 'Sala Múltiple',
  AUDITORIO_PPAL: 'Auditorio Principal',
  SALA_VIRTUAL: 'Sala Virtual 1',
  SALA_VIRTUAL_2: 'Sala Virtual 2'
});

/**
 * @typedef {Object} Speaker
 * @property {string}      id          - Identificador único del ponente
 * @property {string}      name        - Nombre completo
 * @property {string}      role        - Cargo / Título (ej: "Ph.D. en Computación")
 * @property {string}      affiliation - Institución o empresa
 * @property {string}      bio         - Biografía corta
 * @property {string|null} photo_url   - URL de la foto de perfil
 * @property {string}      country     - País de origen
 */

/**
 * @typedef {Object} Session
 * @property {string}            id                      - Identificador único
 * @property {string}            titulo                  - Título de la sesión
 * @property {string}            ponente                 - Nombre del ponente
 * @property {string}            afiliacion              - Afiliación del ponente
 * @property {string}            track                   - Track o tema
 * @property {string}            event_type              - Valor de SESSION_EVENT_TYPE
 * @property {string}            speaker_id              - ID del ponente (referencia a Speaker.id)
 * @property {string}            dia                     - Día (cadena de fecha ISO)
 * @property {string}            hora_inicio             - Hora de inicio (HH:mm)
 * @property {string}            hora_fin                - Hora de fin (HH:mm)
 * @property {string}            salon                   - Nombre del salón
 * @property {string}            salon_anterior          - Salón anterior (si hubo cambio)
 * @property {string}            modalidad               - Valor de SESSION_MODALITY
 * @property {string}            status_logistico        - Valor de SESSION_STATUS
 * @property {boolean}           link_verificado         - Si el enlace virtual está verificado
 * @property {string|null}       link_virtual            - URL de la sesión virtual
 * @property {string}            timestamp_actualizacion - Marca de tiempo ISO 8601 de la última actualización
 * @property {string}            descripcion             - Descripción corta
 */