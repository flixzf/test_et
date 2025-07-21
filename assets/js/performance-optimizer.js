/**
 * 테토-에겐 성격 유형 테스트 성능 최적화 모듈
 * 
 * 이 모듈은 애플리케이션의 성능을 최적화하기 위한 유틸리티 함수들을 제공합니다.
 * 특히 모바일 기기에서의 성능 향상에 중점을 둡니다.
 */

// 전역 변수
let isLowEndDevice = false;
let isLowMemoryDevice = false;
let isMobileDevice = false;

/**
 * 디바이스 성능 감지 및 설정
 * 디바이스의 성능을 감지하고 그에 맞는 설정을 적용합니다.
 */
function detectDeviceCapabilities() {
    // 모바일 기기 감지
    isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // 저사양 기기 감지 (CPU 코어 수, 메모리 등)
    try {
        // CPU 코어 수 확인 (하드웨어 동시성)
        const hardwareConcurrency = navigator.hardwareConcurrency || 1;
        isLowEndDevice = hardwareConcurrency <= 4;
        
        // 메모리 확인 (일부 브라우저에서만 지원)
        if (navigator.deviceMemory) {
            isLowMemoryDevice = navigator.deviceMemory <= 4;
        } else {
            // 메모리 정보를 사용할 수 없는 경우 모바일 기기는 저메모리로 가정
            isLowMemoryDevice = isMobileDevice;
        }
        
        console.log(`디바이스 감지: 모바일=${isMobileDevice}, 저사양=${isLowEndDevice}, 저메모리=${isLowMemoryDevice}`);
    } catch (error) {
        console.warn('디바이스 성능 감지 중 오류 발생:', error);
        // 오류 발생 시 안전하게 저사양 기기로 가정
        isLowEndDevice = true;
        isLowMemoryDevice = true;
    }
    
    // 감지된 성능에 따라 설정 적용
    applyPerformanceSettings();
}

/**
 * 성능 설정 적용
 * 감지된 디바이스 성능에 따라 적절한 설정을 적용합니다.
 */
function applyPerformanceSettings() {
    // TensorFlow.js 설정 최적화
    if (typeof tf !== 'undefined') {
        // 저사양 기기에서는 WebGL 백엔드 사용 (CPU보다 빠름)
        tf.setBackend('webgl');
        
        // WebGL 설정 최적화
        const gl = tf.backend().getGPGPUContext().gl;
        if (gl) {
            // 저사양 기기에서는 정밀도 낮추기
            if (isLowEndDevice) {
                gl.getExtension('OES_texture_float');
                gl.getExtension('WEBGL_color_buffer_float');
                tf.env().set('WEBGL_FORCE_F16_TEXTURES', true);
            }
            
            // 저메모리 기기에서는 메모리 관리 최적화
            if (isLowMemoryDevice) {
                tf.env().set('WEBGL_DELETE_TEXTURE_THRESHOLD', 0);
                tf.env().set('WEBGL_FLUSH_THRESHOLD', 1);
            }
        }
    }
    
    // 이미지 처리 설정 최적화
    if (isLowEndDevice || isLowMemoryDevice) {
        // 이미지 크기 축소 (메모리 사용량 감소)
        window.optimizedImageSize = 192; // 기본 224에서 축소
    } else {
        window.optimizedImageSize = 224; // 기본 크기
    }
}

/**
 * 메모리 정리 함수
 * 주기적으로 호출하여 메모리 사용량을 최적화합니다.
 */
function cleanupMemory() {
    // TensorFlow.js 메모리 정리
    if (typeof tf !== 'undefined') {
        try {
            // 사용하지 않는 텐서 정리
            tf.tidy(() => {});
            
            // 백엔드 메모리 정리
            tf.disposeVariables();
            
            // 가비지 컬렉션 힌트
            if (typeof window.gc === 'function') {
                window.gc();
            }
        } catch (error) {
            console.warn('메모리 정리 중 오류 발생:', error);
        }
    }
}

/**
 * 이미지 최적화 함수
 * 디바이스 성능에 맞게 이미지를 최적화합니다.
 * @param {HTMLImageElement|HTMLCanvasElement} imageElement - 원본 이미지 요소
 * @returns {HTMLCanvasElement} 최적화된 이미지가 그려진 캔버스
 */
function optimizeImage(imageElement) {
    // 최적화된 크기 사용
    const targetSize = window.optimizedImageSize || 224;
    
    // 캔버스 생성
    const canvas = document.createElement('canvas');
    canvas.width = targetSize;
    canvas.height = targetSize;
    
    // 이미지 그리기
    const ctx = canvas.getContext('2d', { alpha: false }); // alpha: false로 성능 향상
    
    // 이미지 비율 유지하며 중앙 크롭
    const scale = Math.max(canvas.width / imageElement.width, canvas.height / imageElement.height);
    const x = (canvas.width / 2) - (imageElement.width / 2) * scale;
    const y = (canvas.height / 2) - (imageElement.height / 2) * scale;
    
    // 저사양 기기에서는 이미지 스무딩 비활성화 (성능 향상)
    if (isLowEndDevice) {
        ctx.imageSmoothingEnabled = false;
    }
    
    ctx.drawImage(imageElement, x, y, imageElement.width * scale, imageElement.height * scale);
    
    return canvas;
}

/**
 * 지연 로딩 함수
 * 필요한 시점에 리소스를 로드하여 초기 로딩 시간을 단축합니다.
 * @param {string} resourceType - 로드할 리소스 유형 ('model', 'script', 'image')
 * @param {string} url - 리소스 URL
 * @returns {Promise} 로드 완료 Promise
 */
function lazyLoad(resourceType, url) {
    return new Promise((resolve, reject) => {
        // undefined 체크 및 기본값 설정
        if (!resourceType) {
            // console.warn('리소스 타입이 정의되지 않았습니다. 기본값 사용');
            resolve();
            return;
        }
        
        switch (resourceType) {
            case 'script':
                const script = document.createElement('script');
                script.src = url;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
                break;
                
            case 'image':
                const img = new Image();
                img.src = url;
                img.onload = () => resolve(img);
                img.onerror = reject;
                break;
                
            case 'model':
                // 모델은 필요할 때 로드
                if (typeof window.aiModel !== 'undefined' && typeof window.aiModel.loadModel === 'function') {
                    window.aiModel.loadModel()
                        .then(resolve)
                        .catch(reject);
                } else {
                    reject(new Error('AI 모델 모듈이 로드되지 않았습니다.'));
                }
                break;
                
            default:
                console.warn(`지원하지 않는 리소스 유형: ${resourceType}`);
                resolve(); // 에러 대신 resolve로 처리
        }
    });
}

/**
 * Lazy Load 요소들을 확인하고 처리하는 함수
 */
function checkLazyLoadElements() {
    try {
        // data-src 속성을 가진 이미지들 찾기
        const lazyImages = document.querySelectorAll('img[data-src]:not([src])');
        let processed = 0;
        
        lazyImages.forEach(img => {
            if (isElementInViewport(img)) {
                if (img.dataset.src) {
                    lazyLoad('image', img.dataset.src)
                        .then(() => {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            processed++;
                        })
                        .catch(err => console.warn('이미지 로딩 실패:', err));
                }
            }
        });
        
        return { processed, total: lazyImages.length };
    } catch (error) {
        console.warn('Lazy load 요소 확인 중 오류:', error);
        return { processed: 0, total: 0 };
    }
}

/**
 * 요소가 뷰포트에 있는지 확인하는 함수
 */
function isElementInViewport(element) {
    if (!element || !element.getBoundingClientRect) {
        return false;
    }
    
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= windowHeight &&
        rect.right <= windowWidth
    );
}

/**
 * 디바운스 함수
 * 연속적인 이벤트 호출을 제한하여 성능을 최적화합니다.
 * @param {Function} func - 실행할 함수
 * @param {number} wait - 대기 시간 (밀리초)
 * @returns {Function} 디바운스된 함수
 */
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

/**
 * 스로틀 함수
 * 함수 호출 빈도를 제한하여 성능을 최적화합니다.
 * @param {Function} func - 실행할 함수
 * @param {number} limit - 제한 시간 (밀리초)
 * @returns {Function} 스로틀된 함수
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 애니메이션 최적화 함수
 * 디바이스 성능에 따라 애니메이션을 최적화합니다.
 */
function optimizeAnimations() {
    // 저사양 기기에서는 애니메이션 효과 줄이기
    if (isLowEndDevice || isLowMemoryDevice) {
        // CSS 클래스 추가
        document.body.classList.add('low-performance-device');
        
        // 애니메이션 관련 클래스 제거
        document.querySelectorAll('.animate__animated').forEach(el => {
            el.classList.remove('animate__animated');
            // 필수 애니메이션만 유지
            if (!el.classList.contains('essential-animation')) {
                el.classList.remove('animate__fadeIn', 'animate__fadeOut', 'animate__zoomIn', 'animate__delay-1s');
            }
        });
    }
}

/**
 * 이미지 로딩 최적화 함수
 * 필요한 시점에 이미지를 로드하여 초기 로딩 시간을 단축합니다.
 */
function optimizeImageLoading() {
    // 지연 로딩 설정
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    // Intersection Observer 지원 확인
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Intersection Observer를 지원하지 않는 브라우저를 위한 폴백
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

/**
 * 초기화 함수
 * 성능 최적화 모듈을 초기화합니다.
 */
function init() {
    // 디바이스 성능 감지
    detectDeviceCapabilities();
    
    // 애니메이션 최적화
    optimizeAnimations();
    
    // 이미지 로딩 최적화
    document.addEventListener('DOMContentLoaded', optimizeImageLoading);
    
    // 주기적인 메모리 정리 설정 (저메모리 기기에서만)
    if (isLowMemoryDevice) {
        // 30초마다 메모리 정리
        setInterval(cleanupMemory, 30000);
    }
    
    console.log('성능 최적화 모듈 초기화 완료');
}

// 모듈 내보내기
window.performanceOptimizer = {
    init,
    optimizeImage,
    lazyLoad,
    setupLazyLoading: lazyLoad, // lazyLoad 함수를 setupLazyLoading으로도 사용
    checkLazyLoadElements, // 새로 추가된 함수
    isElementInViewport, // 새로 추가된 함수
    debounce,
    throttle,
    cleanupMemory,
    isLowEndDevice: () => isLowEndDevice,
    isLowMemoryDevice: () => isLowMemoryDevice,
    isMobileDevice: () => isMobileDevice
};

// 자동 초기화
init();