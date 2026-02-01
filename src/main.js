import { BST } from './logic/BST.js';
import { TreeVisualizer } from './visualizer/TreeVisualizer.js';
import { AudioManager } from './audio/AudioManager.js';
import { TourManager } from './ui/Tour.js';
import { SpaceBackground } from './ui/SpaceBackground.js';

class App {
    constructor() {
        this.bst = new BST();
        this.visualizer = new TreeVisualizer(document.getElementById('tree-svg'));
        this.audio = new AudioManager();
        this.tour = new TourManager();
        this.background = new SpaceBackground();

        this.speed = 400; // Default speed
        this.isRunning = false;

        this.bindEvents();
        this.initRandomTree();
    }

    bindEvents() {
        // Buttons
        document.getElementById('btn-insert').onclick = () => this.handleInsert();
        document.getElementById('btn-delete').onclick = () => this.handleDelete();
        document.getElementById('btn-search').onclick = () => this.handleSearch();
        document.getElementById('btn-random').onclick = () => this.handleRandom();
        document.getElementById('btn-clear').onclick = () => this.handleClear();

        document.getElementById('btn-inorder').onclick = () => this.runGenerator(this.bst.inorder(), 'Inorder Traversal', [], 'Inorder: ');
        document.getElementById('btn-preorder').onclick = () => this.runGenerator(this.bst.preorder(), 'Preorder Traversal', [], 'Preorder: ');
        document.getElementById('btn-postorder').onclick = () => this.runGenerator(this.bst.postorder(), 'Postorder Traversal', [], 'Postorder: ');

        // Settings
        document.getElementById('speed-range').oninput = (e) => {
            const val = parseInt(e.target.value);
            this.speed = 1000 - (val * 9.5);
        };

        const settingsAudioBtn = document.getElementById('btn-audio-toggle');
        if (settingsAudioBtn) {
            settingsAudioBtn.onclick = (e) => {
                const enabled = this.audio.toggle();
                e.target.textContent = enabled ? '🔊' : '🔇';
                this.log(enabled ? 'Audio enabled' : 'Audio muted');
            };
        }

        // Keyboard Shortcuts
        document.addEventListener('keydown', (e) => {
            // Ignore if focus is in input
            if (e.target.tagName === 'INPUT') {
                if (e.key === 'Enter') this.handleInsert();
                return;
            }

            if (this.isRunning) return;

            switch (e.key.toLowerCase()) {
                case 'i':
                    document.getElementById('node-value').focus();
                    break;
                case 's':
                    this.handleSearch();
                    break;
                case 'd':
                case 'delete':
                    this.handleDelete();
                    break;
                case 'r':
                    this.handleRandom();
                    break;
                case 'c':
                    this.handleClear();
                    break;
            }
        });
    }

    async initRandomTree() {
        this.log('Initializing random tree...', 'system');
        for (let i = 0; i < 5; i++) {
            const val = Math.floor(Math.random() * 100);
            await this.quickInsert(val);
        }
        this.updateStatus('Ready');
    }

    async quickInsert(val) {
        const gen = this.bst.insert(val);
        let res = gen.next();
        while (!res.done) res = gen.next();
        this.visualizer.updateTree(this.bst.getRoot());
    }

    // --- Action Handlers ---

    handleInsert() {
        const input = document.getElementById('node-value');
        const val = parseInt(input.value);
        if (isNaN(val)) {
            this.toast('Please enter a number', 'error');
            return;
        }

        input.value = '';
        input.focus();
        this.runGenerator(this.bst.insert(val), `Inserting ${val}`);
    }

    handleDelete() {
        const input = document.getElementById('node-value');
        const val = parseInt(input.value);
        if (isNaN(val)) return;

        input.value = '';
        this.runGenerator(this.bst.delete(val), `Deleting ${val}`);
    }

    handleSearch() {
        const input = document.getElementById('node-value');
        const val = parseInt(input.value);
        if (isNaN(val)) {
            // If input empty, maybe prompt? Or ignore.
            return;
        }
        this.runGenerator(this.bst.search(val), `Searching for ${val}`);
    }

    handleRandom() {
        const val = Math.floor(Math.random() * 100);
        this.runGenerator(this.bst.insert(val), `Inserting Random ${val}`);
    }

    handleClear() {
        this.bst.clear();
        this.visualizer.updateTree(null);
        this.log('Tree cleared', 'system');
        this.updateStatus('Tree Empty');
    }

    // --- UI Updates ---

    updateStatus(text) {
        const el = document.getElementById('system-status');
        if (el) el.textContent = text;
    }

    log(message, type = 'info', id = null) {
        const trace = document.getElementById('code-trace');
        if (!trace) return null;

        if (id) {
            // Check if exists
            const existing = document.getElementById(id);
            if (existing) {
                existing.querySelector('.msg').textContent = message;
                return existing;
            }
        }

        const entry = document.createElement('div');
        entry.className = `log-entry ${type === 'error' ? 'error' : 'new'}`;
        if (id) entry.id = id;

        const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric", second: "numeric" });
        entry.innerHTML = `<span class="time">${time}</span><span class="msg">${message}</span>`;

        trace.prepend(entry);

        // Prune
        if (trace.children.length > 20) trace.lastChild.remove();
        return entry;
    }

    toast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        if (type === 'error') toast.style.borderColor = 'var(--danger)';

        container.appendChild(toast);

        // Remove after 3s
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    setButtonsDisabled(disabled) {
        document.querySelectorAll('.btn').forEach(btn => {
            if (disabled) btn.classList.add('disabled'); // Use class for smoother styling control if attr fails
            else btn.classList.remove('disabled');

            // Or disabled attr
            btn.disabled = disabled;
        });
    }

    // --- Core Runner ---

    async runGenerator(generator, initialMessage, accumulator = null, accumPrefix = '') {
        if (this.isRunning) return;
        this.isRunning = true;
        this.setButtonsDisabled(true);
        this.updateStatus('Running...');

        this.visualizer.clearHighlights();

        let logId = null;
        if (accumulator && accumPrefix) {
            // Create a sticky log entry for traversal
            logId = `log-${Date.now()}`;
            this.log(`${accumPrefix} ...`, 'info', logId);
        } else if (initialMessage) {
            this.log(initialMessage);
        }

        try {
            for (let step of generator) {
                // Visualization logic
                if (step.type === 'TRAVERSE_VISIT') {
                    this.visualizer.highlightNode(step.node, 'TRAVERSE_ACTIVE');
                    this.visualizer.markVisited(step.node);
                } else if (step.node) {
                    this.visualizer.highlightNode(step.node, step.type);
                }

                if (step.type.includes('INSERT') || step.type.includes('DELETE')) {
                    this.visualizer.updateTree(this.bst.getRoot());
                    if (step.node) this.visualizer.highlightNode(step.node, step.type);
                }

                // Logging specific events to side panel
                if (step.type.includes('INSERT_ROOT') || step.type === 'INSERT_LEFT' || step.type === 'INSERT_RIGHT') {
                    this.log(`Inserted node ${step.node.value}`);
                }
                else if (step.type === 'FOUND') {
                    this.log(`Found value ${step.node.value}!`, 'success');
                    this.toast(`Found ${step.node.value}!`);
                }
                else if (step.type === 'NOT_FOUND') {
                    this.log(step.message, 'error');
                    this.toast(step.message, 'error');
                }
                else if (step.type === 'DELETE_DONE') {
                    this.log(`Deleted node ${step.node.value}`);
                }
                else if (step.type === 'TRAVERSE_VISIT' && accumulator) {
                    accumulator.push(step.node.value);
                    this.log(`${accumPrefix}${accumulator.join(' → ')}`, 'info', logId);
                }

                // Audio
                if (step.type.includes('VISIT')) this.audio.play('VISIT');
                else if (step.type.includes('INSERT') || step.type.includes('DELETE')) this.audio.play('INSERT');
                else if (step.type.includes('FOUND')) this.audio.play('FOUND');
                else if (step.type.includes('NOT_FOUND') || step.type.includes('DUPLICATE')) this.audio.play('ERROR');

                // Wait
                await new Promise(r => setTimeout(r, this.speed));
            }
        } catch (e) {
            console.error(e);
            this.log('Error: ' + e.message, 'error');
        }

        await new Promise(r => setTimeout(r, 1000));
        this.visualizer.clearHighlights();
        this.isRunning = false;
        this.setButtonsDisabled(false);
        this.updateStatus('Ready');
    }
}

// Start
window.addEventListener('DOMContentLoaded', () => {
    new App();
});
