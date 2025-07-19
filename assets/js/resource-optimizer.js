/**
 * 테토-에겐 성격 유형 테스트 리소스 최적화 모듈
 * 
 * 이 모듈은 이미지 및 리소스 최적화 기능을 제공하여 페이지 로딩 성능을 개선합니다.
 */

const ResourceOptimizer = {
    // 이미지 캐시
    imageCache: {},
    
    /**
     * 이미지 최적화 함수
     * 이미지를 최적화하여 메모리 사용량과 로딩 시간을 줄입니다.
     * @param {string} src - 이미지 소스 URL
     * @param {Object} options - 최적화 옵션
     * @returns {Promise<HTMLImageElement>} 최적화된 이미지 요소
     */
    optimizeImage: function(src, options = {}) {
        // 기본 옵션
        const defaultOptions = {
            maxWidth: window.performanceOptimizer?.isLowEndDevice() ? 800 : 1200,
            maxHeight: window.performanceOptimizer?.isLowEndDevice() ? 800 : 1200,
            quality: window.performanceOptimizer?.isLowEndDevice() ? 0.8 : 0.9,
            format: 'webp' // 'webp', 'jpeg', 'png'
        };
        
        const settings = { ...defaultOptions, ...options };
        
        // 이미 캐시된 이미지가 있으면 반환
        const cacheKey = `${src}_${settings.maxWidth}_${settings.maxHeight}_${settings.quality}`;
        if (this.imageCache[cacheKey]) {
            return Promise.resolve(this.imageCache[cacheKey]);
        }
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                // 이미지 크기 조정이 필요한지 확인
                if (img.width <= settings.maxWidth && img.height <= settings.maxHeight) {
                    // 크기 조정이 필요 없으면 원본 이미지 반환
                    this.imageCache[cacheKey] = img;
                    resolve(img);
                    return;
                }
                
                // 캔버스 생성
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // 비율 유지하며 크기 조정
                let width = img.width;
                let height = img.height;
                
                if (width > settings.maxWidth) {
                    height = (settings.maxWidth / width) * height;
                    width = settings.maxWidth;
                }
                
                if (height > settings.maxHeight) {
                    width = (settings.maxHeight / height) * width;
                    height = settings.maxHeight;
                }
                
                // 캔버스 크기 설정
                canvas.width = width;
                canvas.height = height;
                
                // 이미지 그리기
                ctx.drawImage(img, 0, 0, width, height);
                
                // 최적화된 이미지 생성
                let optimizedImg = new Image();
                
                // 이미지 포맷 설정
                let mimeType = 'image/jpeg';
                if (settings.format === 'webp' && this.isWebPSupported()) {
                    mimeType = 'image/webp';
                } else if (settings.format === 'png') {
                    mimeType = 'image/png';
                }
                
                // 캔버스를 데이터 URL로 변환
                optimizedImg.src = canvas.toDataURL(mimeType, settings.quality);
                
                // 캐시에 저장
                this.imageCache[cacheKey] = optimizedImg;
                
                // 최적화된 이미지 반환
                optimizedImg.onload = () => resolve(optimizedImg);
                optimizedImg.onerror = reject;
            };
            
            img.onerror = reject;
            img.src = src;
        });
    },
    
    /**
     * WebP 지원 여부 확인
     * @returns {boolean} WebP 지원 여부
     */
    isWebPSupported: function() {
        const canvas = document.createElement('canvas');
        if (canvas.getContext && canvas.getContext('2d')) {
            // WebP 생성 시도
            return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        }
        return false;
    },
    
    /**
     * 이미지 지연 로딩 설정
     * 화면에 보이는 이미지만 로드하여 초기 로딩 시간을 단축합니다.
     */
    setupLazyLoading: function() {
        // data-src 속성이 있는 이미지 선택
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        // Intersection Observer 지원 확인
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.dataset.src;
                        
                        // 이미지 로드 표시
                        img.classList.add('loading');
                        
                        // 이미지 최적화 및 로드
                        this.optimizeImage(src)
                            .then(optimizedImg => {
                                img.src = optimizedImg.src;
                                img.classList.remove('loading');
                                img.classList.add('loaded');
                                img.removeAttribute('data-src');
                            })
                            .catch(error => {
                                console.error('이미지 최적화 실패:', error);
                                // 최적화 실패 시 원본 이미지 로드
                                img.src = src;
                                img.classList.remove('loading');
                                img.removeAttribute('data-src');
                            });
                        
                        // 관찰 중단
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px' // 이미지가 화면에 나타나기 50px 전에 로드 시작
            });
            
            // 각 이미지 관찰 시작
            lazyImages.forEach(img => imageObserver.observe(img));
        } else {
            // Intersection Observer를 지원하지 않는 브라우저를 위한 폴백
            // 모든 이미지를 바로 로드
            lazyImages.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        }
    },
    
    /**
     * 폰트 최적화 함수
     * 폰트 로딩을 최적화하여 FOUT(Flash of Unstyled Text) 현상을 방지합니다.
     */
    optimizeFonts: function() {
        // 폰트 디스플레이 설정
        const fontDisplayStyle = document.createElement('style');
        fontDisplayStyle.textContent = `
            @font-face {
                font-display: swap;
            }
        `;
        document.head.appendChild(fontDisplayStyle);
        
        // 중요 폰트 사전 로드
        if ('fonts' in document) {
            // 시스템 폰트 사용 우선
            document.fonts.ready.then(() => {
                console.log('폰트 로딩 완료');
            });
        }
    },
    
    /**
     * CSS 최적화 함수
     * 중요 CSS를 인라인으로 포함하고 나머지는 비동기로 로드합니다.
     */
    optimizeCSS: function() {
        // 이미 로드된 스타일시트 확인
        const loadedStylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
            .map(link => link.href);
        
        // 중요하지 않은 CSS 비동기 로드
        const nonCriticalCSS = [
            'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css'
        ];
        
        nonCriticalCSS.forEach(cssUrl => {
            // 이미 로드된 스타일시트는 건너뛰기
            if (loadedStylesheets.some(loadedUrl => loadedUrl.includes(cssUrl))) {
                return;
            }
            
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssUrl;
            link.media = 'print';
            link.onload = () => {
                link.media = 'all';
            };
            document.head.appendChild(link);
        });
    },
    
    /**
     * 리소스 캐시 정리 함수
     * 메모리 사용량을 최적화하기 위해 사용하지 않는 리소스를 정리합니다.
     */
    clearResourceCache: function() {
        // 현재 화면에 표시되지 않는 이미지 캐시 정리
        const visibleImages = Array.from(document.querySelectorAll('img[src]'))
            .map(img => img.src);
        
        Object.keys(this.imageCache).forEach(key => {
            const imgSrc = this.imageCache[key].src;
            if (!visibleImages.includes(imgSrc)) {
                delete this.imageCache[key];
            }
        });
        
        console.log('리소스 캐시 정리 완료');
    },
    
    /**
     * 초기화 함수
     */
    init: function() {
        // 이미지 지연 로딩 설정
        this.setupLazyLoading();
        
        // 폰트 최적화
        this.optimizeFonts();
        
        // CSS 최적화
        this.optimizeCSS();
        
        // 주기적인 캐시 정리 (60초마다)
        setInterval(() => this.clearResourceCache(), 60000);
        
        console.log('리소스 최적화 모듈 초기화 완료');
    }
};

// 전역 객체로 내보내기
window.resourceOptimizer = ResourceOptimizer;

// DOMContentLoaded 이벤트에서 초기화
document.addEventListener('DOMContentLoaded', () => {
    ResourceOptimizer.init();
});