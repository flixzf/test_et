/**
 * Language dropdown component for the Teto-Egen personality test application
 * Creates and manages the language selection dropdown UI
 */

// Language dropdown module
const languageDropdown = (function() {
    /**
     * Create the language dropdown HTML
     * @returns {string} HTML for the language dropdown
     */
    function createDropdownHTML() {
        const currentLanguage = window.languageUtils.getCurrentLanguage();
        const supportedLanguages = window.languageUtils.getSupportedLanguages();
        
        // Create dropdown button HTML
        let html = `
            <div class="language-dropdown dropdown">
                <button class="btn btn-sm dropdown-toggle" type="button" id="languageDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                    <img src="assets/images/flags/${currentLanguage.flag}.svg" alt="${currentLanguage.name} Flag" class="flag-icon">
                    <span class="language-name">${currentLanguage.nativeName}</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="languageDropdown">
        `;
        
        // Add language options
        supportedLanguages.forEach(language => {
            const isActive = language.code === currentLanguage.code;
            html += `
                <li>
                    <a class="dropdown-item ${isActive ? 'active' : ''}" href="#" data-language="${language.code}">
                        <img src="assets/images/flags/${language.flag}.svg" alt="${language.name} Flag" class="flag-icon">
                        <span>${language.nativeName}</span>
                    </a>
                </li>
            `;
        });
        
        // Close dropdown HTML
        html += `
                </ul>
            </div>
        `;
        
        return html;
    }
    
    /**
     * Initialize the language dropdown
     * @param {string} containerId - ID of the container element
     */
    function init(containerId = 'language-dropdown-container') {
        // Find the container element
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Language dropdown container not found: #${containerId}`);
            return;
        }
        
        // Create and insert the dropdown HTML
        container.innerHTML = createDropdownHTML();
        
        // Add event listeners to language options
        const languageOptions = container.querySelectorAll('.dropdown-item');
        languageOptions.forEach(option => {
            option.addEventListener('click', function(event) {
                event.preventDefault();
                
                const langCode = this.getAttribute('data-language');
                if (langCode) {
                    // Change the language
                    window.languageTranslator.changeLanguage(langCode)
                        .then(() => {
                            console.log(`Language changed to: ${langCode}`);
                        })
                        .catch(error => {
                            console.error('Error changing language:', error);
                        });
                }
            });
        });
        
        // Add CSS styles
        addStyles();
        
        console.log('Language dropdown initialized');
    }
    
    /**
     * Add CSS styles for the language dropdown
     */
    function addStyles() {
        // Check if styles are already added
        if (document.getElementById('language-dropdown-styles')) {
            return;
        }
        
        // Create style element
        const style = document.createElement('style');
        style.id = 'language-dropdown-styles';
        
        // Add CSS rules
        style.textContent = `
            .language-dropdown {
                position: absolute;
                top: 10px;
                right: 10px;
                z-index: 1000;
            }
            
            .language-dropdown .dropdown-toggle {
                background-color: rgba(255, 255, 255, 0.8);
                border: 1px solid rgba(0, 0, 0, 0.1);
                border-radius: 4px;
                padding: 6px 12px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .language-dropdown .dropdown-toggle:hover {
                background-color: rgba(255, 255, 255, 1);
            }
            
            .language-dropdown .flag-icon {
                width: 20px;
                height: 15px;
                object-fit: cover;
                border-radius: 2px;
            }
            
            .language-dropdown .dropdown-menu {
                min-width: 200px;
                padding: 8px 0;
            }
            
            .language-dropdown .dropdown-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px 16px;
            }
            
            .language-dropdown .dropdown-item.active {
                background-color: rgba(0, 123, 255, 0.1);
                color: #0056b3;
            }
            
            .language-dropdown .dropdown-item:hover {
                background-color: rgba(0, 0, 0, 0.05);
            }
            
            /* RTL support */
            [dir="rtl"] .language-dropdown {
                left: 10px;
                right: auto;
            }
            
            /* Mobile responsiveness */
            @media (max-width: 576px) {
                .language-dropdown {
                    top: 5px;
                    right: 5px;
                }
                
                .language-dropdown .language-name {
                    display: none;
                }
                
                .language-dropdown .dropdown-toggle {
                    padding: 4px 8px;
                }
            }
        `;
        
        // Add style to document head
        document.head.appendChild(style);
    }
    
    // Public API
    return {
        init,
        createDropdownHTML
    };
})();

// Export the language dropdown module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = languageDropdown;
} else {
    // For browser environment
    window.languageDropdown = languageDropdown;
}