/* ═══════════════════════════════════════════════════════════════════════════════════
   api.js — Fachada de acceso a datos del demo.
   Todas las vistas usan estas funciones; en la siguiente fase cada una puede
   sustituirse por fetch() a la API REST del backend sin tocar las vistas.
   ═══════════════════════════════════════════════════════════════════════════════════ */
(function (window) {
    'use strict';
    var GP = window.GP = window.GP || {};
    var D = GP.data;
    var S = function () { return D.get(); };

    /* ── Usuarios / sesión ────────────────────────────────────────────────── */
    function getUser(id) {
        return S().users.find(function (u) { return u.id === id; }) || null;
    }
    function findUserByEmail(email) {
        var e = (email || '').trim().toLowerCase();
        return S().users.find(function (u) { return u.email.toLowerCase() === e; }) || null;
    }
    function createUser(name, email, password, role) {
        var e = (email || '').trim();
        if (!name || !e || !password) return { error: 'Todos los campos son obligatorios' };
        if (password.length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres' };
        if (findUserByEmail(e)) return { error: 'Ya existe una cuenta con ese email' };

        var st = S();
        var user = {
            id: D.genId('u'), name: name.trim(), email: e,
            password: password, role: role === 'trainer' ? 'TRAINER' : 'CLIENT'
        };
        st.users.push(user);

        if (role === 'trainer') {
            st.trainers.push({ id: D.genId('t'), userId: user.id, specialties: '', bio: '' });
        } else {
            var first = st.trainers[0];
            st.clients.push({ id: D.genId('c'), userId: user.id, trainerId: first ? first.id : null, goal: '', weight: null, height: null, phone: '' });
        }
        D.persist();
        return { user: user };
    }
    function updateProfile(userId, patch) {
        var u = getUser(userId);
        if (!u) return { error: 'Usuario no encontrado' };
        Object.assign(u, patch);
        D.persist();
        return { user: u };
    }

    /* ── Perfiles de rol ───────────────────────────────────────────────────── */
    function getTrainerByUserId(userId) {
        return S().trainers.find(function (t) { return t.userId === userId; }) || null;
    }
    function getClientByUserId(userId) {
        return S().clients.find(function (c) { return c.userId === userId; }) || null;
    }
    function getClient(clientId) {
        return S().clients.find(function (c) { return c.id === clientId; }) || null;
    }
    function getClientUser(client) {
        return client ? getUser(client.userId) : null;
    }
    function getClientsByTrainer(trainerId) {
        return S().clients
            .filter(function (c) { return c.trainerId === trainerId; })
            .map(function (c) { return { profile: c, user: getUser(c.userId) }; })
            .sort(function (a, b) { return (a.user.name || '').localeCompare(b.user.name || ''); });
    }
    function createClient(trainerId, data) {
        var name = (data.name || '').trim(), email = (data.email || '').trim();
        if (!name || !email) return { error: 'Nombre y email son obligatorios' };
        var existing = findUserByEmail(email);
        if (existing) {
            var dup = S().clients.find(function (c) { return c.userId === existing.id && c.trainerId === trainerId; });
            if (dup) return { error: 'El cliente ya está asociado a tu cuenta' };
            S().clients.push({ id: D.genId('c'), userId: existing.id, trainerId: trainerId, goal: data.goal || '', weight: data.weight ? +data.weight : null, height: data.height ? +data.height : null, phone: data.phone || '' });
        } else {
            var user = createUser(name, email, data.password || 'cliente123', 'client');
            if (user.error && !user.user) return user;
            S().clients.push({ id: D.genId('c'), userId: user.user.id, trainerId: trainerId, goal: data.goal || '', weight: data.weight ? +data.weight : null, height: data.height ? +data.height : null, phone: data.phone || '' });
        }
        D.persist();
        return { success: true };
    }

    /* ── Rutinas ───────────────────────────────────────────────────────────── */
    function getWorkoutsByTrainer(trainerId) {
        return S().workouts.filter(function (w) { return w.trainerId === trainerId; })
            .sort(function (a, b) { return (b.createdDate || '').localeCompare(a.createdDate || ''); });
    }
    function getWorkoutsByClient(clientId) {
        return S().workouts.filter(function (w) { return w.clientId === clientId; });
    }
    function getActiveWorkoutsByClient(clientId) {
        return getWorkoutsByClient(clientId).filter(function (w) { return w.isActive && !w.completed; });
    }
    function getWorkout(workoutId) {
        return S().workouts.find(function (w) { return w.id === workoutId; }) || null;
    }
    function workoutStats(w) {
        var days = w.days || [];
        var exercises = days.reduce(function (n, d) { return n + (d.exercises ? d.exercises.length : 0); }, 0);
        return { days: days.length, exercises: exercises };
    }
    function dayByNumber(workout, dayNum) {
        return (workout.days || []).find(function (d) { return d.day === dayNum; }) || null;
    }
    function toggleExercise(workoutId, dayId, exerciseId) {
        var w = getWorkout(workoutId);
        if (!w) return;
        var day = (w.days || []).find(function (d) { return d.id === dayId; });
        if (!day) return;
        (day.exercises || []).forEach(function (ex) {
            if (ex.id === exerciseId) ex.completed = !ex.completed;
        });
        D.persist();
    }
    function createWorkout(trainerId, data) {
        var name = (data.name || '').trim();
        if (!name) return { error: 'El nombre es obligatorio' };
        if (!data.days || !data.days.length) return { error: 'Selecciona al menos un día de entrenamiento' };
        var dayCount = 0;
        data.days.forEach(function (d) {
            (d.exercises || []).forEach(function (ex) { if ((ex.name || '').trim()) dayCount++; });
        });
        if (!dayCount) return { error: 'Agrega al menos un ejercicio' };

        S().workouts.push({
            id: D.genId('w'), trainerId: trainerId, clientId: data.clientId || null,
            name: name, description: (data.description || '').trim(),
            difficulty: +data.difficulty || 1, isActive: true, completed: false,
            createdDate: D.iso(0),
            days: data.days.map(function (d) {
                return {
                    id: D.genId('d'), day: d.day, name: d.name,
                    exercises: d.exercises.map(function (ex) {
                        return {
                            id: D.genId('e'), name: ex.name.trim(), muscle: ex.muscle || '',
                            sets: +ex.sets || 3, reps: +ex.reps || 10, weight: +ex.weight || 0,
                            rest: +ex.rest || 60, completed: false, notes: ex.notes || ''
                        };
                    })
                };
            })
        });
        D.persist();
        return { success: true };
    }
    function markWorkoutCompleted(clientId, workoutId) {
        var w = getWorkout(workoutId);
        if (!w) return { error: 'Rutina no encontrada' };
        if (w.clientId !== clientId) return { error: 'No autorizado' };
        w.completed = !w.completed;
        if (w.completed) {
            S().logs.push({ id: D.genId('l'), clientId: clientId, date: D.iso(0), workoutId: workoutId });
        }
        D.persist();
        return { success: true, completed: w.completed };
    }

    /* ── Nutrición ─────────────────────────────────────────────────────────── */
    function getPlansByTrainer(trainerId) {
        return S().nutritionPlans.filter(function (p) { return p.trainerId === trainerId; });
    }
    function getPlansByClient(clientId) {
        return S().nutritionPlans.filter(function (p) { return p.clientId === clientId; });
    }
    function createPlan(trainerId, data) {
        var name = (data.name || '').trim();
        if (!name || !data.clientId) return { error: 'Nombre y cliente son obligatorios' };
        S().nutritionPlans.push({
            id: D.genId('n'), trainerId: trainerId, clientId: data.clientId,
            name: name, description: (data.description || '').trim(),
            meals: (data.meals || []).filter(function (m) { return (m.name || '').trim(); })
        });
        D.persist();
        return { success: true };
    }

    /* ── Citas ─────────────────────────────────────────────────────────────── */
    function getAppointmentsByTrainer(trainerId) {
        return S().appointments.filter(function (a) { return a.trainerId === trainerId; })
            .sort(function (a, b) { return a.start.localeCompare(b.start); });
    }
    function getAppointmentsByClient(clientId) {
        return S().appointments.filter(function (a) { return a.clientId === clientId; })
            .sort(function (a, b) { return a.start.localeCompare(b.start); });
    }
    function getAppointmentsTodayForClient(clientId) {
        return getAppointmentsByClient(clientId).filter(function (a) {
            return a.start.slice(0, 10) === D.iso(0);
        });
    }
    function createAppointment(trainerId, data) {
        if (!data.clientId || !data.date || !data.time) return { error: 'Cliente, fecha y hora son obligatorios' };
        var start = new Date(data.date + 'T' + data.time);
        if (isNaN(start.getTime())) return { error: 'Fecha u hora inválida' };
        var duration = +data.duration || 60;
        var end = new Date(start.getTime() + duration * 60000);

        var conflict = S().appointments.some(function (a) {
            if (a.trainerId !== trainerId || a.status === 'CANCELLED') return false;
            var aStart = new Date(a.start), aEnd = new Date(a.end);
            return aStart < end && aEnd > start;
        });
        if (conflict) return { error: 'Horario ocupado. Elige otro horario.' };

        S().appointments.push({
            id: D.genId('a'), trainerId: trainerId, clientId: data.clientId,
            start: start.toISOString(), end: end.toISOString(),
            status: 'SCHEDULED', notes: (data.notes || '').trim()
        });
        D.persist();
        return { success: true };
    }
    function updateAppointmentStatus(appointmentId, status) {
        var a = S().appointments.find(function (x) { return x.id === appointmentId; });
        if (!a) return { error: 'Cita no encontrada' };
        a.status = status;
        D.persist();
        return { success: true };
    }

    /* ── Progreso ──────────────────────────────────────────────────────────── */
    function getProgress(clientId) {
        return S().progress.filter(function (p) { return p.clientId === clientId; })
            .sort(function (a, b) { return a.date.localeCompare(b.date); });
    }
    function addProgress(clientId, data) {
        if (!data.date || !data.weight) return { error: 'Fecha y peso son obligatorios' };
        S().progress.push({
            id: D.genId('p'), clientId: clientId, date: data.date,
            weight: +data.weight, bodyFat: data.bodyFat ? +data.bodyFat : null, notes: (data.notes || '').trim()
        });
        D.persist();
        return { success: true };
    }

    /* ── Logs / rachas / actividad ─────────────────────────────────────────── */
    function getLogs(clientId) {
        return S().logs.filter(function (l) { return l.clientId === clientId; })
            .sort(function (a, b) { return a.date.localeCompare(b.date); });
    }
    function sessionsThisMonth(clientId) {
        var month = D.iso(0).slice(0, 7);
        return getLogs(clientId).filter(function (l) { return l.date.slice(0, 7) === month; }).length;
    }
    function streak(clientId) {
        var dates = getLogs(clientId).map(function (l) { return l.date; });
        var set = {};
        dates.forEach(function (d) { set[d] = 1; });

        var count = 0;
        var cursor = new Date();
        if (!set[D.iso(0)]) cursor.setDate(cursor.getDate() - 1); // hoy aún no cuenta
        while (set[currentISODate(cursor)]) { count++; cursor.setDate(cursor.getDate() - 1); }
        return count;
    }
    function currentISODate(d) {
        var pad = function (n) { return (n < 10 ? '0' : '') + n; };
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    }
    function lastTrainingDate(clientId) {
        var logs = getLogs(clientId);
        return logs.length ? logs[logs.length - 1].date : null;
    }
    function daysSince(dateISO) {
        if (!dateISO) return null;
        var t = new Date(dateISO + 'T00:00:00');
        var now = new Date(D.iso(0) + 'T00:00:00');
        return Math.round((now - t) / 86400000);
    }

    /* Demos: restablecer los datos de ejemplo */
    function resetDemo() {
        GP._state.reset();
        return { success: true };
    }

    GP.api = {
        getUser: getUser, findUserByEmail: findUserByEmail, createUser: createUser, updateProfile: updateProfile,
        getTrainerByUserId: getTrainerByUserId, getClientByUserId: getClientByUserId,
        getClient: getClient, getClientUser: getClientUser, getClientsByTrainer: getClientsByTrainer, createClient: createClient,
        getWorkoutsByTrainer: getWorkoutsByTrainer, getWorkoutsByClient: getWorkoutsByClient,
        getActiveWorkoutsByClient: getActiveWorkoutsByClient, getWorkout: getWorkout,
        workoutStats: workoutStats, dayByNumber: dayByNumber, toggleExercise: toggleExercise,
        createWorkout: createWorkout, markWorkoutCompleted: markWorkoutCompleted,
        getPlansByTrainer: getPlansByTrainer, getPlansByClient: getPlansByClient, createPlan: createPlan,
        getAppointmentsByTrainer: getAppointmentsByTrainer, getAppointmentsByClient: getAppointmentsByClient,
        getAppointmentsTodayForClient: getAppointmentsTodayForClient,
        createAppointment: createAppointment, updateAppointmentStatus: updateAppointmentStatus,
        getProgress: getProgress, addProgress: addProgress,
        getLogs: getLogs, sessionsThisMonth: sessionsThisMonth, streak: streak,
        lastTrainingDate: lastTrainingDate, daysSince: daysSince, resetDemo: resetDemo
    };

})(window);