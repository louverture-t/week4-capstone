// --- DOM Capstone: Character Detail Management ---

// DOM Elements
const characterInfo = document.getElementById('characterInfo');
const itemForm = document.getElementById('itemForm');
const bagItems = document.getElementById('bagItems');
const itemCount = document.getElementById('itemCount');

// Local Storage Keys
const CHARACTERS_KEY = 'dragonRuneCharacters';

// Character Detail Manager
class CharacterDetailManager {
    constructor() {
        this.characterIndex = null;
        this.character = null;
        this.characters = [];
        
        this.initializeDetail();
    }

    // Initialize the detail page
    async initializeDetail() {
        try {
            // Get character index from sessionStorage
            this.characterIndex = sessionStorage.getItem('selectedCharacterIndex');
            
            if (this.characterIndex === null) {
                this.showError('No character selected. Redirecting to gallery...');
                setTimeout(() => window.location.href = 'index.html', 2000);
                return;
            }

            // Load characters
            this.loadCharacters();
            
            // Get specific character
            this.character = this.characters[parseInt(this.characterIndex)];
            
            if (!this.character) {
                this.showError('Character not found. Redirecting to gallery...');
                setTimeout(() => window.location.href = 'index.html', 2000);
                return;
            }

            // Initialize page
            this.renderCharacterInfo();
            this.renderBag();
            this.initializeEventListeners();
            
            console.log('✨ Character detail loaded:', this.character.name);
            
        } catch (error) {
            console.error('Error initializing character detail:', error);
            this.showError('Error loading character. Please try again.');
        }
    }

    // Load characters from localStorage
    loadCharacters() {
        try {
            const stored = localStorage.getItem(CHARACTERS_KEY);
            this.characters = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading characters:', error);
            this.characters = [];
        }
    }

    // Save characters to localStorage
    saveCharacters() {
        try {
            localStorage.setItem(CHARACTERS_KEY, JSON.stringify(this.characters));
        } catch (error) {
            console.error('Error saving characters:', error);
            this.showMessage('Error saving changes!', 'error');
        }
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Item form submission
        itemForm.addEventListener('submit', (e) => this.handleAddItem(e));
        
        // Form reset on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                itemForm.reset();
            }
        });
    }

    // Render character information
    renderCharacterInfo() {
        const createdDate = this.character.createdAt 
            ? new Date(this.character.createdAt).toLocaleDateString()
            : 'Unknown';

        // Handle image source
        const imageSrc = this.character.imageUrl.includes('://') 
            ? this.character.imageUrl 
            : this.character.imageUrl;

        characterInfo.innerHTML = `
            <div class="character-detail">
                <img src="${imageSrc}" alt="${this.character.name}" class="character-detail-image"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNDQ0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
                
                <div class="character-info">
                    <h2>${this.character.name}</h2>
                    <div class="character-type-detail">
                        ${this.getTypeEmoji(this.character.type)} ${this.character.type}
                    </div>
                    <div class="character-description-detail">
                        ${this.character.description}
                    </div>
                    <div class="character-meta">
                        <p><strong>📅 Created:</strong> ${createdDate}</p>
                        <p><strong>🎒 Items in bag:</strong> ${this.character.bag ? this.character.bag.length : 0}</p>
                    </div>
                </div>
            </div>
        `;

        // Update page title
        document.title = `🐲 ${this.character.name} - Character Details`;
    }

    // Get emoji for character type
    getTypeEmoji(type) {
        const emojis = {
            'Dragon': '🐲',
            'Human': '👤'
        };
        return emojis[type] || '❓';
    }

    // Handle adding new item
    handleAddItem(event) {
        event.preventDefault();

        // Get form data
        const formData = new FormData(itemForm);
        const itemData = {
            id: this.generateItemId(),
            type: formData.get('type'),
            name: formData.get('name').trim(),
            description: formData.get('description').trim() || '',
            addedAt: new Date().toISOString()
        };

        // Validate item data
        if (!this.validateItemData(itemData)) {
            return;
        }

        // Add item to character's bag
        this.addItemToBag(itemData);
    }

    // Validate item data
    validateItemData(data) {
        if (!data.type) {
            this.showMessage('Please select an item type!', 'error');
            return false;
        }

        if (!data.name || data.name.length < 2) {
            this.showMessage('Item name must be at least 2 characters!', 'error');
            return false;
        }

        // Check for duplicate item names in bag
        if (this.character.bag && this.character.bag.some(item => 
            item.name.toLowerCase() === data.name.toLowerCase())) {
            this.showMessage('An item with this name already exists in the bag!', 'error');
            return false;
        }

        return true;
    }

    // Add item to character's bag
    addItemToBag(itemData) {
        try {
            // Initialize bag if it doesn't exist
            if (!this.character.bag) {
                this.character.bag = [];
            }

            // Add item
            this.character.bag.push(itemData);
            
            // Update characters array
            this.characters[parseInt(this.characterIndex)] = this.character;
            
            // Save to localStorage
            this.saveCharacters();
            
            // Update display
            this.renderBag();
            
            // Reset form
            itemForm.reset();
            
            // Show success message
            this.showMessage(`✨ ${itemData.name} has been added to ${this.character.name}'s bag!`, 'success');
            
            console.log('Item added:', itemData);
            
        } catch (error) {
            console.error('Error adding item:', error);
            this.showMessage('Error adding item to bag!', 'error');
        }
    }

    // Render bag contents
    renderBag() {
        const bagArray = this.character.bag || [];
        const count = bagArray.length;
        
        // Update item count
        itemCount.textContent = `${count} item${count !== 1 ? 's' : ''}`;
        
        // Clear bag container
        bagItems.innerHTML = '';
        
        if (count === 0) {
            this.renderEmptyBag();
            return;
        }

        // Render items
        bagArray.forEach((item, index) => {
            const itemElement = this.createBagItem(item, index);
            bagItems.appendChild(itemElement);
        });
    }

    // Render empty bag state
    renderEmptyBag() {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-bag';
        emptyDiv.innerHTML = `
            <div class="empty-icon">🎒</div>
            <p>Bag is empty</p>
            <span>Add your first item above!</span>
        `;
        bagItems.appendChild(emptyDiv);
    }

    // Create bag item element
    createBagItem(item, index) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'bag-item';
        itemDiv.setAttribute('data-index', index);

        const addedDate = item.addedAt 
            ? new Date(item.addedAt).toLocaleDateString()
            : 'Unknown';

        itemDiv.innerHTML = `
            <div class="item-info">
                <div class="item-name">
                    ${this.getItemEmoji(item.type)} ${item.name}
                </div>
                <div class="item-meta">
                    <span class="item-type">${item.type}</span>
                    <span class="item-date">Added: ${addedDate}</span>
                </div>
                ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
            </div>
            <div class="item-actions">
                <button class="btn-small btn-remove" onclick="characterDetailManager.removeItem(${index})">
                    🗑️ Remove
                </button>
            </div>
        `;

        // Add animation class for new items
        itemDiv.classList.add('new-item');

        return itemDiv;
    }

    // Get emoji for item type
    getItemEmoji(type) {
        const emojis = {
            'Rune': '🔮',
            'Weapon': '⚔️',
            'Potion': '🧪',
            'Treasure': '💰',
            'Armor': '🛡️'
        };
        return emojis[type] || '📦';
    }

    // Remove item from bag
    removeItem(index) {
        try {
            const item = this.character.bag[index];
            
            if (confirm(`Are you sure you want to remove "${item.name}" from ${this.character.name}'s bag?`)) {
                // Remove item
                this.character.bag.splice(index, 1);
                
                // Update characters array
                this.characters[parseInt(this.characterIndex)] = this.character;
                
                // Save to localStorage
                this.saveCharacters();
                
                // Update display
                this.renderBag();
                
                // Update character info (to reflect new item count)
                this.renderCharacterInfo();
                
                this.showMessage(`${item.name} has been removed from the bag.`, 'success');
                
                console.log('Item removed:', item);
            }
        } catch (error) {
            console.error('Error removing item:', error);
            this.showMessage('Error removing item!', 'error');
        }
    }

    // Generate unique item ID
    generateItemId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    // Show message to user
    showMessage(message, type = 'success') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.success-message, .error-message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message`;
        messageDiv.textContent = message;

        // Insert after item form
        itemForm.parentNode.insertBefore(messageDiv, itemForm.nextSibling);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Show error message
    showError(message) {
        characterInfo.innerHTML = `
            <div class="error-state">
                <h2>❌ Error</h2>
                <p>${message}</p>
                <a href="index.html" class="btn-primary">← Back to Gallery</a>
            </div>
        `;
    }
}

// Bag Statistics
class BagStats {
    static calculateStats(bag) {
        if (!bag || bag.length === 0) {
            return {
                total: 0,
                byType: {},
                mostRecent: null,
                oldest: null
            };
        }

        const stats = {
            total: bag.length,
            byType: {},
            mostRecent: null,
            oldest: null
        };

        // Count by type
        bag.forEach(item => {
            stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
        });

        // Find most recent and oldest
        const sortedByDate = bag
            .filter(item => item.addedAt)
            .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

        if (sortedByDate.length > 0) {
            stats.mostRecent = sortedByDate[0];
            stats.oldest = sortedByDate[sortedByDate.length - 1];
        }

        return stats;
    }

    static displayStats(stats) {
        const statsHtml = `
            <div class="bag-stats">
                <h4>📊 Bag Statistics</h4>
                <p><strong>Total Items:</strong> ${stats.total}</p>
                ${Object.keys(stats.byType).length > 0 ? `
                    <p><strong>By Type:</strong> ${Object.entries(stats.byType)
                        .map(([type, count]) => `${type}: ${count}`)
                        .join(', ')}</p>
                ` : ''}
                ${stats.mostRecent ? `
                    <p><strong>Most Recent:</strong> ${stats.mostRecent.name}</p>
                ` : ''}
            </div>
        `;
        return statsHtml;
    }
}

// Utility functions for detail page
const detailUtils = {
    // Export bag contents as text
    exportBag: (character) => {
        const bagText = `
${character.name}'s Bag Contents
=================================
Character: ${character.name} (${character.type})
Total Items: ${character.bag ? character.bag.length : 0}

Items:
${character.bag && character.bag.length > 0 
    ? character.bag.map((item, index) => 
        `${index + 1}. ${item.name} (${item.type})${item.description ? ' - ' + item.description : ''}`
    ).join('\n')
    : 'No items in bag'
}

Generated: ${new Date().toLocaleString()}
        `.trim();

        // Create downloadable file
        const blob = new Blob([bagText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${character.name}_bag.txt`;
        a.click();
        URL.revokeObjectURL(url);
    },

    // Get random item suggestion
    getRandomItemSuggestion: () => {
        const suggestions = [
            { type: 'Rune', name: 'Rune of Power', description: 'Increases magical abilities' },
            { type: 'Weapon', name: 'Flame Sword', description: 'A sword that burns with eternal fire' },
            { type: 'Potion', name: 'Health Elixir', description: 'Restores vitality and energy' },
            { type: 'Treasure', name: 'Ancient Coin', description: 'A coin from a forgotten empire' },
            { type: 'Armor', name: 'Dragon Scale Mail', description: 'Armor made from dragon scales' },
            { type: 'Rune', name: 'Rune of Wisdom', description: 'Enhances knowledge and insight' },
            { type: 'Weapon', name: 'Ice Bow', description: 'Shoots arrows of pure ice' },
            { type: 'Potion', name: 'Mana Brew', description: 'Restores magical energy' }
        ];
        
        return suggestions[Math.floor(Math.random() * suggestions.length)];
    }
};

// Global variable for access from onclick handlers
let characterDetailManager;

// Initialize the detail page
document.addEventListener('DOMContentLoaded', () => {
    console.log('🐲 Character Detail page initializing...');
    
    characterDetailManager = new CharacterDetailManager();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + B to focus on bag form
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            document.getElementById('itemName').focus();
        }
        
        // Ctrl/Cmd + G to go back to gallery
        if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
            e.preventDefault();
            window.location.href = 'index.html';
        }
    });
    
    console.log('✨ Character Detail system ready!');
});

// Export for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CharacterDetailManager, BagStats, detailUtils };
}