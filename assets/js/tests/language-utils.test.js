/**
 * Tests for the language utilities module
 */

// Mock dependencies
const mockLanguageConfig = {
    defaultLanguage: 'ko',
    supportedLanguages: [
        { 
            code: 'en', 
            name: 'English', 
            nativeName: 'English', 
            flag: 'gb', 
            rtl: false,
            dateFormat: 'MM/DD/YYYY',
            numberFormat: {
                decimal: '.',
                thousands: ','
            }
        },
        { 
            code: 'ko', 
            name: 'Korean', 
            nativeName: '한국어', 
            flag: 'kr', 
            rtl: false,
            dateFormat: 'YYYY.MM.DD',
            numberFormat: {
                decimal: '.',
                thousands: ','
            }
        },
        { 
            code: 'ar', 
            name: 'Arabic', 
            nativeName: 'العربية', 
            flag: 'sa', 
            rtl: true,
            dateFormat: 'DD/MM/YYYY',
            numberFormat: {
                decimal: '٫',
                thousands: '٬'
            }
        }
    ],
    translationFilePath: 'assets/languages/{lang}.json',
    storageKey: 'teto-egen-language-preference'
};

// Setup test environment
window.languageConfig = mockLanguageConfig;

// Mock navigator for browser language detection
const originalNavigator = window.navigator;
Object.defineProperty(window, 'navigator', {
    value: {
        language: 'en-US',
        userLanguage: undefined
    },
    writable: true
});

// Test the language utilities
describe('Language Utilities', () => {
    beforeEach(() => {
        // Reset navigator mock
        window.navigator = {
            language: 'en-US',
            userLanguage: undefined
        };
        
        // Reset current language
        window.languageUtils.setCurrentLanguage(mockLanguageConfig.defaultLanguage);
    });
    
    afterAll(() => {
        // Restore original navigator
        window.navigator = originalNavigator;
    });
    
    test('Should detect browser language correctly', () => {
        // Test with navigator.language
        expect(window.languageUtils.detectBrowserLanguage()).toBe('en');
        
        // Test with navigator.userLanguage
        window.navigator.language = undefined;
        window.navigator.userLanguage = 'ko-KR';
        expect(window.languageUtils.detectBrowserLanguage()).toBe('ko');
        
        // Test fallback when no language is available
        window.navigator.language = undefined;
        window.navigator.userLanguage = undefined;
        expect(window.languageUtils.detectBrowserLanguage()).toBe('en');
    });
    
    test('Should check if a language is supported', () => {
        expect(window.languageUtils.isLanguageSupported('en')).toBe(true);
        expect(window.languageUtils.isLanguageSupported('ko')).toBe(true);
        expect(window.languageUtils.isLanguageSupported('fr')).toBe(false);
        
        // Should handle case insensitivity
        expect(window.languageUtils.isLanguageSupported('EN')).toBe(true);
        expect(window.languageUtils.isLanguageSupported('Ko')).toBe(true);
        
        // Should handle invalid inputs
        expect(window.languageUtils.isLanguageSupported(null)).toBe(false);
        expect(window.languageUtils.isLanguageSupported(undefined)).toBe(false);
        expect(window.languageUtils.isLanguageSupported('')).toBe(false);
    });
    
    test('Should get language details by code', () => {
        const english = window.languageUtils.getLanguageByCode('en');
        expect(english).not.toBeNull();
        expect(english.name).toBe('English');
        expect(english.nativeName).toBe('English');
        expect(english.flag).toBe('gb');
        
        const korean = window.languageUtils.getLanguageByCode('ko');
        expect(korean).not.toBeNull();
        expect(korean.name).toBe('Korean');
        expect(korean.nativeName).toBe('한국어');
        expect(korean.flag).toBe('kr');
        
        // Should handle case insensitivity
        const englishUpper = window.languageUtils.getLanguageByCode('EN');
        expect(englishUpper).not.toBeNull();
        expect(englishUpper.name).toBe('English');
        
        // Should return null for unsupported languages
        expect(window.languageUtils.getLanguageByCode('fr')).toBeNull();
        
        // Should handle invalid inputs
        expect(window.languageUtils.getLanguageByCode(null)).toBeNull();
        expect(window.languageUtils.getLanguageByCode(undefined)).toBeNull();
        expect(window.languageUtils.getLanguageByCode('')).toBeNull();
    });
    
    test('Should get all supported languages', () => {
        const languages = window.languageUtils.getSupportedLanguages();
        expect(languages).toEqual(mockLanguageConfig.supportedLanguages);
        expect(languages.length).toBe(3);
    });
    
    test('Should get the default language', () => {
        const defaultLang = window.languageUtils.getDefaultLanguage();
        expect(defaultLang).not.toBeNull();
        expect(defaultLang.code).toBe('ko');
    });
    
    test('Should get and set the current language', () => {
        // Default should be Korean
        let currentLang = window.languageUtils.getCurrentLanguage();
        expect(currentLang.code).toBe('ko');
        
        // Set to English
        const setLang = window.languageUtils.setCurrentLanguage('en');
        expect(setLang.code).toBe('en');
        
        // Current should now be English
        currentLang = window.languageUtils.getCurrentLanguage();
        expect(currentLang.code).toBe('en');
        
        // Should handle unsupported languages by keeping current
        window.languageUtils.setCurrentLanguage('fr');
        currentLang = window.languageUtils.getCurrentLanguage();
        expect(currentLang.code).toBe('en'); // Still English
    });
    
    test('Should get the best matching language based on browser settings', () => {
        // Browser language is supported
        window.navigator.language = 'en-US';
        let bestLang = window.languageUtils.getBestMatchingLanguage();
        expect(bestLang.code).toBe('en');
        
        // Browser language is not supported
        window.navigator.language = 'fr-FR';
        bestLang = window.languageUtils.getBestMatchingLanguage();
        expect(bestLang.code).toBe('ko'); // Default language
    });
    
    test('Should format dates according to language format', () => {
        const testDate = new Date(2023, 0, 15); // January 15, 2023
        
        // Korean format: YYYY.MM.DD
        window.languageUtils.setCurrentLanguage('ko');
        expect(window.languageUtils.formatDate(testDate)).toBe('2023.01.15');
        
        // English format: MM/DD/YYYY
        window.languageUtils.setCurrentLanguage('en');
        expect(window.languageUtils.formatDate(testDate)).toBe('01/15/2023');
        
        // Arabic format: DD/MM/YYYY
        window.languageUtils.setCurrentLanguage('ar');
        expect(window.languageUtils.formatDate(testDate)).toBe('15/01/2023');
        
        // Should handle invalid inputs
        expect(window.languageUtils.formatDate(null)).toBe('');
        expect(window.languageUtils.formatDate('not a date')).toBe('');
    });
    
    test('Should format numbers according to language format', () => {
        const testNumber = 1234567.89;
        
        // English format: 1,234,567.89
        window.languageUtils.setCurrentLanguage('en');
        expect(window.languageUtils.formatNumber(testNumber)).toBe('1,234,567.89');
        
        // Arabic format: 1٬234٬567٫89
        window.languageUtils.setCurrentLanguage('ar');
        expect(window.languageUtils.formatNumber(testNumber)).toBe('1٬234٬567٫89');
        
        // Test with different decimal places
        window.languageUtils.setCurrentLanguage('en');
        expect(window.languageUtils.formatNumber(testNumber, 0)).toBe('1,234,568');
        expect(window.languageUtils.formatNumber(testNumber, 3)).toBe('1,234,567.890');
        
        // Should handle invalid inputs
        expect(window.languageUtils.formatNumber('not a number')).toBe('');
    });
    
    test('Should check if the current language is RTL', () => {
        // English is LTR
        window.languageUtils.setCurrentLanguage('en');
        expect(window.languageUtils.isRTL()).toBe(false);
        
        // Arabic is RTL
        window.languageUtils.setCurrentLanguage('ar');
        expect(window.languageUtils.isRTL()).toBe(true);
    });
    
    test('Should get the flag code for the current language', () => {
        window.languageUtils.setCurrentLanguage('en');
        expect(window.languageUtils.getCurrentLanguageFlag()).toBe('gb');
        
        window.languageUtils.setCurrentLanguage('ko');
        expect(window.languageUtils.getCurrentLanguageFlag()).toBe('kr');
    });
    
    test('Should get the native name of the current language', () => {
        window.languageUtils.setCurrentLanguage('en');
        expect(window.languageUtils.getCurrentLanguageNativeName()).toBe('English');
        
        window.languageUtils.setCurrentLanguage('ko');
        expect(window.languageUtils.getCurrentLanguageNativeName()).toBe('한국어');
        
        window.languageUtils.setCurrentLanguage('ar');
        expect(window.languageUtils.getCurrentLanguageNativeName()).toBe('العربية');
    });
});