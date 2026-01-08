/**
 * ChargedUP: Behind The Scenes of an RC Car
 * Main JavaScript Module
 * December 20th
 */

// Global namespace
window.ChargedUP = window.ChargedUP || {};

/* ============================================
   App State Management
   ============================================ */
const AppState = {
    STORAGE_PREFIX: 'chargedup_',

    defaults: {
        theme: 'dark',
        textSize: 'default',
        mode: 'chemistry'
    },

    init() {
        this.loadFromStorage();
        this.applyTheme();
        this.applyTextSize();
        this.syncWithURL();
    },

    loadFromStorage() {
        const theme = localStorage.getItem(this.STORAGE_PREFIX + 'theme');
        const textSize = localStorage.getItem(this.STORAGE_PREFIX + 'textSize');
        const mode = localStorage.getItem(this.STORAGE_PREFIX + 'mode');

        if (theme) document.documentElement.dataset.theme = theme;
        if (textSize) document.documentElement.dataset.textSize = textSize;
        if (mode) this.defaults.mode = mode;
    },

    save(key, value) {
        localStorage.setItem(this.STORAGE_PREFIX + key, value);
        if (key === 'theme') this.applyTheme();
        if (key === 'textSize') this.applyTextSize();
    },

    load(key) {
        return localStorage.getItem(this.STORAGE_PREFIX + key) || this.defaults[key];
    },

    applyTheme() {
        const theme = this.load('theme');
        document.documentElement.dataset.theme = theme;
    },

    applyTextSize() {
        const textSize = this.load('textSize');
        document.documentElement.dataset.textSize = textSize;
    },

    syncWithURL() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('theme')) {
            document.documentElement.dataset.theme = params.get('theme');
        }
        if (params.get('mode')) {
            this.defaults.mode = params.get('mode');
        }
    }
};

/* ============================================
   Settings Panel (Floating Action Button)
   ============================================ */
const SettingsPanel = {
    isOpen: false,

    init() {
        this.createElements();
        this.bindEvents();
        this.updateActiveButtons();
    },

    createElements() {
        // Create FAB button
        const fab = document.createElement('button');
        fab.className = 'settings-fab';
        fab.setAttribute('aria-label', 'Settings');
        fab.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    `;

        // Create settings panel
        const panel = document.createElement('div');
        panel.className = 'settings-panel';
        panel.innerHTML = `
      <div class="settings-panel__title">⚙️ Settings</div>
      
      <div class="settings-panel__group">
        <span class="settings-panel__label">Theme</span>
        <div class="settings-panel__options">
          <button class="settings-panel__btn" data-theme="dark">🌙 Dark</button>
          <button class="settings-panel__btn" data-theme="light">☀️ Light</button>
        </div>
      </div>
      
      <div class="settings-panel__group">
        <span class="settings-panel__label">Text Size</span>
        <div class="settings-panel__options">
          <button class="settings-panel__btn" data-textsize="small">Small</button>
          <button class="settings-panel__btn" data-textsize="default">Default</button>
          <button class="settings-panel__btn" data-textsize="large">Large</button>
        </div>
      </div>
    `;

        document.body.appendChild(fab);
        document.body.appendChild(panel);

        this.fab = fab;
        this.panel = panel;
    },

    bindEvents() {
        this.fab.addEventListener('click', () => this.toggle());

        // Theme buttons
        this.panel.querySelectorAll('[data-theme]').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                AppState.save('theme', theme);
                this.updateActiveButtons();
            });
        });

        // Text size buttons
        this.panel.querySelectorAll('[data-textsize]').forEach(btn => {
            btn.addEventListener('click', () => {
                const size = btn.dataset.textsize;
                AppState.save('textSize', size);
                this.updateActiveButtons();
            });
        });

        // Close on click outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.panel.contains(e.target) && !this.fab.contains(e.target)) {
                this.close();
            }
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    },

    toggle() {
        this.isOpen ? this.close() : this.open();
    },

    open() {
        this.isOpen = true;
        this.fab.classList.add('active');
        this.panel.classList.add('active');
    },

    close() {
        this.isOpen = false;
        this.fab.classList.remove('active');
        this.panel.classList.remove('active');
    },

    updateActiveButtons() {
        const currentTheme = AppState.load('theme');
        const currentTextSize = AppState.load('textSize');

        this.panel.querySelectorAll('[data-theme]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === currentTheme);
        });

        this.panel.querySelectorAll('[data-textsize]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.textsize === currentTextSize);
        });
    }
};

/* ============================================
   Navigation
   ============================================ */
const Navigation = {
    init() {
        const toggle = document.querySelector('.nav-toggle');
        const navList = document.querySelector('.nav__list');

        if (toggle && navList) {
            toggle.addEventListener('click', () => {
                toggle.classList.toggle('active');
                navList.classList.toggle('active');
                const expanded = toggle.getAttribute('aria-expanded') === 'true';
                toggle.setAttribute('aria-expanded', !expanded);
            });
        }

        this.highlightCurrentPage();
    },

    highlightCurrentPage() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav__link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath) {
                link.classList.add('nav__link--active');
            }
        });
    }
};

/* ============================================
   Mode Toggle (Chemistry/Physics)
   ============================================ */
const ModeToggle = {
    init() {
        const buttons = document.querySelectorAll('.mode-toggle__btn');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                this.setMode(mode);
            });
        });

        // Apply saved mode
        const savedMode = AppState.load('mode');
        this.setMode(savedMode, false);
    },

    setMode(mode, save = true) {
        document.querySelectorAll('.mode-toggle__btn').forEach(btn => {
            const isActive = btn.dataset.mode === mode;
            btn.classList.toggle('mode-toggle__btn--active', isActive);
            btn.setAttribute('aria-pressed', isActive);
        });

        if (save) {
            AppState.save('mode', mode);
        }
    }
};

/* ============================================
   Tooltips
   ============================================ */
const Tooltips = {
    init() {
        document.querySelectorAll('[data-tooltip]').forEach(el => {
            el.addEventListener('mouseenter', (e) => this.show(e.target));
            el.addEventListener('mouseleave', () => this.hide());
            el.addEventListener('focus', (e) => this.show(e.target));
            el.addEventListener('blur', () => this.hide());
        });
    },

    show(target) {
        const text = target.dataset.tooltip;
        if (!text) return;

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        tooltip.id = 'active-tooltip';

        document.body.appendChild(tooltip);

        const rect = target.getBoundingClientRect();
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
        tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
    },

    hide() {
        const tooltip = document.getElementById('active-tooltip');
        if (tooltip) tooltip.remove();
    }
};

/* ============================================
   Show Work Panels (Expandable)
   ============================================ */
const ShowWorkPanels = {
    init() {
        document.querySelectorAll('.show-work__header').forEach(header => {
            header.addEventListener('click', () => {
                const panel = header.closest('.show-work');
                panel.classList.toggle('active');

                const toggle = header.querySelector('.show-work__toggle');
                if (toggle) {
                    toggle.textContent = panel.classList.contains('active')
                        ? 'Hide Work ▲'
                        : 'Show Work ▼';
                }

                header.setAttribute('aria-expanded', panel.classList.contains('active'));
            });
        });
    }
};

/* ============================================
   Tabs
   ============================================ */
const Tabs = {
    init() {
        document.querySelectorAll('.tabs').forEach(tabContainer => {
            const buttons = tabContainer.querySelectorAll('.tab-btn');
            const panels = tabContainer.querySelectorAll('.tab-panel');

            buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const target = btn.dataset.tab;

                    buttons.forEach(b => b.classList.remove('tab-btn--active'));
                    panels.forEach(p => p.classList.remove('tab-panel--active'));

                    btn.classList.add('tab-btn--active');
                    const targetPanel = tabContainer.querySelector(`#${target}`);
                    if (targetPanel) targetPanel.classList.add('tab-panel--active');
                });
            });
        });
    }
};

/* ============================================
   Deep Linking Utilities
   ============================================ */
const DeepLinking = {
    getParams() {
        return new URLSearchParams(window.location.search);
    },

    setParams(params) {
        const url = new URL(window.location);
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                url.searchParams.set(key, value);
            }
        });
        window.history.replaceState({}, '', url);
    },

    generateShareURL(params) {
        const url = new URL(window.location.origin + window.location.pathname);
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                url.searchParams.set(key, value);
            }
        });
        return url.toString();
    },

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showCopyFeedback();
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    },

    showCopyFeedback() {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = '✓ Link copied to clipboard!';
        toast.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 24px;
      background: var(--color-accent-cyan);
      color: var(--color-bg-primary);
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 500;
      z-index: 1002;
      animation: fadeIn 0.3s ease;
    `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }
};

/* ============================================
   Export Utilities
   ============================================ */
const ExportUtils = {
    exportJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },

    print() {
        window.print();
    },

    async generatePDF(elementId, filename) {
        // Uses jsPDF if available
        if (typeof jspdf === 'undefined') {
            console.warn('jsPDF not loaded, falling back to print');
            this.print();
            return;
        }

        const { jsPDF } = jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');

        // Add title
        doc.setFontSize(24);
        doc.setTextColor(0, 209, 255);
        doc.text('ChargedUP: RC Car Battery & Motor', 20, 25);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Generated on December 20th', 20, 35);

        // Add content based on current page
        const element = document.getElementById(elementId);
        if (element) {
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            // Basic text extraction (for more complex, use html2canvas)
            const text = element.innerText.substring(0, 3000);
            const lines = doc.splitTextToSize(text, 170);
            doc.text(lines, 20, 50);
        }

        doc.save(filename || 'chargedup-export.pdf');
    }
};

/* ============================================
   Utility Functions
   ============================================ */
const Utils = {
    formatNumber(num, decimals = 4) {
        if (typeof num !== 'number' || isNaN(num)) return '—';
        if (Math.abs(num) < 0.0001 || Math.abs(num) > 999999) {
            return num.toExponential(decimals);
        }
        return num.toFixed(decimals);
    },

    formatSigFigs(num, sigFigs = 3) {
        if (typeof num !== 'number' || isNaN(num)) return '—';
        return Number(num.toPrecision(sigFigs)).toString();
    },

    formatUnit(value, unit, decimals = 4) {
        return `${this.formatNumber(value, decimals)} ${unit}`;
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    animateValue(element, start, end, duration, formatter = (v) => v.toFixed(2)) {
        const startTime = performance.now();

        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
            const current = start + (end - start) * eased;

            element.textContent = formatter(current);

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };

        requestAnimationFrame(update);
    }
};

/* ============================================
   Hero Animation (RC Car themed)
   ============================================ */
const HeroAnimation = {
    canvas: null,
    ctx: null,
    particles: [],
    running: false,

    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.resize();
        this.createParticles();
        this.running = true;
        this.animate();

        window.addEventListener('resize', () => this.resize());
    },

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    },

    createParticles() {
        this.particles = [];
        const count = Math.floor((this.canvas.width * this.canvas.height) / 15000);

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                color: Math.random() > 0.5 ? '#00D1FF' : '#3EF1C6'
            });
        }
    },

    animate() {
        if (!this.running) return;

        this.ctx.fillStyle = 'rgba(7, 23, 51, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.fill();
        });

        // Draw connections for nearby particles (circuit-like effect)
        this.ctx.strokeStyle = 'rgba(0, 209, 255, 0.15)';
        this.ctx.lineWidth = 1;

        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 100) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }

        requestAnimationFrame(() => this.animate());
    },

    stop() {
        this.running = false;
    }
};

/* ============================================
   Glossary Search
   ============================================ */
const GlossarySearch = {
    init() {
        const searchInput = document.getElementById('glossary-search');
        const filterTabs = document.querySelectorAll('.glossary-filter__tab');

        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(() => {
                this.filter(searchInput.value.toLowerCase());
            }, 200));
        }

        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                filterTabs.forEach(t => t.classList.remove('glossary-filter__tab--active'));
                tab.classList.add('glossary-filter__tab--active');
                this.filterByCategory(tab.dataset.category);
            });
        });
    },

    filter(query) {
        document.querySelectorAll('.glossary-item').forEach(item => {
            const term = item.querySelector('.glossary-term').textContent.toLowerCase();
            const def = item.querySelector('.glossary-definition').textContent.toLowerCase();
            const matches = term.includes(query) || def.includes(query);
            item.style.display = matches ? '' : 'none';
        });
    },

    filterByCategory(category) {
        document.querySelectorAll('.glossary-item').forEach(item => {
            if (category === 'all') {
                item.style.display = '';
            } else {
                const itemCategory = item.dataset.category;
                item.style.display = itemCategory === category ? '' : 'none';
            }
        });
    }
};

/* ============================================
   Initialize on DOM Ready
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    AppState.init();
    SettingsPanel.init();
    Navigation.init();
    ModeToggle.init();
    Tooltips.init();
    ShowWorkPanels.init();
    Tabs.init();
    GlossarySearch.init();

    // Initialize hero animation if canvas exists
    const heroCanvas = document.getElementById('hero-canvas');
    if (heroCanvas) {
        HeroAnimation.init('hero-canvas');
    }
});

// Expose to global namespace
window.ChargedUP = {
    AppState,
    SettingsPanel,
    Navigation,
    ModeToggle,
    DeepLinking,
    ExportUtils,
    Utils,
    HeroAnimation,
    GlossarySearch
};
