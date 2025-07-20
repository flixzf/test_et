/**
 * Tests for the language translator module
 */

// Mock dependencies
const mockLanguageConfig = {
    defaultLanguage: 'ko',
    supportedLanguages: [
        { code: 'en', name: 'English', nativeName: 'English', flag: 'gb', rtl: false },
        { code: 'ko', name: 'Korean', nativeName: '한국어', flag: 'kr', rtl: false },
        { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: 'sa', rtl: true }
    ],
    translationFilePath: 'assets/languages/{lang}.json',
    storageKey: 'teto-egen-language-preference'
};

const mockLanguageUtils = {
    getCurrentLanguage: () => ({ code: 'ko', name: 'Korean', nativeName: '한국어', flag: 'kr', rtl: false }),
    setCurrentLanguage: (langCode) => {
        const lang = mockLanguageConfig.supportedLanguages.find(l => l.code === langCode) || 
                    mockLanguageConfig.supportedLanguages.find(l => l.code === mockLanguageConfig.defaultLanguage);
        mockLanguageUtils.getCurrentLanguage = () => lang;
        return lang;
    },
    detectBrowserLanguage: () => 'en',
    isLanguageSupported: (code) => mockLanguageConfig.supportedLanguages.some(l => l.code === code),
    isRTL: () => mockLanguageUtils.getCurrentLanguage().rtl === true
};

const mockLanguageLoader = {
    getTranslations: (langCode) => {
        // Mock translations for testing
        const translations = {
            'en': {
                app: {
                    title: 'Teto-Egen Personality Test',
                    description: 'Discover your Teto-Egen personality type!'
                },
                startScreen: {
                    mainTitle: 'Teto-Egen Personality Test',
                    intro: 'Find out if you are Teto Male, Teto Female, Egen Male, or Egen Female through a survey and facial analysis!',
                    startButton: 'Start Test'
                },
                personalityTypes: {
                    tetoMale: 'Teto Male',
                    tetoFemale: 'Teto Female',
                    egenMale: 'Egen Male',
                    egenFemale: 'Egen Female'
                },
                params: {
                    welcome: 'Welcome, {name}!',
                    score: 'Your score: {score}'
                }
            },
            'ko': {
                app: {
                    title: '테토-에겐 성격 유형 테스트',
                    description: '당신의 테토-에겐 성격 유형을 알아보세요!'
                },
                startScreen: {
                    mainTitle: '테토-에겐 성격 유형 테스트',
                    intro: '설문조사와 얼굴 사진을 통해 당신이 테토남, 테토녀, 에겐남, 에겐녀 중 어떤 유형인지 알아보세요!',
                    startButton: '테스트 시작하기'
                },
                personalityTypes: {
                    tetoMale: '테토남',
                    tetoFemale: '테토녀',
                    egenMale: '에겐남',
                    egenFemale: '에겐녀'
                },
                params: {
                    welcome: '환영합니다, {name}님!',
                    score: '당신의 점수: {score}'
                }
            },
            'ar': {
                app: {
                    title: 'اختبار شخصية تيتو-إيجن',
                    description: 'اكتشف نوع شخصيتك تيتو-إيجن!'
                },
                startScreen: {
                    mainTitle: 'اختبار شخصية تيتو-إيجن',
                    intro: 'اكتشف ما إذا كنت تيتو ذكر، تيتو أنثى، إيجن ذكر، أو إيجن أنثى من خلال استبيان وتحليل الوجه!',
                    startButton: 'ابدأ الاختبار'
                },
                personalityTypes: {
                    tetoMale: 'تيتو ذكر',
                    tetoFemale: 'تيتو أنثى',
                    egenMale: 'إيجن ذكر',
                    egenFemale: 'إيجن أنثى'
                },
                params: {
                    welcome: 'مرحبًا، {name}!',
                    score: 'نتيجتك: {score}'
                }
            }
        };
        
        return Promise.resolve(translations[langCode] || translations[mockLanguageConfig.defaultLanguage]);
    },
    preloadLikelyLanguages: () => Promise.resolve()
};

const mockLanguageStorage = {
    saveLanguagePreference: jest.fn().mockReturnValue(true),
    getSavedLanguagePreference: jest.fn().mockReturnValue('ko'),
    clearLanguagePreference: jest.fn().mockReturnValue(true),
    getPreferredLanguage: jest.fn().mockReturnValue('ko'),
    initializeLanguage: jest.fn().mockReturnValue({ code: 'ko', name: 'Korean', nativeName: '한국어', flag: 'kr', rtl: false })
};

// Setup test environment
window.languageConfig = mockLanguageConfig;
window.languageUtils = mockLanguageUtils;
window.languageLoader = mockLanguageLoader;
window.languageStorage = mockLanguageStorage;

// Mock DOM elements for translation
function setupMockDOM() {
    // Clear any existing elements
    document.body.innerHTML = '';
    
    // Create test elements
    document.body.innerHTML = `
        <div id="test-container">
            <h1 data-i18n="app.title">Test Title</h1>
            <p data-i18n="startScreen.intro">Test Intro</p>
            <button data-i18n="startScreen.startButton">Test Button</button>
            <span data-i18n="params.welcome" data-i18n-param-name="John">Welcome</span>
            <input type="text" data-i18n="startScreen.startButton" data-i18n-attr="placeholder">
            <img src="test.jpg" data-i18n="app.title" data-i18n-target="alt">
        </div>
    `;
    
    // Set document title
    document.documentElement.setAttribute('data-i18n-title', 'app.title');
    document.title = 'Test Title';
}

// Test the language translator
describe('Language Translator', () => {
    beforeEach(() => {
        // Setup mock DOM
        setupMockDOM();
        
        // Reset mocks
        jest.clearAllMocks();
        
        // Initialize translator with Korean language
        return window.languageTranslator.init();
    });
    
    test('Should translate a string correctly', () => {
        const translated = window.languageTranslator.translate('app.title');
        expect(translated).toBe('테토-에겐 성격 유형 테스트');
    });
    
    test('Should handle nested translation keys', () => {
        const translated = window.languageTranslator.translate('personalityTypes.tetoMale');
        expect(translated).toBe('테토남');
    });
    
    test('Should substitute parameters in translations', () => {
        const translated = window.languageTranslator.translate('params.welcome', { name: 'John' });
        expect(translated).toBe('환영합니다, John님!');
        
        const scoreTranslated = window.languageTranslator.translate('params.score', { score: 85 });
        expect(scoreTranslated).toBe('당신의 점수: 85');
    });
    
    test('Should return the key if translation is not found', () => {
        const nonExistentKey = 'nonexistent.key';
        const translated = window.languageTranslator.translate(nonExistentKey);
        expect(translated).toBe(nonExistentKey);
    });
    
    test('Should apply translations to DOM elements', () => {
        // Apply translations
        window.languageTranslator.applyTranslations();
        
        // Check if elements are translated
        const titleElement = document.querySelector('[data-i18n="app.title"]');
        expect(titleElement.textContent).toBe('테토-에겐 성격 유형 테스트');
        
        const introElement = document.querySelector('[data-i18n="startScreen.intro"]');
        expect(introElement.textContent).toBe('설문조사와 얼굴 사진을 통해 당신이 테토남, 테토녀, 에겐남, 에겐녀 중 어떤 유형인지 알아보세요!');
        
        const buttonElement = document.querySelector('[data-i18n="startScreen.startButton"]');
        expect(buttonElement.textContent).toBe('테스트 시작하기');
        
        // Check document title
        expect(document.title).toBe('테토-에겐 성격 유형 테스트');
    });
    
    test('Should handle parameter substitution in DOM elements', () => {
        // Apply translations
        window.languageTranslator.applyTranslations();
        
        // Check if parameters are substituted
        const welcomeElement = document.querySelector('[data-i18n="params.welcome"]');
        expect(welcomeElement.textContent).toBe('환영합니다, John님!');
    });
    
    test('Should handle special attributes for different element types', () => {
        // Apply translations
        window.languageTranslator.applyTranslations();
        
        // Check input placeholder
        const inputElement = document.querySelector('input[data-i18n-attr="placeholder"]');
        expect(inputElement.placeholder).toBe('테스트 시작하기');
        
        // Check img alt attribute
        const imgElement = document.querySelector('img[data-i18n-target="alt"]');
        expect(imgElement.alt).toBe('테토-에겐 성격 유형 테스트');
    });
    
    test('Should change language and update translations', async () => {
        // Change to English
        await window.languageTranslator.changeLanguage('en');
        
        // Check if language was changed
        expect(window.languageUtils.getCurrentLanguage().code).toBe('en');
        
        // Check if translations were updated
        const titleElement = document.querySelector('[data-i18n="app.title"]');
        expect(titleElement.textContent).toBe('Teto-Egen Personality Test');
        
        // Check if language preference was saved
        expect(window.languageStorage.saveLanguagePreference).toHaveBeenCalledWith('en');
    });
    
    test('Should handle RTL languages', async () => {
        // Change to Arabic (RTL language)
        await window.languageTranslator.changeLanguage('ar');
        
        // Check if document direction was updated
        expect(document.documentElement.dir).toBe('rtl');
        
        // Change back to LTR language
        await window.languageTranslator.changeLanguage('en');
        
        // Check if document direction was updated
        expect(document.documentElement.dir).toBe('ltr');
    });
    
    test('Should handle fallback for missing translations', async () => {
        // Add a test element with a key that doesn't exist in any language
        const testElement = document.createElement('div');
        testElement.setAttribute('data-i18n', 'nonexistent.key');
        document.body.appendChild(testElement);
        
        // Apply translations
        window.languageTranslator.applyTranslations();
        
        // The element should show the key itself as fallback
        expect(testElement.textContent).toBe('nonexistent.key');
    });
    
    test('Should clear translation cache', () => {
        // Translate something to populate cache
        window.languageTranslator.translate('app.title');
        
        // Get initial cache size
        const initialCacheSize = window.languageTranslator.getTranslationCacheSize();
        expect(initialCacheSize).toBeGreaterThan(0);
        
        // Clear cache
        window.languageTranslator.clearTranslationCache();
        
        // Check if cache was cleared
        expect(window.languageTranslator.getTranslationCacheSize()).toBe(0);
    });
    
    test('Should invalidate element cache when DOM changes', () => {
        // Apply translations initially
        window.languageTranslator.applyTranslations();
        
        // Add a new element
        const newElement = document.createElement('div');
        newElement.setAttribute('data-i18n', 'app.description');
        document.body.appendChild(newElement);
        
        // Invalidate cache and refresh translations
        window.languageTranslator.invalidateCache();
        window.languageTranslator.refreshTranslations();
        
        // Check if the new element was translated
        expect(newElement.textContent).toBe('당신의 테토-에겐 성격 유형을 알아보세요!');
    });
});