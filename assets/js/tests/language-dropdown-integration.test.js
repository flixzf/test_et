/**
 * 테토-에겐 성격 유형 테스트 - 언어 드롭다운 통합 테스트
 */

// 테스트 프레임워크 사용
const { describe, it, expect, beforeEach } = window.testFramework;

// 언어 드롭다운 통합 테스트
describe('언어 드롭다운 통합 테스트', function() {
    // 테스트 환경 설정
    beforeEach(function() {
        // 테스트용 DOM 설정
        document.body.innerHTML = `
            <div id="language-dropdown-container"></div>
            <div id="content">
                <h1 data-i18n="app.title">테스트 제목</h1>
                <p data-i18n="startScreen.intro">테스트 소개</p>
                <button data-i18n="startScreen.startButton">테스트 버튼</button>
            </div>
        `;
        
        // 문서 제목 설정
        document.documentElement.setAttribute('data-i18n-title', 'app.title');
        document.title = '테스트 제목';
        
        // 로컬 스토리지 초기화
        localStorage.clear();
    });
    
    // 언어 드롭다운 초기화 테스트
    it('언어 드롭다운이 올바르게 초기화되어야 함', function() {
        // 필요한 모듈 로드 확인
        expect(window.languageDropdown).toBeTruthy();
        expect(window.languageTranslator).toBeTruthy();
        expect(window.languageUtils).toBeTruthy();
        expect(window.languageStorage).toBeTruthy();
        expect(window.languageLoader).toBeTruthy();
        
        // 언어 드롭다운 초기화
        window.languageDropdown.init('language-dropdown-container');
        
        // 드롭다운 요소 확인
        const container = document.getElementById('language-dropdown-container');
        const dropdown = container.querySelector('.language-dropdown');
        expect(dropdown).toBeTruthy();
        
        // 드롭다운 버튼 확인
        const button = dropdown.querySelector('.dropdown-toggle');
        expect(button).toBeTruthy();
        expect(button.getAttribute('id')).toBe('languageDropdown');
        
        // 국기 아이콘 확인
        const flagIcon = button.querySelector('.flag-icon');
        expect(flagIcon).toBeTruthy();
        
        // 언어 이름 확인
        const langName = button.querySelector('.language-name');
        expect(langName).toBeTruthy();
        
        // 드롭다운 메뉴 확인
        const menu = dropdown.querySelector('.dropdown-menu');
        expect(menu).toBeTruthy();
        
        // 메뉴 항목 확인
        const menuItems = menu.querySelectorAll('.dropdown-item');
        expect(menuItems.length).toBeGreaterThan(0);
    });
    
    // 언어 전환 테스트
    it('언어 선택 시 인터페이스가 올바르게 업데이트되어야 함', function() {
        // 언어 드롭다운 초기화
        window.languageDropdown.init('language-dropdown-container');
        
        // 현재 언어 확인
        const initialLang = window.languageUtils.getCurrentLanguage();
        
        // 다른 언어로 변경
        const targetLangCode = initialLang.code === 'en' ? 'ko' : 'en';
        window.languageTranslator.changeLanguage(targetLangCode);
        
        // 언어가 변경되었는지 확인
        const newLang = window.languageUtils.getCurrentLanguage();
        expect(newLang.code).toBe(targetLangCode);
        
        // 드롭다운이 업데이트되었는지 확인
        const flagIcon = document.querySelector('.language-dropdown .flag-icon');
        expect(flagIcon.getAttribute('src')).toContain(newLang.flag);
        
        const langName = document.querySelector('.language-dropdown .language-name');
        expect(langName.textContent).toBe(newLang.nativeName);
        
        // 활성 상태가 업데이트되었는지 확인
        const activeItem = document.querySelector('.dropdown-item.active');
        expect(activeItem).toBeTruthy();
        expect(activeItem.getAttribute('data-language')).toBe(targetLangCode);
    });
    
    // 언어 선호도 저장 테스트
    it('선택한 언어 선호도가 로컬 스토리지에 저장되어야 함', function() {
        // 언어 드롭다운 초기화
        window.languageDropdown.init('language-dropdown-container');
        
        // 언어 변경
        const targetLangCode = 'en';
        window.languageTranslator.changeLanguage(targetLangCode);
        
        // 로컬 스토리지에 저장되었는지 확인
        const savedLang = localStorage.getItem(window.languageConfig.storageKey);
        expect(savedLang).toBe(targetLangCode);
    });
    
    // 페이지 로드 시 언어 선호도 복원 테스트
    it('페이지 로드 시 저장된 언어 선호도가 복원되어야 함', function() {
        // 언어 선호도 저장
        const targetLangCode = 'es';
        localStorage.setItem(window.languageConfig.storageKey, targetLangCode);
        
        // 언어 초기화 (페이지 로드 시뮬레이션)
        const language = window.languageStorage.initializeLanguage();
        
        // 저장된 언어가 로드되었는지 확인
        expect(language.code).toBe(targetLangCode);
        
        // 언어 드롭다운 초기화
        window.languageTranslator.init().then(() => {
            window.languageDropdown.init('language-dropdown-container');
            
            // 드롭다운이 올바른 언어로 업데이트되었는지 확인
            const flagIcon = document.querySelector('.language-dropdown .flag-icon');
            expect(flagIcon.getAttribute('src')).toContain(language.flag);
            
            const langName = document.querySelector('.language-dropdown .language-name');
            expect(langName.textContent).toBe(language.nativeName);
        });
    });
    
    // RTL 언어 지원 테스트
    it('RTL 언어 선택 시 문서 방향이 올바르게 설정되어야 함', function() {
        // 언어 드롭다운 초기화
        window.languageDropdown.init('language-dropdown-container');
        
        // RTL 언어로 변경 (아랍어)
        window.languageTranslator.changeLanguage('ar');
        
        // 문서 방향이 RTL로 설정되었는지 확인
        expect(document.documentElement.dir).toBe('rtl');
        
        // LTR 언어로 다시 변경
        window.languageTranslator.changeLanguage('en');
        
        // 문서 방향이 LTR로 설정되었는지 확인
        expect(document.documentElement.dir).toBe('ltr');
    });
    
    // 브라우저 언어 감지 테스트
    it('브라우저 언어가 올바르게 감지되어야 함', function() {
        // 원래 navigator 저장
        const originalNavigator = window.navigator;
        
        // navigator 모의 설정
        Object.defineProperty(window, 'navigator', {
            value: {
                language: 'es-ES',
                userLanguage: undefined
            },
            configurable: true
        });
        
        // 브라우저 언어 감지
        const detectedLang = window.languageUtils.detectBrowserLanguage();
        
        // 감지된 언어 확인
        expect(detectedLang).toBe('es');
        
        // navigator 복원
        window.navigator = originalNavigator;
    });
    
    // 번역 적용 테스트
    it('번역이 DOM 요소에 올바르게 적용되어야 함', function() {
        // 언어 초기화
        window.languageTranslator.init().then(() => {
            // 번역 적용
            window.languageTranslator.applyTranslations();
            
            // 번역이 적용되었는지 확인
            const titleElement = document.querySelector('[data-i18n="app.title"]');
            expect(titleElement.textContent).not.toBe('테스트 제목');
            
            const introElement = document.querySelector('[data-i18n="startScreen.intro"]');
            expect(introElement.textContent).not.toBe('테스트 소개');
            
            const buttonElement = document.querySelector('[data-i18n="startScreen.startButton"]');
            expect(buttonElement.textContent).not.toBe('테스트 버튼');
            
            // 문서 제목 확인
            expect(document.title).not.toBe('테스트 제목');
        });
    });
});