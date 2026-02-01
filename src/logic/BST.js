/**
 * Represents a single node in the BST.
 */
class Node {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        // Visual metadata
        this.x = 0;
        this.y = 0;
        this.id = Math.random().toString(36).substr(2, 9); // Unique ID for SVG mapping
    }
}

/**
 * Binary Search Tree Class
 * designed to yield "Animation Steps" for the visualizer.
 */
export class BST {
    constructor() {
        this.root = null;
    }

    /**
     * Generator for inserting a value.
     * Yields objects like { type: 'highlight', node: Node, message: '...' }
     */
    *insert(value) {
        const newNode = new Node(value);
        if (!this.root) {
            this.root = newNode;
            yield { type: 'INSERT_ROOT', node: newNode, message: `Inserting root: ${value}` };
            return;
        }

        let current = this.root;
        while (true) {
            yield { type: 'VISIT', node: current, message: `Comparing ${value} with ${current.value}` };

            if (value === current.value) {
                yield { type: 'FOUND_DUPLICATE', node: current, message: `${value} already exists` };
                return;
            }

            if (value < current.value) {
                if (!current.left) {
                    current.left = newNode;
                    yield { type: 'INSERT_LEFT', parent: current, node: newNode, message: `${value} < ${current.value}, inserting left` };
                    return;
                }
                current = current.left;
            } else {
                if (!current.right) {
                    current.right = newNode;
                    yield { type: 'INSERT_RIGHT', parent: current, node: newNode, message: `${value} > ${current.value}, inserting right` };
                    return;
                }
                current = current.right;
            }
        }
    }

    /**
     * Generator for searching a value.
     */
    *search(value) {
        let current = this.root;
        if (!current) {
            yield { type: 'EMPTY', message: 'Tree is empty' };
            return false;
        }

        while (current) {
            yield { type: 'VISIT_SEARCH', node: current, message: `Checking ${current.value}` };
            
            if (value === current.value) {
                yield { type: 'FOUND', node: current, message: `Found ${value}!` };
                return true;
            }

            if (value < current.value) {
                yield { type: 'MOVE', message: `${value} < ${current.value}, go left` };
                current = current.left;
            } else {
                yield { type: 'MOVE', message: `${value} > ${current.value}, go right` };
                current = current.right;
            }
        }

        yield { type: 'NOT_FOUND', message: `${value} not found in tree` };
        return false;
    }

    /**
     * Traverse Generators
     */
    *inorder() { return yield* this._inorder(this.root); }
    *_inorder(node) {
        if (node) {
            yield* this._inorder(node.left);
            yield { type: 'TRAVERSE_VISIT', node: node, message: `Visiting ${node.value}` };
            yield* this._inorder(node.right);
        }
    }

    *preorder() { return yield* this._preorder(this.root); }
    *_preorder(node) {
        if (node) {
            yield { type: 'TRAVERSE_VISIT', node: node, message: `Visiting ${node.value}` };
            yield* this._preorder(node.left);
            yield* this._preorder(node.right);
        }
    }

    *postorder() { return yield* this._postorder(this.root); }
    *_postorder(node) {
        if (node) {
            yield* this._postorder(node.left);
            yield* this._postorder(node.right);
            yield { type: 'TRAVERSE_VISIT', node: node, message: `Visiting ${node.value}` };
        }
    }

    /**
     * Delete logic (Simplified for visualization, typically replacing with predecessor/successor)
     */
    *delete(value) {
         if (!this.root) {
            yield { type: 'EMPTY', message: 'Tree is empty' };
            return;
         }
         
         // We need parent pointer for deletion usually, or recursive return
         // For generator, we'll try a recursive generator approach
         yield* this._deleteRecursive(this.root, null, value);
    }

    *_deleteRecursive(node, parent, value) {
        if (!node) {
            yield { type: 'NOT_FOUND', message: `${value} not found` };
            return false;
        }

        yield { type: 'VISIT', node: node, message: `Visiting ${node.value}` };

        if (value < node.value) {
            yield* this._deleteRecursive(node.left, node, value);
        } else if (value > node.value) {
            yield* this._deleteRecursive(node.right, node, value);
        } else {
            // Node found
            yield { type: 'FOUND_DELETE', node: node, message: `Found ${value}, deleting...` };
            
            // Case 1: No children (Leaf)
            if (!node.left && !node.right) {
                if (!parent) this.root = null;
                else if (parent.left === node) parent.left = null;
                else parent.right = null;
                yield { type: 'DELETE_DONE', node: node, message: `Removed leaf node ${value}` };
            }
            // Case 2: One child
            else if (!node.left) {
                let child = node.right;
                if (!parent) this.root = child;
                else if (parent.left === node) parent.left = child;
                else parent.right = child;
                yield { type: 'DELETE_DONE', node: node, message: `Replaced ${value} with right child` };
            }
            else if (!node.right) {
                let child = node.left;
                if (!parent) this.root = child;
                else if (parent.left === node) parent.left = child;
                else parent.right = child;
                yield { type: 'DELETE_DONE', node: node, message: `Replaced ${value} with left child` };
            }
            // Case 3: Two children (Find inorder successor - smallest in right subtree)
            else {
                yield { type: 'COMPLEX_DELETE', message: `Node has two children. Finding successor...` };
                let successorParent = node;
                let successor = node.right;
                
                while (successor.left) {
                    successorParent = successor;
                    successor = successor.left;
                }
                
                yield { type: 'HIGHLIGHT_SUCCESSOR', node: successor, message: `Successor is ${successor.value}` };
                
                // Copy value
                node.value = successor.value; // Visualization might need update here to show value swap
                
                // Delete successor
                // Recursively delete the successor (which is now either leaf or has right child)
                // Simplified: manually fix links since we know where successor is
                if (successorParent === node) {
                    successorParent.right = successor.right;
                } else {
                    successorParent.left = successor.right;
                }
                
                // Since we swapped value, we visually represent this as updating node's value and removing successor
                yield { type: 'DELETE_DONE', node: successor, isSwap: true, originalNode: node, updatedValue: successor.value, message: `Replaced value and removed successor` };
            }
        }
    }
    
    // Helper to get raw structure (for initial render if needed)
    getRoot() { return this.root; }

    clear() {
        this.root = null;
    }
}
