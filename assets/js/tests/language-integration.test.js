/**
 * Integration tests for the language dropdown feature
 */

// Mock dependencies
const mockLanguageConfig = {
    defaultLanguage: 'ko',
    supportedLanguages: [
        { code: 'en', name: 'English', nativeName: 'English', flag: 'gb', rtl: false },
        { code: 'ko', name: 'Korean', nativeName: '한국어', flag: 'kr', rtl: false },
        { code: 'es', name: 'Spanish', nativeName: 'Español', flag: 'es', rtl: false },
        { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: 'sa', rtl: true }
    ],
    translationFilePath: 'assets/languages/{lang}.json',
    storageKey: 'teto-egen-language-preference'
};

// Mock translations
const mockTranslations = {
    'en': {
        app: {
            title: 'Teto-Egen Personality Test',
            description: 'Discover your Teto-Egen personality type!'
        },
        startScreen: {
            mainTitle: 'Teto-Egen Personality Test',
            intro: 'Find out if you are Teto Male, Teto Female, Egen Male, or Egen Female through a survey and facial analysis!',
            startButton: 'Start Test'
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
        }
    },
    'es': {
        app: {
            title: 'Test de Personalidad Teto-Egen',
            description: '¡Descubre tu tipo de personalidad Teto-Egen!'
        },
        startScreen: {
            mainTitle: 'Test de Personalidad Teto-Egen',
            intro: '¡Descubre si eres Teto Masculino, Teto Femenino, Egen Masculino o Egen Femenino a través de una encuesta y análisis facial!',
            startButton: 'Iniciar Test'
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
        }
    }
};

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

// Mock fetch API
window.fetch = jest.fn((url) => {
    // Extract language code from URL
    const langMatch = url.match(/\/([a-z]{2})\.json$/);
    const langCode = langMatch ? langMatch[1] : 'ko';
    
    return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTranslations[langCode] || mockTranslations['ko'])
    });
});

// Setup test environment
function setupTestEnvironment() {
    // Clear localStorage
    mockLocalStorage.clear();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock DOM
    document.body.innerHTML = `
        <div id="language-dropdown-container"></div>
        <div id="content">
            <h1 data-i18n="app.title">Test Title</h1>
            <p data-i18n="startScreen.intro">Test Intro</p>
            <button data-i18n="startScreen.startButton">Test Button</button>
        </div>
    `;
    
    // Set document title
    document.documentElement.setAttribute('data-i18n-title', 'app.title');
    document.title = 'Test Title';
    
    // Initialize global objects
    window.languageConfig = mockLanguageConfig;
    
    // Initialize language modules
    window.languageUtils.setCurrentLanguage(mockLanguageConfig.defaultLanguage);
}

// Integration tests
describe('Language Dropdown Integration', () => {
    beforeEach(() => {
        setupTestEnvironment();
        
        // Initialize all language modules
        return window.languageTranslator.init()
            .then(() => {
                // Initialize language dropdown
                window.languageDropdown.init('language-dropdown-container');
            });
    });
    
    test('Should initialize language dropdown with correct structure', () => {
        const container = document.getElementById('language-dropdown-container');
        
        // Check if dropdown was created
        const dropdown = container.querySelector('.language-dropdown');
        expect(dropdown).not.toBeNull();
        
        // Check dropdown button
        const button = dropdown.querySelector('.dropdown-toggle');
        expect(button).not.toBeNull();
        expect(button.getAttribute('id')).toBe('languageDropdown');
        
        // Check flag icon
        const flagIcon = button.querySelector('.flag-icon');
        expect(flagIcon).not.toBeNull();
        expect(flagIcon.getAttribute('src')).toContain('kr.svg');
        
        // Check language name
        const langName = button.querySelector('.language-name');
        expect(langName).not.toBeNull();
        expect(langName.textContent).toBe('한국어');
        
        // Check dropdown menu
        const menu = dropdown.querySelector('.dropdown-menu');
        expect(menu).not.toBeNull();
        
        // Check menu items (should have one for each supported language)
        const menuItems = menu.querySelectorAll('.dropdown-item');
        expect(menuItems.length).toBe(mockLanguageConfig.supportedLanguages.length);
        
        // Check active state of current language
        const activeItem = menu.querySelector('.dropdown-item.active');
        expect(activeItem).not.toBeNull();
        expect(activeItem.getAttribute('data-language')).toBe('ko');
    });
    
    test('Should change language when dropdown item is clicked', () => {
        // Find English language option
        const englishOption = document.querySelector('.dropdown-item[data-language="en"]');
        expect(englishOption).not.toBeNull();
        
        // Simulate click
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        englishOption.dispatchEvent(clickEvent);
        
        // Wait for language change to complete
        return new Promise(resolve => setTimeout(resolve, 100))
            .then(() => {
                // Check if language was changed
                expect(window.languageUtils.getCurrentLanguage().code).toBe('en');
                
                // Check if translations were applied
                const titleElement = document.querySelector('[data-i18n="app.title"]');
                expect(titleElement.textContent).toBe('Teto-Egen Personality Test');
                
                // Check if dropdown was updated
                const flagIcon = document.querySelector('.language-dropdown .flag-icon');
                expect(flagIcon.getAttribute('src')).toContain('gb.svg');
                
                const langName = document.querySelector('.language-dropdown .language-name');
                expect(langName.textContent).toBe('English');
                
                // Check if active state was updated
                const activeItem = document.querySelector('.dropdown-item.active');
                expect(activeItem).not.toBeNull();
                expect(activeItem.getAttribute('data-language')).toBe('en');
                
                // Check if language preference was saved
                expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                    mockLanguageConfig.storageKey,
                    'en'
                );
            });
    });
    
    test('Should persist language preference across page loads', () => {
        // Set language preference
        mockLocalStorage._setItem(mockLanguageConfig.storageKey, 'es');
        
        // Simulate page reload
        setupTestEnvironment();
        
        // Initialize language modules again
        return window.languageTranslator.init()
            .then(() => {
                // Initialize language dropdown
                window.languageDropdown.init('language-dropdown-container');
                
                // Check if saved language was loaded
                expect(window.languageUtils.getCurrentLanguage().code).toBe('es');
                
                // Check if translations were applied
                const titleElement = document.querySelector('[data-i18n="app.title"]');
                expect(titleElement.textContent).toBe('Test de Personalidad Teto-Egen');
                
                // Check if dropdown was updated
                const flagIcon = document.querySelector('.language-dropdown .flag-icon');
                expect(flagIcon.getAttribute('src')).toContain('es.svg');
                
                const langName = document.querySelector('.language-dropdown .language-name');
                expect(langName.textContent).toBe('Español');
            });
    });
    
    test('Should handle RTL languages correctly', () => {
        // Find Arabic language option
        const arabicOption = document.querySelector('.dropdown-item[data-language="ar"]');
        expect(arabicOption).not.toBeNull();
        
        // Simulate click
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        arabicOption.dispatchEvent(clickEvent);
        
        // Wait for language change to complete
        return new Promise(resolve => setTimeout(resolve, 100))
            .then(() => {
                // Check if language was changed
                expect(window.languageUtils.getCurrentLanguage().code).toBe('ar');
                
                // Check if document direction was updated
                expect(document.documentElement.dir).toBe('rtl');
                
                // Change back to LTR language
                const englishOption = document.querySelector('.dropdown-item[data-language="en"]');
                englishOption.dispatchEvent(clickEvent);
                
                return new Promise(resolve => setTimeout(resolve, 100));
            })
            .then(() => {
                // Check if document direction was updated back
                expect(document.documentElement.dir).toBe('ltr');
            });
    });
    
    test('Should detect browser language on first load', () => {
        // Clear any saved preference
        mockLocalStorage.clear();
        
        // Set browser language to Spanish
        Object.defineProperty(window.navigator, 'language', {
            value: 'es-ES',
            configurable: true
        });
        
        // Simulate first page load
        setupTestEnvironment();
        
        // Initialize language modules again
        return window.languageTranslator.init()
            .then(() => {
                // Initialize language dropdown
                window.languageDropdown.init('language-dropdown-container');
                
                // Check if browser language was detected
                expect(window.languageUtils.getCurrentLanguage().code).toBe('es');
                
                // Check if translations were applied
                const titleElement = document.querySelector('[data-i18n="app.title"]');
                expect(titleElement.textContent).toBe('Test de Personalidad Teto-Egen');
            });
    });
    
    test('Should fall back to default language if browser language is not supported', () => {
        // Clear any saved preference
        mockLocalStorage.clear();
        
        // Set browser language to an unsupported language
        Object.defineProperty(window.navigator, 'language', {
            value: 'fr-FR',
            configurable: true
        });
        
        // Simulate first page load
        setupTestEnvironment();
        
        // Initialize language modules again
        return window.languageTranslator.init()
            .then(() => {
                // Initialize language dropdown
                window.languageDropdown.init('language-dropdown-container');
                
                // Check if default language was used
                expect(window.languageUtils.getCurrentLanguage().code).toBe('ko');
                
                // Check if translations were applied
                const titleElement = document.querySelector('[data-i18n="app.title"]');
                expect(titleElement.textContent).toBe('테토-에겐 성격 유형 테스트');
            });
    });
});