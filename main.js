// ...new file...
'use strict';

document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.getElementById('hamburger-menu');
    const nav = document.getElementById('nav-menu');

    if (!hamburger || !nav) {
        console.error('main.js: hamburger or nav element not found');
        return;
    }

    // Toggle menu
    hamburger.addEventListener('click', function (e) {
        e.stopPropagation();
        nav.classList.toggle('active');
        const expanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', String(!expanded));
    });

    // Close when clicking outside menu
    document.addEventListener('click', function (e) {
        if (nav.classList.contains('active') && !nav.contains(e.target) && !hamburger.contains(e.target)) {
            nav.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && nav.classList.contains('active')) {
            nav.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.focus();
        }
    });
});