/* ═══════════════════════════════════════════════════════════════════════════════════
   ui.js — Utilidades de interfaz: toasts, modales, sidebar, formatos y fecha.
   ═══════════════════════════════════════════════════════════════════════════════════ */
(function (window) {
    'use strict';
    var GP = window.GP = window.GP || {};

    var DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    var DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    var MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    function $(sel, root) { return (root || document).querySelector(sel); }
    function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    /* ── Toasts ─────────────────────────────────────────────────────────────── */
    function toast(message, type) {
        type = type || 'info';
        var container = $('#toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        var el = document.createElement('div');
        el.className = 'toast toast-' + type;
        el.setAttribute('role', 'status');
        el.textContent = message;
        container.appendChild(el);
        setTimeout(function () {
            el.classList.add('toast-out');
            setTimeout(function () { el.remove(); }, 300);
        }, 3200);
    }

    /* ── Modales ────────────────────────────────────────────────────────────── */
    function openModal(id) {
        var modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            var first = modal.querySelector('input, select, textarea, button');
            if (first) setTimeout(function () { first.focus(); }, 50);
        }
    }
    function closeModal(id) {
        var modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    function initModalHandlers() {
        document.addEventListener('click', function (e) {
            if (e.target.classList.contains('modal-overlay')) closeModal(e.target.id);
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                $$('.modal-overlay.active').forEach(function (m) { closeModal(m.id); });
            }
        });
    }

    /* ── Sidebar (entrenador) ───────────────────────────────────────────────── */
    function toggleSidebar() {
        var sb = $('#sidebar'), ov = $('#sidebarOverlay');
        if (!sb || !ov) return;
        sb.classList.toggle('open');
        ov.classList.toggle('active');
    }
    function initSidebar() {
        var ov = $('#sidebarOverlay');
        if (ov) ov.addEventListener('click', toggleSidebar);
    }

    /* ── Formatos de fecha/hora ─────────────────────────────────────────────── */
    function isToday(iso) { return (iso || '').slice(0, 10) === todayISO(); }
    function todayISO() {
        var d = new Date();
        function p(n) { return (n < 10 ? '0' : '') + n; }
        return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
    }
    function fmtTime(iso) {
        var d = new Date(iso);
        return p2(d.getHours()) + ':' + p2(d.getMinutes());
    }
    function fmtDate(iso) {
        var d = new Date(iso + 'T00:00:00');
        return d.getDate() + ' ' + MONTHS[d.getMonth()].slice(0, 3);
    }
    function fmtDateLong(iso) {
        var d = new Date(iso + 'T00:00:00');
        return DAYS[d.getDay()] + ' ' + d.getDate() + ' de ' + MONTHS[d.getMonth()];
    }
    function fmtDateDayNum(iso) {
        var d = new Date(iso + 'T00:00:00');
        return d.getDate();
    }
    function fmtDateShort(iso) {
        var d = new Date(iso + 'T00:00:00');
        return p2(d.getDate()) + '/' + p2(d.getMonth() + 1);
    }
    function dayLabel(dayNum) { return DAYS_SHORT[dayNum % 7] || ''; }
    function relDay(iso) {
        if (isToday(iso)) return 'Hoy';
        return fmtDate(iso);
    }
    function p2(n) { return (n < 10 ? '0' : '') + n; }

    /* Deps */
    var W = window.GP = window.GP || {};
    W.ui = {
        $: $, $$: $$, esc: esc, toast: toast,
        openModal: openModal, closeModal: closeModal, initModalHandlers: initModalHandlers,
        toggleSidebar: toggleSidebar, initSidebar: initSidebar,
        isToday: isToday, todayISO: todayISO, fmtTime: fmtTime, fmtDate: fmtDate,
        fmtDateLong: fmtDateLong, fmtDateShort: fmtDateShort, relDay: relDay,
        dayLabel: dayLabel, DAYS: DAYS, DAYS_SHORT: DAYS_SHORT
    };

})(window);