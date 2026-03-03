# Guía de Estilos

## Variables CSS Globales

Las variables están definidas en `src/styles/animations.css` o en el `:root` del CSS global.

### Colores principales

```css
--color-primary:      #1F69B6   /* Azul CONIITI */
--color-primary-dark: #091D36   /* Azul oscuro */
--color-primary-light:#2a7fd4   /* Azul claro */
--color-accent:       #D4A017   /* Dorado CONIITI */
--color-accent-dark:  #b8860b   /* Dorado oscuro */
--color-accent-light: #e8b94a   /* Dorado claro */
--color-surface:      #ffffff   /* Fondo de tarjetas */
--color-text:         #1a1a2e   /* Texto principal */
--color-text-secondary: #4a5568 /* Texto secundario */
--color-text-muted:   #9ca3af   /* Texto tenue */
--color-border-light: #e2e8f0   /* Bordes suaves */
```

### Tipografía

```css
--font-family:   'Inter', system-ui, sans-serif
--font-display:  'Plus Jakarta Sans', 'Inter', sans-serif
--font-size-xs:  0.75rem   /* 12px */
--font-size-sm:  0.875rem  /* 14px */
--font-size-base:1rem      /* 16px */
--font-size-lg:  1.125rem  /* 18px */
--font-size-xl:  1.25rem   /* 20px */
```

### Espaciado (escala de 4px)

```css
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-5:  20px
--space-6:  24px
--space-8:  32px
--space-10: 40px
```

### Bordes y sombras

```css
--radius-sm:   4px
--radius-md:   8px
--radius-lg:   12px
--radius-full: 9999px

--shadow-sm:   0 1px 3px rgba(9,29,54,0.06)
--shadow-lg:   0 10px 30px rgba(9,29,54,0.12)
```

---

## Colores por Track

| Track | Color badge | Color texto |
|---|---|---|
| Inteligencia Artificial | rgba(59,130,246,0.12) | #1d4ed8 |
| Ciberseguridad | rgba(239,68,68,0.12) | #dc2626 |
| Internet de las Cosas | rgba(16,185,129,0.12) | #059669 |
| Desarrollo de Software | rgba(96,165,250,0.15) | #2563eb |
| Ciencia de Datos | rgba(139,92,246,0.12) | #7c3aed |
| Innovación y Tendencias | rgba(245,158,11,0.15) | #d97706 |

---

## Colores de Estado Logístico

| Estado | Fondo | Texto |
|---|---|---|
| Normal | rgba(16,185,129,0.12) | #059669 (verde) |
| Cambio de Salón | rgba(239,68,68,0.12) | #dc2626 (rojo) |
| Retrasado | rgba(245,158,11,0.12) | #d97706 (naranja) |

---

## Colores de Cupos (Barra de Progreso)

| Estado | Umbral | Color barra |
|---|---|---|
| Disponible | < 80% | Gradiente verde |
| Casi lleno | ≥ 80% | Gradiente naranja |
| Agotado | 100% | Gradiente rojo |

---

## Convenciones de CSS Modules

Todos los estilos usan **CSS Modules** (`.module.css`). Cada componente/página tiene su propio archivo de estilos.

**Convención de nombres:**
- Clases en camelCase: `.loginCard`, `.registerBtn`, `.metaGrid`
- Variantes por estado: `.badgeNormal`, `.badgeCambio`, `.trackIA`
- Breakpoints: siempre mobile-first con `@media (min-width: ...)`

**Breakpoints principales:**
```css
@media (max-width: 480px)  { /* Móviles pequeños */ }
@media (max-width: 640px)  { /* Móviles */ }
@media (max-width: 768px)  { /* Tablets */ }
@media (min-width: 768px)  { /* Desktop+ */ }
```

---

## Navbar

El Navbar tiene altura de **76px** y usa:
- Fondo degradado azul oscuro → azul
- Borde inferior dorado semitransparente
- `backdrop-filter: blur(8px)` para efecto glassmorphism
- Botón "Iniciar Sesión" con pill dorado con degradado
- Enlace "Panel Staff" solo visible para usuarios con rol staff

---

## Animaciones

- **`fadeInUp`**: para tarjetas `SessionCard` (escalonadas con `animationDelay`)
- **`slideUp`**: para las tarjetas de Login y Registro al cargar
- **`dropIn`**: para el menú dropdown del Navbar
- **`blink`**: para el punto de polling activo en la Agenda
