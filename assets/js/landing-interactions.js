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
 */
function addTypingAnimation() {
    const texts = [
        "나는 누구인가?",
        "다른 사람들은 나를 어떻게 판단할까?",
        "나의 진짜 성격은 무엇일까?",
        "내가 어떤 사람인지 알고 싶다면?"
    ];
    
    let currentIndex = 0;
    const typingElement = $('.typing-text');
    
    function typeText(text, element, index = 0) {
        if (index < text.length) {
            element.text(element.text() + text.charAt(index));
            setTimeout(() => typeText(text, element, index + 1), 100);
        } else {
            // Wait and then erase
            setTimeout(() => eraseText(element), 2000);
        }
    }
    
    function eraseText(element) {
        const text = element.text();
        if (text.length > 0) {
            element.text(text.substring(0, text.length - 1));
            setTimeout(() => eraseText(element), 50);
        } else {
            // Move to next text
            currentIndex = (currentIndex + 1) % texts.length;
            setTimeout(() => typeText(texts[currentIndex], element), 500);
        }
    }
    
    // Start the typing animation
    if (typingElement.length) {
        typeText(texts[currentIndex], typingElement);
    }
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