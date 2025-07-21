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
    // Click event for personality type cards
    $('.personality-type-card').on('click', function() {
        const personalityType = $(this).data('personality');
        
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
    
    // 표시할 텍스트 배열
    const texts = [
        "나의 진짜 성격은 무엇일까?",
        "내가 어떤 사람인지 알고 싶다면?",
        "나는 누구인가?",
        "다른 사람들은 나를 어떻게 생각할까?"
    ];
    
    let currentIndex = 0;
    let isAnimating = false;
    const typingElement = $('.typing-text');
    
    /**
     * 텍스트를 한 글자씩 타이핑하는 함수
     * @param {string} text - 타이핑할 텍스트
     * @param {jQuery} element - 대상 요소
     * @param {number} index - 현재 글자 인덱스
     */
    function typeText(text, element, index = 0) {
        if (!isAnimating) return; // 애니메이션이 중단되었으면 종료
        
        if (index < text.length) {
            // 한 글자씩 추가
            element.text(element.text() + text.charAt(index));
            setTimeout(() => typeText(text, element, index + 1), config.typeSpeed);
        } else {
            // 타이핑 완료 후 대기
            setTimeout(() => eraseText(element), config.displayTime);
        }
    }
    
    /**
     * 텍스트를 한 글자씩 지우는 함수
     * @param {jQuery} element - 대상 요소
     */
    function eraseText(element) {
        if (!isAnimating) return; // 애니메이션이 중단되었으면 종료
        
        const text = element.text();
        if (text.length > 0) {
            // 뒤에서부터 한 글자씩 제거
            element.text(text.substring(0, text.length - 1));
            setTimeout(() => eraseText(element), config.eraseSpeed);
        } else {
            // 다음 텍스트로 순환
            currentIndex = (currentIndex + 1) % texts.length;
            setTimeout(() => {
                if (isAnimating) {
                    typeText(texts[currentIndex], element);
                }
            }, config.switchDelay);
        }
    }
    
    /**
     * 애니메이션 시작
     */
    function startAnimation() {
        if (typingElement.length && texts.length > 0) {
            isAnimating = true;
            typingElement.text(''); // 초기화
            typeText(texts[currentIndex], typingElement);
        }
    }
    
    /**
     * 애니메이션 중지
     */
    function stopAnimation() {
        isAnimating = false;
    }
    
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
    // Start typing animation
    addTypingAnimation();
    
    // Add click events to personality nodes in food chain
    $('.personality-node').on('click', function() {
        const className = $(this).attr('class').split(' ').find(cls => cls.includes('-'));
        if (className) {
            const personalityType = className;
            
            // Find the corresponding personality card and trigger its click event
            $(`.personality-type-card[data-personality="${personalityType}"]`).click();
        }
    });
});