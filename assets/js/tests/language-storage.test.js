/**
 * Tests for the language storage module
 */

// Mock dependencies
const mockLanguageConfig = {
    defaultLanguage: 'ko',
    supportedLanguages: [
        { code: 'en', name: 'English', nativeName: 'English', flag: 'gb' },
        { code: 'ko', name: 'Korean', nativeName: '한국어', flag: 'kr' },
        { code: 'es', name: 'Spanish', nativeName: 'Español', flag: 'es' }
    ],
    translationFilePath: 'assets/languages/{lang}.json',
    storageKey: 'teto-egen-language-preference'
};

const mockLanguageUtils = {
    getCurrentLanguage: () => ({ code: 'ko', name: 'Korean', nativeName: '한국어', flag: 'kr' }),
    setCurrentLanguage: (langCode) => {
        const lang = mockLanguageConfig.supportedLanguages.find(l => l.code === langCode) || 
                    mockLanguageConfig.supportedLanguages.find(l => l.code === mockLanguageConfig.defaultLanguage);
        mockLanguageUtils.getCurrentLanguage = () => lang;
        return lang;
    },
    detectBrowserLanguage: jest.fn().mockReturnValue('en'),
    isLanguageSupported: (code) => mockLanguageConfig.supportedLanguages.some(l => l.code === code)
};

// Setup test environment
window.languageConfig = mockLanguageConfig;
window.languageUtils = mockLanguageUtils;

// Mock localStorage
const mockLocalStorage = (() => {
    let store = {};
    return {
        getItem: jest.fn(key => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = value.toString();
        }),
        removeItem: jest.fn(key => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            store = {};
        }),
        // Helper to directly set a value for testing
        _setItem: (key, value) => {
            store[key] = value;
        },
        // Helper to get the store for assertions
        _getStore: () => ({ ...store })
    };
})();

// Replace localStorage with mock
Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage
});

// Test the language storage
describe('Language Storage', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        mockLocalStorage.clear();
        jest.clearAllMocks();
    });
    
    test('Should save language preference to localStorage', () => {
        const result = window.languageStorage.saveLanguagePreference('en');
        
        expect(result).toBe(true);
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
            mockLanguageConfig.storageKey,
            'en'
        );
    });
    
    test('Should handle invalid language code when saving', () => {
        // Test with null
        let result = window.languageStorage.saveLanguagePreference(null);
        expect(result).toBe(false);
        expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
        
        // Test with non-string
        result = window.languageStorage.saveLanguagePreference(123);
        expect(result).toBe(false);
        expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
    
    test('Should get saved language preference from localStorage', () => {
        // Set up a saved preference
        mockLocalStorage._setItem(mockLanguageConfig.storageKey, 'es');
        
        const result = window.languageStorage.getSavedLanguagePreference();
        
        expect(result).toBe('es');
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith(mockLanguageConfig.storageKey);
    });
    
    test('Should return null if no language preference is saved', () => {
        const result = window.languageStorage.getSavedLanguagePreference();
        
        expect(result).toBeNull();
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith(mockLanguageConfig.storageKey);
    });
    
    test('Should clear language preference from localStorage', () => {
        // Set up a saved preference
        mockLocalStorage._setItem(mockLanguageConfig.storageKey, 'es');
        
        const result = window.languageStorage.clearLanguagePreference();
        
        expect(result).toBe(true);
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(mockLanguageConfig.storageKey);
        expect(mockLocalStorage._getStore()[mockLanguageConfig.storageKey]).toBeUndefined();
    });
    
    test('Should handle localStorage errors gracefully', () => {
        // Mock localStorage to throw an error
        const originalSetItem = mockLocalStorage.setItem;
        mockLocalStorage.setItem = jest.fn().mockImplementation(() => {
            throw new Error('Storage error');
        });
        
        const result = window.languageStorage.saveLanguagePreference('en');
        
        expect(result).toBe(false);
        
        // Restore original mock
        mockLocalStorage.setItem = originalSetItem;
    });
    
    test('Should get preferred language with priority order', () => {
        // Test 1: Saved preference exists and is supported
        mockLocalStorage._setItem(mockLanguageConfig.storageKey, 'es');
        expect(window.languageStorage.getPreferredLanguage()).toBe('es');
        
        // Test 2: No saved preference, use browser language
        mockLocalStorage.clear();
        expect(window.languageStorage.getPreferredLanguage()).toBe('en');
        expect(window.languageUtils.detectBrowserLanguage).toHaveBeenCalled();
        
        // Test 3: No saved preference, browser language not supported
        mockLocalStorage.clear();
        window.languageUtils.detectBrowserLanguage = jest.fn().mockReturnValue('fr'); // Not in supported list
        expect(window.languageStorage.getPreferredLanguage()).toBe('ko'); // Default language
    });
    
    test('Should initialize language based on preferences', () => {
        // Set up a saved preference
        mockLocalStorage._setItem(mockLanguageConfig.storageKey, 'es');
        
        const result = window.languageStorage.initializeLanguage();
        
        expect(result.code).toBe('es');
        expect(window.languageUtils.setCurrentLanguage).toHaveBeenCalledWith('es');
    });
});