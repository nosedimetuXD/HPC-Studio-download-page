/**
 * docs.js - HPC Studio Documentation Interactive Portal
 * Implements: Topic Filtering, Collapsible Accordion Navigation,
 * ScrollSpy active link indicators, Code block copy buttons,
 * FAQ toggles, and Mobile Drawer controls.
 */

(function () {
  'use strict';

  function initDocs() {
    initNavAccordion();
    initTopicFilter();
    initCodeCopyButtons();
    initScrollSpy();
    initFaqAccordion();
    initMobileSidebar();
    initBackToTop();
    initKeyboardShortcuts();
  }

  // 1. Sidebar Nav Accordion (Expand / Collapse groups)
  function initNavAccordion() {
    const headers = document.querySelectorAll('.docs-nav-group-header');
    headers.forEach(header => {
      header.addEventListener('click', (e) => {
        const group = header.closest('.docs-nav-group');
        if (group) {
          group.classList.toggle('collapsed');
          const isCollapsed = group.classList.contains('collapsed');
          header.setAttribute('aria-expanded', !isCollapsed);
        }
      });
    });
  }

  // 2. Interactive Topic Search / Filter in Sidebar
  function initTopicFilter() {
    const filterInput = document.getElementById('docs-filter-input');
    const navGroups = document.querySelectorAll('.docs-nav-group');

    if (!filterInput) return;

    filterInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();

      navGroups.forEach(group => {
        const links = group.querySelectorAll('.docs-topic-link');
        let hasMatch = false;

        links.forEach(link => {
          const text = link.textContent.toLowerCase();
          if (query === '' || text.includes(query)) {
            link.style.display = 'flex';
            hasMatch = true;
          } else {
            link.style.display = 'none';
          }
        });

        if (query !== '') {
          if (hasMatch) {
            group.classList.remove('collapsed');
            group.style.display = 'flex';
          } else {
            group.style.display = 'none';
          }
        } else {
          group.style.display = 'flex';
          group.classList.remove('collapsed');
        }
      });
    });
  }

  // 3. Code Snippet Copy Buttons
  function initCodeCopyButtons() {
    document.querySelectorAll('[data-copy-target]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const targetId = btn.getAttribute('data-copy-target');
        const codeElem = document.querySelector(targetId);
        if (!codeElem) return;

        const textToCopy = codeElem.innerText || codeElem.textContent;

        try {
          await navigator.clipboard.writeText(textToCopy);
          const originalHTML = btn.innerHTML;
          btn.innerHTML = `
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
              <path d="M13.5 4.5L6.5 11.5L3 8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Copied!</span>
          `;
          btn.classList.add('copied');

          setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.classList.remove('copied');
          }, 2000);
        } catch (err) {
          console.error('Copy failed: ', err);
        }
      });
    });
  }

  // 4. ScrollSpy for Sidebar Active State
  function initScrollSpy() {
    const sections = document.querySelectorAll('.docs-section[id]');
    const navLinks = document.querySelectorAll('.docs-topic-link[href^="#"]');
    const breadcrumbCurrent = document.querySelector('.docs-breadcrumbs .current');

    if (!sections.length || !navLinks.length) return;

    function onScroll() {
      const scrollY = window.pageYOffset + 120;
      let currentSectionId = '';

      sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollY >= top && scrollY < top + height) {
          currentSectionId = section.getAttribute('id');
        }
      });

      if (!currentSectionId && sections.length > 0) {
        if (window.pageYOffset < sections[0].offsetTop) {
          currentSectionId = sections[0].getAttribute('id');
        }
      }

      if (currentSectionId) {
        navLinks.forEach(link => {
          const href = link.getAttribute('href').replace('#', '');
          const isActive = href === currentSectionId;
          link.classList.toggle('active', isActive);

          if (isActive && breadcrumbCurrent) {
            const title = link.getAttribute('data-topic-title') || link.textContent.trim();
            breadcrumbCurrent.textContent = title;
          }
        });
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // Run once on load
    setTimeout(onScroll, 100);
  }

  // 5. FAQ Accordion
  function initFaqAccordion() {
    const faqButtons = document.querySelectorAll('.faq-question');
    faqButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        if (item) {
          const isOpen = item.classList.toggle('open');
          btn.setAttribute('aria-expanded', isOpen);
        }
      });
    });
  }

  // 6. Mobile Sidebar Drawer
  function initMobileSidebar() {
    const toggleBtn = document.getElementById('docs-mobile-sidebar-toggle');
    const sidebar = document.getElementById('docs-sidebar');

    if (!toggleBtn || !sidebar) return;

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = sidebar.classList.toggle('drawer-open');
      toggleBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (sidebar.classList.contains('drawer-open') && !sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
        sidebar.classList.remove('drawer-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Close sidebar on topic click on mobile
    sidebar.querySelectorAll('.docs-topic-link').forEach(link => {
      link.addEventListener('click', () => {
        sidebar.classList.remove('drawer-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 7. Back-to-Top Button
  function initBackToTop() {
    const btn = document.getElementById('docs-back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // 8. Global Keyboard Shortcut: Ctrl+K or / focuses docs filter
  function initKeyboardShortcuts() {
    const filterInput = document.getElementById('docs-filter-input');
    const navSearchInput = document.getElementById('nav-search-input');

    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (filterInput) {
          filterInput.focus();
          filterInput.select();
        } else if (navSearchInput) {
          navSearchInput.focus();
        }
      }
    });

    if (navSearchInput && filterInput) {
      navSearchInput.addEventListener('click', () => {
        filterInput.focus();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDocs);
  } else {
    initDocs();
  }
})();
