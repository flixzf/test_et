/**
 * 테토-에겐 성격 유형 테스트 코드 분할 및 지연 로딩 모듈
 * 
 * 이 모듈은 애플리케이션의 성능을 최적화하기 위해 코드 분할 및 지연 로딩 기능을 제공합니다.
 * 필요한 시점에 필요한 리소스만 로드하여 초기 로딩 시간을 단축합니다.
 */

// 모듈 상태 관리
const CodeSplitter = {
    loadedModules: {},
    modulePromises: {},
    
    /**
     * 모듈 로드 함수
     * 필요한 시점에 JavaScript 모듈을 동적으로 로드합니다.
     * @param {string} moduleName - 모듈 이름
     * @param {string} modulePath - 모듈 경로
     * @returns {Promise} 모듈 로드 Promise
     */
    loadModule: function(moduleName, modulePath) {
        // 이미 로드된 모듈이면 바로 반환
        if (this.loadedModules[moduleName]) {
            return Promise.resolve(this.loadedModules[moduleName]);
        }
        
        // 이미 로드 중인 모듈이면 진행 중인 Promise 반환
        if (this.modulePromises[moduleName]) {
            return this.modulePromises[moduleName];
        }
        
        // 새 모듈 로드
        console.log(`모듈 로드 중: ${moduleName}`);
        
        this.modulePromises[moduleName] = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = modulePath;
            script.async = true;
            
            script.onload = () => {
                console.log(`모듈 로드 완료: ${moduleName}`);
                
                // 모듈 이름에 따라 적절한 전역 객체 생성
                let moduleObject;
                
                if (moduleName === 'questionModule') {
                    // questions.js 파일이 로드된 경우
                    moduleObject = {
                        questions: window.questions || [],
                        QUESTION_CATEGORIES: window.QUESTION_CATEGORIES || {},
                        PERSONALITY_TYPES: window.PERSONALITY_TYPES || {},
                        personalityCharacteristics: window.personalityCharacteristics || {},
                        personalityDescriptions: window.personalityDescriptions || {},
                        getQuestions: function() { return this.questions; }
                    };
                    window.questionModule = moduleObject;
                } 
                else if (moduleName === 'scoreCalculator') {
                    // score-calculator.js 파일이 로드된 경우
                    moduleObject = {
                        calculateSurveyResult: window.calculateSurveyResult || function(){},
                        combineResults: window.combineResults || function(){},
                        determinePersonalityType: window.determinePersonalityType || function(){},
                        calculateScores: function(responses) {
                            return this.calculateSurveyResult(responses);
                        },
                        getMockAnalysisResult: function() {
                            return {
                                tetoScore: 70,
                                egenScore: 30,
                                masculinityScore: 65,
                                femininityScore: 35,
                                confidence: 0.8
                            };
                        }
                    };
                    window.scoreCalculator = moduleObject;
                }
                else {
                    // 기타 모듈의 경우 전역 네임스페이스에서 찾기
                    moduleObject = window[moduleName] || {};
                }
                
                this.loadedModules[moduleName] = moduleObject;
                resolve(moduleObject);
            };
            
            script.onerror = (error) => {
                console.error(`모듈 로드 실패: ${moduleName}`, error);
                delete this.modulePromises[moduleName];
                reject(new Error(`모듈 로드 실패: ${moduleName}`));
            };
            
            document.head.appendChild(script);
        });
        
        return this.modulePromises[moduleName];
    },
    
    /**
     * 모듈 사전 로드 함수
     * 사용자가 특정 기능을 사용할 가능성이 높을 때 미리 모듈을 로드합니다.
     * @param {string} moduleName - 모듈 이름
     * @param {string} modulePath - 모듈 경로
     */
    preloadModule: function(moduleName, modulePath) {
        // 이미 로드된 모듈이면 무시
        if (this.loadedModules[moduleName] || this.modulePromises[moduleName]) {
            return;
        }
        
        // 링크 프리로드 태그 추가
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'script';
        link.href = modulePath;
        document.head.appendChild(link);
        
        console.log(`모듈 사전 로드: ${moduleName}`);
    },
    
    /**
     * 리소스 사전 로드 함수
     * 필요한 리소스(이미지, 폰트 등)를 미리 로드합니다.
     * @param {string} resourcePath - 리소스 경로
     * @param {string} resourceType - 리소스 유형 ('image', 'font', 'style', 'fetch')
     */
    preloadResource: function(resourcePath, resourceType) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resourcePath;
        
        switch (resourceType) {
            case 'image':
                link.as = 'image';
                break;
            case 'font':
                link.as = 'font';
                link.crossOrigin = 'anonymous';
                break;
            case 'style':
                link.as = 'style';
                break;
            case 'fetch':
                link.as = 'fetch';
                break;
            default:
                console.warn(`알 수 없는 리소스 유형: ${resourceType}`);
                return;
        }
        
        document.head.appendChild(link);
        console.log(`리소스 사전 로드: ${resourcePath} (${resourceType})`);
    },
    
    /**
     * 화면 전환 시 필요한 모듈 로드
     * @param {string} screenName - 화면 이름
     * @returns {Promise} 모듈 로드 Promise
     */
    loadScreenModules: function(screenName) {
        switch (screenName) {
            case 'start':
                // 시작 화면에는 추가 모듈이 필요 없음
                return Promise.resolve();
                
            case 'survey':
                // 설문 화면에 필요한 모듈
                return Promise.all([
                    this.loadModule('questionModule', 'assets/js/questions.js'),
                    this.loadModule('scoreCalculator', 'assets/js/score-calculator.js')
                ]);
                
            case 'photo':
                // 사진 업로드 화면에 필요한 모듈
                return Promise.all([
                    this.loadModule('cameraAccess', 'assets/js/camera-access.js'),
                    this.loadModule('faceDetection', 'assets/js/face-detection.js')
                ]);
                
            case 'result':
                // 결과 화면에 필요한 모듈
                return Promise.all([
                    this.loadModule('aiModel', 'assets/js/ai-model.js'),
                    this.loadModule('shareFunctions', 'assets/js/share-functions.js'),
                    this.loadModule('showResult', 'assets/js/new-show-result.js')
                ]);
                
            default:
                console.warn(`알 수 없는 화면: ${screenName}`);
                return Promise.resolve();
        }
    },
    
    /**
     * 다음 화면 사전 로드
     * 현재 화면에서 다음에 이동할 가능성이 높은 화면의 리소스를 미리 로드합니다.
     * @param {string} currentScreen - 현재 화면 이름
     */
    preloadNextScreen: function(currentScreen) {
        switch (currentScreen) {
            case 'start':
                // 시작 화면에서는 설문 화면 사전 로드
                this.preloadModule('questionModule', 'assets/js/questions.js');
                break;
                
            case 'survey':
                // 설문 화면에서는 사진 업로드 화면 사전 로드
                this.preloadModule('cameraAccess', 'assets/js/camera-access.js');
                break;
                
            case 'photo':
                // 사진 업로드 화면에서는 결과 화면 사전 로드
                this.preloadModule('aiModel', 'assets/js/ai-model.js');
                this.preloadModule('showResult', 'assets/js/new-show-result.js');
                break;
        }
    },
    
    /**
     * 중요 리소스 사전 로드
     * 애플리케이션에서 중요한 리소스를 미리 로드합니다.
     */
    preloadCriticalResources: function() {
        // 중요 이미지 사전 로드
        this.preloadResource('assets/images/main-image.jpg', 'image');
        this.preloadResource('assets/images/테토남.png', 'image');
        this.preloadResource('assets/images/테토녀.png', 'image');
        this.preloadResource('assets/images/에겐남.png', 'image');
        this.preloadResource('assets/images/에겐녀.png', 'image');
    },
    
    /**
     * 초기화 함수
     */
    init: function() {
        // 시작 화면에서 필요한 모듈을 즉시 로드
        if (document.querySelector('#start-screen.active')) {
            this.loadModule('questionModule', 'assets/js/questions.js');
            this.loadModule('scoreCalculator', 'assets/js/score-calculator.js');
        }
        
        console.log('코드 분할 및 지연 로딩 모듈 초기화 완료');
    }
};

// 전역 객체로 내보내기
window.codeSplitter = CodeSplitter;

// DOMContentLoaded 이벤트에서 초기화
document.addEventListener('DOMContentLoaded', () => {
    CodeSplitter.init();
});