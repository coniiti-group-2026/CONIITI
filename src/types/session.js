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

/**
 * @typedef {Object} Session
 * @property {string}            id                      - Identificador único
 * @property {string}            titulo                  - Título de la sesión
 * @property {string}            ponente                 - Nombre del ponente
 * @property {string}            afiliacion              - Afiliación del ponente
 * @property {string}            track                   - Track o tema
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
