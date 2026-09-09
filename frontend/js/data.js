/* ═══════════════════════════════════════════════════════════════════════════════════
   data.js — Dataset demo + persistencia en localStorage.
   El frontend es 100% HTML/CSS/JS: los datos de ejemplo viven aquí.
   (Más adelante este módulo se sustituye por llamadas a la API del backend.)
   ═══════════════════════════════════════════════════════════════════════════════════ */
(function (window) {
    'use strict';
    var GP = window.GP = window.GP || {};

    var STORE_KEY = 'gympro.demo.db';
    var state = null;

    function pad(n) { return (n < 10 ? '0' : '') + n; }

    function at(offsetDays, hour, minute) {
        var d = new Date();
        d.setDate(d.getDate() + (offsetDays || 0));
        d.setHours(hour || 0, minute || 0, 0, 0);
        return d.toISOString();
    }

    function iso(offsetDays) {
        var d = new Date();
        d.setDate(d.getDate() + (offsetDays || 0));
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    }

    function seed() {
        // ── Usuarios y perfiles ────────────────────────────────────────────
        return {
            users: [
                { id: 'u-admin',  name: 'Administrador', email: 'admin@example.com',    password: 'admin',      role: 'TRAINER' },
                { id: 'u-client', name: 'Juan Pérez',    email: 'cliente@example.com',  password: 'cliente123', role: 'CLIENT' },
                { id: 'u-client2',name: 'María García',  email: 'maria@example.com',    password: 'maria123',   role: 'CLIENT' }
            ],
            trainers: [
                { id: 't1', userId: 'u-admin', specialties: 'Entrenamiento Personal, Hipertrofia, Pérdida de peso', bio: 'Entrenador certificado con más de 5 años de experiencia.' }
            ],
            clients: [
                { id: 'c1', userId: 'u-client',  trainerId: 't1', goal: 'Pérdida de peso',      weight: 85, height: 175, phone: '521234567890' },
                { id: 'c2', userId: 'u-client2', trainerId: 't1', goal: 'Ganancia muscular',    weight: 70, height: 170, phone: '521122334455' }
            ],

            // ── Rutinas (workouts) con días y ejercicios ────────────────────
            workouts: [
                {
                    id: 'w1', trainerId: 't1', clientId: 'c1', name: 'Full Body Básico',
                    description: 'Rutina completa para principiantes. Ideal para empezar la semana con todo el cuerpo.',
                    difficulty: 1, isActive: true, completed: false, createdDate: iso(-14),
                    days: [
                        { id: 'd1', day: 1, name: 'Lunes', exercises: [
                            { id: 'e11', name: 'Sentadillas',       muscle: 'Piernas',    sets: 4, reps: 12, weight: 20,  rest: 90, completed: false, notes: 'Baja controlada' },
                            { id: 'e12', name: 'Press de pecho',    muscle: 'Pecho',      sets: 4, reps: 10, weight: 30,  rest: 90, completed: false, notes: '' },
                            { id: 'e13', name: 'Remo con barra',    muscle: 'Espalda',    sets: 4, reps: 10, weight: 25,  rest: 90, completed: false, notes: '' },
                            { id: 'e14', name: 'Press militar',     muscle: 'Hombros',    sets: 3, reps: 12, weight: 15,  rest: 60, completed: false, notes: '' },
                            { id: 'e15', name: 'Curl de bíceps',    muscle: 'Bíceps',     sets: 3, reps: 15, weight: 10,  rest: 60, completed: false, notes: '' },
                            { id: 'e16', name: 'Plancha abdominal', muscle: 'Core',       sets: 3, reps: 30, weight: 0,   rest: 45, completed: false, notes: 'Contraer abdomen' }
                        ] },
                        { id: 'd2', day: 3, name: 'Miércoles', exercises: [
                            { id: 'e21', name: 'Peso muerto rumano', muscle: 'Femoral',   sets: 4, reps: 10, weight: 35,  rest: 120, completed: false, notes: '' },
                            { id: 'e22', name: 'Dominadas asistidas', muscle: 'Espalda',  sets: 4, reps: 8,  weight: 15,  rest: 90,  completed: false, notes: '' },
                            { id: 'e23', name: 'Elevaciones laterales', muscle: 'Hombros', sets: 3, reps: 15, weight: 8,  rest: 60,  completed: false, notes: '' },
                            { id: 'e24', name: 'Fondos en banco',   muscle: 'Tríceps',    sets: 3, reps: 12, weight: 0,   rest: 60,  completed: false, notes: '' },
                            { id: 'e25', name: 'Crunch abdominal',  muscle: 'Core',       sets: 3, reps: 20, weight: 0,   rest: 45,  completed: false, notes: '' }
                        ] },
                        { id: 'd3', day: 5, name: 'Viernes', exercises: [
                            { id: 'e31', name: 'Zancadas',          muscle: 'Piernas',    sets: 3, reps: 12, weight: 12,  rest: 90,  completed: false, notes: '' },
                            { id: 'e32', name: 'Flexiones',         muscle: 'Pecho',      sets: 3, reps: 15, weight: 0,   rest: 60,  completed: false, notes: '' },
                            { id: 'e33', name: 'Remo mancuernas',   muscle: 'Espalda',    sets: 3, reps: 12, weight: 18,  rest: 90,  completed: false, notes: '' },
                            { id: 'e34', name: 'Bicicleta estática', muscle: 'Cardio',    sets: 1, reps: 20, weight: 0,   rest: 60,  completed: false, notes: '20 min, intensidad media' }
                        ] }
                    ]
                },
                {
                    id: 'w2', trainerId: 't1', clientId: 'c1', name: 'Cardio y Core',
                    description: 'Sesiones complementarias para movilidad y abdomen.',
                    difficulty: 2, isActive: true, completed: false, createdDate: iso(-7),
                    days: [
                        { id: 'd4', day: 2, name: 'Martes', exercises: [
                            { id: 'e41', name: 'Caminata en cinta', muscle: 'Cardio', sets: 1, reps: 30, weight: 0, rest: 0, completed: false, notes: '30 min a ritmo constante' },
                            { id: 'e42', name: 'Russian twist', muscle: 'Core', sets: 3, reps: 20, weight: 6, rest: 45, completed: false, notes: '' },
                            { id: 'e43', name: 'Puente de glúteo', muscle: 'Glúteo', sets: 3, reps: 15, weight: 0, rest: 45, completed: false, notes: '' }
                        ] },
                        { id: 'd5', day: 4, name: 'Jueves', exercises: [
                            { id: 'e51', name: 'Remo en máquina', muscle: 'Espalda', sets: 3, reps: 12, weight: 22, rest: 60, completed: false, notes: '' },
                            { id: 'e52', name: 'Press inclinado', muscle: 'Pecho', sets: 3, reps: 10, weight: 20, rest: 60, completed: false, notes: '' },
                            { id: 'e53', name: 'Mountain climbers', muscle: 'Core', sets: 3, reps: 30, weight: 0, rest: 45, completed: false, notes: '' }
                        ] }
                    ]
                },
                {
                    id: 'w3', trainerId: 't1', clientId: 'c2', name: 'Hipertrofia Pecho y Espalda',
                    description: 'Enfoque en fuerza y volumen para pectoral y dorsal.',
                    difficulty: 3, isActive: true, completed: false, createdDate: iso(-10),
                    days: [
                        { id: 'd6', day: 2, name: 'Martes', exercises: [
                            { id: 'e61', name: 'Press banca',          muscle: 'Pecho',   sets: 5, reps: 6, weight: 60, rest: 150, completed: false, notes: '' },
                            { id: 'e62', name: 'Press inclinado mancuernas', muscle: 'Pecho', sets: 4, reps: 8, weight: 24, rest: 120, completed: false, notes: '' },
                            { id: 'e63', name: 'Aperturas',            muscle: 'Pecho',   sets: 3, reps: 12, weight: 14, rest: 90, completed: false, notes: '' },
                            { id: 'e64', name: 'Fondos',               muscle: 'Tríceps', sets: 4, reps: 10, weight: 0, rest: 90, completed: false, notes: '' }
                        ] }
                    ]
                }
            ],

            // ── Planes nutricionales ────────────────────────────────────────
            nutritionPlans: [
                {
                    id: 'n1', trainerId: 't1', clientId: 'c1', name: 'Plan de Definición',
                    description: 'Alimentación enfocada en mantener masa muscular y reducir grasa corporal.',
                    meals: [
                        { time: '08:00', name: 'Desayuno',   food: 'Avena con frutos rojos y claras de huevo' },
                        { time: '11:00', name: 'Merienda',   food: 'Batido de proteínas con plátano' },
                        { time: '14:00', name: 'Almuerzo',   food: 'Arroz integral con pechuga de pollo y verduras' },
                        { time: '17:00', name: 'Merienda',   food: 'Yogur griego con nueces' },
                        { time: '20:00', name: 'Cena',       food: 'Pescado al horno con ensalada' }
                    ]
                }
            ],

            // ── Citas ────────────────────────────────────────────────────────
            appointments: [
                { id: 'a1', trainerId: 't1', clientId: 'c1', start: at(0, 10, 0),   end: at(0, 11, 0),   status: 'SCHEDULED', notes: 'Sesión de evaluación' },
                { id: 'a2', trainerId: 't1', clientId: 'c2', start: at(0, 12, 30),  end: at(0, 13, 30),  status: 'SCHEDULED', notes: 'Entrenamiento fuerza' },
                { id: 'a3', trainerId: 't1', clientId: 'c1', start: at(1, 9, 0),    end: at(1, 10, 0),   status: 'SCHEDULED', notes: 'Segunda sesión' },
                { id: 'a4', trainerId: 't1', clientId: 'c2', start: at(3, 17, 0),   end: at(3, 18, 0),   status: 'SCHEDULED', notes: 'Revisión de técnica' },
                { id: 'a5', trainerId: 't1', clientId: 'c1', start: at(5, 18, 0),   end: at(5, 19, 0),   status: 'SCHEDULED', notes: 'Sesión semanal' }
            ],

            // ── Progreso corporal (clientes) ────────────────────────────────
            progress: [
                { id: 'p1', clientId: 'c1', date: iso(-70), weight: 88.0, bodyFat: 24.0, notes: 'Inicio del programa' },
                { id: 'p2', clientId: 'c1', date: iso(-56), weight: 87.5, bodyFat: 23.5, notes: '' },
                { id: 'p3', clientId: 'c1', date: iso(-42), weight: 87.0, bodyFat: 23.0, notes: '' },
                { id: 'p4', clientId: 'c1', date: iso(-28), weight: 86.4, bodyFat: 22.5, notes: 'Buen ritmo' },
                { id: 'p5', clientId: 'c1', date: iso(-14), weight: 85.8, bodyFat: 22.0, notes: '' },
                { id: 'p6', clientId: 'c1', date: iso(-7),  weight: 85.3, bodyFat: 21.7, notes: '' },
                { id: 'p7', clientId: 'c1', date: iso(0),   weight: 85.0, bodyFat: 21.5, notes: '' },
                { id: 'p8', clientId: 'c2', date: iso(-42), weight: 66.0, bodyFat: 15.0, notes: 'Inicio hipertrofia' },
                { id: 'p9', clientId: 'c2', date: iso(-14), weight: 68.5, bodyFat: 14.6, notes: '' },
                { id: 'p10',clientId: 'c2', date: iso(0),   weight: 70.0, bodyFat: 14.2, notes: '' }
            ],

            // ── Logs de entrenamiento (para rachas y inactividad) ───────────
            logs: [
                { id: 'l1', clientId: 'c1', date: iso(-5), workoutId: 'w1' },
                { id: 'l2', clientId: 'c1', date: iso(-4), workoutId: 'w2' },
                { id: 'l3', clientId: 'c1', date: iso(-3), workoutId: 'w1' },
                { id: 'l4', clientId: 'c1', date: iso(-2), workoutId: 'w2' },
                { id: 'l5', clientId: 'c1', date: iso(-1), workoutId: 'w1' }
            ]
        };
    }

    function load() {
        try {
            var raw = localStorage.getItem(STORE_KEY);
            if (raw) { state = JSON.parse(raw); return; }
        } catch (e) { /* almacenamiento no disponible */ }
        state = seed();
        persist();
    }

    function persist() {
        try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* sin persistencia */ }
    }

    function reset() {
        state = seed();
        persist();
    }

    function getState() { return state; }

    /* Identificadores únicos simples para el demo */
    function genId(prefix) {
        return (prefix || 'id') + '-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e6).toString(36);
    }

    load();

    GP._state = { reset: reset };
    GP.data = { get: getState, persist: persist, genId: genId, iso: iso, at: at };

})(window);