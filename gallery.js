// --- DOM Capstone: Character Gallery Management ---

// DOM Elements
const characterForm = document.getElementById('characterForm');
const characterGallery = document.getElementById('characterGallery');
const characterCount = document.getElementById('characterCount');
const clearAllBtn = document.getElementById('clearAllBtn');

// Local Storage Keys
const CHARACTERS_KEY = 'dragonRuneCharacters';

// Character management
class CharacterManager {
    constructor() {
        this.characters = this.loadCharacters();
        this.initializeEventListeners();
        this.renderGallery();
    }

    // Load characters from localStorage
    loadCharacters() {
        try {
            const stored = localStorage.getItem(CHARACTERS_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading characters:', error);
            return [];
        }
    }

    // Save characters to localStorage
    saveCharacters() {
        try {
            localStorage.setItem(CHARACTERS_KEY, JSON.stringify(this.characters));
        } catch (error) {
            console.error('Error saving characters:', error);
            this.showMessage('Error saving characters!', 'error');
        }
    }

    // Initialize event listeners
    initializeEventListeners() {
        characterForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        clearAllBtn.addEventListener('click', () => this.clearAllCharacters());

        // Handle custom image URL
        const imageSelect = document.getElementById('imageSelect');
        const customImageUrl = document.getElementById('customImageUrl');

        imageSelect.addEventListener('change', () => {
            if (imageSelect.value) {
                customImageUrl.value = '';
                customImageUrl.disabled = true;
            } else {
                customImageUrl.disabled = false;
            }
        });

        customImageUrl.addEventListener('input', () => {
            if (customImageUrl.value.trim()) {
                imageSelect.value = '';
            }
        });
    }

    // Handle form submission
    handleFormSubmit(event) {
        event.preventDefault();

        // Get form data
        const formData = new FormData(characterForm);
        const characterData = {
            id: Date.now(), // Simple unique ID
            type: formData.get('type'),
            name: formData.get('name').trim(),
            description: formData.get('description').trim(),
            imageUrl: formData.get('customImageUrl').trim() || formData.get('imageUrl'),
            bag: [], // Initialize empty bag
            createdAt: new Date().toISOString()
        };

        // Validate data
        if (!this.validateCharacterData(characterData)) {
            return;
        }

        // Add character
        this.addCharacter(characterData);
    }

    // Validate character data
    validateCharacterData(data) {
        if (!data.type) {
            this.showMessage('Please select a character type!', 'error');
            return false;
        }

        if (!data.name || data.name.length < 2) {
            this.showMessage('Character name must be at least 2 characters!', 'error');
            return false;
        }

        if (!data.description || data.description.length < 10) {
            this.showMessage('Please provide a description (at least 10 characters)!', 'error');
            return false;
        }

        if (!data.imageUrl) {
            this.showMessage('Please select or provide a character image!', 'error');
            return false;
        }

        // Check for duplicate names
        if (this.characters.some(char => char.name.toLowerCase() === data.name.toLowerCase())) {
            this.showMessage('A character with this name already exists!', 'error');
            return false;
        }

        return true;
    }

    // Add new character
    addCharacter(characterData) {
        try {
            this.characters.push(characterData);
            this.saveCharacters();
            this.renderGallery();
            this.resetForm();
            this.showMessage(`✨ ${characterData.name} has been created successfully!`, 'success');
        } catch (error) {
            console.error('Error adding character:', error);
            this.showMessage('Error creating character!', 'error');
        }
    }

    // Reset form
    resetForm() {
        characterForm.reset();
        document.getElementById('customImageUrl').disabled = false;
    }

    // Render character gallery
    renderGallery() {
        // Update character count
        const count = this.characters.length;
        characterCount.textContent = `${count} character${count !== 1 ? 's' : ''}`;
        
        // Show/hide clear all button
        clearAllBtn.style.display = count > 0 ? 'block' : 'none';

        // Clear gallery
        characterGallery.innerHTML = '';

        if (count === 0) {
            this.renderEmptyGallery();
            return;
        }

        // Render character cards
        this.characters.forEach((character, index) => {
            const card = this.createCharacterCard(character, index);
            characterGallery.appendChild(card);
        });
    }

    // Render empty gallery state
    renderEmptyGallery() {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-gallery';
        emptyDiv.innerHTML = `
            <div class="empty-icon">🎭</div>
            <h3>No Characters Yet</h3>
            <p>Create your first character using the form above!</p>
        `;
        characterGallery.appendChild(emptyDiv);
    }

    // Create character card element
    createCharacterCard(character, index) {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.setAttribute('data-index', index);

        // Handle image source
        const imageSrc = character.imageUrl.includes('://') 
            ? character.imageUrl 
            : character.imageUrl; // Assume local images are in same directory

        card.innerHTML = `
            <img src="${imageSrc}" alt="${character.name}" class="character-image" 
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNDQ0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
            <div class="character-name">${character.name}</div>
            <div class="character-type">${this.getTypeEmoji(character.type)} ${character.type}</div>
            <div class="character-description">${character.description}</div>
        `;

        // Add click handler
        card.addEventListener('click', () => this.viewCharacter(index));

        return card;
    }

    // Get emoji for character type
    getTypeEmoji(type) {
        const emojis = {
            'Dragon': '🐲',
            'Human': '👤'
        };
        return emojis[type] || '❓';
    }

    // View character details
    viewCharacter(index) {
        try {
            // Store character index in sessionStorage
            sessionStorage.setItem('selectedCharacterIndex', index.toString());
            
            // Redirect to detail page
            window.location.href = 'detail.html';
        } catch (error) {
            console.error('Error navigating to character detail:', error);
            this.showMessage('Error opening character details!', 'error');
        }
    }

    // Clear all characters
    clearAllCharacters() {
        if (confirm('⚠️ Are you sure you want to delete all characters? This action cannot be undone!')) {
            try {
                this.characters = [];
                this.saveCharacters();
                this.renderGallery();
                this.showMessage('All characters have been deleted.', 'success');
            } catch (error) {
                console.error('Error clearing characters:', error);
                this.showMessage('Error deleting characters!', 'error');
            }
        }
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

        // Insert after form
        characterForm.parentNode.insertBefore(messageDiv, characterForm.nextSibling);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// Character Statistics Display
class StatsDisplay {
    static updateStats() {
        const characters = JSON.parse(localStorage.getItem(CHARACTERS_KEY) || '[]');
        
        // Count by type
        const stats = {
            total: characters.length,
            dragons: characters.filter(c => c.type === 'Dragon').length,
            humans: characters.filter(c => c.type === 'Human').length,
            totalItems: characters.reduce((sum, c) => sum + (c.bag ? c.bag.length : 0), 0)
        };

        // Update display if stats element exists
        const statsElement = document.getElementById('galleryStats');
        if (statsElement) {
            statsElement.innerHTML = `
                📊 Gallery Stats: ${stats.total} characters | 
                🐲 ${stats.dragons} Dragons | 
                👤 ${stats.humans} Humans | 
                🎒 ${stats.totalItems} total items
            `;
        }
    }
}

// Utility Functions
const utils = {
    // Generate unique ID
    generateId: () => Date.now() + Math.random().toString(36).substr(2, 9),
    
    // Format date
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // Validate image URL
    validateImageUrl: (url) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    },
    
    // Truncate text
    truncateText: (text, maxLength = 100) => {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('🐲 Character Gallery initialized!');
    
    // Create character manager instance
    const characterManager = new CharacterManager();
    
    // Update stats display
    StatsDisplay.updateStats();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + N to focus on name input
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            document.getElementById('characterName').focus();
        }
        
        // Escape to clear form
        if (e.key === 'Escape') {
            if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
                characterForm.reset();
                document.getElementById('customImageUrl').disabled = false;
            }
        }
    });
    
    console.log('✨ All systems ready! Create your first character!');
});

// Export for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CharacterManager, StatsDisplay, utils };
}