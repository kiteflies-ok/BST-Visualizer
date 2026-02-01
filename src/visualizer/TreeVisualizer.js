export class TreeVisualizer {
    constructor(svgElement) {
        this.svg = svgElement;
        this.nodeRadius = 20;
        this.verticalSpacing = 60;
        this.root = null;
    }

    /**
     * Updates the local reference to the tree root and redraws.
     * @param {Node} root 
     */
    updateTree(root) {
        this.root = root;
        this.calculatePositions();
        this.render();
    }

    /**
     * Calculates X and Y coordinates for all nodes using an inorder traversal heuristic.
     * X = rank in inorder * horizontalSpacing
     * This guarantees no overlaps for a BST.
     */
    calculatePositions() {
        if (!this.root) return;

        let index = 0;
        const traverse = (node, depth) => {
            if (!node) return;
            traverse(node.left, depth + 1);

            node.x = (index + 1) * 50; // 50px spacing
            node.y = (depth + 1) * this.verticalSpacing;
            index++;

            traverse(node.right, depth + 1);
        };

        traverse(this.root, 0);

        // Center the tree in the container
        const totalWidth = (index + 2) * 50;
        const containerWidth = this.svg.clientWidth || 800; // Fallback
        const offset = (containerWidth - totalWidth) / 2;

        // Apply offset if tree is smaller than container, or just leave it
        // Actually, centering looks better.
        if (offset > 0) {
            this.applyOffset(this.root, offset);
        }

        // Update SVG size to fit tree
        this.svg.setAttribute('width', Math.max(containerWidth, totalWidth));
        this.svg.setAttribute('height', Math.max(600, this.getMaxDepth(this.root) * this.verticalSpacing + 100));
    }

    applyOffset(node, offset) {
        if (!node) return;
        node.x += offset;
        this.applyOffset(node.left, offset);
        this.applyOffset(node.right, offset);
    }

    getMaxDepth(node) {
        if (!node) return 0;
        return 1 + Math.max(this.getMaxDepth(node.left), this.getMaxDepth(node.right));
    }

    /**
     * Renders the tree based on calculated positions.
     * Uses a diffing approach (by ID) to allow CSS transitions.
     */
    render() {
        // We will simple clear and rebuild lines, but keep nodes to allow transitions if we used a data-binding lib.
        // Since we are vanilla, we'll try to reuse elements if they exist.

        // 1. Map existing elements
        const existingNodes = new Map();
        this.svg.querySelectorAll('.node-group').forEach(el => {
            existingNodes.set(el.getAttribute('data-id'), el);
        });

        // 2. Build new state
        const nodesToRender = [];
        const linesToRender = [];

        const traverse = (node, parent) => {
            if (!node) return;
            nodesToRender.push(node);
            if (parent) {
                linesToRender.push({
                    id: `${parent.id}-${node.id}`,
                    x1: parent.x, y1: parent.y,
                    x2: node.x, y2: node.y
                });
            }
            traverse(node.left, node);
            traverse(node.right, node);
        };

        traverse(this.root, null);

        // 3. Render Lines (Cleanest to just rebuild lines or use simple pool)
        // Remove old lines
        this.svg.querySelectorAll('.link-line').forEach(el => el.remove());

        // Add new lines
        linesToRender.forEach(line => {
            const lineEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            lineEl.setAttribute('x1', line.x1);
            lineEl.setAttribute('y1', line.y1);
            lineEl.setAttribute('x2', line.x2);
            lineEl.setAttribute('y2', line.y2);
            lineEl.setAttribute('class', 'link-line');
            this.svg.prepend(lineEl); // Put behind nodes
        });

        // 4. Render Nodes
        nodesToRender.forEach(node => {
            let el = existingNodes.get(node.id);
            if (!el) {
                // Create new
                el = this.createNodeElement(node);
                this.svg.appendChild(el);
            } else {
                // Update position
                el.setAttribute('transform', `translate(${node.x}, ${node.y})`);
                // Remove from map to track stale nodes
                existingNodes.delete(node.id);

                // Also update text if value changed (swap case)
                const textEl = el.querySelector('text');
                if (textEl.textContent != node.value) {
                    textEl.textContent = node.value;
                }
            }
            // Clear styles
            el.setAttribute('class', 'node-group'); // Reset classes
        });

        // 5. Remove stale nodes
        existingNodes.forEach(el => el.remove());
    }

    createNodeElement(node) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'node-group new-node');
        g.setAttribute('data-id', node.id);
        g.setAttribute('transform', `translate(${node.x}, ${node.y})`);

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', this.nodeRadius);
        circle.setAttribute('class', 'node-circle');

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('dy', 5);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('class', 'node-text');
        text.textContent = node.value;

        g.appendChild(circle);
        g.appendChild(text);
        return g;
    }

    /**
     * Highlights a specific node.
     * @param {Node} node 
     * @param {string} type 'visit', 'found', 'insert'
     */
    highlightNode(node, type) {
        if (!node) return;
        const el = this.svg.querySelector(`g[data-id="${node.id}"]`);
        if (el) {
            // Remove previous highlights BUT keep visited
            el.classList.remove('highlight-visit', 'highlight-found', 'highlight-active-cursor');

            if (type === 'VISIT') {
                el.classList.add('highlight-visit');
            } else if (type === 'FOUND' || type === 'FOUND_DELETE') {
                el.classList.add('highlight-found');
            } else if (type === 'TRAVERSE_ACTIVE') {
                el.classList.add('highlight-active-cursor');
            }
        }
    }

    markVisited(node) {
        if (!node) return;
        const el = this.svg.querySelector(`g[data-id="${node.id}"]`);
        if (el) el.classList.add('highlight-visited');
    }

    clearHighlights() {
        this.svg.querySelectorAll('.node-group').forEach(el => {
            el.classList.remove('highlight-visit', 'highlight-found', 'highlight-visited', 'highlight-active-cursor');
        });
    }
}
