/**
 * main.js - HPC Studio
 * Main entry point: Mobile navigation menu, dropdown toggles, smooth scroll, copy-to-clipboard, and interactive polish.
 */

(function () {
  'use strict';

  function initMain() {
    initMobileNav();
    initDropdowns();
    initCopyButtons();
    initSmoothScroll();
    initHeaderScrollShadow();
  }

  // Mobile Navigation Toggle
  function initMobileNav() {
    const hamburger = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('main-nav-menu');

    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navMenu.classList.toggle('nav-open');
      hamburger.setAttribute('aria-expanded', isOpen);
      hamburger.classList.toggle('is-active', isOpen);
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
        navMenu.classList.remove('nav-open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.classList.remove('is-active');
      }
    });

    // Close mobile nav when clicking a link
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('nav-open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.classList.remove('is-active');
      });
    });
  }

  // Dropdown menus (e.g. Hero download split dropdown)
  function initDropdowns() {
    const dropdownTriggers = document.querySelectorAll('[data-dropdown-toggle]');

    dropdownTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetId = trigger.getAttribute('data-dropdown-toggle');
        const dropdownMenu = document.getElementById(targetId);

        if (!dropdownMenu) return;

        const isCurrentlyOpen = dropdownMenu.classList.contains('show');

        // Close all dropdowns first
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
          menu.classList.remove('show');
        });
        document.querySelectorAll('[data-dropdown-toggle]').forEach(t => {
          t.setAttribute('aria-expanded', 'false');
        });

        // Toggle target
        if (!isCurrentlyOpen) {
          dropdownMenu.classList.add('show');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });

    // Close dropdowns on outside click
    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('show');
      });
      document.querySelectorAll('[data-dropdown-toggle]').forEach(t => {
        t.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Copy code blocks
  function initCopyButtons() {
    document.querySelectorAll('[data-copy-btn]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const targetSelector = btn.getAttribute('data-copy-target');
        const targetElem = document.querySelector(targetSelector);
        if (!targetElem) return;

        const textToCopy = targetElem.innerText || targetElem.textContent;

        try {
          await navigator.clipboard.writeText(textToCopy);
          const originalText = btn.innerHTML;
          btn.innerHTML = '<span>✓ Copied!</span>';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('copied');
          }, 2000);
        } catch (err) {
          console.error('Failed to copy text: ', err);
        }
      });
    });
  }

  // Smooth scrolling for anchor links
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '') return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const headerHeight = document.querySelector('.site-header')?.offsetHeight || 70;
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // Header shadow on scroll
  function initHeaderScrollShadow() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
      }
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMain);
  } else {
    initMain();
  }
})();
