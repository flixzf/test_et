/**
 * Mobile Touch Handler for Modern Landing Page
 * Optimized for touch devices, performance, and battery life
 */

class MobileTouchHandler {
    constructor() {
        this.isMobile = this.detectMobile();
        this.isTouch = this.detectTouch();
        this.reducedMotion = this.detectReducedMotion();
        this.init();
    }

    init() {
        if (this.isMobile || this.isTouch) {
            this.setupMobileOptimizations();
            this.setupTouchFeedback();
            this.optimizeAnimations();
            this.setupOrientationHandler();
            this.setupPerformanceOptimizations();
        }
        
        // 모든 기기에서 적용
        this.setupAccessibilityFeatures();
        this.setupProgressiveEnhancement();
    }

    /**
     * 모바일 기기 감지
     */
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }

    /**
     * 터치 지원 감지
     */
    detectTouch() {
        return 'ontouchstart' in window || 
               navigator.maxTouchPoints > 0 ||
               navigator.msMaxTouchPoints > 0;
    }

    /**
     * 모션 감소 설정 감지
     */
    detectReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /**
     * 모바일 최적화 설정
     */
    setupMobileOptimizations() {
        // HTML에 모바일 클래스 추가
        document.documentElement.classList.add('mobile-optimized');
        
        if (this.isTouch) {
            document.documentElement.classList.add('touch-device');
        }

        // 뷰포트 설정 최적화
        this.optimizeViewport();
        
        // 터치 액션 설정
        this.setupTouchActions();
        
        // 모바일 전용 이벤트 리스너
        this.setupMobileEventListeners();
    }

    /**
     * 뷰포트 최적화
     */
    optimizeViewport() {
        // 기존 뷰포트 태그 찾기 또는 생성
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }
        
        // 모바일 최적화 뷰포트 설정
        viewport.content = 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover';
    }

    /**
     * 터치 액션 설정
     */
    setupTouchActions() {
        // 카드와 버튼에 터치 액션 최적화
        const touchElements = document.querySelectorAll(
            '.modern-personality-card, .btn-modern, .btn-hero, .personality-node'
        );
        
        touchElements.forEach(element => {
            element.style.touchAction = 'manipulation';
            element.classList.add('touch-feedback');
        });
    }

    /**
     * 터치 피드백 시스템
     */
    setupTouchFeedback() {
        const feedbackElements = document.querySelectorAll('.touch-feedback, .modern-personality-card');
        
        feedbackElements.forEach(element => {
            // 터치 시작
            element.addEventListener('touchstart', (e) => {
                element.classList.add('touch-active');
                this.createTouchRipple(e, element);
            }, { passive: true });

            // 터치 종료
            element.addEventListener('touchend', () => {
                setTimeout(() => {
                    element.classList.remove('touch-active');
                }, 150);
            }, { passive: true });

            // 터치 취소
            element.addEventListener('touchcancel', () => {
                element.classList.remove('touch-active');
            }, { passive: true });
        });
    }

    /**
     * 터치 리플 효과 생성
     */
    createTouchRipple(event, element) {
        const rect = element.getBoundingClientRect();
        const touch = event.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        const ripple = document.createElement('div');
        ripple.className = 'touch-ripple';
        ripple.style.cssText = `
            position: absolute;
            top: ${y}px;
            left: ${x}px;
            width: 0;
            height: 0;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: touchRipple 0.6s ease-out;
            pointer-events: none;
            z-index: 1000;
        `;

        element.style.position = 'relative';
        element.appendChild(ripple);

        // 애니메이션 완료 후 제거
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    /**
     * 애니메이션 최적화
     */
    optimizeAnimations() {
        if (this.reducedMotion) {
            // 모든 애니메이션 비활성화
            document.documentElement.classList.add('no-animations');
            return;
        }

        // 모바일에서 애니메이션 간소화
        if (this.isMobile) {
            this.simplifyAnimations();
        }

        // 배터리 절약을 위한 애니메이션 조절
        this.setupBatteryOptimizations();
    }

    /**
     * 애니메이션 간소화
     */
    simplifyAnimations() {
        const shapes = document.querySelectorAll('.shape');
        shapes.forEach(shape => {
            // 애니메이션 속도 느리게
            shape.style.animationDuration = '12s';
            // GPU 가속 제거하여 배터리 절약
            shape.style.willChange = 'auto';
        });

        // 복잡한 3D 효과 제거
        const cards = document.querySelectorAll('.modern-personality-card');
        cards.forEach(card => {
            card.style.transform = 'none';
            card.classList.add('simplified-interaction');
        });
    }

    /**
     * 배터리 최적화
     */
    setupBatteryOptimizations() {
        // Battery API 사용 (지원하는 브라우저만)
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                if (battery.level < 0.2) {
                    // 배터리 부족 시 애니메이션 최소화
                    document.documentElement.classList.add('low-battery');
                }

                battery.addEventListener('levelchange', () => {
                    if (battery.level < 0.2) {
                        document.documentElement.classList.add('low-battery');
                    } else {
                        document.documentElement.classList.remove('low-battery');
                    }
                });
            });
        }
    }

    /**
     * 화면 회전 처리
     */
    setupOrientationHandler() {
        const handleOrientationChange = () => {
            // 회전 후 레이아웃 재계산을 위한 짧은 지연
            setTimeout(() => {
                this.adjustLayoutForOrientation();
                this.recalculateAnimations();
            }, 100);
        };

        // 현대적 이벤트 우선 사용
        if ('onorientationchange' in window) {
            window.addEventListener('orientationchange', handleOrientationChange);
        }
        
        // 대체 이벤트
        window.addEventListener('resize', this.debounce(handleOrientationChange, 250));
    }

    /**
     * 화면 방향에 따른 레이아웃 조정
     */
    adjustLayoutForOrientation() {
        const isLandscape = window.innerWidth > window.innerHeight;
        
        if (isLandscape && this.isMobile) {
            document.body.classList.add('mobile-landscape');
            document.body.classList.remove('mobile-portrait');
        } else {
            document.body.classList.add('mobile-portrait');
            document.body.classList.remove('mobile-landscape');
        }
    }

    /**
     * 애니메이션 재계산
     */
    recalculateAnimations() {
        // IntersectionObserver 재초기화
        const event = new CustomEvent('recalculate-animations');
        document.dispatchEvent(event);
    }

    /**
     * 모바일 이벤트 리스너 설정
     */
    setupMobileEventListeners() {
        // 터치 스크롤 최적화
        document.addEventListener('touchmove', (e) => {
            // 필요한 경우가 아니면 기본 동작 허용
            if (!e.target.closest('.prevent-scroll')) {
                return;
            }
        }, { passive: true });

        // 모바일 키보드 대응
        this.setupKeyboardHandler();
        
        // 스와이프 제스처 (필요한 경우)
        this.setupSwipeGestures();
    }

    /**
     * 키보드 표시/숨김 처리
     */
    setupKeyboardHandler() {
        let initialViewportHeight = window.innerHeight;

        const handleViewportChange = () => {
            const currentHeight = window.innerHeight;
            const heightDiff = initialViewportHeight - currentHeight;
            
            if (heightDiff > 150) {
                // 키보드가 표시됨
                document.body.classList.add('keyboard-visible');
            } else {
                // 키보드가 숨겨짐
                document.body.classList.remove('keyboard-visible');
            }
        };

        window.addEventListener('resize', this.debounce(handleViewportChange, 100));
    }

    /**
     * 스와이프 제스처 설정
     */
    setupSwipeGestures() {
        let touchStartX = 0;
        let touchStartY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (!e.changedTouches[0]) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            // 스와이프 감지 (최소 50px 이동)
            if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
                const direction = this.getSwipeDirection(deltaX, deltaY);
                this.handleSwipe(direction, e.target);
            }
        }, { passive: true });
    }

    /**
     * 스와이프 방향 계산
     */
    getSwipeDirection(deltaX, deltaY) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            return deltaX > 0 ? 'right' : 'left';
        } else {
            return deltaY > 0 ? 'down' : 'up';
        }
    }

    /**
     * 스와이프 처리
     */
    handleSwipe(direction, target) {
        // 필요한 경우 스와이프 동작 구현
        const swipeEvent = new CustomEvent('swipe', {
            detail: { direction, target }
        });
        document.dispatchEvent(swipeEvent);
    }

    /**
     * 성능 최적화 설정
     */
    setupPerformanceOptimizations() {
        // Intersection Observer 최적화
        this.optimizeIntersectionObserver();
        
        // 스크롤 성능 최적화
        this.optimizeScrollPerformance();
        
        // 이미지 지연 로딩
        this.setupLazyLoading();
    }

    /**
     * Intersection Observer 최적화
     */
    optimizeIntersectionObserver() {
        // 기존 observer에 모바일 최적화 적용
        document.addEventListener('recalculate-animations', () => {
            // 애니메이션 재계산 로직
            const cards = document.querySelectorAll('.modern-personality-card');
            cards.forEach((card, index) => {
                card.style.animationDelay = `${index * 0.1}s`;
            });
        });
    }

    /**
     * 스크롤 성능 최적화
     */
    optimizeScrollPerformance() {
        // 패시브 스크롤 리스너
        const scrollElements = document.querySelectorAll('.smooth-scroll');
        scrollElements.forEach(element => {
            element.style.webkitOverflowScrolling = 'touch';
        });

        // 스크롤 이벤트 쓰로틀링
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            
            scrollTimeout = setTimeout(() => {
                this.handleOptimizedScroll();
            }, 16); // ~60fps
        }, { passive: true });
    }

    /**
     * 최적화된 스크롤 처리
     */
    handleOptimizedScroll() {
        const scrollY = window.pageYOffset;
        
        // 모바일에서는 패럴랙스 효과 최소화
        if (this.isMobile) {
            const shapes = document.querySelectorAll('.shape');
            shapes.forEach((shape, index) => {
                const speed = 0.1 + (index * 0.02); // 매우 약한 효과
                const yPos = -(scrollY * speed);
                shape.style.transform = `translateY(${yPos}px)`;
            });
        }
    }

    /**
     * 지연 로딩 설정
     */
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.add('loaded');
                        }
                        imageObserver.unobserve(img);
                    }
                });
            });

            // data-src 속성이 있는 이미지들에 적용
            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    /**
     * 접근성 기능 설정
     */
    setupAccessibilityFeatures() {
        // 포커스 관리
        this.setupFocusManagement();
        
        // 스크린 리더 지원
        this.setupScreenReaderSupport();
        
        // 키보드 내비게이션
        this.setupKeyboardNavigation();
    }

    /**
     * 포커스 관리
     */
    setupFocusManagement() {
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        focusableElements.forEach(element => {
            // 터치 기기에서 포커스 아웃라인 조정
            if (this.isTouch) {
                element.addEventListener('focus', () => {
                    element.classList.add('keyboard-focus');
                });
                
                element.addEventListener('blur', () => {
                    element.classList.remove('keyboard-focus');
                });
            }
        });
    }

    /**
     * 스크린 리더 지원
     */
    setupScreenReaderSupport() {
        // 동적 콘텐츠에 aria-live 추가
        const typingElement = document.querySelector('.modern-typing');
        if (typingElement) {
            typingElement.setAttribute('aria-live', 'polite');
        }

        // 카드에 적절한 ARIA 속성 추가
        const cards = document.querySelectorAll('.modern-personality-card');
        cards.forEach(card => {
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            
            const title = card.querySelector('.card-title-modern');
            const description = card.querySelector('.card-description');
            
            if (title && description) {
                const ariaLabel = `${title.textContent}, ${description.textContent}`;
                card.setAttribute('aria-label', ariaLabel);
            }
        });
    }

    /**
     * 키보드 내비게이션
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const activeElement = document.activeElement;
                
                if (activeElement.classList.contains('modern-personality-card')) {
                    e.preventDefault();
                    activeElement.click();
                }
            }
        });
    }

    /**
     * 점진적 향상
     */
    setupProgressiveEnhancement() {
        // JavaScript 로드 완료 표시
        document.documentElement.classList.add('js-loaded');
        
        // 기능 지원 감지 후 클래스 추가
        if ('IntersectionObserver' in window) {
            document.documentElement.classList.add('intersection-observer');
        }
        
        if ('matchMedia' in window) {
            document.documentElement.classList.add('match-media');
        }
    }

    /**
     * 디바운스 유틸리티
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// 터치 리플 애니메이션 CSS 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes touchRipple {
        0% {
            width: 0;
            height: 0;
            opacity: 1;
        }
        100% {
            width: 200px;
            height: 200px;
            opacity: 0;
        }
    }
    
    .touch-active {
        transform: scale(0.95) !important;
        opacity: 0.8;
        transition: all 0.1s ease !important;
    }
    
    .keyboard-focus {
        outline: 2px solid #007bff;
        outline-offset: 2px;
    }
    
    .no-animations *,
    .no-animations *::before,
    .no-animations *::after {
        animation: none !important;
        transition: none !important;
    }
    
    .low-battery .shape {
        animation: none !important;
    }
    
    .low-battery .parallax-element {
        transform: none !important;
    }
`;

document.head.appendChild(style);

// 인스턴스 생성 및 초기화
const mobileTouchHandler = new MobileTouchHandler(); 