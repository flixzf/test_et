/**
 * Language loader service for the Teto-Egen personality test application
 * Provides optimized loading of language files with lazy loading and preloading capabilities
 */

// Language loader module
const languageLoader = (function() {
    // Private variables
    const cache = new Map(); // Cache for loaded language files
    const cacheMetadata = new Map(); // Metadata for cached items (timestamp, size, etc.)
    let loadingPromises = {}; // Track loading promises to prevent duplicate requests
    let preloadQueue = []; // Queue for languages to preload
    let isPreloading = false; // Flag to track if preloading is in progress
    
    // Cache configuration
    const cacheConfig = {
        maxSize: 15, // Maximum number of languages to cache
        expirationTime: 24 * 60 * 60 * 1000, // Cache expiration time in ms (24 hours)
        persistKey: 'teto-egen-language-cache', // Local storage key for persisted cache
        persistEnabled: true // Whether to persist cache to local storage
    };
    
    // Cache version - increment when translation structure changes to invalidate old caches
    const currentCacheVersion = 2;
    
    /**
     * Initialize the cache from local storage if available
     */
    function initializeCache() {
        if (!cacheConfig.persistEnabled) return;
        
        try {
            const cachedData = localStorage.getItem(cacheConfig.persistKey);
            if (cachedData) {
                const parsedData = JSON.parse(cachedData);
                
                // Restore cache data and metadata
                Object.keys(parsedData).forEach(langCode => {
                    const item = parsedData[langCode];
                    if (item && item.data && item.metadata) {
                        // Check if the cache item is expired
                        const isExpired = Date.now() - item.metadata.timestamp > cacheConfig.expirationTime;
                        if (!isExpired && item.metadata.version === currentCacheVersion) {
                            cache.set(langCode, item.data);
                            cacheMetadata.set(langCode, item.metadata);
                            console.log(`Restored cached translations for ${langCode} from local storage`);
                        }
                    }
                });
                
                console.log(`Cache initialized with ${cache.size} languages from local storage`);
            }
        } catch (error) {
            console.error('Error initializing cache from local storage:', error);
            // Clear potentially corrupted cache
            localStorage.removeItem(cacheConfig.persistKey);
        }
        
        // Set up periodic cache persistence
        if (typeof window !== 'undefined') {
            // Save cache before page unload
            window.addEventListener('beforeunload', () => {
                persistCache();
            });
            
            // Periodically persist cache (every 5 minutes)
            setInterval(() => {
                persistCache();
            }, 5 * 60 * 1000);
        }
    }
    
    /**
     * Save the cache to local storage
     */
    function persistCache() {
        if (!cacheConfig.persistEnabled) return;
        
        try {
            const cacheData = {};
            
            // Build cache data object
            cache.forEach((data, langCode) => {
                cacheData[langCode] = {
                    data,
                    metadata: cacheMetadata.get(langCode) || { timestamp: Date.now() }
                };
            });
            
            // Save to local storage
            localStorage.setItem(cacheConfig.persistKey, JSON.stringify(cacheData));
            console.log(`Cache persisted to local storage with ${cache.size} languages`);
        } catch (error) {
            // Handle potential quota exceeded errors
            if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                console.warn('Local storage quota exceeded. Trying to free up space...');
                
                // Try to free up space by removing older cache entries
                try {
                    // Remove all cached languages except the current and default
                    const currentLang = window.languageUtils.getCurrentLanguage().code;
                    const defaultLang = window.languageConfig.defaultLanguage;
                    
                    const keysToKeep = [currentLang, defaultLang];
                    const cacheData = {};
                    
                    // Only keep essential languages
                    keysToKeep.forEach(langCode => {
                        if (cache.has(langCode)) {
                            cacheData[langCode] = {
                                data: cache.get(langCode),
                                metadata: cacheMetadata.get(langCode) || { timestamp: Date.now() }
                            };
                        }
                    });
                    
                    // Try saving the reduced cache
                    localStorage.setItem(cacheConfig.persistKey, JSON.stringify(cacheData));
                    console.log('Reduced cache persisted to local storage');
                } catch (innerError) {
                    console.error('Failed to persist reduced cache:', innerError);
                    // As a last resort, clear the cache storage
                    localStorage.removeItem(cacheConfig.persistKey);
                }
            } else {
                console.error('Error persisting cache to local storage:', error);
            }
        }
    }
    
    /**
     * Add an item to the cache with metadata
     * @param {string} langCode - The language code
     * @param {Object} data - The translation data
     */
    function addToCache(langCode, data) {
        // Check if we need to evict items from cache
        if (cache.size >= cacheConfig.maxSize) {
            evictFromCache();
        }
        
        // Add to cache with metadata
        cache.set(langCode, data);
        cacheMetadata.set(langCode, {
            timestamp: Date.now(),
            lastAccessed: Date.now(),
            accessCount: 0,
            version: currentCacheVersion
        });
        
        // Persist cache to local storage
        persistCache();
    }
    
    /**
     * Get an item from cache and update its metadata
     * @param {string} langCode - The language code
     * @returns {Object|null} The cached data or null if not found
     */
    function getFromCache(langCode) {
        if (!cache.has(langCode)) return null;
        
        // Update metadata
        const metadata = cacheMetadata.get(langCode) || { timestamp: Date.now(), accessCount: 0 };
        metadata.lastAccessed = Date.now();
        metadata.accessCount = (metadata.accessCount || 0) + 1;
        cacheMetadata.set(langCode, metadata);
        
        return cache.get(langCode);
    }
    
    /**
     * Evict least recently used or expired items from cache
     */
    function evictFromCache() {
        // First remove expired items
        const now = Date.now();
        let expired = false;
        
        cacheMetadata.forEach((metadata, langCode) => {
            if (now - metadata.timestamp > cacheConfig.expirationTime) {
                cache.delete(langCode);
                cacheMetadata.delete(langCode);
                expired = true;
                console.log(`Expired cache item removed: ${langCode}`);
            }
        });
        
        // If we removed expired items or cache size is now acceptable, return
        if (expired || cache.size < cacheConfig.maxSize) return;
        
        // Otherwise, remove least recently used item
        let lruLangCode = null;
        let lruTime = Infinity;
        
        cacheMetadata.forEach((metadata, langCode) => {
            // Skip the default language
            if (langCode === window.languageConfig.defaultLanguage) return;
            
            if (metadata.lastAccessed < lruTime) {
                lruTime = metadata.lastAccessed;
                lruLangCode = langCode;
            }
        });
        
        if (lruLangCode) {
            cache.delete(lruLangCode);
            cacheMetadata.delete(lruLangCode);
            console.log(`Least recently used cache item removed: ${lruLangCode}`);
        }
    }
    
    /**
     * Load a language file
     * @param {string} langCode - The language code to load
     * @returns {Promise} Promise that resolves with the translations
     */
    function loadLanguage(langCode) {
        // Check if in cache and not expired
        const cachedData = getFromCache(langCode);
        const metadata = cacheMetadata.get(langCode);
        if (cachedData && metadata && metadata.version === currentCacheVersion) {
            console.log(`Using cached translations for ${langCode}`);
            return Promise.resolve(cachedData);
        }
        
        // If already loading, return the existing promise
        if (loadingPromises[langCode]) {
            console.log(`Already loading translations for ${langCode}`);
            return loadingPromises[langCode];
        }
        
        // Create loading promise
        loadingPromises[langCode] = new Promise((resolve, reject) => {
            console.log(`Loading translations for ${langCode}`);
            
            // Get the translation file path from config
            const filePath = window.languageConfig.translationFilePath.replace('{lang}', langCode);
            
            // Fetch the translation file
            fetch(filePath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to load translations for ${langCode}`);
                    }
                    return response.json();
                })
                .then(data => {
                    // Attach language code to data
                    data.__langCode = langCode;
                    // Store translations in cache
                    addToCache(langCode, data);
                    console.log(`Translations loaded for ${langCode}`);
                    resolve(data);
                })
                .catch(error => {
                    console.error(`Error loading translations for ${langCode}:`, error);
                    
                    // If the requested language fails to load, try loading the default language
                    if (langCode !== window.languageConfig.defaultLanguage) {
                        console.log(`Falling back to default language: ${window.languageConfig.defaultLanguage}`);
                        return loadLanguage(window.languageConfig.defaultLanguage)
                            .then(resolve)
                            .catch(reject);
                    } else {
                        reject(error);
                    }
                })
                .finally(() => {
                    // Clear the loading promise
                    delete loadingPromises[langCode];
                });
        });
        
        return loadingPromises[langCode];
    }
    
    /**
     * Preload language files in the background
     * @param {Array} langCodes - Array of language codes to preload
     * @returns {Promise} Promise that resolves when all languages are preloaded
     */
    function preloadLanguages(langCodes) {
        if (!Array.isArray(langCodes) || langCodes.length === 0) {
            return Promise.resolve();
        }
        
        // Add languages to preload queue
        preloadQueue = [...new Set([...preloadQueue, ...langCodes])];
        
        // If already preloading, just return
        if (isPreloading) {
            return Promise.resolve();
        }
        
        // Set preloading flag
        isPreloading = true;
        
        // Process preload queue with a delay between each request
        return new Promise(resolve => {
            const processQueue = () => {
                // If queue is empty, resolve and reset flag
                if (preloadQueue.length === 0) {
                    isPreloading = false;
                    resolve();
                    return;
                }
                
                // Get next language to preload
                const langCode = preloadQueue.shift();
                
                // Skip if already cached
                if (cache.has(langCode)) {
                    setTimeout(processQueue, 0);
                    return;
                }
                
                // Load language with low priority
                console.log(`Preloading language: ${langCode}`);
                loadLanguage(langCode)
                    .catch(error => {
                        console.warn(`Failed to preload ${langCode}:`, error);
                    })
                    .finally(() => {
                        // Process next language after a delay
                        setTimeout(processQueue, 300);
                    });
            };
            
            // Start processing queue
            setTimeout(processQueue, 0);
        });
    }
    
    /**
     * Get translations for a language
     * @param {string} langCode - The language code
     * @returns {Promise} Promise that resolves with the translations
     */
    function getTranslations(langCode) {
        return loadLanguage(langCode);
    }
    
    /**
     * Clear the cache for a specific language or all languages
     * @param {string} [langCode] - The language code to clear, or undefined to clear all
     */
    function clearCache(langCode) {
        if (langCode) {
            cache.delete(langCode);
            cacheMetadata.delete(langCode);
            console.log(`Cache cleared for ${langCode}`);
        } else {
            cache.clear();
            cacheMetadata.clear();
            console.log('Cache cleared for all languages');
        }
        
        // Update persisted cache if enabled
        if (cacheConfig.persistEnabled) {
            if (cache.size > 0) {
                persistCache();
            } else {
                localStorage.removeItem(cacheConfig.persistKey);
            }
        }
    }
    
    /**
     * Get the cache size
     * @returns {number} Number of cached languages
     */
    function getCacheSize() {
        return cache.size;
    }
    
    /**
     * Check if a language is cached
     * @param {string} langCode - The language code to check
     * @returns {boolean} True if the language is cached
     */
    function isCached(langCode) {
        return cache.has(langCode);
    }
    
    /**
     * Get list of cached languages
     * @returns {Array} Array of cached language codes
     */
    function getCachedLanguages() {
        return Array.from(cache.keys());
    }
    
    /**
     * Preload likely-to-be-used languages based on user's browser settings and location
     */
    function preloadLikelyLanguages() {
        const currentLang = window.languageUtils.getCurrentLanguage().code;
        const browserLang = window.languageUtils.detectBrowserLanguage();
        const defaultLang = window.languageConfig.defaultLanguage;
        
        // Collect languages to preload
        const toPreload = [];
        
        // Always include browser language if supported and not current
        if (browserLang !== currentLang && window.languageUtils.isLanguageSupported(browserLang)) {
            toPreload.push(browserLang);
        }
        
        // Include default language if not current
        if (defaultLang !== currentLang && defaultLang !== browserLang) {
            toPreload.push(defaultLang);
        }
        
        // Include English as it's commonly used
        if ('en' !== currentLang && 'en' !== browserLang && 'en' !== defaultLang) {
            toPreload.push('en');
        }
        
        // Preload collected languages
        if (toPreload.length > 0) {
            console.log('Preloading likely languages:', toPreload);
            preloadLanguages(toPreload);
        }
    }
    
    // Initialize cache from local storage
    initializeCache();
    
    /**
     * Set cache configuration (for testing purposes)
     * @param {Object} config - The new cache configuration
     * @private
     */
    function _setTestCacheConfig(config) {
        Object.assign(cacheConfig, config);
    }
    
    // Public API
    return {
        loadLanguage,
        getTranslations,
        preloadLanguages,
        preloadLikelyLanguages,
        clearCache,
        getCacheSize,
        isCached,
        getCachedLanguages,
        // Expose cache configuration for testing and debugging
        getCacheConfig: () => ({ ...cacheConfig }),
        // For testing only
        _setTestCacheConfig
    };
})();

// Export the language loader module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = languageLoader;
} else {
    // For browser environment
    window.languageLoader = languageLoader;
}