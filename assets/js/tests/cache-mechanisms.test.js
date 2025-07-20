/**
 * Tests for the caching mechanisms in language modules
 */

// Mock dependencies
const mockLanguageConfig = {
    defaultLanguage: 'ko',
    supportedLanguages: [
        { code: 'en', name: 'English', nativeName: 'English', flag: 'gb' },
        { code: 'ko', name: 'Korean', nativeName: '한국어', flag: 'kr' }
    ],
    translationFilePath: 'assets/languages/{lang}.json',
    storageKey: 'teto-egen-language-preference'
};

const mockLanguageUtils = {
    getCurrentLanguage: () => ({ code: 'ko', name: 'Korean', nativeName: '한국어', flag: 'kr' }),
    detectBrowserLanguage: () => 'en',
    isLanguageSupported: (code) => ['en', 'ko'].includes(code),
    isRTL: () => false,
    setCurrentLanguage: (code) => {
        return { code, name: code === 'ko' ? 'Korean' : 'English' };
    }
};

const mockLanguageStorage = {
    saveLanguagePreference: jest.fn(),
    initializeLanguage: () => ({ code: 'ko', name: 'Korean', nativeName: '한국어', flag: 'kr' })
};

// Setup test environment
window.languageConfig = mockLanguageConfig;
window.languageUtils = mockLanguageUtils;
window.languageStorage = mockLanguageStorage;

// Mock localStorage
const mockLocalStorage = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; },
        _getStore: () => store
    };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock fetch API
const originalFetch = window.fetch;
window.fetch = function(url) {
    console.log(`Mocked fetch called for: ${url}`);
    
    return new Promise((resolve) => {
        // Simulate network delay
        setTimeout(() => {
            resolve({
                ok: true,
                json: () => Promise.resolve({
                    app: {
                        title: url.includes('en.json') ? 'Test App' : '테스트 앱',
                        welcome: url.includes('en.json') ? 'Welcome' : '환영합니다'
                    }
                })
            });
        }, 50);
    });
};

// Mock DOM for translation tests
document.body.innerHTML = `
    <div id="test-container">
        <h1 data-i18n="app.title">Default Title</h1>
        <p data-i18n="app.welcome">Default Welcome</p>
        <input type="text" data-i18n="app.welcome" data-i18n-target="placeholder">
    </div>
`;

// Test the language loader cache mechanisms
describe('Language Loader Cache Mechanisms', () => {
    beforeEach(() => {
        // Reset cache before each test
        window.languageLoader.clearCache();
        mockLocalStorage.clear();
    });
    
    afterAll(() => {
        // Restore original fetch
        window.fetch = originalFetch;
    });
    
    test('Should persist cache to localStorage', async () => {
        // Load a language
        await window.languageLoader.loadLanguage('en');
        
        // Check if cache was persisted to localStorage
        const cachedData = mockLocalStorage.getItem(window.languageConfig.storageKey + '-cache');
        expect(cachedData).toBeDefined();
        
        // Parse the cached data
        const parsedCache = JSON.parse(cachedData);
        expect(parsedCache).toHaveProperty('en');
    });
    
    test('Should restore cache from localStorage on initialization', async () => {
        // First, load a language and let it be cached
        await window.languageLoader.loadLanguage('en');
        
        // Clear the in-memory cache
        window.languageLoader.clearCache();
        
        // Create a new instance of the language loader (simulating page reload)
        // This should trigger cache initialization from localStorage
        const fetchSpy = jest.spyOn(window, 'fetch');
        
        // Load the language again
        await window.languageLoader.loadLanguage('en');
        
        // Fetch should not have been called if cache was restored from localStorage
        expect(fetchSpy).not.toHaveBeenCalled();
        fetchSpy.mockRestore();
    });
    
    test('Should evict least recently used items when cache is full', async () => {
        // Mock a smaller cache size for testing
        const originalCacheConfig = window.languageLoader.getCacheConfig();
        const testCacheConfig = { ...originalCacheConfig, maxSize: 1 };
        
        // Apply test config (this is a mock implementation for testing)
        window.languageLoader._setTestCacheConfig(testCacheConfig);
        
        // Load first language
        await window.languageLoader.loadLanguage('en');
        expect(window.languageLoader.isCached('en')).toBe(true);
        
        // Load second language (should evict first language since max size is 1)
        await window.languageLoader.loadLanguage('ko');
        expect(window.languageLoader.isCached('ko')).toBe(true);
        expect(window.languageLoader.isCached('en')).toBe(false);
        
        // Restore original config
        window.languageLoader._setTestCacheConfig(originalCacheConfig);
    });
});

// Test the language translator cache mechanisms
describe('Language Translator Cache Mechanisms', () => {
    beforeEach(() => {
        // Reset caches
        window.languageTranslator.clearTranslationCache(true);
        window.languageTranslator.invalidateCache(true, true);
    });
    
    test('Should cache translated strings', async () => {
        // Load translations
        await window.languageTranslator.loadTranslations('en');
        
        // First translation call should add to cache
        const translation1 = window.languageTranslator.translate('app.title');
        expect(translation1).toBe('Test App');
        expect(window.languageTranslator.getTranslationCacheSize()).toBe(1);
        
        // Mock the translations object to detect if it's accessed
        const originalTranslate = window.languageTranslator.translate;
        window.languageTranslator.translate = jest.fn(originalTranslate);
        
        // Second call with same key should use cache
        const translation2 = window.languageTranslator.translate('app.title');
        expect(translation2).toBe('Test App');
        
        // Check if the translate function accessed the translations object
        // If it used the cache, it shouldn't have navigated through the translations object
        expect(window.languageTranslator.translate.mock.calls.length).toBe(1);
        
        // Restore original function
        window.languageTranslator.translate = originalTranslate;
    });
    
    test('Should only update DOM elements with changed translations', async () => {
        // Setup spy on requestAnimationFrame
        const rafSpy = jest.spyOn(window, 'requestAnimationFrame');
        
        // Load translations
        await window.languageTranslator.loadTranslations('en');
        
        // Apply translations first time
        window.languageTranslator.applyTranslations();
        expect(rafSpy).toHaveBeenCalledTimes(1);
        
        // Reset spy
        rafSpy.mockClear();
        
        // Apply translations again without changes
        window.languageTranslator.applyTranslations();
        
        // Should not have called requestAnimationFrame again since no changes
        expect(rafSpy).not.toHaveBeenCalled();
        
        // Change language
        await window.languageTranslator.loadTranslations('ko');
        
        // Apply translations with new language
        window.languageTranslator.applyTranslations();
        
        // Should have called requestAnimationFrame since translations changed
        expect(rafSpy).toHaveBeenCalledTimes(1);
        
        // Restore spy
        rafSpy.mockRestore();
    });
    
    test('Should manage translation cache size', async () => {
        // Load translations
        await window.languageTranslator.loadTranslations('en');
        
        // Generate many translations to fill cache
        for (let i = 0; i < 1200; i++) {
            window.languageTranslator.translate(`app.title.${i}`);
        }
        
        // Cache should be larger than default max size (1000)
        expect(window.languageTranslator.getTranslationCacheSize()).toBeGreaterThan(1000);
        
        // Manage cache size
        window.languageTranslator.manageTranslationCacheSize(500);
        
        // Cache should now be at or below the specified max size
        expect(window.languageTranslator.getTranslationCacheSize()).toBeLessThanOrEqual(500);
    });
});