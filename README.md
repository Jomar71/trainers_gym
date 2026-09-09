# GymPro (TrainerHub)

Aplicación web de entrenamiento personalizado para gimnasios: los **entrenadores**
gestionan rutinas, planes nutricionales y agenda; los **clientes** siguen sus
planes desde cualquier dispositivo.

Frontend **100% HTML, CSS y JavaScript vanilla** (sin dependencias ni servidor).
Los datos demo se guardan en `localStorage`.

## Demo rápida

1. Abre `frontend/index.html` (doble clic). Redirige automáticamente al login.
2. Inicia sesión con una cuenta demo:

| Rol       | Email                 | Contraseña  |
|-----------|-----------------------|-------------|
| Entrenador| admin@example.com     | admin       |
| Cliente   | cliente@example.com   | cliente123  |
| Cliente   | maria@example.com     | maria123    |

## Funcionalidad

- **Login / registro / cierre de sesión** con control de rol.
- **Entrenador:** dashboard (estadísticas, rutinas recientes e inactivos),
  clientes (buscar, registrar, enlace WhatsApp), rutinas (crear con días y
  ejercicios), planes nutricionales (crear con comidas), agenda (agendar,
  completar y cancelar citas con detección de conflictos de horario).
- **Cliente:** inicio (racha, sesiones del mes, cita próxima, rutina de hoy),
  rutinas (marcar ejercicios por día, completar), nutrición, agenda y
  progreso (gráfica SVG de peso + registro e historial).

## Estructura

```
gympro/
├── frontend/
│   ├── index.html           # Punto de entrada (bootstraps por rol)
│   ├── css/style.css        # CSS responsive (mobile-first)
│   ├── js/
│   │   ├── data.js          # Dataset demo + persistencia (localStorage)
│   │   ├── api.js           # Fachada de datos (GP.api) — punto de reemplazo por fetch()
│   │   ├── ui.js            # Toasts, modales, sidebar y formatos de fecha
│   │   ├── auth.js          # Sesión y roles (localStorage)
│   │   ├── trainer.js       # Vistas del entrenador
│   │   ├── client.js        # Vistas del cliente
│   │   └── app.js           # Arranque común (logout, sidebar, modales)
│   └── pages/
│       ├── login.html
│       ├── register.html
│       ├── trainer/         # home, clients, routines, nutrition, calendar
│       └── client/          # home, routines, nutrition, calendar, progress
└── README.md
```

Orden de scripts en cada página (sin ES modules para funcionar vía `file://`):
`data.js` → `api.js` → `ui.js` → `auth.js` → `trainer.js`/`client.js` → `app.js`.

## Extender (conexión a API)

Todas las vistas consumen datos mediante `GP.api` (`frontend/js/api.js`). Para
conectar un backend real, sustituye esas funciones por `fetch()` a tu API sin
tocar las vistas. Se planea: API REST + autenticación por token, base de datos
en la nube, biblioteca de ejercicios y calendario interactivo.