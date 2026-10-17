/**
 * visualizer-preview.js - HPC Studio
 * Canvas 3D interactive viewer for Silicon FCC Diamond unit cell lattice.
 * Supports mouse drag rotation, zoom, auto-rotation, and bond rendering.
 */

(function () {
  'use strict';

  function initSiliconViewer() {
    const canvas = document.getElementById('crystal-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width || 600;
      height = rect.height || 420;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    }

    resize();
    window.addEventListener('resize', resize);

    // Silicon Diamond Lattice Coordinates (Conventional Unit Cell: 8 Si atoms)
    // FCC lattice: (0,0,0), (0,0.5,0.5), (0.5,0,0.5), (0.5,0.5,0)
    // + basis shifted by (0.25, 0.25, 0.25)
    const rawAtoms = [
      // Corner & Face centers (FCC)
      { x: 0.0, y: 0.0, z: 0.0 },
      { x: 1.0, y: 0.0, z: 0.0 },
      { x: 0.0, y: 1.0, z: 0.0 },
      { x: 1.0, y: 1.0, z: 0.0 },
      { x: 0.0, y: 0.0, z: 1.0 },
      { x: 1.0, y: 0.0, z: 1.0 },
      { x: 0.0, y: 1.0, z: 1.0 },
      { x: 1.0, y: 1.0, z: 1.0 },

      // Face centers
      { x: 0.5, y: 0.5, z: 0.0 },
      { x: 0.5, y: 0.5, z: 1.0 },
      { x: 0.5, y: 0.0, z: 0.5 },
      { x: 0.5, y: 1.0, z: 0.5 },
      { x: 0.0, y: 0.5, z: 0.5 },
      { x: 1.0, y: 0.5, z: 0.5 },

      // Interior basis atoms (shifted by 1/4)
      { x: 0.25, y: 0.25, z: 0.25 },
      { x: 0.75, y: 0.75, z: 0.25 },
      { x: 0.75, y: 0.25, z: 0.75 },
      { x: 0.25, y: 0.75, z: 0.75 }
    ];

    // Center coordinates around (0,0,0) with scale
    const atoms = rawAtoms.map(a => ({
      x: (a.x - 0.5) * 220,
      y: (a.y - 0.5) * 220,
      z: (a.z - 0.5) * 220,
      color: '#4fc1ff',
      radius: 12
    }));

    // Find bonds: Si-Si distance in diamond is sqrt(3)/4 * a ≈ 0.433 * a
    // In scaled units (220): 0.433 * 220 ≈ 95.3. Let's set cutoff at 105.
    const bonds = [];
    const BOND_CUTOFF = 105;
    for (let i = 0; i < atoms.length; i++) {
      for (let j = i + 1; j < atoms.length; j++) {
        const dx = atoms[i].x - atoms[j].x;
        const dy = atoms[i].y - atoms[j].y;
        const dz = atoms[i].z - atoms[j].z;
        const dist = Math.hypot(dx, dy, dz);
        if (dist > 10 && dist <= BOND_CUTOFF) {
          bonds.push([i, j]);
        }
      }
    }

    // Unit cell bounding wireframe box
    const boxVertices = [
      { x: -110, y: -110, z: -110 },
      { x: 110, y: -110, z: -110 },
      { x: 110, y: 110, z: -110 },
      { x: -110, y: 110, z: -110 },
      { x: -110, y: -110, z: 110 },
      { x: 110, y: -110, z: 110 },
      { x: 110, y: 110, z: 110 },
      { x: -110, y: 110, z: 110 }
    ];

    const boxEdges = [
      [0,1], [1,2], [2,3], [3,0],
      [4,5], [5,6], [6,7], [7,4],
      [0,4], [1,5], [2,6], [3,7]
    ];

    let rotX = 0.38;
    let rotY = 0.72;
    let zoom = 1.0;
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let autoRotate = true;

    // Interaction handlers
    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      autoRotate = false;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      rotY += dx * 0.008;
      rotX += dy * 0.008;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    });

    // Touch support for mobile
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        autoRotate = false;
        lastMouseX = e.touches[0].clientX;
        lastMouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - lastMouseX;
      const dy = e.touches[0].clientY - lastMouseY;
      rotY += dx * 0.01;
      rotX += dy * 0.01;
      lastMouseX = e.touches[0].clientX;
      lastMouseY = e.touches[0].clientY;
    }, { passive: true });

    // Wheel zoom
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      zoom *= e.deltaY > 0 ? 0.95 : 1.05;
      zoom = Math.max(0.5, Math.min(zoom, 2.5));
    }, { passive: false });

    // Control buttons if present
    const resetBtn = document.getElementById('crystal-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        rotX = 0.38;
        rotY = 0.72;
        zoom = 1.0;
        autoRotate = true;
      });
    }

    const toggleRotateBtn = document.getElementById('crystal-rotate-toggle');
    if (toggleRotateBtn) {
      toggleRotateBtn.addEventListener('click', () => {
        autoRotate = !autoRotate;
        toggleRotateBtn.textContent = autoRotate ? '⏸ Pause' : '▶ Rotate';
      });
    }

    // 3D Projection Helper
    function project(p) {
      // Rotate around X
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y1 = p.y * cosX - p.z * sinX;
      const z1 = p.y * sinX + p.z * cosX;

      // Rotate around Y
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x2 = p.x * cosY + z1 * sinY;
      const z2 = -p.x * sinY + z1 * cosY;

      // Perspective projection
      const cameraDistance = 500;
      const fov = cameraDistance / (cameraDistance + z2);

      return {
        x: width / 2 + x2 * fov * zoom,
        y: height / 2 + y1 * fov * zoom,
        z: z2,
        scale: fov * zoom
      };
    }

    // Render loop
    function render() {
      if (autoRotate && !isDragging) {
        rotY += 0.007;
      }

      ctx.clearRect(0, 0, width, height);

      // Draw subtle background grid or vignette
      const grad = ctx.createRadialGradient(width/2, height/2, 20, width/2, height/2, width/1.4);
      grad.addColorStop(0, 'rgba(15, 23, 42, 0.4)');
      grad.addColorStop(1, 'rgba(2, 6, 23, 0.9)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Project box vertices and draw bounding wireframe
      const projBox = boxVertices.map(project);
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      boxEdges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(projBox[i].x, projBox[i].y);
        ctx.lineTo(projBox[j].x, projBox[j].y);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Project atoms
      const projAtoms = atoms.map((atom, idx) => {
        const proj = project(atom);
        return { ...proj, radius: atom.radius, color: atom.color, id: idx };
      });

      // Project bonds and calculate average Z for depth sorting
      const renderItems = [];

      bonds.forEach(([i, j]) => {
        const p1 = projAtoms[i];
        const p2 = projAtoms[j];
        renderItems.push({
          type: 'bond',
          z: (p1.z + p2.z) / 2,
          p1,
          p2
        });
      });

      projAtoms.forEach(atom => {
        renderItems.push({
          type: 'atom',
          z: atom.z,
          atom
        });
      });

      // Painter's algorithm: sort from back to front
      renderItems.sort((a, b) => b.z - a.z);

      renderItems.forEach(item => {
        if (item.type === 'bond') {
          ctx.beginPath();
          ctx.moveTo(item.p1.x, item.p1.y);
          ctx.lineTo(item.p2.x, item.p2.y);
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.55)';
          ctx.lineWidth = 4 * ((item.p1.scale + item.p2.scale) / 2);
          ctx.stroke();
        } else if (item.type === 'atom') {
          const a = item.atom;
          const r = Math.max(4, a.radius * a.scale);

          // Sphere with 3D gradient lighting
          const sphereGrad = ctx.createRadialGradient(
            a.x - r * 0.35, a.y - r * 0.35, r * 0.1,
            a.x, a.y, r
          );
          sphereGrad.addColorStop(0, '#93c5fd');
          sphereGrad.addColorStop(0.3, '#3b82f6');
          sphereGrad.addColorStop(0.85, '#1d4ed8');
          sphereGrad.addColorStop(1, '#0f172a');

          ctx.beginPath();
          ctx.arc(a.x, a.y, r, 0, Math.PI * 2);
          ctx.fillStyle = sphereGrad;
          ctx.fill();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSiliconViewer);
  } else {
    initSiliconViewer();
  }
})();
