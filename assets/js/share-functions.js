/**
 * 테토-에겐 성격 유형 테스트 공유 기능 모듈
 * 
 * 이 모듈은 테스트 결과를 소셜 미디어에 공유하고 결과 이미지를 생성하는 기능을 제공합니다.
 * 요구사항 4.1, 4.2, 4.3, 4.4에 따라 구현되었습니다.
 */

/**
 * 결과 공유
 * @param {string} platform - 공유 플랫폼 (facebook, twitter, line, kakaotalk, link)
 * @param {Object} personalityType - 성격 유형 결과 객체
 */
function shareResult(platform, personalityType) {
    // 기본 공유 정보 설정
    const url = window.location.href;
    const title = `테토-에겐 성격 유형 테스트 결과: ${personalityType.personalityType}`;
    const description = `나의 테토-에겐 성격 유형은 ${personalityType.personalityType}입니다. 당신의 유형도 알아보세요!`;
    
    // 공유 플랫폼별 처리
    switch (platform) {
        case 'facebook':
            // Facebook 공유
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(description)}`, '_blank', 'width=600,height=400');
            showShareToast('Facebook에 공유되었습니다.');
            break;
            
        case 'twitter':
            // Twitter 공유
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
            showShareToast('Twitter에 공유되었습니다.');
            break;
            
        case 'line':
            // LINE 공유
            window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank', 'width=600,height=600');
            showShareToast('LINE에 공유되었습니다.');
            break;
            
        case 'kakaotalk':
            // 카카오톡 공유 (Kakao SDK 필요)
            if (typeof Kakao !== 'undefined' && Kakao.isInitialized()) {
                Kakao.Link.sendDefault({
                    objectType: 'feed',
                    content: {
                        title: title,
                        description: description,
                        imageUrl: `${window.location.origin}/assets/images/${personalityType.personalityType}.jpg`,
                        link: {
                            mobileWebUrl: url,
                            webUrl: url
                        }
                    },
                    buttons: [
                        {
                            title: '테스트 하러가기',
                            link: {
                                mobileWebUrl: url,
                                webUrl: url
                            }
                        }
                    ]
                });
                showShareToast('카카오톡에 공유되었습니다.');
            } else {
                alert('카카오톡 공유 기능을 사용할 수 없습니다.');
            }
            break;
            
        case 'link':
            // 링크 복사
            copyToClipboard(url);
            showShareToast('링크가 클립보드에 복사되었습니다.');
            break;
    }
    
    // 공유 이벤트 추적 (선택 사항)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'share', {
            'method': platform,
            'content_type': 'personality_test',
            'personality_type': personalityType.personalityType
        });
    }
}

/**
 * 클립보드에 텍스트 복사
 * @param {string} text - 복사할 텍스트
 * @returns {boolean} 복사 성공 여부
 */
function copyToClipboard(text) {
    // 최신 Clipboard API 사용 시도
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text)
            .then(() => true)
            .catch(() => {
                // 실패 시 대체 방법 사용
                return fallbackCopyToClipboard(text);
            });
        return true;
    }
    
    // 대체 방법 사용
    return fallbackCopyToClipboard(text);
}

/**
 * 클립보드 복사 대체 방법
 * @param {string} text - 복사할 텍스트
 * @returns {boolean} 복사 성공 여부
 */
function fallbackCopyToClipboard(text) {
    try {
        // textarea 요소 생성
        const textarea = document.createElement('textarea');
        textarea.value = text;
        
        // 화면 밖으로 위치시키기
        textarea.style.position = 'fixed';
        textarea.style.left = '-999999px';
        textarea.style.top = '-999999px';
        
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        
        // 복사 명령 실행
        const success = document.execCommand('copy');
        
        // 요소 제거
        document.body.removeChild(textarea);
        
        return success;
    } catch (err) {
        console.error('클립보드 복사 실패:', err);
        return false;
    }
}

/**
 * 공유 완료 토스트 메시지 표시
 * @param {string} message - 표시할 메시지
 */
function showShareToast(message) {
    // 기존 토스트가 있으면 제거
    const existingToast = document.getElementById('share-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 토스트 요소 생성
    const toast = document.createElement('div');
    toast.id = 'share-toast';
    toast.className = 'share-toast';
    toast.innerHTML = `
        <div class="share-toast-content">
            <i class="fas fa-check-circle me-2"></i>
            ${message}
        </div>
    `;
    
    // 문서에 추가
    document.body.appendChild(toast);
    
    // 토스트 표시 애니메이션
    setTimeout(() => {
        toast.classList.add('show');
        
        // 3초 후 숨기기
        setTimeout(() => {
            toast.classList.remove('show');
            
            // 애니메이션 완료 후 제거
            setTimeout(() => {
                toast.remove();
            }, 500);
        }, 3000);
    }, 100);
}

/**
 * 결과 이미지 생성 및 다운로드
 * @param {Object} personalityType - 성격 유형 결과 객체
 */
async function downloadResultImage(personalityType) {
    try {
        // 로딩 표시
        showLoading();
        
        // 결과 컨테이너 요소 가져오기
        const resultContainer = document.querySelector('.result-container');
        
        if (!resultContainer) {
            throw new Error('결과 컨테이너를 찾을 수 없습니다.');
        }
        
        // 이미지 생성을 위한 스타일 백업
        const originalStyle = resultContainer.getAttribute('style') || '';
        const originalWidth = resultContainer.style.width;
        const originalHeight = resultContainer.style.height;
        
        // 이미지 생성을 위한 스타일 설정
        resultContainer.style.width = '600px';
        resultContainer.style.padding = '30px';
        resultContainer.style.margin = '0';
        resultContainer.style.backgroundColor = '#ffffff';
        
        // 공유용 워터마크 추가
        const watermark = document.createElement('div');
        watermark.className = 'result-watermark';
        watermark.innerHTML = `
            <p class="mb-0">테토-에겐 성격 유형 테스트</p>
            <p class="mb-0 small">www.teto-egen-test.com</p>
        `;
        resultContainer.appendChild(watermark);
        
        // html2canvas 옵션
        const options = {
            scale: 2, // 고해상도
            useCORS: true, // 외부 이미지 허용
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false
        };
        
        // 이미지 생성
        const canvas = await html2canvas(resultContainer, options);
        
        // 워터마크 제거
        resultContainer.removeChild(watermark);
        
        // 원래 스타일 복원
        resultContainer.style.width = originalWidth;
        resultContainer.style.height = originalHeight;
        resultContainer.setAttribute('style', originalStyle);
        
        // 이미지 데이터 URL 생성
        const imageDataUrl = canvas.toDataURL('image/png');
        
        // 모바일 기기 확인
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // 모바일 기기에서 Web Share API 지원 확인
        if (isMobile && navigator.share && navigator.canShare) {
            try {
                // 이미지 데이터 URL을 Blob으로 변환
                const blob = await dataURLtoBlob(imageDataUrl);
                const file = new File([blob], `테토에겐_성격유형_${personalityType.personalityType}.png`, { type: 'image/png' });
                
                // 공유 가능 여부 확인
                const shareData = {
                    title: '테토-에겐 성격 유형 테스트 결과',
                    text: `나의 테토-에겐 성격 유형은 ${personalityType.personalityType}입니다. 당신의 유형도 알아보세요!`,
                    files: [file]
                };
                
                if (navigator.canShare(shareData)) {
                    // Web Share API로 공유
                    await navigator.share(shareData);
                    hideLoading();
                    return;
                }
            } catch (shareError) {
                console.warn('Web Share API 사용 실패:', shareError);
                // 실패 시 기본 다운로드 방식으로 진행
            }
        }
        
        // 기본 다운로드 방식 (데스크톱 또는 Web Share API 미지원 기기)
        const downloadLink = document.createElement('a');
        downloadLink.href = imageDataUrl;
        downloadLink.download = `테토에겐_성격유형_${personalityType.personalityType}.png`;
        
        // 다운로드 트리거
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // 로딩 숨기기
        hideLoading();
        
        // 다운로드 완료 메시지
        showShareToast('결과 이미지가 다운로드되었습니다.');
        
    } catch (error) {
        console.error('결과 이미지 생성 실패:', error);
        hideLoading();
        alert('결과 이미지 생성에 실패했습니다. 다시 시도해 주세요.');
    }
}

/**
 * Data URL을 Blob으로 변환
 * @param {string} dataURL - 변환할 Data URL
 * @returns {Promise<Blob>} 변환된 Blob
 */
function dataURLtoBlob(dataURL) {
    return new Promise((resolve) => {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        
        resolve(new Blob([u8arr], { type: mime }));
    });
}

/**
 * 카카오톡 SDK 초기화
 * @param {string} appKey - 카카오톡 앱 키
 */
function initKakaoSDK(appKey) {
    // 카카오톡 SDK가 로드되었는지 확인
    if (typeof Kakao === 'undefined') {
        console.warn('카카오톡 SDK가 로드되지 않았습니다.');
        return;
    }
    
    // SDK 초기화
    if (!Kakao.isInitialized()) {
        Kakao.init(appKey);
        console.log('카카오톡 SDK 초기화 완료');
    }
}

// 토스트 메시지 스타일 추가
function addToastStyles() {
    // 이미 스타일이 추가되어 있는지 확인
    if (document.getElementById('share-toast-styles')) {
        return;
    }
    
    // 스타일 요소 생성
    const style = document.createElement('style');
    style.id = 'share-toast-styles';
    style.textContent = `
        .share-toast {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 24px;
            border-radius: 50px;
            z-index: 9999;
            opacity: 0;
            transition: all 0.5s ease;
        }
        
        .share-toast.show {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        
        .share-toast-content {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
        }
        
        .result-watermark {
            position: absolute;
            bottom: 10px;
            right: 10px;
            text-align: right;
            font-size: 12px;
            color: #999;
            opacity: 0.7;
        }
        
        @media (max-width: 768px) {
            .share-toast {
                width: 80%;
                font-size: 12px;
                padding: 10px 20px;
            }
        }
    `;
    
    // 문서에 추가
    document.head.appendChild(style);
}

// 페이지 로드 시 스타일 추가
document.addEventListener('DOMContentLoaded', addToastStyles);

// 모듈 내보내기
window.shareModule = {
    shareResult,
    copyToClipboard,
    downloadResultImage,
    initKakaoSDK
};