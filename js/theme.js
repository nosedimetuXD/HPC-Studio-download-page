/**
 * theme.js - HPC Studio
 * Manages theme switching (dark, light, high-contrast) and persists to localStorage.
 */

(function () {
  'use strict';

  const THEME_STORAGE_KEY = 'hpc-studio-theme';
  const THEMES = ['dark', 'light', 'high-contrast'];

  function getSavedTheme() {
    return localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
  }

  function applyTheme(theme) {
    if (!THEMES.includes(theme)) theme = 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    // Update active state in theme toggles
    document.querySelectorAll('[data-theme-value]').forEach(btn => {
      const val = btn.getAttribute('data-theme-value');
      btn.classList.toggle('active', val === theme);
      btn.setAttribute('aria-pressed', val === theme ? 'true' : 'false');
    });

    // Update theme toggle icon if single button
    const toggleIcon = document.getElementById('theme-toggle-icon');
    if (toggleIcon) {
      if (theme === 'dark') toggleIcon.textContent = '🌙';
      else if (theme === 'light') toggleIcon.textContent = '☀️';
      else toggleIcon.textContent = '👁️';
    }
  }

  function cycleTheme() {
    const current = getSavedTheme();
    const next = current === 'dark' ? 'light' : current === 'light' ? 'high-contrast' : 'dark';
    applyTheme(next);
  }

  function initTheme() {
    const saved = getSavedTheme();
    applyTheme(saved);

    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', cycleTheme);
    }

    document.querySelectorAll('[data-theme-value]').forEach(btn => {
      btn.addEventListener('click', () => {
        const selected = btn.getAttribute('data-theme-value');
        applyTheme(selected);
      });
    });
  }

  // Early execution to prevent flash of wrong theme
  initTheme();

  window.HPC_Theme = { applyTheme, cycleTheme, getSavedTheme };
})();
