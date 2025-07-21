/**
 * Interactive elements for the landing page
 */

$(document).ready(function() {
    // Personality type card interactions
    initPersonalityCards();
    
    // Enhanced hover effects
    initEnhancedHoverEffects();
    
    // Scroll animations
    initScrollAnimations();
});

/**
 * Initialize personality type card interactions
 */
function initPersonalityCards() {
    // Click event for modern personality type cards
    $('.modern-personality-card').on('click', function() {
        const personalityType = $(this).data('personality');
        
        // Add click animation
        $(this).addClass('card-clicked');
        setTimeout(() => {
            $(this).removeClass('card-clicked');
        }, 200);
        
        // Show the info modal
        $('#infoModal').modal('show');
        
        // Scroll to the specific personality type section
        setTimeout(() => {
            const targetSection = $(`.personality-detail h5:contains("${getPersonalityName(personalityType)}")`);
            if (targetSection.length) {
                const modalBody = $('.modal-body');
                const scrollTop = targetSection.offset().top - modalBody.offset().top + modalBody.scrollTop();
                modalBody.animate({ scrollTop: scrollTop - 20 }, 300);
                
                // Highlight the section briefly
                targetSection.parent().addClass('highlight-section');
                setTimeout(() => {
                    targetSection.parent().removeClass('highlight-section');
                }, 1500);
            }
        }, 300);
    });
}

/**
 * Get personality name from type
 * @param {string} type - Personality type code
 * @returns {string} Personality name in Korean
 */
function getPersonalityName(type) {
    switch(type) {
        case 'teto-male': return '테토남';
        case 'teto-female': return '테토녀';
        case 'egen-male': return '에겐남';
        case 'egen-female': return '에겐녀';
        default: return '';
    }
}

/**
 * Initialize enhanced hover effects
 */
function initEnhancedHoverEffects() {
    // Add parallax effect to main image
    $('.main-image').on('mousemove', function(e) {
        const $this = $(this);
        const boundingRect = this.getBoundingClientRect();
        const mouseX = e.clientX - boundingRect.left;
        const mouseY = e.clientY - boundingRect.top;
        
        const centerX = boundingRect.width / 2;
        const centerY = boundingRect.height / 2;
        
        const moveX = (mouseX - centerX) / 20;
        const moveY = (mouseY - centerY) / 20;
        
        $this.find('img').css({
            'transform': `translate(${moveX}px, ${moveY}px) scale(1.03)`
        });
    });
    
    $('.main-image').on('mouseleave', function() {
        $(this).find('img').css({
            'transform': 'translate(0, 0) scale(1)'
        });
    });
}

/**
 * Initialize scroll animations
 */
function initScrollAnimations() {
    // Add scroll animations to elements
    $(window).on('scroll', function() {
        const scrollTop = $(window).scrollTop();
        const windowHeight = $(window).height();
        
        // Animate elements as they come into view
        $('.animate-on-scroll').each(function() {
            const $element = $(this);
            const elementTop = $element.offset().top;
            
            if (elementTop < scrollTop + windowHeight - 100) {
                $element.addClass('animated');
            }
        });
    });
}

/**
 * Add typing animation to highlight text
 * Enhanced version with configurable settings
 */
function addTypingAnimation() {
    // 애니메이션 설정
    const config = {
        typeSpeed: 80,      // 타이핑 속도 (ms)
        eraseSpeed: 40,     // 지우기 속도 (ms)
        displayTime: 2500,  // 텍스트 표시 시간 (ms)
        switchDelay: 300    // 텍스트 전환 대기 시간 (ms)
    };
    
    // 표시할 텍스트 배열 (번역 시스템에서 가져오기)
    function getTypingTexts() {
        try {
            const currentLang = window.languageUtils ? window.languageUtils.getCurrentLanguage().code : 'ko';
            const langKey = 'startScreen.typingTexts';
            
            if (window.languageTranslator && window.languageTranslator.translate) {
                const translatedTexts = window.languageTranslator.translate(langKey);
                if (Array.isArray(translatedTexts) && translatedTexts.length > 0) {
                    return translatedTexts;
                }
            }
        } catch (error) {
            console.warn('타이핑 텍스트 번역 실패:', error);
        }
        // 기본값 (한국어)
        return [
            "내가 어떤 사람인지 알고 싶다면?",        
            "다른 사람들은 나를 어떻게 생각할까?"
        ];
    }
    
    let texts = getTypingTexts();
    
    let currentIndex = 0;
    let isAnimating = false;
    const typingElement = $('.modern-typing');
    
    function typeText(text, element, index = 0) {
        try {
            if (!isAnimating || !element || !element.length) return;
            if (typeof text !== 'string') {
                console.warn('타이핑 텍스트가 문자열이 아님:', text);
                isAnimating = false;
                return;
            }
            if (index < text.length) {
                element.text(element.text() + text.charAt(index));
                setTimeout(() => typeText(text, element, index + 1), config.typeSpeed);
            } else {
                setTimeout(() => eraseText(element), config.displayTime);
            }
        } catch (error) {
            console.warn('Type text error:', error);
            isAnimating = false;
        }
    }
    
    function eraseText(element) {
        try {
            if (!isAnimating || !element || !element.length) return;
            const text = element.text();
            if (typeof text !== 'string') {
                console.warn('지울 텍스트가 문자열이 아님:', text);
                isAnimating = false;
                return;
            }
            if (text.length > 0) {
                element.text(text.substring(0, text.length - 1));
                setTimeout(() => eraseText(element), config.eraseSpeed);
            } else {
                currentIndex = 0;
                if (Array.isArray(texts) && texts.length > 0) {
                    currentIndex = (currentIndex + 1) % texts.length;
                }
                setTimeout(() => {
                    if (isAnimating && Array.isArray(texts) && typeof texts[currentIndex] === 'string') {
                        typeText(texts[currentIndex], element);
                    }
                }, config.switchDelay);
            }
        } catch (error) {
            console.warn('Erase text error:', error);
            isAnimating = false;
        }
    }
    
    function updateTypingTexts() {
        stopAnimation();
        texts = getTypingTexts();
        currentIndex = 0;
        startAnimation();
    }
    
    // 언어 변경 이벤트 리스너 (전역으로 노출)
    window.updateTypingAnimation = updateTypingTexts;
    
    // 애니메이션 시작
    startAnimation();
    
    // 페이지 가시성 변경 시 애니메이션 제어
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            stopAnimation();
        } else {
            startAnimation();
        }
    });
    
    // 전역으로 제어 함수 노출 (필요시 외부에서 제어 가능)
    window.typingAnimation = {
        start: startAnimation,
        stop: stopAnimation,
        config: config
    };
}

/**
 * Initialize typing animation when document is ready
 */
$(document).ready(function() {
    try {
        // Start typing animation
        addTypingAnimation();
        
        // Add click events to personality nodes in food chain
        $('.personality-node').on('click', function() {
            try {
                const className = $(this).attr('class').split(' ').find(cls => cls.includes('-'));
                if (className) {
                    const personalityType = className;
                    
                    // Find the corresponding modern personality card and trigger its click event
                    $(`.modern-personality-card[data-personality="${personalityType}"]`).click();
                }
            } catch (error) {
                console.warn('Personality node click error:', error);
            }
        });
    } catch (error) {
        console.error('Landing interactions initialization failed:', error);
    }
});