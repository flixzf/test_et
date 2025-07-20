/**
 * Language storage service for the Teto-Egen personality test application
 * Provides functions to save and retrieve language preferences
 */

// Language storage module
const languageStorage = (function() {
    /**
     * Save the user's language preference to local storage
     * @param {string} langCode - The language code to save
     * @returns {boolean} True if saved successfully, false otherwise
     */
    function saveLanguagePreference(langCode) {
        try {
            if (!langCode || typeof langCode !== 'string') {
                return false;
            }
            
            // Get the storage key from the language config
            const storageKey = window.languageConfig.storageKey || 'teto-egen-language-preference';
            
            // Save to local storage
            localStorage.setItem(storageKey, langCode);
            return true;
        } catch (error) {
            console.error('Error saving language preference:', error);
            return false;
        }
    }
    
    /**
     * Get the user's saved language preference from local storage
     * @returns {string|null} The saved language code or null if not found
     */
    function getSavedLanguagePreference() {
        try {
            // Get the storage key from the language config
            const storageKey = window.languageConfig.storageKey || 'teto-egen-language-preference';
            
            // Get from local storage
            return localStorage.getItem(storageKey);
        } catch (error) {
            console.error('Error retrieving language preference:', error);
            return null;
        }
    }
    
    /**
     * Clear the user's language preference from local storage
     * @returns {boolean} True if cleared successfully, false otherwise
     */
    function clearLanguagePreference() {
        try {
            // Get the storage key from the language config
            const storageKey = window.languageConfig.storageKey || 'teto-egen-language-preference';
            
            // Remove from local storage
            localStorage.removeItem(storageKey);
            return true;
        } catch (error) {
            console.error('Error clearing language preference:', error);
            return false;
        }
    }
    
    /**
     * Get the best language to use based on preferences and browser settings
     * Priority: 1. Saved preference, 2. Browser language, 3. Default language
     * @returns {string} The language code to use
     */
    function getPreferredLanguage() {
        // Check for saved preference first
        const savedLanguage = getSavedLanguagePreference();
        if (savedLanguage && window.languageUtils.isLanguageSupported(savedLanguage)) {
            return savedLanguage;
        }
        
        // Check browser language
        const browserLanguage = window.languageUtils.detectBrowserLanguage();
        if (window.languageUtils.isLanguageSupported(browserLanguage)) {
            return browserLanguage;
        }
        
        // Fall back to default language
        return window.languageConfig.defaultLanguage;
    }
    
    /**
     * Initialize the language based on preferences
     * @returns {Object} The selected language object
     */
    function initializeLanguage() {
        const preferredLanguage = getPreferredLanguage();
        return window.languageUtils.setCurrentLanguage(preferredLanguage);
    }
    
    // Public API
    return {
        saveLanguagePreference,
        getSavedLanguagePreference,
        clearLanguagePreference,
        getPreferredLanguage,
        initializeLanguage
    };
})();

// Export the language storage module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = languageStorage;
} else {
    // For browser environment
    window.languageStorage = languageStorage;
}