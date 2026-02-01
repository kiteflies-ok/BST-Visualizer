export class TourManager {
    constructor() {
        this.steps = [
            {
                element: '.sidebar',
                text: "MISSION_CONTROL: Input numeric data here to manipulate the binary structure. Use buttons or keyboard shortcuts (I, D, S).",
                position: 'right'
            },
            {
                element: '#viz-container',
                text: "VISUAL_CORE: Observe real-time data ingestion and restructuring. The tree self-organizes according to binary logic.",
                position: 'center'
            },
            {
                element: '.log-panel',
                text: "DATA_LOGS: Track operation history, traversal paths, and system status updates in this dedicated terminal.",
                position: 'left'
            }
        ];

        this.currentStep = 0;
        this.overlay = document.getElementById('tour-overlay');
        this.modal = document.querySelector('.tour-modal');
        this.highlight = document.getElementById('tour-highlight');
        this.tooltip = document.getElementById('tour-tooltip');
        this.desc = document.getElementById('tour-desc');

        this.bindEvents();

        // Auto-start if not visited
        if (!localStorage.getItem('bst_tour_completed')) {
            this.showWelcome();
        }
    }

    bindEvents() {
        document.getElementById('btn-start-tour').onclick = () => this.startTour();
        document.getElementById('btn-skip-tour').onclick = () => this.endTour();
        document.getElementById('btn-next-tour').onclick = () => this.nextStep();
    }

    showWelcome() {
        this.overlay.classList.remove('hidden');
        this.modal.style.display = 'block';
        this.highlight.classList.remove('active');
        this.tooltip.classList.add('hidden');
    }

    startTour() {
        this.modal.style.display = 'none';
        this.currentStep = 0;
        this.showStep();
    }

    showStep() {
        const step = this.steps[this.currentStep];
        const target = document.querySelector(step.element);

        if (!target) {
            this.endTour();
            return;
        }

        const rect = target.getBoundingClientRect();

        // Position Highlight
        this.highlight.classList.add('active');
        this.highlight.style.top = `${rect.top - 5}px`;
        this.highlight.style.left = `${rect.left - 5}px`;
        this.highlight.style.width = `${rect.width + 10}px`;
        this.highlight.style.height = `${rect.height + 10}px`;

        // Position Tooltip
        this.tooltip.classList.remove('hidden');
        this.desc.textContent = step.text;

        // Simple positioning logic
        if (step.position === 'right') {
            this.tooltip.style.top = `${rect.top + 50}px`;
            this.tooltip.style.left = `${rect.right + 20}px`;
        } else if (step.position === 'left') {
            this.tooltip.style.top = `${rect.top + 50}px`;
            this.tooltip.style.left = `${rect.left - 320}px`;
        } else {
            this.tooltip.style.top = `50%`;
            this.tooltip.style.left = `50%`;
            this.tooltip.style.transform = `translate(-50%, -50%)`;
        }
    }

    nextStep() {
        this.currentStep++;
        if (this.currentStep >= this.steps.length) {
            this.endTour();
        } else {
            this.showStep();
        }
    }

    endTour() {
        this.overlay.classList.add('hidden');
        localStorage.setItem('bst_tour_completed', 'true');
    }
}
