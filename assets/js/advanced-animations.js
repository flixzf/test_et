/**
 * Advanced Animation System for Modern Landing Page
 * Features: IntersectionObserver, Parallax, Micro-interactions
 */

class AdvancedAnimations {
    constructor() {
        this.init();
    }

    init() {
        // DOM이 로드된 후 초기화
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupAnimations();
            });
        } else {
            this.setupAnimations();
        }
    }

    setupAnimations() {
        this.initIntersectionObserver();
        this.initParallaxEffect();
        this.initMicroInteractions();
        this.initScrollAnimations();
        this.initSmoothScrolling();
    }

    /**
     * IntersectionObserver를 사용한 요소 등장 애니메이션
     */
    initIntersectionObserver() {
        // 관찰할 요소들 선택
        const observerElements = document.querySelectorAll('.animate-on-scroll, .modern-personality-card, .glass-card, .hero-image');
        
        // IntersectionObserver 옵션
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        // Observer 생성
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 요소가 화면에 들어올 때
                    entry.target.classList.add('animate-in');
                    
                    // 카드들에 대해 순차적 애니메이션 적용
                    if (entry.target.classList.contains('modern-personality-card')) {
                        const cards = document.querySelectorAll('.modern-personality-card');
                        const index = Array.from(cards).indexOf(entry.target);
                        entry.target.style.animationDelay = `${index * 0.1}s`;
                    }
                    
                    // 한 번 애니메이션된 요소는 관찰 중지 (성능 최적화)
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // 모든 요소에 Observer 적용
        observerElements.forEach(element => {
            observer.observe(element);
        });
    }

    /**
     * Parallax 효과 (배경 요소들)
     */
    initParallaxEffect() {
        const parallaxElements = document.querySelectorAll('.shape');
        
        if (parallaxElements.length === 0) return;

        let ticking = false;

        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;

            parallaxElements.forEach((element, index) => {
                const speed = 0.5 + (index * 0.1); // 각 shape마다 다른 속도
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px) rotate(${scrolled * 0.1}deg)`;
            });

            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick);
    }

    /**
     * 마이크로 인터랙션 (버튼, 링크 등)
     */
    initMicroInteractions() {
        // 버튼 클릭 효과
        this.initButtonMicroInteractions();
        
        // 카드 호버 효과 강화
        this.enhanceCardInteractions();
        
        // 아이콘 애니메이션
        this.initIconAnimations();
        
        // 링크 호버 효과
        this.initLinkAnimations();
    }

    /**
     * 버튼 마이크로 인터랙션
     */
    initButtonMicroInteractions() {
        const buttons = document.querySelectorAll('.btn-modern, .btn-hero');
        
        buttons.forEach(button => {
            // 클릭 시 리플 효과
            button.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple-effect');
                
                button.appendChild(ripple);
                
                // 애니메이션 완료 후 요소 제거
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });

            // 마우스 팔로우 효과
            button.addEventListener('mousemove', (e) => {
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                button.style.setProperty('--mouse-x', x + 'px');
                button.style.setProperty('--mouse-y', y + 'px');
            });
        });
    }

    /**
     * 카드 인터랙션 강화
     */
    enhanceCardInteractions() {
        const cards = document.querySelectorAll('.modern-personality-card');
        
        cards.forEach(card => {
            // 마우스 움직임에 따른 3D 효과
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                card.style.transform = `
                    perspective(1000px) 
                    rotateX(${rotateX}deg) 
                    rotateY(${rotateY}deg) 
                    translateY(-10px) 
                    scale(1.02)
                `;
            });

            // 마우스가 떠날 때 원상복구
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
            });

            // 클릭 시 펄스 효과
            card.addEventListener('click', () => {
                card.classList.add('card-pulse');
                setTimeout(() => {
                    card.classList.remove('card-pulse');
                }, 300);
            });
        });
    }

    /**
     * 아이콘 애니메이션
     */
    initIconAnimations() {
        const icons = document.querySelectorAll('.icon-container-modern i');
        
        icons.forEach(icon => {
            icon.addEventListener('mouseenter', () => {
                icon.style.animation = 'iconBounce 0.6s ease';
            });

            icon.addEventListener('animationend', () => {
                icon.style.animation = '';
            });
        });
    }

    /**
     * 링크 애니메이션
     */
    initLinkAnimations() {
        const links = document.querySelectorAll('a:not(.btn-modern):not(.btn-hero)');
        
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                link.style.transform = 'translateY(-2px)';
                link.style.textShadow = '0 2px 4px rgba(0,0,0,0.1)';
            });

            link.addEventListener('mouseleave', () => {
                link.style.transform = 'translateY(0)';
                link.style.textShadow = 'none';
            });
        });
    }

    /**
     * 스크롤 기반 애니메이션
     */
    initScrollAnimations() {
        let scrollPosition = 0;
        let ticking = false;

        const updateScrollAnimations = () => {
            const currentScroll = window.pageYOffset;
            const scrollDiff = currentScroll - scrollPosition;
            
            // 헤더 숨김/표시 효과 (필요시)
            this.handleHeaderVisibility(scrollDiff, currentScroll);
            
            // 배경 패럴랙스
            this.updateBackgroundParallax(currentScroll);
            
            scrollPosition = currentScroll;
            ticking = false;
        };

        const requestScrollUpdate = () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollAnimations);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestScrollUpdate);
    }

    /**
     * 헤더 가시성 제어
     */
    handleHeaderVisibility(scrollDiff, currentScroll) {
        const header = document.querySelector('.hero-container');
        if (!header) return;

        if (currentScroll > 100) {
            if (scrollDiff > 0) {
                // 아래로 스크롤
                header.style.opacity = '0.9';
            } else {
                // 위로 스크롤
                header.style.opacity = '1';
            }
        } else {
            header.style.opacity = '1';
        }
    }

    /**
     * 배경 패럴랙스 업데이트
     */
    updateBackgroundParallax(scrollPosition) {
        const heroBackground = document.querySelector('.hero-background');
        if (heroBackground) {
            const speed = 0.5;
            heroBackground.style.transform = `translateY(${scrollPosition * speed}px)`;
        }
    }

    /**
     * 부드러운 스크롤링
     */
    initSmoothScrolling() {
        // 앵커 링크에 부드러운 스크롤 적용
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#' || href === '#!') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    
                    const offsetTop = target.offsetTop - 100;
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    /**
     * 성능 최적화를 위한 디바운스 함수
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

    /**
     * 쓰로틀 함수
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// 인스턴스 생성 및 초기화
const advancedAnimations = new AdvancedAnimations(); 