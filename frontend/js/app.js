/* ═══════════════════════════════════════════════════════════════════════════════════
   app.js — Inicio compartido: logout, sidebar, modales y atajos globales.
   ═══════════════════════════════════════════════════════════════════════════════════ */
(function (window) {
    'use strict';
    var GP = window.GP = window.GP || {};

    function init() {
        GP.ui.initSidebar();
        GP.ui.initModalHandlers();

        document.addEventListener('click', function (e) {
            var btn = e.target.closest ? e.target.closest('.js-logout') : null;
            if (btn) {
                e.preventDefault();
                GP.auth.logout();
                u().toast('Sesión cerrada', 'info');
                location.href = GP.auth.getLoginURL();
            }
        });
    }

    function u() { return GP.ui; }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    GP.app = { init: init };

})(window);