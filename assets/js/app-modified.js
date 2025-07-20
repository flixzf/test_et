/**
 * 테토-에겐 성격 유형 테스트 애플리케이션
 * AI 기능 제거 버전
 */

// 전역 변수
let currentQuestionIndex = 0;
let userResponses = [];
let uploadedImage = null;

// DOM이 로드된 후 실행
$(document).ready(function() {
    // 성능 최적화 모듈 사용 확인
    const isOptimized = typeof window.performanceOptimizer !== 'undefined';
    
    // 이벤트 리스너 등록
    registerEventListeners();
    
    // 페이지 이탈 방지
    setupBeforeUnloadEvent();
    
    // 지연 로딩 설정
    if (isOptimized) {
        setupLazyLoading();
    }
    
    // 언어 시스템 초기화
    initializeLanguageSystem();
});

/**
 * 이벤트 리스너 등록
 */
function registerEventListeners() {
    // 테스트 시작 버튼 클릭 이벤트
    $('#start-test-btn').on('click', function() {
        startSurvey();
    });
    
    // 더 알아보기 버튼 클릭 이벤트
    $('#more-info-btn').on('click', function() {
        $('#infoModal').modal('show');
    });
    
    // 창 닫기 이벤트 (페이지 이탈 방지)
    $(window).on('beforeunload', function(e) {
        if (isTestInProgress()) {
            e.preventDefault();
            return '테스트가 진행 중입니다. 정말로 나가시겠습니까?';
        }
    });
}

/**
 * 테스트 진행 중인지 확인
 */
function isTestInProgress() {
    return currentQuestionIndex > 0 && currentQuestionIndex < questions.length;
}

/**
 * 설문 시작
 */
function startSurvey() {
    // questions 변수가 정의되었는지 확인
    if (typeof questions === 'undefined') {
        console.error('questions 변수가 정의되지 않았습니다.');
        alert('질문 데이터를 불러오는 중 오류가 발생했습니다. 페이지를 새로고침해 주세요.');
        return;
    }
    
    // 시작 화면 숨기기
    $('#start-screen').removeClass('active');
    
    // 설문 화면 표시
    $('#survey-screen').addClass('active');
    
    // 첫 번째 질문 표시
    showQuestion(0);
}

/**
 * 질문 표시
 * @param {number} index - 질문 인덱스
 */
function showQuestion(index) {
    currentQuestionIndex = index;
    const question = questions[index];
    const previousResponse = userResponses[index];
    
    // 설문 화면 HTML 생성
    let html = `
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-8 col-lg-6">
                    <div class="progress-container">
                        <div class="progress">
                            <div class="progress-bar" role="progressbar" style="width: ${(index + 1) / questions.length * 100}%" 
                                aria-valuenow="${(index + 1) / questions.length * 100}" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                        <div class="progress-text">
                            <span class="badge bg-primary">${index + 1} / ${questions.length}</span>
                            <span class="category-badge badge bg-secondary">${question.category}</span>
                        </div>
                    </div>
                    
                    <div class="question-container animate__animated animate__fadeIn">
                        <h4 class="question-text mb-4">Q${index + 1}. ${question.text}</h4>
                        
                        ${question.imageUrl ? `
                        <div class="question-image mb-4">
                            <img src="${question.imageUrl}" alt="질문 이미지" class="img-fluid rounded">
                        </div>
                        ` : ''}
                        
                        <div class="options-container">
    `;
    
    // 선택지 HTML 생성
    question.options.forEach((option, optionIndex) => {
        const isSelected = previousResponse && previousResponse.selectedOption === optionIndex;
        html += `
            <button class="option-btn ${isSelected ? 'selected' : ''} animate__animated animate__fadeInUp animate__delay-${optionIndex}s" 
                    data-option-index="${optionIndex}">
                <span class="option-number">${optionIndex + 1}</span>
                <span class="option-text">${option.text}</span>
            </button>
        `;
    });
    
    // 네비게이션 버튼 HTML 생성
    html += `
                        </div>
                    </div>
                    
                    <div class="navigation-buttons d-flex justify-content-between mt-4">
                        ${index > 0 ? 
                            '<button id="prev-btn" class="btn btn-outline-secondary"><i class="fas fa-arrow-left me-2"></i>이전</button>' : 
                            '<div></div>'}
                        <div class="text-center">
                            <div class="question-indicator">
                                ${Array(questions.length).fill(0).map((_, i) => 
                                    `<span class="dot ${i === index ? 'active' : ''}"></span>`
                                ).join('')}
                            </div>
                        </div>
                        <div></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // HTML 삽입
    $('#survey-screen').html(html);
    
    // 이벤트 리스너 등록
    $('.option-btn').on('click', function() {
        const optionIndex = $(this).data('option-index');
        selectOption(optionIndex);
    });
    
    $('#prev-btn').on('click', function() {
        navigateToPreviousQuestion();
    });
    
    // 키보드 내비게이션 지원
    $(document).on('keydown', function(e) {
        // 설문 화면이 활성화된 경우에만 키보드 내비게이션 적용
        if (!$('#survey-screen').hasClass('active')) return;
        
        // 숫자 키 1-4로 선택지 선택
        if (e.key >= '1' && e.key <= '4') {
            const optionIndex = parseInt(e.key) - 1;
            if (optionIndex < questions[currentQuestionIndex].options.length) {
                selectOption(optionIndex);
            }
        }
        
        // 왼쪽 화살표 키로 이전 질문으로 이동
        if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
            navigateToPreviousQuestion();
        }
        
        // 오른쪽 화살표 키로 다음 질문으로 이동 (응답이 있는 경우에만)
        if (e.key === 'ArrowRight' && userResponses[currentQuestionIndex] && currentQuestionIndex < questions.length - 1) {
            showQuestion(currentQuestionIndex + 1);
        }
    });
}

/**
 * 선택지 선택
 * @param {number} optionIndex - 선택한 옵션 인덱스
 */
function selectOption(optionIndex) {
    const question = questions[currentQuestionIndex];
    const option = question.options[optionIndex];
    
    // 선택된 옵션 시각적 표시
    $('.option-btn').removeClass('selected');
    $(`.option-btn[data-option-index="${optionIndex}"]`).addClass('selected');
    
    // 사용자 응답 저장
    userResponses[currentQuestionIndex] = {
        questionId: question.id,
        selectedOption: optionIndex,
        weight: question.weight || 1,
        tetoScore: option.tetoScore,
        egenScore: option.egenScore,
        masculinityScore: option.masculinityScore,
        femininityScore: option.femininityScore,
        confidenceWeight: option.confidenceWeight || 1
    };
    
    // 잠시 후 다음 질문으로 이동 (애니메이션 효과를 위한 지연)
    setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
            showQuestion(currentQuestionIndex + 1);
        } else {
            // 마지막 질문 후 결과 바로 표시 (사진 업로드 단계 건너뜀)
            const surveyResult = calculateSurveyResult(userResponses);
            showResult(surveyResult);
        }
    }, 300);
}

/**
 * 설문 결과 계산
 * @param {Array} responses - 사용자 응답 배열
 * @returns {Object} 계산된 결과
 */
function calculateSurveyResult(responses) {
    // 점수 초기화
    let tetoScore = 0;
    let egenScore = 0;
    let masculinityScore = 0;
    let femininityScore = 0;
    let totalWeight = 0;
    
    // 각 응답에 대한 점수 계산
    responses.forEach(response => {
        const weight = response.weight || 1;
        totalWeight += weight;
        
        tetoScore += response.tetoScore * weight;
        egenScore += response.egenScore * weight;
        masculinityScore += response.masculinityScore * weight;
        femininityScore += response.femininityScore * weight;
    });
    
    // 가중치에 따른 평균 계산
    tetoScore = totalWeight > 0 ? tetoScore / totalWeight : 0;
    egenScore = totalWeight > 0 ? egenScore / totalWeight : 0;
    masculinityScore = totalWeight > 0 ? masculinityScore / totalWeight : 0;
    femininityScore = totalWeight > 0 ? femininityScore / totalWeight : 0;
    
    // 테토-에겐 점수 정규화 (합이 100이 되도록)
    const tetoEgenSum = tetoScore + egenScore;
    if (tetoEgenSum > 0) {
        tetoScore = (tetoScore / tetoEgenSum) * 100;
        egenScore = (egenScore / tetoEgenSum) * 100;
    } else {
        tetoScore = 50;
        egenScore = 50;
    }
    
    // 남성성-여성성 점수 정규화 (합이 100이 되도록)
    const mascFemSum = masculinityScore + femininityScore;
    if (mascFemSum > 0) {
        masculinityScore = (masculinityScore / mascFemSum) * 100;
        femininityScore = (femininityScore / mascFemSum) * 100;
    } else {
        masculinityScore = 50;
        femininityScore = 50;
    }
    
    // 결과 반환
    return {
        tetoScore,
        egenScore,
        masculinityScore,
        femininityScore
    };
}

/**
 * 성격 유형 결정
 * @param {Object} result - 계산된 결과
 * @returns {Object} 성격 유형 정보
 */
function determinePersonalityType(result) {
    // 테토-에겐 성향에 따른 분류
    const isTeto = result.tetoScore >= result.egenScore;
    
    // 남성성-여성성에 따른 분류
    const isMasculine = result.masculinityScore >= result.femininityScore;
    
    // 성격 유형 결정
    let personalityType;
    if (isTeto && isMasculine) {
        personalityType = "테토남";
    } else if (isTeto && !isMasculine) {
        personalityType = "테토녀";
    } else if (!isTeto && isMasculine) {
        personalityType = "에겐남";
    } else {
        personalityType = "에겐녀";
    }
    
    // 결과 반환
    return {
        personalityType,
        tetoScore: result.tetoScore,
        egenScore: result.egenScore,
        masculinityScore: result.masculinityScore,
        femininityScore: result.femininityScore
    };
}

/**
 * 결과 표시
 * @param {Object} result - 분석 결과
 */
function showResult(result) {
    // 사진 업로드 화면 숨기기 (표시된 경우)
    $('#photo-screen').removeClass('active');
    $('#survey-screen').removeClass('active');
    
    // 성격 유형 결정
    const personalityType = determinePersonalityType(result);
    
    // 성격 유형별 특징 및 설명
    const characteristics = personalityCharacteristics[personalityType.personalityType];
    const description = personalityDescriptions[personalityType.personalityType];
    
    // 성격 유형별 클래스 결정
    let personalityClass = '';
    switch (personalityType.personalityType) {
        case "테토남":
            personalityClass = 'teto-male';
            break;
        case "테토녀":
            personalityClass = 'teto-female';
            break;
        case "에겐남":
            personalityClass = 'egen-male';
            break;
        case "에겐녀":
            personalityClass = 'egen-female';
            break;
    }
    
    // 결과 화면 HTML 생성
    let html = `
        <div class="container ${personalityClass}">
            <div class="row justify-content-center">
                <div class="col-md-8 col-lg-6">
                    <div class="result-container text-center">
                        <h2 class="result-title personality-color">당신의 테토-에겐 성격 유형은</h2>
                        <h1 class="display-4 mb-4 personality-color">${personalityType.personalityType}</h1>
                        
                        <div class="result-image-container mb-4">
                            <img src="assets/images/${personalityType.personalityType}.jpg" alt="${personalityType.personalityType}" class="result-image personality-border">
                        </div>
                        
                        <div class="description mb-4">
                            <p>${description}</p>
                        </div>
                        
                        <div class="characteristics mb-4">
                            <h4 class="mb-3 personality-color">${personalityType.personalityType}의 특징</h4>
                            <ul class="list-unstyled">
    `;
    
    // 특징 목록 HTML 생성
    characteristics.forEach(characteristic => {
        html += `
            <li class="characteristic-item mb-2">
                <i class="fas fa-check-circle me-2 personality-color"></i>${characteristic}
            </li>
        `;
    });
    
    html += `
                            </ul>
                        </div>
    `;
    
    // 점수 그래프 표시
    html += `
        <div class="score-graph mb-4">
            <h4 class="mb-3 personality-color">성향 점수</h4>
            <div class="card">
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-6">
                            <div class="score-label">테토 성향</div>
                            <div class="progress">
                                <div class="progress-bar bg-primary" role="progressbar" style="width: ${personalityType.tetoScore}%" 
                                    aria-valuenow="${personalityType.tetoScore}" aria-valuemin="0" aria-valuemax="100">
                                    ${personalityType.tetoScore.toFixed(1)}
                                </div>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="score-label">에겐 성향</div>
                            <div class="progress">
                                <div class="progress-bar bg-success" role="progressbar" style="width: ${personalityType.egenScore}%" 
                                    aria-valuenow="${personalityType.egenScore}" aria-valuemin="0" aria-valuemax="100">
                                    ${personalityType.egenScore.toFixed(1)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-6">
                            <div class="score-label">남성성</div>
                            <div class="progress">
                                <div class="progress-bar bg-info" role="progressbar" style="width: ${personalityType.masculinityScore}%" 
                                    aria-valuenow="${personalityType.masculinityScore}" aria-valuemin="0" aria-valuemax="100">
                                    ${personalityType.masculinityScore.toFixed(1)}
                                </div>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="score-label">여성성</div>
                            <div class="progress">
                                <div class="progress-bar bg-danger" role="progressbar" style="width: ${personalityType.femininityScore}%" 
                                    aria-valuenow="${personalityType.femininityScore}" aria-valuemin="0" aria-valuemax="100">
                                    ${personalityType.femininityScore.toFixed(1)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;  
  
    // 연애 먹이사슬 HTML 생성
    html += `
                        <div class="food-chain-container">
                            <h4 class="mb-3">연애 먹이사슬</h4>
                            <p class="mb-2">에겐녀 → 에겐남 → 테토녀 → 테토남 → 에겐녀</p>
                            <div class="food-chain-image">
                                <img src="assets/images/food-chain.jpg" alt="연애 먹이사슬" class="img-fluid">
                            </div>
                        </div>
                        
                        <div class="share-buttons mt-4">
                            <h5 class="mb-3">결과 공유하기</h5>
                            <button class="btn btn-primary share-btn" data-platform="facebook">
                                <i class="fab fa-facebook-f"></i>
                            </button>
                            <button class="btn btn-info share-btn" data-platform="twitter">
                                <i class="fab fa-twitter"></i>
                            </button>
                            <button class="btn btn-success share-btn" data-platform="line">
                                <i class="fab fa-line"></i>
                            </button>
                            <button class="btn btn-secondary share-btn" data-platform="link">
                                <i class="fas fa-link"></i>
                            </button>
                            <button id="download-result" class="btn btn-danger share-btn">
                                <i class="fas fa-download"></i>
                            </button>
                        </div>
                        
                        <div class="mt-5">
                            <button id="restart-test" class="btn btn-lg btn-outline-primary">다시 테스트하기</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // HTML 삽입
    $('#result-screen').html(html);
    $('#result-screen').addClass('active');
    
    // 이벤트 리스너 등록
    setupResultEvents();
}

/**
 * 결과 화면 이벤트 설정
 */
function setupResultEvents() {
    // 다시 테스트하기 버튼 클릭 이벤트
    $('#restart-test').on('click', function() {
        resetTest();
    });
    
    // 공유 버튼 클릭 이벤트
    $('.share-btn').on('click', function() {
        const platform = $(this).data('platform');
        shareResult(platform);
    });
    
    // 결과 이미지 다운로드 버튼 클릭 이벤트
    $('#download-result').on('click', function() {
        downloadResultImage();
    });
}

/**
 * 테스트 초기화
 */
function resetTest() {
    // 변수 초기화
    currentQuestionIndex = 0;
    userResponses = [];
    uploadedImage = null;
    
    // 화면 초기화
    $('.screen').removeClass('active');
    $('#start-screen').addClass('active');
}

/**
 * 결과 공유
 * @param {string} platform - 공유 플랫폼
 */
function shareResult(platform) {
    const url = window.location.href;
    const title = '테토-에겐 성격 유형 테스트 결과';
    
    switch (platform) {
        case 'facebook':
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
            break;
        case 'twitter':
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
            break;
        case 'line':
            window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`, '_blank');
            break;
        case 'link':
            copyToClipboard(url);
            alert('링크가 클립보드에 복사되었습니다.');
            break;
    }
}

/**
 * 클립보드에 텍스트 복사
 * @param {string} text - 복사할 텍스트
 */
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

/**
 * 결과 이미지 다운로드
 */
function downloadResultImage() {
    // 실제 구현에서는 html2canvas 등을 사용하여 결과 이미지 생성
    alert('결과 이미지 다운로드 기능은 준비 중입니다.');
}

/**
 * 로딩 오버레이 표시
 */
function showLoading() {
    $('#loading-overlay').removeClass('d-none');
}

/**
 * 로딩 오버레이 숨기기
 */
function hideLoading() {
    $('#loading-overlay').addClass('d-none');
}

/**
 * 페이지 이탈 방지 이벤트 설정
 */
function setupBeforeUnloadEvent() {
    window.addEventListener('beforeunload', function(e) {
        if (isTestInProgress()) {
            e.preventDefault();
            e.returnValue = confirmPageExit();
            return confirmPageExit();
        }
    });
}

/**
 * 이전 질문으로 이동
 */
function navigateToPreviousQuestion() {
    // 현재 질문에서 이전 질문으로 이동
    if (currentQuestionIndex > 0) {
        // 애니메이션 효과를 위한 클래스 추가
        $('.question-container').removeClass('animate__fadeIn').addClass('animate__fadeOut');
        
        // 애니메이션 완료 후 이전 질문 표시
        setTimeout(() => {
            showQuestion(currentQuestionIndex - 1);
        }, 300);
    }
}

/**
 * 페이지 이탈 확인 메시지
 */
function confirmPageExit() {
    return '테스트가 진행 중입니다. 페이지를 떠나면 진행 상황이 저장되지 않습니다.';
}

/**
 * 언어 시스템 초기화
 * 언어 설정을 로드하고 언어 드롭다운을 초기화합니다.
 */
function initializeLanguageSystem() {
    try {
        // 언어 모듈이 로드되었는지 확인
        if (!window.languageUtils || !window.languageStorage || !window.languageLoader || 
            !window.languageTranslator || !window.languageDropdown) {
            console.warn('언어 모듈이 로드되지 않았습니다.');
            return;
        }
        
        // 성능 최적화 모듈 사용 확인
        const isOptimized = typeof window.performanceOptimizer !== 'undefined';
        
        // 언어 시스템 초기화
        window.languageTranslator.init()
            .then(language => {
                console.log(`언어 시스템 초기화 완료: ${language.code} (${language.name})`);
                
                // 언어 드롭다운 초기화
                window.languageDropdown.init('language-dropdown-container');
                
                // RTL 언어 지원
                if (window.languageUtils.isRTL()) {
                    document.documentElement.dir = 'rtl';
                    document.body.classList.add('rtl');
                } else {
                    document.documentElement.dir = 'ltr';
                    document.body.classList.remove('rtl');
                }
                
                // 성능 최적화가 활성화된 경우에만 추가 최적화 적용
                if (isOptimized) {
                    // 페이지 로드 후 사용자가 상호작용할 때까지 기다린 후 추가 언어 파일 미리 로드
                    const userInteractionEvents = ['mousemove', 'click', 'keydown', 'touchstart', 'scroll'];
                    
                    const handleUserInteraction = () => {
                        // 사용자 상호작용 이벤트 리스너 제거
                        userInteractionEvents.forEach(event => {
                            window.removeEventListener(event, handleUserInteraction);
                        });
                        
                        // 사용자가 상호작용한 후 미리 로드 시작
                        setTimeout(() => {
                            window.languageLoader.preloadLikelyLanguages();
                        }, 3000); // 사용자 상호작용 후 3초 후에 미리 로드 시작
                    };
                    
                    // 사용자 상호작용 이벤트 리스너 등록
                    userInteractionEvents.forEach(event => {
                        window.addEventListener(event, handleUserInteraction, { once: true });
                    });
                }
            })
            .catch(error => {
                console.error('언어 시스템 초기화 실패:', error);
            });
    } catch (error) {
        console.error('언어 시스템 초기화 중 오류 발생:', error);
    }
}

/**
 * 지연 로딩 설정
 * 필요한 리소스를 필요할 때만 로드하도록 설정합니다.
 */
function setupLazyLoading() {
    // 성능 최적화 모듈이 로드되었는지 확인
    if (typeof window.performanceOptimizer === 'undefined') {
        return;
    }
    
    // 이미지 지연 로딩 설정
    window.performanceOptimizer.setupLazyLoading();
    
    // 스크롤 이벤트에 따른 컨텐츠 지연 로딩
    window.addEventListener('scroll', function() {
        window.performanceOptimizer.checkLazyLoadElements();
    });
    
    // 리사이즈 이벤트에 따른 컨텐츠 지연 로딩
    window.addEventListener('resize', function() {
        window.performanceOptimizer.checkLazyLoadElements();
    });
    
    // 초기 체크
    window.performanceOptimizer.checkLazyLoadElements();
}