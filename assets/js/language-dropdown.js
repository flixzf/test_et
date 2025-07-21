/**
 * Language dropdown component for the Teto-Egen personality test application
 * Creates and manages the language selection dropdown UI
 */

// Language dropdown module
const languageDropdown = (function () {
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
            option.addEventListener('click', function (event) {
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
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1050;
            }
            
            .language-dropdown .dropdown-toggle {
                background-color: rgba(255, 255, 255, 0.9);
                border: 2px solid rgba(0, 123, 255, 0.5);
                border-radius: 30px;
                padding: 8px 16px;
                display: flex;
                align-items: center;
                gap: 10px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
            }
            
            .language-dropdown .dropdown-toggle:hover {
                background-color: rgba(255, 255, 255, 1);
                border-color: rgba(0, 123, 255, 0.8);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
                transform: translateY(-2px);
            }
            
            .language-dropdown .dropdown-toggle::before {
                content: "";
                font-family: "Font Awesome 5 Free";
                font-weight: 900;
                content: "\f0ac"; /* Globe icon */
                font-size: 16px;
                margin-right: 8px;
                color: #0d6efd;
            }
            
            .language-dropdown .flag-icon {
                width: 24px;
                height: 18px;
                object-fit: cover;
                border-radius: 3px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                transition: all 0.3s ease;
                border: 1px solid rgba(0, 0, 0, 0.1);
            }
            
            .language-dropdown .dropdown-item:hover .flag-icon {
                transform: scale(1.1);
            }
            
            .language-dropdown .language-name {
                font-weight: 500;
                font-size: 14px;
            }
            
            .language-dropdown .dropdown-menu {
                min-width: 220px;
                padding: 10px 0;
                border-radius: 12px;
                box-shadow: 0 5px 25px rgba(0, 0, 0, 0.15);
                border: none;
                margin-top: 10px;
                animation: fadeIn 0.3s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .language-dropdown .dropdown-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px 20px;
                transition: all 0.2s ease;
            }
            
            .language-dropdown .dropdown-item.active {
                background-color: rgba(0, 123, 255, 0.1);
                color: #0056b3;
                font-weight: 500;
            }
            
            .language-dropdown .dropdown-item:hover {
                background-color: rgba(0, 0, 0, 0.05);
                transform: translateX(5px);
            }
            
            /* RTL support */
            [dir="rtl"] .language-dropdown {
                left: 15px;
                right: auto;
            }
            
            [dir="rtl"] .language-dropdown .dropdown-item:hover {
                transform: translateX(-5px);
            }
            
            /* Mobile responsiveness */
            @media (max-width: 576px) {
                .language-dropdown {
                    top: 10px;
                    right: 10px;
                }
                
                .language-dropdown .language-name {
                    display: none;
                }
                
                .language-dropdown .dropdown-toggle {
                    padding: 6px 10px;
                }
                
                .language-dropdown .dropdown-toggle::before {
                    margin-right: 0;
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