/**
 * Tests for the language loader module
 */

// Mock dependencies
const mockLanguageConfig = {
    defaultLanguage: 'ko',
    supportedLanguages: [
        { code: 'en', name: 'English', nativeName: 'English', flag: 'gb' },
        { code: 'ko', name: 'Korean', nativeName: '한국어', flag: 'kr' }
    ],
    translationFilePath: 'assets/languages/{lang}.json'
};

const mockLanguageUtils = {
    getCurrentLanguage: () => ({ code: 'ko', name: 'Korean', nativeName: '한국어', flag: 'kr' }),
    detectBrowserLanguage: () => 'en',
    isLanguageSupported: (code) => ['en', 'ko'].includes(code)
};

// Setup test environment
window.languageConfig = mockLanguageConfig;
window.languageUtils = mockLanguageUtils;

// Mock fetch API
const originalFetch = window.fetch;
window.fetch = function(url) {
    console.log(`Mocked fetch called for: ${url}`);
    
    return new Promise((resolve) => {
        // Simulate network delay
        setTimeout(() => {
            resolve({
                ok: true,
                json: () => Promise.resolve({ test: 'Translation loaded' })
            });
        }, 100);
    });
};

// Test the language loader
describe('Language Loader', () => {
    beforeEach(() => {
        // Reset cache before each test
        window.languageLoader.clearCache();
    });
    
    afterAll(() => {
        // Restore original fetch
        window.fetch = originalFetch;
    });
    
    test('Should load a language file', async () => {
        const translations = await window.languageLoader.loadLanguage('en');
        expect(translations).toBeDefined();
        expect(translations.test).toBe('Translation loaded');
    });
    
    test('Should cache loaded languages', async () => {
        // First load
        await window.languageLoader.loadLanguage('en');
        
        // Should be cached now
        expect(window.languageLoader.isCached('en')).toBe(true);
        
        // Second load should use cache
        const fetchSpy = jest.spyOn(window, 'fetch');
        await window.languageLoader.loadLanguage('en');
        expect(fetchSpy).not.toHaveBeenCalled();
        fetchSpy.mockRestore();
    });
    
    test('Should preload languages', async () => {
        const preloadPromise = window.languageLoader.preloadLanguages(['en', 'ko']);
        
        // Preloading should not block
        expect(preloadPromise).resolves.toBeUndefined();
        
        // Wait for preloading to complete
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Both languages should be cached
        expect(window.languageLoader.isCached('en')).toBe(true);
        expect(window.languageLoader.isCached('ko')).toBe(true);
    });
    
    test('Should preload likely languages', async () => {
        const preloadSpy = jest.spyOn(window.languageLoader, 'preloadLanguages');
        
        window.languageLoader.preloadLikelyLanguages();
        
        expect(preloadSpy).toHaveBeenCalled();
        expect(preloadSpy.mock.calls[0][0]).toContain('en');
        
        preloadSpy.mockRestore();
    });
});