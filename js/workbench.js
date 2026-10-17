/**
 * workbench.js - HPC Studio
 * Interactive Hero Workbench: Tab Switching, terminal toggling, and simulated agent response.
 */

(function () {
  'use strict';

  function initWorkbench() {
    const tabButtons = document.querySelectorAll('.wb-tab-btn');
    const tabPanes = document.querySelectorAll('.wb-tab-content');
    const termToggle = document.getElementById('wb-toggle-terminal');
    const termDrawer = document.getElementById('wb-terminal-drawer');

    // Tab Switching
    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTabId = btn.getAttribute('data-tab');

        tabButtons.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        tabPanes.forEach((p) => {
          p.classList.remove('active');
          p.setAttribute('hidden', 'true');
        });

        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const activePane = document.getElementById(`wb-panel-${targetTabId}`);
        if (activePane) {
          activePane.classList.add('active');
          activePane.removeAttribute('hidden');
        }

        // Trigger resize event for canvas if 3D viewer is selected
        if (targetTabId === 'crystal-3d') {
          window.dispatchEvent(new Event('resize'));
        }
      });
    });

    // Terminal Drawer Toggle
    if (termToggle && termDrawer) {
      termToggle.addEventListener('click', () => {
        const isCollapsed = termDrawer.classList.toggle('collapsed');
        termToggle.setAttribute('aria-expanded', !isCollapsed);
        const icon = termToggle.querySelector('.codicon');
        if (icon) {
          icon.textContent = isCollapsed ? '▲ Terminal' : '▼ Terminal';
        } else {
          termToggle.textContent = isCollapsed ? '▲ Terminal' : '▼ Terminal';
        }
      });
    }

    // AI Agent Interactive Chat simulation
    initAgentChat();
  }

  function initAgentChat() {
    const input = document.getElementById('wb-agent-input');
    const sendBtn = document.getElementById('wb-agent-send');
    const chatContainer = document.getElementById('wb-agent-messages');

    if (!input || !sendBtn || !chatContainer) return;

    function handleSend() {
      const text = input.value.trim();
      if (!text) return;

      // Append User message
      const userMsg = document.createElement('div');
      userMsg.className = 'agent-msg user-msg';
      userMsg.innerHTML = `
        <div class="msg-header"><span class="avatar">👤</span> <strong>Scientist</strong></div>
        <div class="msg-body">${escapeHTML(text)}</div>
      `;
      chatContainer.appendChild(userMsg);
      input.value = '';
      chatContainer.scrollTop = chatContainer.scrollHeight;

      // Simulate Agent Thinking & Response
      const typingMsg = document.createElement('div');
      typingMsg.className = 'agent-msg ai-msg typing';
      typingMsg.innerHTML = `
        <div class="msg-header"><span class="avatar">⚡</span> <strong>HPC Studio Agent</strong></div>
        <div class="msg-body"><span class="pulse-dot"></span> Analyzing cluster state and QE namelists...</div>
      `;
      chatContainer.appendChild(typingMsg);
      chatContainer.scrollTop = chatContainer.scrollHeight;

      setTimeout(() => {
        typingMsg.remove();
        const replyMsg = document.createElement('div');
        replyMsg.className = 'agent-msg ai-msg';

        let replyHtml = '';
        const lower = text.toLowerCase();
        if (lower.includes('converge') || lower.includes('scf') || lower.includes('silicon')) {
          replyHtml = `
            <div class="msg-header"><span class="avatar">⚡</span> <strong>HPC Studio Agent</strong> <span class="tag-badge">QE Tool Invoked</span></div>
            <div class="msg-body">
              <p>I inspected <code>pw.scf.silicon.in</code>:</p>
              <ul>
                <li><strong>ecutwfc:</strong> 30.0 Ry is optimal for standard ultrasoft silicon pseudopotentials.</li>
                <li><strong>conv_thr:</strong> 1.0d-8 provides high numerical accuracy.</li>
                <li><strong>k-mesh:</strong> 4x4x4 Monkhorst-Pack is balanced for bulk Si.</li>
              </ul>
              <div class="code-pill">Status: ✅ Estimated walltime 42s across 16 MPI ranks on 1 node.</div>
            </div>
          `;
        } else if (lower.includes('slurm') || lower.includes('queue') || lower.includes('sbatch')) {
          replyHtml = `
            <div class="msg-header"><span class="avatar">⚡</span> <strong>HPC Studio Agent</strong> <span class="tag-badge">Slurm MCP</span></div>
            <div class="msg-body">
              <p>Querying cluster partition <code>standard</code>:</p>
              <pre class="inline-code">JOBID   PARTITION    NODES   CPUS   STATE     TIME_LEFT
49201   standard     2       64     RUNNING   01:14:20</pre>
              <p>Node <code>node01</code> is available with 32 free cores and 128GB RAM.</p>
            </div>
          `;
        } else {
          replyHtml = `
            <div class="msg-header"><span class="avatar">⚡</span> <strong>HPC Studio Agent</strong></div>
            <div class="msg-body">
              <p>I am ready to assist your ab-initio simulations! I can:</p>
              <ul>
                <li>Validate Quantum ESPRESSO namelists (<code>&amp;CONTROL</code>, <code>&amp;SYSTEM</code>, <code>&amp;ELECTRONS</code>).</li>
                <li>Submit jobs via Slurm <code>sbatch</code> and stream <code>pw.x</code> logfiles live.</li>
                <li>Parse atomic positions from <code>.pwo</code> output files directly into the 3D visualizer.</li>
              </ul>
            </div>
          `;
        }

        replyMsg.innerHTML = replyHtml;
        chatContainer.appendChild(replyMsg);
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }, 850);
    }

    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      }
    });
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWorkbench);
  } else {
    initWorkbench();
  }
})();
