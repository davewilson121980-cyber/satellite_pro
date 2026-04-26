/**
 * Main JavaScript file for Satellite Analytics Web App
 * Contains common utilities and initialization code
 */

// Application state
const AppState = {
    currentUser: null,
    mapInitialized: false,
    activeLayers: [],
    apiBaseUrl: '/api'
};

// Utility functions
const Utils = {
    /**
     * Format date to YYYYMMDD format
     * @param {Date} date - Date object to format
     * @returns {string} Formatted date string
     */
    formatDate: (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    },

    /**
     * Format number with commas
     * @param {number} num - Number to format
     * @returns {string} Formatted number string
     */
    formatNumber: (num) => {
        return new Intl.NumberFormat().format(num);
    },

    /**
     * Debounce function execution
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce: (func, wait) => {
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

    /**
     * Show notification toast
     * @param {string} message - Message to display
     * @param {string} type - Notification type (success, error, info)
     */
    showNotification: (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-y-[-100%] opacity-0`;
        
        const colors = {
            success: 'bg-green-900 border border-green-700 text-green-100',
            error: 'bg-red-900 border border-red-700 text-red-100',
            info: 'bg-blue-900 border border-blue-700 text-blue-100'
        };
        
        notification.classList.add(...colors[type].split(' '));
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.classList.remove('translate-y-[-100%]', 'opacity-0');
        });
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('translate-y-[-100%]', 'opacity-0');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// API helper functions
const API = {
    /**
     * Make authenticated API request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise} Response promise
     */
    async request(endpoint, options = {}) {
        const url = `${AppState.apiBaseUrl}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        const config = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...(options.headers || {})
            }
        };
        
        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `HTTP ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            Utils.showNotification(error.message, 'error');
            throw error;
        }
    },

    /**
     * GET request helper
     */
    get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    },

    /**
     * POST request helper
     */
    post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Satellite Analytics App initialized');
    
    // Initialize any global event listeners
    initializeGlobalListeners();
});

/**
 * Initialize global event listeners
 */
function initializeGlobalListeners() {
    // Handle online/offline status
    window.addEventListener('online', () => {
        Utils.showNotification('Connection restored', 'success');
    });
    
    window.addEventListener('offline', () => {
        Utils.showNotification('You are offline. Some features may not work.', 'error');
    });
    
    // Handle beforeunload to prevent accidental navigation
    window.addEventListener('beforeunload', (e) => {
        // Only warn if there's unsaved data
        if (AppState.hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AppState, Utils, API };
}
