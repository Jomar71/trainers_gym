/* ═══════════════════════════════════════════════════════════════════════════════════
   trainer.js — Vistas del rol Entrenador (dashboard, clientes, rutinas, nutrición, agenda)
   ═══════════════════════════════════════════════════════════════════════════════════ */
(function (window) {
    'use strict';
    var GP = window.GP = window.GP || {};
    var u = GP.ui;
    var $ = u.$, $$ = u.$$, esc = u.esc;

    var DIFF = ['', 'Principiante', 'Intermedio', 'Avanzado'];
    var DAYS = [
        { n: 1, label: 'Lun' }, { n: 2, label: 'Mar' }, { n: 3, label: 'Mié' },
        { n: 4, label: 'Jue' }, { n: 5, label: 'Vie' }, { n: 6, label: 'Sáb' }, { n: 0, label: 'Dom' }
    ];
    var DAY_FULL = { 0: 'Domingo', 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado' };

    function trainer() {
        return GP.api.getTrainerByUserId(GP.auth.current().userId);
    }

    function avatarInitials(name) {
        var parts = (name || '?').trim().split(/\s+/);
        return (parts[0] || '?').charAt(0).toUpperCase() + (parts[1] ? parts[1].charAt(0).toUpperCase() : '');
    }

    function renderSidebar() {
        var el = $('#sidebarUser');
        var usr = GP.auth.user();
        if (el && usr) {
            el.innerHTML = '<strong>' + esc(usr.name) + '</strong><span>' + esc(usr.email) + '</span>';
        }
    }

    function clientName(clientId) {
        var c = GP.api.getClient(clientId);
        var cu = c ? GP.api.getClientUser(c) : null;
        return cu ? cu.name : 'Sin asignar';
    }

    /* ═══ DASHBOARD ═══════════════════════════════════════════════════════════ */
    function home() {
        GP.auth.guard('TRAINER');
        renderSidebar();
        owner();
        var t = trainer();
        var me = GP.auth.user();
        var allWorkouts = GP.api.getWorkoutsByTrainer(t.id);
        var allClients = GP.api.getClientsByTrainer(t.id);
        var today = u.todayISO();
        var apptsToday = GP.api.getAppointmentsByTrainer(t.id).filter(function (a) { return a.start.slice(0, 10) === today; });
        var recent = allWorkouts.slice(0, 4);

        var inactive = allClients.filter(function (c) {
            var last = GP.api.lastTrainingDate(c.profile.id);
            var d = GP.api.daysSince(last);
            return d !== null && d >= 3;
        });

        var statHtml = statCard('Clientes Activos', allClients.length, 'blue', icUsers)
            + statCard('Rutinas Creadas', allWorkouts.length, 'green', icList)
            + statCard('Turnos Hoy', apptsToday.length, 'purple', icCal);

        var recents = recent.length ? '<div class="list">' + recent.map(function (w) {
            var st = GP.api.workoutStats(w);
            return '<a class="list-item" href="routines.html">' +
                '<div class="list-item-left">' +
                '<div class="avatar blue">' + icListSm + '</div>' +
                '<div class="list-item-info"><h4>' + esc(w.name) + '</h4>' +
                '<p>' + st.exercises + ' ejercicios · ' + st.days + ' días · ' + esc(clientName(w.clientId)) + '</p></div></div>' +
                '<span class="badge badge-level-' + (w.difficulty || 1) + '">' + DIFF[w.difficulty || 1] + '</span></a>';
        }).join('') + '</div>' : emptyState(icList, 'Sin rutinas aún', 'Crea tu primera rutina con el botón de arriba.');

        var alerts = inactive.length
            ? '<div class="alert alert-warning"><strong>Clientes sin entrenar (≥ 3 días):</strong> ' + inactive.map(function (c) {
                return esc(c.user.name) + ' (' + GP.api.daysSince(GP.api.lastTrainingDate(c.profile.id)) + ' días)';
            }).join(' · ') + '</div>'
            : '';

        $('#app').innerHTML =
            '<div class="page-header"><div><h1>Bienvenido, ' + esc((me && me.name) || 'Entrenador') + '</h1>' +
            '<p class="text-muted">Panel de control de TrainerHub</p></div></div>' +
            '<div class="stats-grid">' + statHtml + '</div>' +
            alerts +
            quickActions() +
            '<div class="section"><h3 class="section-title">' + icList + ' Rutinas Recientes</h3>' + recents + '</div>';
    }

    function statCard(label, value, color, icon) {
        return '<div class="stat-card"><div class="stat-info"><p>' + label + '</p><h3>' + value + '</h3></div>' +
            '<div class="stat-icon ' + color + '">' + icon + '</div></div>';
    }

    function quickActions() {
        return '<div class="quick-actions"><h3>Comienza a usar TrainerHub</h3>' +
            '<p>Sigue estos pasos para configurar tu cuenta:</p>' +
            '<div class="quick-actions-grid">' +
            '<a class="quick-action-item" href="clients.html"><h4>1. Agregar Clientes</h4><p>Registra tus primeros alumnos</p></a>' +
            '<a class="quick-action-item" href="routines.html"><h4>2. Crear Rutinas</h4><p>Diseña planes de entrenamiento</p></a>' +
            '<a class="quick-action-item" href="calendar.html"><h4>3. Agendar Turnos</h4><p>Organiza tu calendario</p></a>' +
            '</div></div>';
    }

    function emptyState(icon, title, text) {
        return '<div class="empty-state">' + icon + '<h3>' + title + '</h3><p>' + text + '</p></div>';
    }

    /* ═══ CLIENTES ═══════════════════════════════════════════════════════════ */
    function clients() {
        GP.auth.guard('TRAINER');
        renderSidebar();
        owner();
        var t = trainer();
        var list = GP.api.getClientsByTrainer(t.id);

        function renderList(items) {
            var box = $('#clientsList');
            if (!box) return;
            if (!items.length) {
                box.innerHTML = emptyState(icUsers, 'No tienes clientes', 'Registra tu primer cliente con el botón "Nuevo Cliente".');
                return;
            }
            box.innerHTML = '<div class="list">' + items.map(function (c) {
                var last = GP.api.lastTrainingDate(c.profile.id);
                var sin = GP.api.daysSince(last);
                var badge = c.profile.goal
                    ? '<span class="badge badge-green mt-1">' + esc(c.profile.goal) + '</span>'
                    : '<span class="badge badge-gray mt-1">Sin objetivo</span>';
                var wa = c.profile.phone
                    ? '<a class="whatsapp-link" title="WhatsApp" target="_blank" rel="noopener" href="https://wa.me/' + esc(c.profile.phone) + '">' + icWa + '</a>'
                    : '';
                return '<div class="list-item" data-search="' + esc(c.user.name.toLowerCase() + ' ' + (c.user.email || '').toLowerCase()) + '">' +
                    '<div class="list-item-left"><div class="avatar blue">' + esc(avatarInitials(c.user.name)) + '</div>' +
                    '<div class="list-item-info"><h4>' + esc(c.user.name || 'Sin Nombre') + '</h4>' +
                    '<p>' + esc(c.user.email) + '</p>' + badge + '</div></div>' +
                    '<div class="list-item-actions">' + wa + '</div></div>';
            }).join('') + '</div>';
        }

        $('#app').innerHTML =
            '<div class="page-header"><div><h1>Clientes</h1><p class="text-muted">' + list.length + ' cliente(s) asignado(s)</p></div>' +
            '<button class="btn btn-primary" onclick="GP.trainer.actions.openNewClient()">' + icPlus + ' Nuevo Cliente</button></div>' +
            '<div class="form-group mb-3"><input id="clientSearch" class="form-input" type="search" placeholder="Buscar cliente por nombre o email..." aria-label="Buscar cliente"></div>' +
            '<div id="clientsList"></div>' +
            newClientModal();

        var search = $('#clientSearch');
        search.addEventListener('input', function (e) {
            var q = e.target.value.toLowerCase().trim();
            var items = $$('#clientsList .list-item');
            items.forEach(function (it) {
                it.style.display = !q || (it.getAttribute('data-search') || '').includes(q) ? '' : 'none';
            });
            var any = q ? items.some(function (it) { return it.style.display !== 'none'; }) : items.length > 0;
            if (!any) {
                $('#clientsList').innerHTML = emptyState(icUsers, 'Sin resultados', 'Ningún cliente coincide con la búsqueda.');
            }
        });
        renderList(list);
    }

    /* ═══ RUTINAS ════════════════════════════════════════════════════════════ */
    function routines() {
        GP.auth.guard('TRAINER');
        renderSidebar();
        owner();
        var t = trainer();
        var list = GP.api.getWorkoutsByTrainer(t.id);
        var clientsList = GP.api.getClientsByTrainer(t.id);

        var html = '<div class="page-header"><div><h1>Rutinas</h1><p class="text-muted">' + list.length + ' plan(es) de entrenamiento</p></div>' +
            '<button class="btn btn-primary" onclick="GP.trainer.actions.openNewRoutine()">' + icPlus + ' Nueva Rutina</button></div>';

        if (!list.length) {
            html += emptyState(icList, 'No tienes rutinas', 'Crea tu primera rutina con el botón "Nueva Rutina".');
        } else {
            html += '<div class="grid-3">' + list.map(function (w) {
                var st = GP.api.workoutStats(w);
                return '<div class="workout-card">' +
                    '<div class="workout-card-header"><div><h3>' + esc(w.name) + '</h3>' +
                    '<p class="text-sm text-muted mt-1">' + esc(clientName(w.clientId)) + '</p></div>' +
                    '<span class="badge badge-level-' + (w.difficulty || 1) + '">' + DIFF[w.difficulty || 1] + '</span></div>' +
                    '<div class="workout-card-body"><p class="text-xs text-muted">' + st.exercises + ' ejercicios · ' + st.days + ' días</p>' +
                    (w.description ? '<p class="text-sm mt-1">' + esc(w.description) + '</p>' : '') +
                    '</div>' +
                    '<div class="workout-card-footer"><span class="text-xs text-muted">Creada ' + u.fmtDate(w.createdDate) + '</span>' +
                    (w.completed ? '<span class="badge badge-green">Completada</span>' : '<span class="badge badge-blue">Activa</span>') + '</div></div>';
            }).join('') + '</div>';
        }

        $('#app').innerHTML = html + newRoutineModal(clientsList);
    }

    /* ═══ NUTRICIÓN ══════════════════════════════════════════════════════════ */
    function nutrition() {
        GP.auth.guard('TRAINER');
        renderSidebar();
        owner();
        var t = trainer();
        var plans = GP.api.getPlansByTrainer(t.id);
        var clientsList = GP.api.getClientsByTrainer(t.id);

        var html = '<div class="page-header"><div><h1>Planes Nutricionales</h1><p class="text-muted">' + plans.length + ' plan(es)</p></div>' +
            '<button class="btn btn-primary" onclick="GP.trainer.actions.openNewPlan()">' + icPlus + ' Nuevo Plan</button></div>';

        if (!plans.length) {
            html += emptyState(icFood, 'No hay planes nutricionales', 'Crea tu primer plan con el botón "Nuevo Plan".');
        } else {
            html += '<div class="grid-3">' + plans.map(function (p) {
                var who = p.clientId ? esc(clientName(p.clientId)) : 'Sin asignar';
                return '<div class="nutrition-card">' +
                    '<div class="nutrition-card-header"><div class="flex items-center gap-2"><span>' + icFood + '</span><h3>' + esc(p.name) + '</h3></div>' +
                    (p.description ? '<p class="text-sm text-muted mt-1">' + esc(p.description) + '</p>' : '') +
                    '</div>' +
                    '<div style="padding:1rem 1.25rem;"><p class="text-xs text-muted">Asignado a: <strong>' + who + '</strong></p>' +
                    '<p class="text-xs text-muted mt-1">' + p.meals.length + ' comidas</p></div></div>';
            }).join('') + '</div>';
        }

        $('#app').innerHTML = html + newPlanModal(clientsList);
    }

    /* ═══ AGENDA / CALENDARIO ════════════════════════════════════════════════ */
    function calendar() {
        GP.auth.guard('TRAINER');
        renderSidebar();
        owner();
        var t = trainer();
        var clientsList = GP.api.getClientsByTrainer(t.id);
        var appts = GP.api.getAppointmentsByTrainer(t.id);

        var html = '<div class="page-header"><div><h1>Agenda</h1><p class="text-muted">' + appts.length + ' citas (mes actual y próximas)</p></div>' +
            '<button class="btn btn-primary" onclick="GP.trainer.actions.openNewAppointment(\'' + u.todayISO() + '\')">' + icPlus + ' Nueva Cita</button></div>';

        if (!appts.length) {
            html += emptyState(icCal, 'No hay citas programadas', 'Agenda una nueva cita con el botón "Nueva Cita".');
        } else {
            var byDate = {};
            appts.forEach(function (a) {
                var d = a.start.slice(0, 10);
                (byDate[d] = byDate[d] || []).push(a);
            });
            var groups = Object.keys(byDate).sort();
            html += groups.map(function (d) {
                var label = u.isToday(d) ? 'Hoy · ' + u.fmtDateLong(d) : (u.fmtDateLong(d));
                return '<div class="date-group-label">' + label + '</div>' +
                    byDate[d].map(function (a) {
                        var who = esc(clientName(a.clientId));
                        var badge = a.status === 'COMPLETED' ? '<span class="badge badge-green">Completada</span>'
                            : a.status === 'CANCELLED' ? '<span class="badge badge-red">Cancelada</span>'
                            : '<span class="badge badge-yellow">Pendiente</span>';
                        var actions = a.status === 'SCHEDULED'
                            ? '<button class="btn btn-sm btn-success" title="Marcar completa" onclick="GP.trainer.actions.setAppointment(\'' + a.id + '\',\'COMPLETED\')">' + icCheck + '</button>' +
                              '<button class="btn btn-sm btn-danger" title="Cancelar" onclick="GP.trainer.actions.setAppointment(\'' + a.id + '\',\'CANCELLED\')">' + icX + '</button>'
                            : '';
                        return '<div class="appointment-card">' +
                            '<div class="flex items-center gap-2" style="min-width:0;">' +
                            '<div class="appointment-time">' + u.fmtTime(a.start) + '</div>' +
                            '<div class="appointment-info"><h4>' + who + '</h4>' +
                            '<p>' + icClock + ' ' + durMin(a) + ' min</p>' +
                            (a.notes ? '<p>' + esc(a.notes) + '</p>' : '') + '</div></div>' +
                            '<div class="flex items-center gap-1">' + badge + actions + '</div></div>';
                    }).join('');
            }).join('');
        }

        $('#app').innerHTML = html + newAppointmentModal(clientsList, u.todayISO());
    }

    function durMin(a) {
        return Math.round((new Date(a.end) - new Date(a.start)) / 60000);
    }

    /* ═══ ACCIONES ═══════════════════════════════════════════════════════════ */
    var routineDraft = { days: [] };

    var actions = {
        /* -- Nuevo cliente -- */
        openNewClient: function () { u.openModal('newClientModal'); },
        submitNewClient: function (e) {
            if (e) e.preventDefault();
            var f = $('#newClientModal form');
            var res = GP.api.createClient(trainer().id, {
                name: f.name.value, email: f.email.value,
                phone: f.phone.value, goal: f.goal.value,
                weight: f.weight.value, height: f.height.value
            });
            if (res.error) { u.toast(res.error, 'error'); return false; }
            u.toast('Cliente registrado exitosamente', 'success');
            u.closeModal('newClientModal');
            clients();
            return false;
        },

        /* -- Nueva rutina -- */
        openNewRoutine: function () {
            routineDraft.days = [];
            rebuildDayChips();
            u.openModal('newRoutineModal');
        },
        toggleDay: function (btn, day, label) {
            var i = routineDraft.days.indexOf(day);
            if (i >= 0) { routineDraft.days.splice(i, 1); btn.classList.remove('on'); }
            else { routineDraft.days.push(day); btn.classList.add('on'); }
        },
        addExercise: function () {
            var box = $('#exBuilder');
            var entry = document.createElement('div');
            entry.className = 'exercise-entry';
            entry.innerHTML =
                '<button type="button" class="exercise-remove" onclick="GP.trainer.actions.removeExercise(this)">&times;</button>' +
                '<div class="flex items-center gap-2"><input class="form-input ex-name" placeholder="Nombre del ejercicio" aria-label="Nombre del ejercicio">' +
                '<input class="form-input ex-muscle" style="max-width:140px;" placeholder="Músculo (opcional)" aria-label="Músculo"></div>' +
                '<div class="exercise-grid"><div><label>Series</label><input type="number" class="ex-sets" value="3" min="1"></div>' +
                '<div><label>Reps</label><input type="number" class="ex-reps" value="10" min="1"></div>' +
                '<div><label>Peso (kg)</label><input type="number" class="ex-weight" value="0" min="0" step="0.5"></div>' +
                '<div><label>Descanso (s)</label><input type="number" class="ex-rest" value="60" min="0" step="5"></div></div>';
            box.appendChild(entry);
        },
        removeExercise: function (btn) { btn.closest('.exercise-entry').remove(); },
        submitNewRoutine: function (e) {
            if (e) e.preventDefault();
            var f = $('#newRoutineModal form');
            var days = routineDraft.days.slice().sort(function (a, b) { return a - b; });
            var dayList = days.map(function (d) {
                return {
                    day: d, name: DAY_FULL[d],
                    exercises: $$('#exBuilder .exercise-entry').map(function (row) {
                        return {
                            name: row.querySelector('.ex-name').value,
                            muscle: row.querySelector('.ex-muscle').value,
                            sets: row.querySelector('.ex-sets').value,
                            reps: row.querySelector('.ex-reps').value,
                            weight: row.querySelector('.ex-weight').value,
                            rest: row.querySelector('.ex-rest').value
                        };
                    }).filter(function (ex) { return ex.name.trim(); })
                };
            });
            var res = GP.api.createWorkout(trainer().id, {
                name: f.name.value, description: f.description.value,
                clientId: f.client_id.value, difficulty: f.difficulty.value,
                days: dayList
            });
            if (res.error) { u.toast(res.error, 'error'); return false; }
            u.toast('Rutina creada exitosamente', 'success');
            u.closeModal('newRoutineModal');
            routines();
            return false;
        },

        /* -- Nuevo plan -- */
        openNewPlan: function () { u.openModal('newPlanModal'); },
        addMeal: function () {
            var box = $('#mealBuilder');
            var entry = document.createElement('div');
            entry.className = 'exercise-entry';
            entry.innerHTML =
                '<button type="button" class="exercise-remove" onclick="GP.trainer.actions.removeExercise(this)">&times;</button>' +
                '<div class="exercise-grid">' +
                '<div><label>Hora</label><input type="time" class="meal-time" value="08:00"></div>' +
                '<div><label>Nombre</label><input class="form-input meal-name" placeholder="Ej: Desayuno"></div></div>' +
                '<input class="form-input meal-food mt-2" placeholder="Descripción de la comida">';
            box.appendChild(entry);
        },
        submitNewPlan: function (e) {
            if (e) e.preventDefault();
            var f = $('#newPlanModal form');
            var meals = $$('#mealBuilder .exercise-entry').map(function (row) {
                return {
                    time: row.querySelector('.meal-time').value,
                    name: row.querySelector('.meal-name').value,
                    food: row.querySelector('.meal-food').value
                };
            }).filter(function (m) { return (m.name || '').trim(); });
            var res = GP.api.createPlan(trainer().id, {
                name: f.name.value, description: f.description.value,
                clientId: f.client_id.value, meals: meals
            });
            if (res.error) { u.toast(res.error, 'error'); return false; }
            u.toast('Plan creado exitosamente', 'success');
            u.closeModal('newPlanModal');
            nutrition();
            return false;
        },

        /* -- Nueva cita -- */
        openNewAppointment: function (today) {
            var input = $('#newAppointmentModal input[name="date"]');
            if (input) input.min = today;
            u.openModal('newAppointmentModal');
        },
        submitNewAppointment: function (e) {
            if (e) e.preventDefault();
            var f = $('#newAppointmentModal form');
            var res = GP.api.createAppointment(trainer().id, {
                clientId: f.client_id.value, date: f.date.value, time: f.time.value,
                duration: f.duration.value, notes: f.notes.value
            });
            if (res.error) { u.toast(res.error, 'error'); return false; }
            u.toast('Cita agendada exitosamente', 'success');
            u.closeModal('newAppointmentModal');
            calendar();
            return false;
        },
        setAppointment: function (id, status) {
            var res = GP.api.updateAppointmentStatus(id, status);
            if (res.error) { u.toast(res.error, 'error'); return; }
            u.toast(status === 'COMPLETED' ? 'Cita completada' : 'Cita cancelada', 'success');
            calendar();
        }
    };

    function rebuildDayChips() {
        var box = $('#dayChips');
        if (!box) return;
        box.innerHTML = DAYS.map(function (d) {
            return '<button type="button" class="chip" data-day="' + d.n + '" onclick="GP.trainer.actions.toggleDay(this,' + d.n + ',\'' + DAY_FULL[d.n] + '\')">' + d.label + '</button>';
        }).join('');
    }

    /* ═══ Modales (HTML) ═════════════════════════════════════════════════════ */
    function newClientModal() {
        return modal('newClientModal', 'Registrar Nuevo Cliente', '<form onsubmit="return GP.trainer.actions.submitNewClient(event)">' +
            '<div class="modal-body">' +
            formField('Nombre Completo', '<input class="form-input" name="name" placeholder="Juan Pérez" required>') +
            formField('Email', '<input class="form-input" name="email" type="email" placeholder="juan@ejemplo.com" required>') +
            '<div class="grid-2">' +
            formField('Teléfono (WhatsApp)', '<input class="form-input" name="phone" type="tel" placeholder="521234567890">') +
            formField('Objetivo', '<input class="form-input" name="goal" placeholder="Pérdida de peso...">') +
            '</div>' +
            '<div class="grid-2">' +
            formField('Peso (kg)', '<input class="form-input" name="weight" type="number" min="0" step="0.1">') +
            formField('Altura (cm)', '<input class="form-input" name="height" type="number" min="0">') +
            '</div>' +
            formField('Contraseña temporal', '<input class="form-input" name="password" placeholder="cliente123" value="cliente123">', 'El cliente podrá iniciar sesión con esta contraseña.') +
            '</div>' +
            '<div class="modal-footer"><button type="button" class="btn btn-outline" onclick="GP.ui.closeModal(\'newClientModal\')">Cancelar</button>' +
            '<button type="submit" class="btn btn-primary">Guardar Cliente</button></div></form>');
    }

    function newRoutineModal(clientsList) {
        var opts = '<option value="">Sin asignar (Plantilla)</option>' +
            clientsList.map(function (c) { return '<option value="' + c.profile.id + '">' + esc(c.user.name) + '</option>'; }).join('');
        return modal('newRoutineModal', 'Nueva Rutina', '<form onsubmit="return GP.trainer.actions.submitNewRoutine(event)">' +
            '<div class="modal-body">' +
            formField('Nombre de la Rutina', '<input class="form-input" name="name" placeholder="Ej. Hipertrofia Pecho" required>') +
            formField('Descripción (Opcional)', '<textarea class="form-input" name="description" rows="2"></textarea>') +
            '<div class="grid-2">' +
            formField('Dificultad', '<select class="form-input" name="difficulty"><option value="1">Principiante</option><option value="2">Intermedio</option><option value="3">Avanzado</option></select>') +
            formField('Asignar a Cliente', '<select class="form-input" name="client_id">' + opts + '</select>') +
            '</div>' +
            formField('Días de entrenamiento', '<div class="chip-group" id="dayChips"></div>') +
            '<div class="flex justify-between items-center mb-1 mt-2"><label class="form-label" style="margin:0;">Ejercicios</label>' +
            '<button type="button" class="btn btn-sm btn-outline" onclick="GP.trainer.actions.addExercise()">+ Agregar</button></div>' +
            '<div id="exBuilder"></div>' +
            '</div>' +
            '<div class="modal-footer"><button type="button" class="btn btn-outline" onclick="GP.ui.closeModal(\'newRoutineModal\')">Cancelar</button>' +
            '<button type="submit" class="btn btn-primary">Guardar Rutina</button></div></form>');
    }

    function newPlanModal(clientsList) {
        var opts = clientsList.map(function (c) { return '<option value="' + c.profile.id + '">' + esc(c.user.name) + '</option>'; }).join('');
        return modal('newPlanModal', 'Nuevo Plan Nutricional', '<form onsubmit="return GP.trainer.actions.submitNewPlan(event)">' +
            '<div class="modal-body">' +
            formField('Nombre del Plan', '<input class="form-input" name="name" placeholder="Ej. Plan Pérdida de Grasa" required>') +
            formField('Descripción', '<textarea class="form-input" name="description" rows="2"></textarea>') +
            formField('Asignar a Cliente', '<select class="form-input" name="client_id" required><option value="">Seleccionar cliente...</option>' + opts + '</select>') +
            '<div class="flex justify-between items-center mb-1 mt-2"><label class="form-label" style="margin:0;">Comidas</label>' +
            '<button type="button" class="btn btn-sm btn-outline" onclick="GP.trainer.actions.addMeal()">+ Agregar</button></div>' +
            '<div id="mealBuilder"></div>' +
            '</div>' +
            '<div class="modal-footer"><button type="button" class="btn btn-outline" onclick="GP.ui.closeModal(\'newPlanModal\')">Cancelar</button>' +
            '<button type="submit" class="btn btn-primary">Guardar Plan</button></div></form>');
    }

    function newAppointmentModal(clientsList, today) {
        var opts = clientsList.map(function (c) { return '<option value="' + c.profile.id + '">' + esc(c.user.name) + '</option>'; }).join('');
        return modal('newAppointmentModal', 'Nueva Cita', '<form onsubmit="return GP.trainer.actions.submitNewAppointment(event)">' +
            '<div class="modal-body">' +
            formField('Cliente', '<select class="form-input" name="client_id" required><option value="">Seleccionar Cliente...</option>' + opts + '</select>') +
            '<div class="grid-2">' +
            formField('Fecha', '<input class="form-input" name="date" type="date" min="' + today + '" required>') +
            formField('Hora', '<input class="form-input" name="time" type="time" value="09:00" required>') +
            '</div>' +
            formField('Duración (minutos)', '<input class="form-input" name="duration" type="number" value="60" min="15" step="15">') +
            formField('Notas (Opcional)', '<textarea class="form-input" name="notes" rows="2" placeholder="Detalles de la sesión..."></textarea>') +
            '</div>' +
            '<div class="modal-footer"><button type="button" class="btn btn-outline" onclick="GP.ui.closeModal(\'newAppointmentModal\')">Cancelar</button>' +
            '<button type="submit" class="btn btn-primary">Agendar Cita</button></div></form>');
    }

    /* ── Helpers de marcado ─────────────────────────────────────────────────── */
    function modal(id, title, body) {
        return '<div class="modal-overlay" id="' + id + '" role="dialog" aria-modal="true" aria-label="' + title + '">' +
            '<div class="modal"><div class="modal-header"><h3>' + title + '</h3>' +
            '<button class="modal-close" onclick="GP.ui.closeModal(\'' + id + '\')" aria-label="Cerrar">&times;</button></div>' +
            body + '</div></div>';
    }
    function formField(label, input, hint) {
        return '<div class="form-group mb-3"><label class="form-label">' + label + '</label>' + input +
            (hint ? '<span class="form-hint">' + hint + '</span>' : '') + '</div>';
    }

    function owner() {
        // Metadato del documento (nota de demo)
        var u2 = GP.auth.user();
        document.title = document.title.replace(/· TrainerHub$/, '') + ' · TrainerHub';
        if (u2) { var n = $('#navName'); if (n) n.textContent = u2.name; }
    }

    /* ── Iconos SVG (estilo consistente) ────────────────────────────────────── */
    var svg = function (inner, w, h) {
        w = w || 18; h = h || 18;
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:' + w + 'px;height:' + h + 'px;">' + inner + '</svg>';
    };
    var icUsers = svg('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>');
    var icList = svg('<path d="M6.5 6.5h11M6.5 17.5h11M3 12h18"/>');
    var icListSm = svg('<path d="M6.5 6.5h11M6.5 17.5h11M3 12h18"/>', 18, 18);
    var icCal = svg('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>');
    var icPlus = svg('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>', 18, 18);
    var icFood = svg('<path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>');
    var icClock = svg('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>', 12, 12);
    var icCheck = svg('<polyline points="20 6 9 17 4 12"/>', 16, 16);
    var icX = svg('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>', 16, 16);
    var icWa = svg('<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>', 18, 18);

    GP.trainer = {
        home: home, clients: clients, routines: routines, nutrition: nutrition, calendar: calendar,
        actions: actions
    };

})(window);