/**
 * os-detect.js - HPC Studio
 * Detects client OS and architecture to adapt Download CTAs dynamically.
 */

(function () {
  'use strict';

  const RELEASE_TAG = 'v1.143.0';
  const BASE_URL = `https://github.com/nosedimetuXD/HPC-Studio/releases/download/${RELEASE_TAG}`;

  const DOWNLOAD_CONFIGS = {
    linux: {
      name: 'Linux',
      badge: 'Linux (.deb / x64)',
      filename: `hpc-studio_${RELEASE_TAG.replace('v', '')}_amd64.deb`,
      url: `${BASE_URL}/hpc-studio_${RELEASE_TAG.replace('v', '')}_amd64.deb`,
      icon: 'linux'
    },
    windows: {
      name: 'Windows',
      badge: 'Windows (x64 Installer)',
      filename: `HPC-Studio-Setup-${RELEASE_TAG.replace('v', '')}.exe`,
      url: `${BASE_URL}/HPC-Studio-Setup-${RELEASE_TAG.replace('v', '')}.exe`,
      icon: 'windows'
    },
    macArm: {
      name: 'macOS (Apple Silicon)',
      badge: 'macOS (Apple Silicon)',
      filename: `HPC-Studio-${RELEASE_TAG.replace('v', '')}-arm64.dmg`,
      url: `${BASE_URL}/HPC-Studio-${RELEASE_TAG.replace('v', '')}-arm64.dmg`,
      icon: 'apple'
    },
    macIntel: {
      name: 'macOS (Intel)',
      badge: 'macOS (Intel x64)',
      filename: `HPC-Studio-${RELEASE_TAG.replace('v', '')}-x64.dmg`,
      url: `${BASE_URL}/HPC-Studio-${RELEASE_TAG.replace('v', '')}-x64.dmg`,
      icon: 'apple'
    },
    fallback: {
      name: 'All Platforms',
      badge: 'Download for Linux (.deb)',
      filename: `hpc-studio_${RELEASE_TAG.replace('v', '')}_amd64.deb`,
      url: `${BASE_URL}/hpc-studio_${RELEASE_TAG.replace('v', '')}_amd64.deb`,
      icon: 'download'
    }
  };

  function detectOS() {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const platform = (window.navigator.userAgentData?.platform || window.navigator.platform || '').toLowerCase();

    if (platform.includes('win') || userAgent.includes('windows')) {
      return DOWNLOAD_CONFIGS.windows;
    }

    if (platform.includes('mac') || userAgent.includes('macintosh')) {
      // Check Apple Silicon
      const isArm = /arm|apple/i.test(navigator.userAgentData?.brands?.[0]?.brand || '') ||
                    (navigator.maxTouchPoints > 1 && !userAgent.includes('iphone') && !userAgent.includes('ipad'));
      return isArm ? DOWNLOAD_CONFIGS.macArm : DOWNLOAD_CONFIGS.macIntel;
    }

    if (platform.includes('linux') || userAgent.includes('linux') || userAgent.includes('x11')) {
      return DOWNLOAD_CONFIGS.linux;
    }

    return DOWNLOAD_CONFIGS.fallback;
  }

  function initOSDetect() {
    const osInfo = detectOS();
    const downloadBtns = document.querySelectorAll('[data-os-detect-target]');
    const osBadges = document.querySelectorAll('[data-os-badge]');

    downloadBtns.forEach((btn) => {
      btn.setAttribute('href', osInfo.url);
      btn.setAttribute('download', osInfo.filename);
      const textElem = btn.querySelector('.btn-main-text');
      if (textElem) {
        textElem.textContent = `Download for ${osInfo.name}`;
      }
    });

    osBadges.forEach((badge) => {
      badge.textContent = osInfo.badge;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOSDetect);
  } else {
    initOSDetect();
  }

  window.HPC_OSDetect = { detectOS, DOWNLOAD_CONFIGS };
})();
