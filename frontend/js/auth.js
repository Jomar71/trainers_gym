/* ═══════════════════════════════════════════════════════════════════════════════════
   auth.js — Gestión de sesión y control de acceso por rol (demo, vía localStorage).
   ═══════════════════════════════════════════════════════════════════════════════════ */
(function (window) {
    'use strict';
    var GP = window.GP = window.GP || {};
    var SESSION_KEY = 'gympro.session';
    var REMEMBER_KEY = 'gympro.remember';

    function _read(key) {
        try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null; }
    }
    function _write(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* sin persistencia */ }
    }
    function _remove(key) {
        try { localStorage.removeItem(key); } catch (e) { /* noop */ }
    }

    function current() { return _read(SESSION_KEY); }

    function remember() { return localStorage.getItem(REMEMBER_KEY) === '1'; }

    function login(email, password, rememberMe) {
        var user = GP.api.findUserByEmail(email);
        if (!user || user.password !== password) return null;
        _write(SESSION_KEY, { userId: user.id, role: user.role });
        try { localStorage.setItem(REMEMBER_KEY, rememberMe ? '1' : '0'); } catch (e) { /* noop */ }
        return user;
    }

    function register(name, email, password, role) {
        return GP.api.createUser(name, email, password, role);
    }

    function logout() {
        _remove(SESSION_KEY);
        _remove(REMEMBER_KEY);
    }

    /* Comprueba sesión antes de cargar una página privada */
    function guard(requiredRole) {
        var s = current();
        if (!s) { location.replace(getLoginURL()); return null; }
        if (requiredRole && s.role !== requiredRole) {
            location.replace(relToPages(s.role === 'TRAINER' ? 'trainer/home.html' : 'client/home.html'));
            return null;
        }
        return s;
    }
    /* Ruta relativa desde la carpeta actual hasta pages/ (sirve para file:// y http) */
    function relToPages(sub) {
        var path = (location.pathname || '').split('?')[0];
        var file = path.slice(path.lastIndexOf('/') + 1);
        var dir = path.slice(0, path.length - file.length);
        var segs = dir.split('/').filter(function (s) { return s.length > 0; });
        var ups = 0, i;
        for (i = segs.length - 1; i >= 0; i--) {
            if (segs[i] === 'pages') break;
            ups++;
        }
        if (i < 0) {
            var hasFrontend = segs.indexOf('frontend') !== -1;
            return (hasFrontend ? 'frontend/' : '') + sub;
        }
        var prefix = '';
        for (var k = 0; k < ups; k++) prefix += '../';
        return prefix + sub;
    }
    function getLoginURL() {
        return relToPages('login.html');
    }
    function user() {
        var s = current();
        return s ? GP.api.getUser(s.userId) : null;
    }

    function homeURL() {
        var s = current();
        if (!s) return 'login.html';
        return s.role === 'TRAINER' ? 'trainer/home.html' : 'client/home.html';
    }

    GP.auth = {
        current: current, remember: remember, login: login, register: register,
        logout: logout, guard: guard, user: user, homeURL: homeURL, getLoginURL: getLoginURL
    };

})(window);