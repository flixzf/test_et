/**
 * Language translation service for the Teto-Egen personality test application
 * Provides functions to load and apply translations
 */

// Language translator module
const languageTranslator = (function() {
    // Private variables
    let translations = {};
    let currentLanguageCode = null;
    
    // DOM update optimization
    let translationCache = new Map(); // Cache for translated strings
    let previousTranslations = {}; // Previous translations for diffing
    let domUpdateQueue = []; // Queue for batched DOM updates
    let isUpdateScheduled = false; // Flag to track if an update is scheduled
    
    /**
     * Load translations for a specific language
     * @param {string} langCode - The language code to load
     * @returns {Promise} Promise that resolves when translations are loaded
     */
    function loadTranslations(langCode) {
        // Use the language loader to get translations
        return window.languageLoader.getTranslations(langCode)
            .then(data => {
                // Store translations
                translations = data;
                currentLanguageCode = langCode;
                console.log(`Translations set for ${langCode}`);
                return translations;
            });
    }
    
    /**
     * Get a translated string by key
     * @param {string} key - The translation key (dot notation for nested keys)
     * @param {Object} params - Parameters to substitute in the translation
     * @returns {string} The translated string or the key if not found
     */
    function translate(key, params = {}) {
        if (!key) return '';
        
        // Generate cache key based on translation key and parameters
        const cacheKey = generateCacheKey(key, params);
        
        // Check if translation is in cache
        if (translationCache.has(cacheKey)) {
            return translationCache.get(cacheKey);
        }
        
        // Split the key by dots to access nested properties
        const keys = key.split('.');
        
        // Navigate through the translations object
        let result = translations;
        for (const k of keys) {
            if (result && typeof result === 'object' && k in result) {
                result = result[k];
            } else {
                // Key not found
                console.warn(`Translation key not found: ${key}`);
                return key;
            }
        }
        
        // If the result is not a string, return the key
        if (typeof result !== 'string') {
            console.warn(`Translation key does not resolve to a string: ${key}`);
            return key;
        }
        
        // Replace parameters in the translation
        let translatedText = result;
        if (Object.keys(params).length > 0) {
            Object.entries(params).forEach(([paramKey, paramValue]) => {
                translatedText = translatedText.replace(new RegExp(`{${paramKey}}`, 'g'), paramValue);
            });
        }
        
        // Cache the translated string
        translationCache.set(cacheKey, translatedText);
        
        return translatedText;
    }
    
    /**
     * Generate a cache key for a translation
     * @param {string} key - The translation key
     * @param {Object} params - The parameters for the translation
     * @returns {string} The cache key
     */
    function generateCacheKey(key, params) {
        if (Object.keys(params).length === 0) {
            return `${currentLanguageCode}:${key}`;
        }
        
        // Include parameters in cache key
        return `${currentLanguageCode}:${key}:${JSON.stringify(params)}`;
    }
    
    // Cache for DOM elements that need translation
    let translationElementsCache = null;
    let titleKeyCache = null;
    let lastAppliedTranslations = new Map(); // Cache of last applied translations to elements
    
    /**
     * Apply translations to the entire UI with optimized DOM updates
     */
    function applyTranslations() {
        // Use cached elements or build cache if not available
        if (!translationElementsCache) {
            // Find all elements with data-i18n attribute
            translationElementsCache = document.querySelectorAll('[data-i18n]');
            
            // Cache the title key
            titleKeyCache = document.documentElement.getAttribute('data-i18n-title');
        }
        
        // Elements that need updating
        const elementsToUpdate = [];
        
        // Prepare all translations first to minimize DOM reflows
        translationElementsCache.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const params = getElementTranslationParams(element);
            const translatedText = translate(key, params);
            
            // Generate a unique identifier for this element
            const elementId = element.id || element.getAttribute('data-i18n-id') || 
                              getElementPath(element);
            
            // Check if the translation has changed since last time
            if (!lastAppliedTranslations.has(elementId) || 
                lastAppliedTranslations.get(elementId) !== translatedText) {
                
                // Store element and translation for batch update
                elementsToUpdate.push({
                    element,
                    elementId,
                    translatedText
                });
                
                // Update the cache with the new translation
                lastAppliedTranslations.set(elementId, translatedText);
            }
        });
        
        // If no elements need updating, skip the DOM update
        if (elementsToUpdate.length === 0) {
            console.log('No translation updates needed');
            return;
        }
        
        // Apply all translations in a single batch
        // Use requestAnimationFrame to apply changes during the next paint cycle
        requestAnimationFrame(() => {
            elementsToUpdate.forEach(({ element, translatedText }) => {
                // Apply translation based on element type
                if (element.tagName === 'INPUT' && element.type === 'placeholder') {
                    element.placeholder = translatedText;
                } else if (element.tagName === 'INPUT' && element.type === 'value') {
                    element.value = translatedText;
                } else {
                    element.textContent = translatedText;
                }
            });
            
            // Update document title if needed
            if (titleKeyCache) {
                const newTitle = translate(titleKeyCache);
                if (document.title !== newTitle) {
                    document.title = newTitle;
                }
            }
            
            console.log(`Translations applied to UI (${elementsToUpdate.length} elements updated)`);
        });
    }
    
    /**
     * Get translation parameters from element data attributes
     * @param {Element} element - The DOM element
     * @returns {Object} Parameters for translation
     */
    function getElementTranslationParams(element) {
        const params = {};
        const dataAttributes = element.attributes;
        
        // Look for data-i18n-param-* attributes
        for (let i = 0; i < dataAttributes.length; i++) {
            const attr = dataAttributes[i];
            if (attr.name.startsWith('data-i18n-param-')) {
                const paramName = attr.name.substring('data-i18n-param-'.length);
                params[paramName] = attr.value;
            }
        }
        
        return params;
    }
    
    /**
     * Get a unique path for an element in the DOM
     * @param {Element} element - The DOM element
     * @returns {string} A unique identifier for the element
     */
    function getElementPath(element) {
        const path = [];
        let currentElement = element;
        
        while (currentElement && currentElement !== document.body) {
            let selector = currentElement.tagName.toLowerCase();
            
            if (currentElement.id) {
                selector += `#${currentElement.id}`;
                path.unshift(selector);
                break;
            }
            
            if (currentElement.className) {
                selector += `.${Array.from(currentElement.classList).join('.')}`;
            }
            
            // Add position among siblings
            const siblings = currentElement.parentNode ? 
                Array.from(currentElement.parentNode.children) : [];
            const index = siblings.indexOf(currentElement);
            selector += `:nth-child(${index + 1})`;
            
            path.unshift(selector);
            currentElement = currentElement.parentNode;
        }
        
        return path.join(' > ');
    }
    
    /**
     * Clear the translation cache
     * @param {boolean} [clearLastApplied=false] - Whether to also clear the last applied translations cache
     */
    function clearTranslationCache(clearLastApplied = false) {
        translationCache.clear();
        
        if (clearLastApplied) {
            lastAppliedTranslations.clear();
        }
        
        console.log(`Translation cache cleared${clearLastApplied ? ' (including last applied translations)' : ''}`);
    }
    
    /**
     * Manage the translation cache size
     * Removes least recently used entries when the cache exceeds the maximum size
     * @param {number} maxSize - Maximum number of entries in the cache
     */
    function manageTranslationCacheSize(maxSize = 1000) {
        if (translationCache.size <= maxSize) return;
        
        // Convert cache to array for sorting
        const cacheEntries = Array.from(translationCache.entries());
        
        // Sort by access count (if we had access counts)
        // For now, just remove the oldest entries (first added)
        const entriesToRemove = cacheEntries.slice(0, cacheEntries.length - maxSize);
        
        // Remove entries from cache
        entriesToRemove.forEach(([key]) => {
            translationCache.delete(key);
        });
        
        console.log(`Translation cache pruned: removed ${entriesToRemove.length} entries`);
    }
    
    /**
     * Change the current language
     * @param {string} langCode - The language code to change to
     * @returns {Promise} Promise that resolves when language is changed
     */
    function changeLanguage(langCode) {
        return new Promise((resolve, reject) => {
            // If it's the same language, just resolve
            if (currentLanguageCode === langCode) {
                console.log(`Already using language: ${langCode}`);
                resolve(window.languageUtils.getCurrentLanguage());
                return;
            }
            
            // Set the current language in languageUtils
            const language = window.languageUtils.setCurrentLanguage(langCode);
            
            // Save the language preference
            window.languageStorage.saveLanguagePreference(langCode);
            
            // Clear translation cache when changing languages
            clearTranslationCache(false);
            
            // Load translations for the language
            loadTranslations(langCode)
                .then(() => {
                    // Apply translations to the UI
                    applyTranslations();
                    
                    // Update language direction for RTL languages
                    document.documentElement.dir = window.languageUtils.isRTL() ? 'rtl' : 'ltr';
                    
                    // Update language dropdown if it exists
                    updateLanguageDropdown();
                    
                    // Manage cache size after language change
                    manageTranslationCacheSize();
                    
                    resolve(language);
                })
                .catch(reject);
        });
    }
    
    /**
     * Update the language dropdown to reflect the current language
     * Uses requestAnimationFrame for optimized DOM updates
     */
    function updateLanguageDropdown() {
        const dropdown = document.getElementById('languageDropdown');
        if (!dropdown) return;
        
        const currentLanguage = window.languageUtils.getCurrentLanguage();
        
        // Batch DOM updates using requestAnimationFrame
        requestAnimationFrame(() => {
            const flagImg = dropdown.querySelector('.flag-icon');
            const langName = dropdown.querySelector('.language-name');
            
            if (flagImg) {
                flagImg.src = `assets/images/flags/${currentLanguage.flag}.svg`;
                flagImg.alt = `${currentLanguage.name} Flag`;
            }
            
            if (langName) {
                langName.textContent = currentLanguage.nativeName;
            }
            
            // Update active state in dropdown menu
            const dropdownItems = document.querySelectorAll('.language-dropdown .dropdown-item');
            dropdownItems.forEach(item => {
                const itemLangCode = item.getAttribute('data-language');
                if (itemLangCode === currentLanguage.code) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        });
    }
    
    /**
     * Initialize the translation service
     * @returns {Promise} Promise that resolves when initialization is complete
     */
    function init() {
        return new Promise((resolve, reject) => {
            // Initialize language based on preferences
            const language = window.languageStorage.initializeLanguage();
            
            // Load translations for the language
            loadTranslations(language.code)
                .then(() => {
                    // Apply translations to the UI
                    applyTranslations();
                    
                    // Set document direction for RTL languages
                    document.documentElement.dir = window.languageUtils.isRTL() ? 'rtl' : 'ltr';
                    
                    // Preload likely-to-be-used languages in the background
                    setTimeout(() => {
                        window.languageLoader.preloadLikelyLanguages();
                    }, 2000); // Delay preloading to prioritize current page rendering
                    
                    resolve(language);
                })
                .catch(reject);
        });
    }
    
    /**
     * Invalidate the translation elements cache
     * Call this when the DOM structure changes (e.g., new elements are added)
     * @param {boolean} [clearTranslations=false] - Whether to also clear the translation string cache
     * @param {boolean} [clearLastApplied=false] - Whether to also clear the last applied translations cache
     */
    function invalidateCache(clearTranslations = false, clearLastApplied = false) {
        translationElementsCache = null;
        titleKeyCache = null;
        
        if (clearTranslations) {
            clearTranslationCache(clearLastApplied);
        }
        
        console.log(`Translation elements cache invalidated${clearTranslations ? ' (translation cache also cleared)' : ''}`);
    }
    
    /**
     * Refresh translations for the current language
     * Useful after DOM changes or when new translatable elements are added
     * @returns {Promise} Promise that resolves when translations are refreshed
     */
    function refreshTranslations() {
        // Invalidate cache to force re-scanning of DOM elements
        invalidateCache();
        
        // Apply translations with the refreshed cache
        applyTranslations();
        
        return Promise.resolve();
    }
    
    // Public API
    return {
        loadTranslations,
        translate,
        applyTranslations,
        changeLanguage,
        init,
        invalidateCache,
        refreshTranslations,
        // Expose cache management methods
        clearTranslationCache,
        manageTranslationCacheSize,
        // Cache statistics methods
        getTranslationCacheSize: () => translationCache.size,
        getLastAppliedCacheSize: () => lastAppliedTranslations.size
    };
})();

// Export the language translator module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = languageTranslator;
} else {
    // For browser environment
    window.languageTranslator = languageTranslator;
}