/**
 * Language utilities for the Teto-Egen personality test application
 * Provides functions for language detection, selection, and management
 */

// Language utilities module
const languageUtils = (function() {
    // Private variables
    let currentLanguage = null;
    
    /**
     * Get the browser's language
     * @returns {string} The browser language code (e.g., 'en', 'ko')
     */
    function detectBrowserLanguage() {
        // Get browser language from navigator
        const browserLang = (navigator.language || navigator.userLanguage || 'en').split('-')[0];
        return browserLang.toLowerCase();
    }
    
    /**
     * Check if a language is supported
     * @param {string} langCode - The language code to check
     * @returns {boolean} True if the language is supported, false otherwise
     */
    function isLanguageSupported(langCode) {
        if (!langCode) return false;
        
        // Convert to lowercase for case-insensitive comparison
        const normalizedLangCode = langCode.toLowerCase();
        
        // Check if the language is in the supported languages list
        return window.languageConfig.supportedLanguages.some(lang => 
            lang.code.toLowerCase() === normalizedLangCode
        );
    }
    
    /**
     * Get language details by code
     * @param {string} langCode - The language code
     * @returns {Object|null} The language details or null if not found
     */
    function getLanguageByCode(langCode) {
        if (!langCode) return null;
        
        // Convert to lowercase for case-insensitive comparison
        const normalizedLangCode = langCode.toLowerCase();
        
        // Find the language in the supported languages list
        return window.languageConfig.supportedLanguages.find(lang => 
            lang.code.toLowerCase() === normalizedLangCode
        ) || null;
    }
    
    /**
     * Get all supported languages
     * @returns {Array} Array of supported language objects
     */
    function getSupportedLanguages() {
        return window.languageConfig.supportedLanguages;
    }
    
    /**
     * Get the default language
     * @returns {Object} The default language object
     */
    function getDefaultLanguage() {
        const defaultLangCode = window.languageConfig.defaultLanguage;
        return getLanguageByCode(defaultLangCode) || 
               window.languageConfig.supportedLanguages[0];
    }
    
    /**
     * Get the current language
     * @returns {Object} The current language object
     */
    function getCurrentLanguage() {
        return currentLanguage || getDefaultLanguage();
    }
    
    /**
     * Set the current language
     * @param {string} langCode - The language code to set
     * @returns {Object} The set language object
     */
    function setCurrentLanguage(langCode) {
        const language = getLanguageByCode(langCode);
        if (language) {
            currentLanguage = language;
        }
        return getCurrentLanguage();
    }
    
    /**
     * Get the best matching language based on browser settings
     * Falls back to default language if no match is found
     * @returns {Object} The best matching language object
     */
    function getBestMatchingLanguage() {
        const browserLang = detectBrowserLanguage();
        
        // Check if browser language is supported
        if (isLanguageSupported(browserLang)) {
            return getLanguageByCode(browserLang);
        }
        
        // Fall back to default language
        return getDefaultLanguage();
    }
    
    /**
     * Format a date according to the current language's date format
     * @param {Date} date - The date to format
     * @returns {string} The formatted date string
     */
    function formatDate(date) {
        if (!date || !(date instanceof Date)) {
            return '';
        }
        
        const language = getCurrentLanguage();
        const format = language.dateFormat || 'YYYY/MM/DD';
        
        // Simple date formatting (for a more robust solution, consider using a library like date-fns)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day);
    }
    
    /**
     * Format a number according to the current language's number format
     * @param {number} num - The number to format
     * @param {number} [decimals=2] - The number of decimal places
     * @returns {string} The formatted number string
     */
    function formatNumber(num, decimals = 2) {
        if (typeof num !== 'number') {
            return '';
        }
        
        const language = getCurrentLanguage();
        const decimalSeparator = language.numberFormat?.decimal || '.';
        const thousandsSeparator = language.numberFormat?.thousands || ',';
        
        // Format the number
        const parts = num.toFixed(decimals).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
        
        return parts.join(decimalSeparator);
    }
    
    /**
     * Check if the current language is right-to-left (RTL)
     * @returns {boolean} True if the current language is RTL
     */
    function isRTL() {
        const language = getCurrentLanguage();
        return language.rtl === true;
    }
    
    /**
     * Get the flag code for the current language
     * @returns {string} The flag code (ISO 3166-1 alpha-2)
     */
    function getCurrentLanguageFlag() {
        const language = getCurrentLanguage();
        return language.flag || '';
    }
    
    /**
     * Get the native name of the current language
     * @returns {string} The native name of the language
     */
    function getCurrentLanguageNativeName() {
        const language = getCurrentLanguage();
        return language.nativeName || language.name || '';
    }
    
    // Public API
    return {
        detectBrowserLanguage,
        isLanguageSupported,
        getLanguageByCode,
        getSupportedLanguages,
        getDefaultLanguage,
        getCurrentLanguage,
        setCurrentLanguage,
        getBestMatchingLanguage,
        formatDate,
        formatNumber,
        isRTL,
        getCurrentLanguageFlag,
        getCurrentLanguageNativeName
    };
})();

// Export the language utilities module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = languageUtils;
} else {
    // For browser environment
    window.languageUtils = languageUtils;
}