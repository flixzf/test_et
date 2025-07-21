/**
 * 테토-에겐 성격 유형 테스트 오류 처리 모듈
 * 
 * 이 모듈은 네트워크 오류, 리소스 로딩 오류, 사용자 입력 오류 등을 처리하는 기능을 제공합니다.
 */

const ErrorHandler = {
    // 오류 메시지 저장소
    errorMessages: {
        network: {
            offline: "인터넷 연결이 끊어졌습니다. 연결을 확인하고 다시 시도해 주세요.",
            timeout: "서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.",
            serverError: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
        },
        resource: {
            imageLoad: "이미지를 불러오는 중 오류가 발생했습니다.",
            scriptLoad: "필요한 스크립트를 불러오는 중 오류가 발생했습니다.",
            modelLoad: "AI 모델을 불러오는 중 오류가 발생했습니다."
        },
        input: {
            required: "필수 입력 항목입니다.",
            invalidFormat: "올바른 형식이 아닙니다.",
            fileSize: "파일 크기가 너무 큽니다. 5MB 이하의 파일을 업로드해 주세요.",
            fileType: "지원하지 않는 파일 형식입니다. JPG, PNG, WEBP 형식만 지원합니다.",
            noFace: "얼굴을 인식할 수 없습니다. 다른 사진을 업로드해 주세요."
        },
        general: {
            unknown: "알 수 없는 오류가 발생했습니다. 페이지를 새로고침하고 다시 시도해 주세요.",
            browserSupport: "현재 브라우저에서는 일부 기능이 제대로 작동하지 않을 수 있습니다. 최신 Chrome, Firefox, Safari, Edge 브라우저를 사용해 주세요."
        }
    },
    
    // 활성화된 오류 알림 목록
    activeNotifications: [],
    
    /**
     * 네트워크 상태 모니터링 설정
     */
    setupNetworkMonitoring: function() {
        // 오프라인 상태 감지
        window.addEventListener('offline', () => {
            this.showError('network', 'offline');
        });
        
        // 온라인 상태 감지
        window.addEventListener('online', () => {
            this.hideError('network', 'offline');
            this.showSuccess('인터넷 연결이 복구되었습니다.');
        });
        
        // 초기 네트워크 상태 확인
        if (!navigator.onLine) {
            this.showError('network', 'offline');
        }
    },
    
    /**
     * 리소스 로딩 오류 처리 설정
     */
    setupResourceErrorHandling: function() {
        // 이미지 로딩 오류 처리
        document.addEventListener('error', (event) => {
            const target = event.target;
            
            // 이미지 로딩 오류
            if (target.tagName === 'IMG') {
                handleImageError(event, target.src);
                
                // 중요한 이미지인 경우 오류 표시
                if (target.classList.contains('critical-image')) {
                    this.showError('resource', 'imageLoad');
                }
                
                // 대체 이미지 표시 (data URI 사용)
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuydtOuvuOyngCDsl4bsnYw8L3RleHQ+PC9zdmc+';
                target.classList.add('image-load-error');
            }
        }, true); // 캡처 단계에서 이벤트 처리
        
        // 스크립트 로딩 오류 처리
        window.addEventListener('error', (event) => {
            if (event.target && event.target.tagName === 'SCRIPT') {
                console.error('스크립트 로딩 오류:', event.target.src);
                this.showError('resource', 'scriptLoad');
            }
        }, true); // 캡처 단계에서 이벤트 처리
    },
    
    /**
     * 사용자 입력 검증
     * @param {HTMLElement} inputElement - 입력 요소
     * @param {string} validationType - 검증 유형 ('required', 'email', 'number', 등)
     * @param {Object} options - 추가 옵션
     * @returns {boolean} 검증 결과
     */
    validateInput: function(inputElement, validationType, options = {}) {
        const value = inputElement.value.trim();
        let isValid = true;
        let errorType = '';
        
        switch (validationType) {
            case 'required':
                isValid = value !== '';
                errorType = 'required';
                break;
                
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = emailRegex.test(value);
                errorType = 'invalidFormat';
                break;
                
            case 'number':
                const numberRegex = /^[0-9]+$/;
                isValid = numberRegex.test(value);
                errorType = 'invalidFormat';
                break;
                
            case 'file':
                if (!inputElement.files || !inputElement.files[0]) {
                    isValid = false;
                    errorType = 'required';
                    break;
                }
                
                const file = inputElement.files[0];
                
                // 파일 크기 검증
                if (options.maxSize && file.size > options.maxSize) {
                    isValid = false;
                    errorType = 'fileSize';
                    break;
                }
                
                // 파일 형식 검증
                if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
                    isValid = false;
                    errorType = 'fileType';
                    break;
                }
                
                break;
                
            default:
                console.warn(`알 수 없는 검증 유형: ${validationType}`);
                break;
        }
        
        // 검증 결과에 따라 UI 업데이트
        if (!isValid) {
            this.showInputError(inputElement, errorType);
        } else {
            this.hideInputError(inputElement);
        }
        
        return isValid;
    },
    
    /**
     * 파일 업로드 검증
     * @param {File} file - 업로드된 파일
     * @param {Object} options - 검증 옵션
     * @returns {Promise<boolean>} 검증 결과
     */
    validateFileUpload: function(file, options = {}) {
        return new Promise((resolve, reject) => {
            // 파일 존재 여부 확인
            if (!file) {
                this.showError('input', 'required');
                reject(new Error('파일이 선택되지 않았습니다.'));
                return;
            }
            
            // 파일 크기 검증
            const maxSize = options.maxSize || 5 * 1024 * 1024; // 기본 5MB
            if (file.size > maxSize) {
                this.showError('input', 'fileSize');
                reject(new Error('파일 크기가 너무 큽니다.'));
                return;
            }
            
            // 파일 형식 검증
            const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                this.showError('input', 'fileType');
                reject(new Error('지원하지 않는 파일 형식입니다.'));
                return;
            }
            
            // 이미지 파일인 경우 추가 검증
            if (file.type.startsWith('image/')) {
                const img = new Image();
                const objectURL = URL.createObjectURL(file);
                
                img.onload = () => {
                    // 이미지 크기 검증
                    if (options.minWidth && img.width < options.minWidth) {
                        URL.revokeObjectURL(objectURL);
                        this.showError('input', 'invalidFormat');
                        reject(new Error('이미지 너비가 너무 작습니다.'));
                        return;
                    }
                    
                    if (options.minHeight && img.height < options.minHeight) {
                        URL.revokeObjectURL(objectURL);
                        this.showError('input', 'invalidFormat');
                        reject(new Error('이미지 높이가 너무 작습니다.'));
                        return;
                    }
                    
                    // 얼굴 인식 검증 (옵션)
                    if (options.requireFace && typeof window.faceDetection !== 'undefined') {
                        window.faceDetection.detectFace(img)
                            .then(faces => {
                                URL.revokeObjectURL(objectURL);
                                if (faces && faces.length > 0) {
                                    resolve(true);
                                } else {
                                    this.showError('input', 'noFace');
                                    reject(new Error('얼굴을 인식할 수 없습니다.'));
                                }
                            })
                            .catch(error => {
                                URL.revokeObjectURL(objectURL);
                                console.error('얼굴 인식 오류:', error);
                                this.showError('general', 'unknown');
                                reject(error);
                            });
                    } else {
                        URL.revokeObjectURL(objectURL);
                        resolve(true);
                    }
                };
                
                img.onerror = () => {
                    URL.revokeObjectURL(objectURL);
                    this.showError('input', 'invalidFormat');
                    reject(new Error('이미지를 불러올 수 없습니다.'));
                };
                
                img.src = objectURL;
            } else {
                resolve(true);
            }
        });
    },
    
    /**
     * 입력 필드 오류 표시
     * @param {HTMLElement} inputElement - 입력 요소
     * @param {string} errorType - 오류 유형
     */
    showInputError: function(inputElement, errorType) {
        // 입력 요소에 오류 클래스 추가
        inputElement.classList.add('is-invalid');
        
        // 기존 오류 메시지 제거
        const parent = inputElement.parentElement;
        const existingError = parent.querySelector('.invalid-feedback');
        if (existingError) {
            existingError.remove();
        }
        
        // 오류 메시지 생성
        const errorMessage = this.errorMessages.input[errorType] || this.errorMessages.general.unknown;
        const errorElement = document.createElement('div');
        errorElement.className = 'invalid-feedback';
        errorElement.textContent = errorMessage;
        
        // 오류 메시지 추가
        parent.appendChild(errorElement);
    },
    
    /**
     * 입력 필드 오류 숨기기
     * @param {HTMLElement} inputElement - 입력 요소
     */
    hideInputError: function(inputElement) {
        // 입력 요소에서 오류 클래스 제거
        inputElement.classList.remove('is-invalid');
        
        // 오류 메시지 제거
        const parent = inputElement.parentElement;
        const existingError = parent.querySelector('.invalid-feedback');
        if (existingError) {
            existingError.remove();
        }
    },
    
    /**
     * 오류 알림 표시
     * @param {string} category - 오류 카테고리
     * @param {string} type - 오류 유형
     * @param {Object} options - 추가 옵션
     */
    showError: function(category, type, options = {}) {
        // 오류 메시지 가져오기
        const message = this.errorMessages[category]?.[type] || this.errorMessages.general.unknown;
        
        // 이미 동일한 오류가 표시되고 있는지 확인
        const errorId = `${category}-${type}`;
        if (this.activeNotifications.includes(errorId)) {
            return;
        }
        
        // 오류 알림 생성
        const notification = document.createElement('div');
        notification.className = 'error-notification animate__animated animate__fadeIn';
        notification.dataset.errorId = errorId;
        
        // 오류 내용 설정
        notification.innerHTML = `
            <div class="error-icon"><i class="fas fa-exclamation-circle"></i></div>
            <div class="error-message">${message}</div>
            <button class="error-close"><i class="fas fa-times"></i></button>
        `;
        
        // 닫기 버튼 이벤트 설정
        const closeButton = notification.querySelector('.error-close');
        closeButton.addEventListener('click', () => {
            this.hideNotification(notification);
        });
        
        // 자동 숨김 설정
        if (options.autoHide !== false) {
            setTimeout(() => {
                this.hideNotification(notification);
            }, options.duration || 5000);
        }
        
        // 알림 영역에 추가
        let notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            document.body.appendChild(notificationContainer);
        }
        
        notificationContainer.appendChild(notification);
        
        // 활성 알림 목록에 추가
        this.activeNotifications.push(errorId);
        
        // 콘솔에 오류 기록
        console.error(`오류 [${category}:${type}]:`, message);
    },
    
    /**
     * 성공 알림 표시
     * @param {string} message - 성공 메시지
     * @param {Object} options - 추가 옵션
     */
    showSuccess: function(message, options = {}) {
        // 성공 알림 생성
        const notification = document.createElement('div');
        notification.className = 'success-notification animate__animated animate__fadeIn';
        
        // 성공 내용 설정
        notification.innerHTML = `
            <div class="success-icon"><i class="fas fa-check-circle"></i></div>
            <div class="success-message">${message}</div>
            <button class="success-close"><i class="fas fa-times"></i></button>
        `;
        
        // 닫기 버튼 이벤트 설정
        const closeButton = notification.querySelector('.success-close');
        closeButton.addEventListener('click', () => {
            this.hideNotification(notification);
        });
        
        // 자동 숨김 설정
        setTimeout(() => {
            this.hideNotification(notification);
        }, options.duration || 3000);
        
        // 알림 영역에 추가
        let notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            document.body.appendChild(notificationContainer);
        }
        
        notificationContainer.appendChild(notification);
    },
    
    /**
     * 알림 숨기기
     * @param {HTMLElement} notification - 알림 요소
     */
    hideNotification: function(notification) {
        // 이미 제거 중인 알림인지 확인
        if (notification.classList.contains('animate__fadeOut')) {
            return;
        }
        
        // 페이드 아웃 애니메이션 적용
        notification.classList.remove('animate__fadeIn');
        notification.classList.add('animate__fadeOut');
        
        // 애니메이션 완료 후 요소 제거
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            
            // 활성 알림 목록에서 제거
            const errorId = notification.dataset.errorId;
            if (errorId) {
                const index = this.activeNotifications.indexOf(errorId);
                if (index !== -1) {
                    this.activeNotifications.splice(index, 1);
                }
            }
            
            // 알림 컨테이너가 비어있으면 제거
            const notificationContainer = document.getElementById('notification-container');
            if (notificationContainer && !notificationContainer.children.length) {
                notificationContainer.remove();
            }
        }, 500); // 애니메이션 지속 시간
    },
    
    /**
     * 특정 오류 숨기기
     * @param {string} category - 오류 카테고리
     * @param {string} type - 오류 유형
     */
    hideError: function(category, type) {
        const errorId = `${category}-${type}`;
        const notification = document.querySelector(`.error-notification[data-error-id="${errorId}"]`);
        
        if (notification) {
            this.hideNotification(notification);
        }
    },
    
    /**
     * 모든 오류 숨기기
     */
    hideAllErrors: function() {
        const notifications = document.querySelectorAll('.error-notification');
        notifications.forEach(notification => {
            this.hideNotification(notification);
        });
    },
    
    /**
     * 브라우저 호환성 확인
     * @returns {boolean} 호환성 여부
     */
    checkBrowserCompatibility: function() {
        // 필수 기능 지원 여부 확인
        const requiredFeatures = [
            'Promise' in window,
            'fetch' in window,
            'localStorage' in window,
            'FileReader' in window
        ];
        
        const isCompatible = requiredFeatures.every(feature => feature);
        
        // 호환되지 않는 브라우저인 경우 경고 표시
        if (!isCompatible) {
            this.showError('general', 'browserSupport', { autoHide: false });
        }
        
        return isCompatible;
    },
    
    /**
     * 페이지 이탈 방지 경고 설정
     * @param {boolean} enable - 활성화 여부
     * @param {string} message - 경고 메시지
     */
    setupBeforeUnloadWarning: function(enable, message = '테스트가 진행 중입니다. 정말 페이지를 떠나시겠습니까?') {
        if (enable) {
            window.addEventListener('beforeunload', this.beforeUnloadHandler);
            this.beforeUnloadMessage = message;
        } else {
            window.removeEventListener('beforeunload', this.beforeUnloadHandler);
            this.beforeUnloadMessage = null;
        }
    },
    
    /**
     * 페이지 이탈 이벤트 핸들러
     * @param {BeforeUnloadEvent} event - 이벤트 객체
     */
    beforeUnloadHandler: function(event) {
        if (ErrorHandler.beforeUnloadMessage) {
            event.preventDefault();
            event.returnValue = ErrorHandler.beforeUnloadMessage;
            return ErrorHandler.beforeUnloadMessage;
        }
    },
    
    /**
     * 전역 오류 처리 설정
     */
    setupGlobalErrorHandling: function() {
        // 전역 오류 처리
        window.addEventListener('error', (event) => {
            console.error('전역 오류:', event.error || event.message);
            
            // 스크립트 오류인 경우 (이미 처리된 스크립트 로딩 오류는 제외)
            if (event.error && !event.target.tagName) {
                this.showError('general', 'unknown');
            }
        });
        
        // 처리되지 않은 Promise 오류 처리
        window.addEventListener('unhandledrejection', (event) => {
            console.error('처리되지 않은 Promise 오류:', event.reason);
            this.showError('general', 'unknown');
        });
    },
    
    /**
     * 초기화 함수
     */
    init: function() {
        // 네트워크 상태 모니터링 설정
        this.setupNetworkMonitoring();
        
        // 리소스 로딩 오류 처리 설정
        this.setupResourceErrorHandling();
        
        // 전역 오류 처리 설정
        this.setupGlobalErrorHandling();
        
        // 브라우저 호환성 확인
        this.checkBrowserCompatibility();
        
        // CSS 스타일 추가
        this.addStyles();
        
        console.log('오류 처리 모듈 초기화 완료');
    },
    
    /**
     * 알림 스타일 추가
     */
    addStyles: function() {
        const style = document.createElement('style');
        style.textContent = `
            #notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 350px;
            }
            
            .error-notification, .success-notification {
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                margin-bottom: 10px;
                padding: 15px;
                display: flex;
                align-items: center;
                animation-duration: 0.5s;
            }
            
            .error-notification {
                border-left: 4px solid #dc3545;
            }
            
            .success-notification {
                border-left: 4px solid #28a745;
            }
            
            .error-icon, .success-icon {
                margin-right: 15px;
                font-size: 20px;
            }
            
            .error-icon {
                color: #dc3545;
            }
            
            .success-icon {
                color: #28a745;
            }
            
            .error-message, .success-message {
                flex: 1;
                font-size: 14px;
            }
            
            .error-close, .success-close {
                background: none;
                border: none;
                cursor: pointer;
                color: #6c757d;
                padding: 0;
                margin-left: 10px;
            }
            
            .error-close:hover, .success-close:hover {
                color: #343a40;
            }
            
            .image-load-error {
                opacity: 0.5;
                border: 1px dashed #dc3545;
            }
            
            @media (max-width: 576px) {
                #notification-container {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
};

// 전역 객체로 내보내기
window.errorHandler = ErrorHandler;

// DOMContentLoaded 이벤트에서 초기화
document.addEventListener('DOMContentLoaded', () => {
    ErrorHandler.init();
});

// 이미지 로딩 오류 처리 개선
function handleImageError(error, imgSrc) {
    // 이미지 로딩 오류를 덜 시끄럽게 처리
    if (imgSrc && (imgSrc.includes('image-placeholder.png') || imgSrc.startsWith('data:image/'))) {
        // placeholder 이미지나 data URI 오류는 무시
        return;
    }
    
    console.warn('이미지 로딩 오류:', imgSrc || error);
}