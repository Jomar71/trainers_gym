/* ═══════════════════════════════════════════════════════════════════════════════════
   client.js — Vistas del rol Cliente (inicio, rutinas, nutrición, agenda, progreso)
   ═══════════════════════════════════════════════════════════════════════════════════ */
(function (window) {
    'use strict';
    var GP = window.GP = window.GP || {};
    var u = GP.ui;
    var $ = u.$, $$ = u.$$, esc = u.esc;

    var DIFF = ['', 'Principiante', 'Intermedio', 'Avanzado'];

    function client() {
        return GP.api.getClientByUserId(GP.auth.current().userId);
    }

    function initShell() {
        var usr = GP.auth.user();
        var el = $('#navUser');
        if (el && usr) el.innerHTML = '<div class="avatar orange">' + esc(initials(usr.name)) + '</div><span>' + esc(usr.name) + '</span>';
        var go = $('#navGoal');
        if (go) {
            var c = client();
            go.textContent = c && c.goal ? c.goal : 'Objetivo: por definir';
        }
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-outline btn-sm js-logout';
        btn.textContent = 'Salir';
        if (el) el.appendChild(btn);
    }

    function initials(name) {
        var parts = (name || '?').trim().split(/\s+/);
        return (parts[0] || '?').charAt(0).toUpperCase() + (parts[1] ? parts[1].charAt(0).toUpperCase() : '');
    }
    function trainername() {
        var c = client();
        if (!c || !c.trainerId) return 'Tu entrenador';
        var st = GP.data.get();
        var tprof = st.trainers.find(function (x) { return x.id === c.trainerId; });
        var user = tprof ? st.users.find(function (x) { return x.id === tprof.userId; }) : null;
        return user ? user.name : 'Tu entrenador';
    }

    function emptyState(icon, title, text) {
        return '<div class="empty-state">' + icon + '<h3>' + title + '</h3><p>' + text + '</p></div>';
    }

    /* ═══ INICIO ═════════════════════════════════════════════════════════════ */
    function home() {
        var s = GP.auth.guard('CLIENT');
        if (!s) return;
        initShell();
        var c = client();
        var me = GP.auth.user();
        var today = u.todayISO();
        var appts = GP.api.getAppointmentsByClient(c.id);
        var todaysAppts = appts.filter(function (a) { return a.start.slice(0, 10) === today && a.status !== 'CANCELLED'; });
        var upcoming = appts.filter(function (a) { return a.start.slice(0, 10) >= today && a.status !== 'CANCELLED'; })[0] || null;
        var streak = GP.api.streak(c.id);
        var sessions = GP.api.sessionsThisMonth(c.id);
        var workouts = GP.api.getActiveWorkoutsByClient(c.id);
        var todayNum = new Date().getDay();
        var todaysWorkout = workouts.map(function (w) {
            var d = GP.api.dayByNumber(w, todayNum);
            return d ? { w: w, d: d } : null;
        }).filter(Boolean)[0] || null;

        var apptsHtml = todaysAppts.length
            ? '<div class="list">' + todaysAppts.map(function (a) {
                return '<div class="list-item"><div class="list-item-left"><div class="avatar green">' + icDumbbell + '</div>' +
                    '<div class="list-item-info"><h4>Sesión hoy · ' + u.fmtTime(a.start) + '</h4><p>' + trainername(a.trainerId) + '</p>' +
                    (a.notes ? '<p class="text-xs text-muted">' + esc(a.notes) + '</p>' : '') + '</div></div></div>';
            }).join('') + '</div>'
            : '<div class="card"><p class="text-muted">No tienes sesiones agendadas para hoy.</p></div>';

        var todayWo = todaysWorkout
            ? '<a class="workout-card link-card" href="routines.html"><div class="workout-card-header"><div><h3>' + esc(todaysWorkout.w.name) + '</h3>' +
              '<p class="text-sm text-muted mt-1">El día de hoy · ' + todaysWorkout.d.exercises.length + ' ejercicios</p></div>' +
              '<span class="badge badge-level-' + (todaysWorkout.w.difficulty || 1) + '">' + DIFF[todaysWorkout.w.difficulty || 1] + '</span></div>' +
              '<div class="workout-card-footer"><span style="color:var(--primary);" class="text-sm">Ver rutina →</span></div></a>'
            : '<div class="card"><p class="text-muted">Hoy no tienes rutina asignada. ¡Descansa o repasa tu plan!</p></div>';

        $('#app').innerHTML =
            '<div class="welcome-banner"><div><h1>¡Hola, ' + esc((me && me.name.split(' ')[0]) || 'atleta') + '!</h1>' +
            '<p>Tu próxima cita: ' + (upcoming ? u.fmtDateLong(upcoming.start.slice(0, 10)) + ' a las ' + u.fmtTime(upcoming.start) : 'sin cita próxima') + '.</p></div>' +
            '<div class="avatar avatar-lg orange">' + esc(initials((me && me.name) || 'A')) + '</div></div>' +

            '<div class="stats-grid">' +
            statCard('Racha', streak + ' días', 'orange', icFlame) +
            statCard('Sesiones este mes', sessions, 'blue', icDumbbell) +
            statCard('Próxima cita', upcoming ? u.fmtDateShort(upcoming.start.slice(0, 10)) : '—', 'purple', icCal) +
            '</div>' +

            '<div class="section"><h3 class="section-title">Rutina de Hoy</h3>' + todayWo + '</div>' +
            '<div class="section"><h3 class="section-title">Sesiones de Hoy</h3>' + apptsHtml + '</div>';

        bindQuickNav();
    }

    function statCard(label, value, color, icon) {
        return '<div class="stat-card"><div class="stat-info"><p>' + label + '</p><h3>' + value + '</h3></div>' +
            '<div class="stat-icon ' + color + '">' + icon + '</div></div>';
    }

    function bindQuickNav() {
        $$('[data-go]').forEach(function (el) {
            el.addEventListener('click', function () {
                var page = el.getAttribute('data-go');
                if (page === 'calendar') calendar();
                else if (page === 'routines') routines();
            });
        });
    }

    /* ═══ RUTINAS ════════════════════════════════════════════════════════════ */
    var routineView = { workoutId: null, dayId: null };

    function routines() {
        var s = GP.auth.guard('CLIENT');
        if (!s) return;
        initShell();
        var c = client();
        var workouts = GP.api.getActiveWorkoutsByClient(c.id);

        $('#app').innerHTML =
            '<div class="page-header"><div><h1>Mis Rutinas</h1><p class="text-muted">' + workouts.length + ' plan(es) activo(s)</p></div></div>' +
            (workouts.length
                ? '<div class="grid-3">' + workouts.map(function (w) {
                    var st = GP.api.workoutStats(w);
                    return '<div class="workout-card" onclick="GP.client.actions.openRoutine(\'' + w.id + '\')" role="button" tabindex="0">' +
                        '<div class="workout-card-header"><div><h3>' + esc(w.name) + '</h3>' +
                        '<p class="text-sm text-muted mt-1">' + st.days + ' días · ' + st.exercises + ' ejercicios</p></div>' +
                        '<span class="badge badge-level-' + (w.difficulty || 1) + '">' + DIFF[w.difficulty || 1] + '</span></div>' +
                        (w.description ? '<div class="workout-card-body"><p class="text-sm">' + esc(w.description) + '</p></div>' : '') +
                        '<div class="workout-card-footer"><span style="color:var(--primary);" class="text-sm">Ver rutina →</span></div></div>';
                }).join('') + '</div>'
                : emptyState(icList, 'Aún no tienes rutinas', 'Tu entrenador te asignará un plan de entrenamiento. ¡Pronto lo verás aquí!')) +
            '<div class="flex items-center gap-2 mt-4"><button class="btn btn-outline" onclick="GP.client.actions.home()">← Volver</button></div>';
    }

    function openRoutine(workoutId) {
        var s = GP.auth.guard('CLIENT');
        if (!s) return;
        initShell();
        var c = client();
        var w = GP.api.getWorkout(workoutId);
        if (!w || w.clientId !== c.id) { u.toast('Rutina no encontrada', 'error'); return; }

        routineView.workoutId = w.id;
        if (!routineView.dayId || !(w.days || []).some(function (d) { return d.id === routineView.dayId; })) {
            routineView.dayId = (w.days[0] || {}).id || null;
        }
        var curDay = (w.days || []).find(function (d) { return d.id === routineView.dayId; });

        var dayTabs = '<div class="day-tabs" role="tablist">' + (w.days || []).map(function (d) {
            return '<button class="day-tab' + (d.id === routineView.dayId ? ' active' : '') + '" onclick="GP.client.actions.selectDay(\'' + d.id + '\')">' + esc(d.day || '') + '</button>';
        }).join('') + '</div>';

        var prog = GP.api.workoutStats(w);
        var exercisesHtml = curDay && curDay.exercises && curDay.exercises.length
            ? curDay.exercises.map(function (ex) {
                return '<div class="exercise-row' + (ex.completed ? ' done' : '') + '" onclick="GP.client.actions.toggleEx(\'' + w.id + '\',\'' + curDay.id + '\',\'' + ex.id + '\')" role="button" tabindex="0">' +
                    '<label class="ex-check"><input type="checkbox" data-exid="' + ex.id + '"' + (ex.completed ? ' checked' : '') + '><span class="ex-checkmark"></span></label>' +
                    '<div class="ex-main"><strong>' + esc(ex.name) + '</strong>' +
                    (ex.muscle ? '<span class="badge badge-gray">' + esc(ex.muscle) + '</span>' : '') +
                    '<p class="text-xs text-muted mt-1">' + ex.sets + ' x ' + ex.reps + ' · ' + (ex.weight ? ex.weight + ' kg' : 'peso corporal') + (ex.rest ? ' · descanso ' + ex.rest + 's' : '') + '</p>' +
                    (ex.notes ? '<p class="text-xs text-muted">' + esc(ex.notes) + '</p>' : '') + '</div></div>';
            }).join('')
            : '<div class="exercise-row"><p class="text-muted">Este día aún no tiene ejercicios.</p></div>';

        var allDone = curDay && curDay.exercises.every(function (e) { return e.completed; });

        $('#app').innerHTML =
            '<button class="btn btn-outline btn-sm mb-3" onclick="GP.client.actions.routines()">← Mis rutinas</button>' +
            '<div class="page-header"><div><h1>' + esc(w.name) + '</h1>' +
            '<p class="text-muted">' + prog.days + ' días · ' + prog.exercises + ' ejercicios · ' + (w.description ? esc(w.description) : '') + '</p></div>' +
            '<span class="badge badge-level-' + (w.difficulty || 1) + '">' + DIFF[w.difficulty || 1] + '</span></div>' +
            dayTabs +
            '<div class="exercise-list">' + exercisesHtml + '</div>' +
            '<div class="mt-3"><button class="btn btn-success w-100" onclick="GP.client.actions.complete(\'' + w.id + '\')" ' +
            (w.completed ? 'disabled' : '') + '>' + (w.completed ? icCheck + ' Rutina completada' : icCheck + ' Completar día') + '</button>' +
            (allDone && !w.completed ? '<p class="text-xs text-center text-muted mt-1">Todo listo. ¡Buen trabajo!</p>' : '') + '</div>';
        // nota: se usa variable global en ar: onclick directo
    }

    /* ═══ NUTRICIÓN ══════════════════════════════════════════════════════════ */
    function nutrition() {
        var s = GP.auth.guard('CLIENT');
        if (!s) return;
        initShell();
        var c = client();
        var plans = GP.api.getPlansByClient(c.id);

        var html = '<div class="page-header"><div><h1>Mi Nutrición</h1><p class="text-muted">' + plans.length + ' plan(es) asignado(s)</p></div></div>';

        if (!plans.length) {
            html += emptyState(icFood, 'Sin planes aún', 'Tu entrenador te compartirá un plan nutricional. ¡Ya casi!');
        } else {
            html += '<div class="grid-2">' + plans.map(function (p) {
                return '<div class="nutrition-card">' +
                    '<div class="nutrition-card-header"><div><h3>' + esc(p.name) + '</h3>' +
                    (p.description ? '<p class="text-sm text-muted mt-1">' + esc(p.description) + '</p>' : '') + '</div></div>' +
                    '<div class="meal-list">' + p.meals.map(function (m) {
                        return '<div class="meal-item"><div class="meal-time">' + u.fmtTime(m.time + ':00') + '</div>' +
                            '<div class="meal-info"><h4>' + esc(m.name) + '</h4><p>' + esc(m.food) + '</p></div></div>';
                    }).join('') + '</div></div>';
            }).join('') + '</div>';
        }
        $('#app').innerHTML = html + '<div class="flex items-center gap-2 mt-4"><button class="btn btn-outline" onclick="GP.client.actions.home()">← Volver</button></div>';
    }

    /* ═══ AGENDA ═════════════════════════════════════════════════════════════ */
    function calendar() {
        var s = GP.auth.guard('CLIENT');
        if (!s) return;
        initShell();
        var c = client();
        var today = u.todayISO();
        var appts = GP.api.getAppointmentsByClient(c.id)
            .filter(function (a) { return a.start.slice(0, 10) >= today; });

        var html = '<div class="page-header"><div><h1>Mi Agenda</h1><p class="text-muted">Tus próximas sesiones</p></div></div>';

        if (!appts.length) {
            html += emptyState(icCal, 'No hay citas próximas', 'Tu entrenador agendará tus sesiones. Revisa pronto este espacio.');
        } else {
            var byDate = {};
            appts.forEach(function (a) {
                var d = a.start.slice(0, 10);
                (byDate[d] = byDate[d] || []).push(a);
            });
            html += Object.keys(byDate).sort().map(function (d) {
                var isT = u.isToday(d);
                var label = isT ? 'Hoy' : (GP.api.daysSince(d) === 1 ? 'Mañana' : u.fmtDateLong(d));
                return '<div class="date-group-label">' + label + '</div>' +
                    byDate[d].map(function (a) {
                        var badge = a.status === 'COMPLETED' ? '<span class="badge badge-green">Completada</span>'
                            : a.status === 'CANCELLED' ? '<span class="badge badge-red">Cancelada</span>'
                            : '<span class="badge badge-yellow">Pendiente</span>';
                        return '<div class="appointment-card">' +
                            '<div class="flex items-center gap-2" style="min-width:0;">' +
                            '<div class="appointment-time">' + u.fmtTime(a.start) + '</div>' +
                            '<div class="appointment-info"><h4>Sesión de entrenamiento</h4>' +
                            '<p>' + icClock + ' con ' + trainername() + '</p>' +
                            (a.notes ? '<p class="text-xs text-muted">' + esc(a.notes) + '</p>' : '') + '</div></div>' +
                            '<div>' + badge + '</div></div>';
                    }).join('');
            }).join('');
        }
        $('#app').innerHTML = html + '<div class="flex items-center gap-2 mt-4"><button class="btn btn-outline" onclick="GP.client.actions.home()">← Volver</button></div>';
    }

    /* ═══ PROGRESO ═══════════════════════════════════════════════════════════ */
    function progress() {
        var s = GP.auth.guard('CLIENT');
        if (!s) return;
        initShell();
        var c = client();
        var entries = GP.api.getProgress(c.id);

        var html = '<div class="page-header"><div><h1>Mi Progreso</h1><p class="text-muted">Evolución de peso corporal</p></div></div>';

        if (entries.length >= 2) {
            html += chartCard(entries);
        } else {
            html += '<div class="card mb-3"><p class="text-muted">Aún no hay suficientes registros para graficar. Registra tu peso y crea tu gráfica.</p></div>';
        }

        var rows = entries.slice().reverse().map(function (p) {
            return '<tr><td>' + u.fmtDateShort(p.date) + '</td><td><strong>' + p.weight + ' kg</strong></td>' +
                '<td>' + (p.bodyFat != null ? p.bodyFat + '%' : '—') + '</td>' +
                '<td class="text-muted text-xs">' + (p.notes ? esc(p.notes) : '') + '</td></tr>';
        }).join('');

        html +=
            '<div class="section"><h3 class="section-title">Registrar peso</h3>' +
            '<form class="card" onsubmit="return GP.client.actions.addWeight(event)">' +
            '<div class="grid-2"><div class="form-group"><label class="form-label">Fecha</label>' +
            '<input class="form-input" name="date" type="date" value="' + u.todayISO() + '" required></div>' +
            '<div class="form-group"><label class="form-label">Peso (kg)</label>' +
            '<input class="form-input" name="weight" type="number" min="0" step="0.1" required></div></div>' +
            '<div class="form-group mt-2"><label class="form-label">Grasa corporal (%) — opcional</label>' +
            '<input class="form-input" name="bodyFat" type="number" min="0" max="60" step="0.1"></div>' +
            '<button class="btn btn-primary mt-3 w-100" type="submit">Guardar registro</button></form></div>' +

            '<div class="section"><h3 class="section-title">Historial</h3>' +
            '<div class="table-wrap"><table class="table"><thead><tr><th>Fecha</th><th>Peso</th><th>Grasa</th><th>Notas</th></tr></thead><tbody>' +
            (rows || '<tr><td colspan="4" class="text-muted">Sin registros.</td></tr>') +
            '</tbody></table></div></div>' +
            '<div class="flex items-center gap-2 mt-4"><button class="btn btn-outline" onclick="GP.client.actions.home()">← Volver</button></div>';

        $('#app').innerHTML = html;
    }

    function chartCard(entries) {
        var W = 260, H = 120, pad = 8;
        var weights = entries.map(function (p) { return p.weight; });
        var min = Math.min.apply(null, weights) - 2, max = Math.max.apply(null, weights) + 2;
        var span = (max - min) || 1;

        var coords = entries.map(function (p, i) {
            var x = pad + (i / (entries.length - 1)) * (W - pad * 2);
            var y = H - pad - ((p.weight - min) / span) * (H - pad * 2);
            return { x: x.toFixed(1), y: y.toFixed(1), w: p.weight };
        });

        var line = coords.map(function (p, i) { return (i ? 'L' : 'M') + p.x + ' ' + p.y; }).join(' ');
        var area = 'M' + coords[0].x + ' ' + (H - pad) + line + ' L' + coords[coords.length - 1].x + ' ' + (H - pad) + ' Z';
        var dots = coords.map(function (p, i) {
            return '<circle cx="' + p.x + '" cy="' + p.y + '" r="3" fill="var(--primary)"><title>' + u.fmtDate(entries[i].date) + ': ' + p.w + ' kg</title></circle>';
        }).join('');

        var diff = (weights[weights.length - 1] - weights[0]);
        var diffLabel = (diff === 0 ? 'sin cambios'
            : (diff > 0 ? '+' + diff.toFixed(1) : diff.toFixed(1)) + ' kg desde el inicio');

        return '<div class="chart-card"><div class="chart-header"><div><h3 style="margin:0;">Evolución de Peso</h3>' +
            '<p class="text-sm text-muted mt-1">' + diffLabel + '</p></div>' +
            '<span class="badge badge-blue">' + weights[weights.length - 1] + ' kg</span></div>' +
            '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Gráfica de evolución de peso">' +
            '<path d="' + area + '" fill="var(--primary)" opacity="0.12"></path>' +
            '<path d="' + line + '" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>' +
            dots + '</svg>' +
            '<div class="chart-x"><span>' + u.fmtDate(entries[0].date) + '</span><span>' + u.fmtDate(entries[entries.length - 1].date) + '</span></div></div>';
    }

    /* ═══ ACCIONES ═══════════════════════════════════════════════════════════ */
    var actions = {
        home: home,
        routines: routines,
        openRoutine: openRoutine,
        selectDay: function (dayId) { routineView.dayId = dayId; openRoutine(routineView.workoutId); },
        toggleEx: function (workoutId, dayId, exId) {
            GP.api.toggleExercise(workoutId, dayId, exId);
            u.toast('Marcado', 'success');
            openRoutine(workoutId);
        },
        complete: function (workoutId) {
            var c = client();
            var res = GP.api.markWorkoutCompleted(c.id, workoutId);
            if (res.error) { u.toast(res.error, 'error'); return; }
            u.toast(res.completed ? 'Rutina completada. ¡Excelente!' : 'Rutina reactivada', 'success');
            openRoutine(workoutId);
        },
        addWeight: function (e) {
            if (e) e.preventDefault();
            var f = e.target;
            var c = client();
            var res = GP.api.addProgress(c.id, {
                date: f.date.value, weight: f.weight.value,
                bodyFat: f.bodyFat.value || ''
            });
            if (res.error) { u.toast(res.error, 'error'); return false; }
            u.toast('Registro guardado', 'success');
            progress();
            return false;
        }
    };

    /* ═══ Iconos SVG ═════════════════════════════════════════════════════════ */
    var svg = function (inner, w, h) {
        w = w || 18; h = h || 18;
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:' + w + 'px;height:' + h + 'px;">' + inner + '</svg>';
    };
    var icFlame = svg('<path d="M12 2c1 4 4 5 4 9a4 4 0 0 1-8 0c0-1 .5-2 1-3 1 1 2 2 3 1 .3-2 .3-4 0-7z"/><path d="M12 22a7 7 0 0 1-7-7c0-3 2-5 3-6 0 2 1 3 2 4 0-3 1-5 2-7 2 3 5 5 5 9a7 7 0 0 1-7 7z"/>');
    var icDumbbell = svg('<path d="M6.5 6.5h2v11h-2z"/><path d="M15.5 6.5h2v11h-2z"/><path d="M3 9.5h3.5v5H3z"/><path d="M17.5 9.5H21v5h-3.5z"/>');
    var icCal = svg('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>');
    var icList = svg('<path d="M6.5 6.5h11M6.5 17.5h11M3 12h18"/>');
    var icFood = svg('<path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>');
    var icClock = svg('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>', 12, 12);
    var icCheck = svg('<polyline points="20 6 9 17 4 12"/>', 16, 16);
    var icNavHome = svg('<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>');
    var icNavWorkout = svg('<path d="M6.5 6.5h2v11h-2z"/><path d="M15.5 6.5h2v11h-2z"/><path d="M3 9.5h3.5v5H3z"/><path d="M17.5 9.5H21v5h-3.5z"/>');
    var icNavFood = svg('<path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>');
    var icNavChart = svg('<path d="M5 20V10"/><path d="M12 20V4"/><path d="M19 20v-6"/>');

    GP.client = {
        home: home, routines: routines, openRoutine: openRoutine,
        nutrition: nutrition, calendar: calendar, progress: progress,
        actions: actions, view: routineView
    };

    /* Uso del nombre del entrenador por id (bien definido al final del modulo) */
    GP.client.trainerName = trainername;

})(window);