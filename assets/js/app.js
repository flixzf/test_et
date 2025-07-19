/**
 * 테토-에겐 성격 유형 테스트 애플리케이션
 */

// 전역 변수
let currentQuestionIndex = 0;
let userResponses = [];
let uploadedImage = null;
let model = null;

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
}/**
 
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
}/**
 *
 선택지 선택
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
            showPhotoUploadScreen();
        }
    }, 300);
}

/**
 * 사진 업로드 화면 표시
 */
function showPhotoUploadScreen() {
    // 설문 화면 숨기기
    $('#survey-screen').removeClass('active');
    
    // 사진 업로드 화면 HTML 생성
    let html = `
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-8 col-lg-6">
                    <div class="upload-container text-center animate__animated animate__fadeIn">
                        <h3 class="mb-4">얼굴 사진 업로드 <span class="badge bg-secondary">선택사항</span></h3>
                        <p class="mb-4">더 정확한 테토-에겐 성격 유형 분석을 위해 얼굴 사진을 업로드해 주세요.</p>
                        
                        <div class="upload-instruction mb-3">
                            <div class="row">
                                <div class="col-4 text-center">
                                    <div class="upload-tip">
                                        <i class="fas fa-check-circle text-success mb-2"></i>
                                        <p class="small">정면 얼굴</p>
                                    </div>
                                </div>
                                <div class="col-4 text-center">
                                    <div class="upload-tip">
                                        <i class="fas fa-check-circle text-success mb-2"></i>
                                        <p class="small">밝은 조명</p>
                                    </div>
                                </div>
                                <div class="col-4 text-center">
                                    <div class="upload-tip">
                                        <i class="fas fa-check-circle text-success mb-2"></i>
                                        <p class="small">선명한 이미지</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="upload-area" id="upload-area">
                            <i class="fas fa-cloud-upload-alt fa-3x mb-3"></i>
                            <p>이곳을 클릭하거나 사진을 끌어다 놓으세요</p>
                            <input type="file" id="file-input" accept="image/*" style="display: none;">
                            <div class="upload-formats small text-muted mt-2">지원 형식: JPG, PNG, GIF (최대 5MB)</div>
                        </div>
                        
                        <div id="upload-progress" class="mt-3" style="display: none;">
                            <div class="progress">
                                <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 100%"></div>
                            </div>
                            <p class="small text-muted mt-1">이미지 처리 중...</p>
                        </div>
                        
                        <div id="preview-container" class="mt-4" style="display: none;">
                            <div class="preview-wrapper">
                                <img id="image-preview" class="upload-preview img-fluid rounded">
                                <div class="preview-overlay">
                                    <button id="remove-image" class="btn btn-sm btn-danger">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            </div>
                            <p class="small text-success mt-2"><i class="fas fa-check-circle me-1"></i>이미지가 업로드되었습니다</p>
                        </div>
                        
                        <div class="mt-4">
                            <button id="upload-submit" class="btn btn-primary me-2" disabled>
                                <i class="fas fa-brain me-1"></i>분석하기
                            </button>
                            <button id="skip-upload" class="btn btn-outline-secondary">
                                <i class="fas fa-forward me-1"></i>건너뛰기
                            </button>
                        </div>
                        
                        <div class="privacy-notice mt-4">
                            <p class="small text-muted">
                                <i class="fas fa-shield-alt me-1"></i>
                                업로드된 사진은 분석 후 즉시 삭제되며 저장되지 않습니다.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // HTML 삽입
    $('#photo-screen').html(html);
    $('#photo-screen').addClass('active');
    
    // 이벤트 리스너 등록
    setupPhotoUploadEvents();
}
/**
 * 사진 업로드 이벤트 설정
 */
function setupPhotoUploadEvents() {
    const uploadArea = $('#upload-area');
    const fileInput = $('#file-input');
    const previewContainer = $('#preview-container');
    const imagePreview = $('#image-preview');
    const removeImageBtn = $('#remove-image');
    const uploadSubmitBtn = $('#upload-submit');
    const skipUploadBtn = $('#skip-upload');
    
    // 업로드 영역 클릭 시 파일 선택 다이얼로그 표시
    uploadArea.on('click', function() {
        fileInput.click();
    });
    
    // 드래그 앤 드롭 이벤트
    uploadArea.on('dragover', function(e) {
        e.preventDefault();
        uploadArea.addClass('dragover');
    });
    
    uploadArea.on('dragleave', function() {
        uploadArea.removeClass('dragover');
    });
    
    uploadArea.on('drop', function(e) {
        e.preventDefault();
        uploadArea.removeClass('dragover');
        
        const files = e.originalEvent.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });
    
    // 파일 선택 이벤트
    fileInput.on('change', function() {
        if (this.files.length > 0) {
            handleFileSelect(this.files[0]);
        }
    });
    
    // 이미지 삭제 버튼 클릭 이벤트
    removeImageBtn.on('click', function() {
        uploadedImage = null;
        fileInput.val('');
        previewContainer.hide();
        uploadSubmitBtn.prop('disabled', true);
    });
    
    // 분석하기 버튼 클릭 이벤트
    uploadSubmitBtn.on('click', function() {
        analyzeWithPhoto();
    });
    
    // 건너뛰기 버튼 클릭 이벤트
    skipUploadBtn.on('click', function() {
        analyzeWithoutPhoto();
    });
    
    // 모바일 기기에서 카메라 접근 기능 추가
    if (isMobileDevice().isMobile) {
        addCameraOption();
        // setupCameraCapture 함수는 camera-access.js에서 구현됨
    }
}

/**
 * 파일 선택 처리
 * @param {File} file - 선택한 파일
 */
function handleFileSelect(file) {
    // 이미지 파일 검증
    if (!file.type.match('image.*')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
    }
    
    // 파일 크기 검증 (최대 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.');
        return;
    }
    
    // 업로드 진행 상태 표시
    $('#upload-progress').show();
    $('#preview-container').hide();
    
    // 이미지 미리보기
    const reader = new FileReader();
    reader.onload = function(e) {
        // 이미지 검증 및 전처리
        validateAndPreprocessImage(e.target.result)
            .then(result => {
                // 업로드 진행 상태 숨기기
                $('#upload-progress').hide();
                
                // 이미지 미리보기 표시
                $('#image-preview').attr('src', result.imageData);
                $('#preview-container').fadeIn(300);
                $('#upload-submit').prop('disabled', false);
                uploadedImage = result.imageData;
            })
            .catch(error => {
                // 업로드 진행 상태 숨기기
                $('#upload-progress').hide();
                
                // 오류 메시지 표시
                alert(error.message || '이미지 처리 중 오류가 발생했습니다.');
            });
    };
    reader.onerror = function() {
        $('#upload-progress').hide();
        alert('파일을 읽는 중 오류가 발생했습니다.');
    };
    reader.readAsDataURL(file);
}/**

 * 모바일 기기 여부 확인
 * @returns {Object} 모바일 기기 정보
 */
function isMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    // 기기 유형 감지
    const isAndroid = /Android/i.test(userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const isWindowsPhone = /Windows Phone/i.test(userAgent);
    const isBlackBerry = /BlackBerry|BB10/i.test(userAgent);
    const isOpera = /Opera Mini/i.test(userAgent);
    const isWebOS = /webOS/i.test(userAgent);
    
    // 모바일 브라우저 감지
    const isMobileSafari = isIOS && !/(Chrome|CriOS|OPiOS)/i.test(userAgent);
    const isChrome = /Chrome|CriOS/i.test(userAgent);
    const isSamsung = /SamsungBrowser/i.test(userAgent);
    
    // 모바일 기기 여부
    const isMobile = isAndroid || isIOS || isWindowsPhone || isBlackBerry || isOpera || isWebOS;
    
    return {
        isMobile,
        isAndroid,
        isIOS,
        isWindowsPhone,
        isMobileSafari,
        isChrome,
        isSamsung,
        userAgent
    };
}

/**
 * 모바일 기기에 카메라 옵션 추가
 */
function addCameraOption() {
    const uploadArea = $('#upload-area');
    const deviceInfo = isMobileDevice();
    
    // 카메라 버튼 추가
    uploadArea.after(`
        <div class="text-center mt-3">
            <button id="camera-btn" class="btn btn-outline-primary">
                <i class="fas fa-camera me-2"></i>사진 촬영하기
            </button>
        </div>
    `);
    
    // 카메라 기능 설정
    setupCameraCapture();
}

/**
 * 사진과 함께 분석
 */
function analyzeWithPhoto() {
    // 로딩 오버레이 표시
    showLoading();
    
    // AI 모델 로드 및 분석
    loadModel()
        .then(() => {
            // 이미지 분석
            return analyzeImage(uploadedImage);
        })
        .then(imageAnalysisResult => {
            // 설문 결과와 이미지 분석 결과 통합
            const surveyResult = calculateSurveyResult(userResponses);
            const finalResult = combineResults(surveyResult, imageAnalysisResult);
            
            // 결과 표시
            showResult(finalResult);
        })
        .catch(error => {
            console.error('분석 중 오류 발생:', error);
            alert('이미지 분석 중 오류가 발생했습니다. 설문 결과만으로 분석을 진행합니다.');
            
            // 설문 결과만으로 분석
            const surveyResult = calculateSurveyResult(userResponses);
            showResult(surveyResult);
        })
        .finally(() => {
            // 로딩 오버레이 숨기기
            hideLoading();
        });
}

/**
 * 사진 없이 분석
 */
function analyzeWithoutPhoto() {
    // 설문 결과만으로 분석
    const surveyResult = calculateSurveyResult(userResponses);
    showResult(surveyResult);
}

/**
 * AI 모델 로드
 */
async function loadModel() {
    try {
        // aiModel 모듈의 loadModel 함수 호출
        await window.aiModel.loadModel();
        model = window.aiModel; // 전역 model 변수에 aiModel 모듈 참조 저장
        return Promise.resolve();
    } catch (error) {
        console.error('모델 로드 실패:', error);
        // 오류 처리 및 사용자에게 알림
        const errorInfo = window.aiModel.handleModelError(error);
        alert(errorInfo.userMessage);
        return Promise.reject(error);
    }
}

/**
 * 이미지 분석
 * @param {string} imageData - Base64 인코딩된 이미지 데이터
 */
async function analyzeImage(imageData) {
    try {
        // 모델이 로드되지 않았으면 로드
        if (!model) {
            await loadModel();
        }
        
        // aiModel 모듈의 analyzeImage 함수 호출
        return await window.aiModel.analyzeImage(imageData);
    } catch (error) {
        console.error('이미지 분석 실패:', error);
        // 오류 처리 및 사용자에게 알림
        const errorInfo = window.aiModel.handleModelError(error);
        alert(errorInfo.userMessage);
        throw error;
    }
}/**

 * 결과 표시
 * @param {Object} result - 분석 결과
 */
function showResult(result) {
    // 사진 업로드 화면 숨기기
    $('#photo-screen').removeClass('active');
    
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
    
    // 얼굴 분석 결과가 있는 경우 표시
    if (result.facialAnalysis && result.imageAnalysisApplied) {
        html += `
            <div class="facial-analysis mb-4">
                <h4 class="mb-3 personality-color">얼굴 특징 분석</h4>
                <div class="card">
                    <div class="card-body">
        `;
        
        // 얼굴 특징 분석 설명 추가
        result.facialAnalysis.descriptions.forEach(description => {
            html += `<p class="mb-2"><i class="fas fa-face-smile me-2 personality-color"></i>${description}</p>`;
        });
        
        html += `
                    </div>
                </div>
            </div>
        `;
    }
    
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
                                <div class="progress-bar bg-primary" role="progressbar" style="width: ${personalityType.tetoScore * 10}%" 
                                    aria-valuenow="${personalityType.tetoScore * 10}" aria-valuemin="0" aria-valuemax="100">
                                    ${personalityType.tetoScore.toFixed(1)}
                                </div>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="score-label">에겐 성향</div>
                            <div class="progress">
                                <div class="progress-bar bg-success" role="progressbar" style="width: ${personalityType.egenScore * 10}%" 
                                    aria-valuenow="${personalityType.egenScore * 10}" aria-valuemin="0" aria-valuemax="100">
                                    ${personalityType.egenScore.toFixed(1)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-6">
                            <div class="score-label">남성성</div>
                            <div class="progress">
                                <div class="progress-bar bg-info" role="progressbar" style="width: ${personalityType.masculinityScore * 10}%" 
                                    aria-valuenow="${personalityType.masculinityScore * 10}" aria-valuemin="0" aria-valuemax="100">
                                    ${personalityType.masculinityScore.toFixed(1)}
                                </div>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="score-label">여성성</div>
                            <div class="progress">
                                <div class="progress-bar bg-danger" role="progressbar" style="width: ${personalityType.femininityScore * 10}%" 
                                    aria-valuenow="${personalityType.femininityScore * 10}" aria-valuemin="0" aria-valuemax="100">
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
        }, 200);
    }
}

/**
 * 페이지 이탈 확인 대화상자 표시
 */
function confirmPageExit() {
    return '테스트가 진행 중입니다. 페이지를 떠나면 지금까지의 응답이 모두 사라집니다. 정말로 나가시겠습니까?';
}

/**
 * 이미지 검증 및 전처리
 * @param {string} imageData - Base64 인코딩된 이미지 데이터
 * @returns {Promise} 처리된 이미지 데이터를 포함한 Promise
 */
function validateAndPreprocessImage(imageData) {
    // face-detection.js 모듈의 함수 호출
    return window.faceDetection.validateAndPreprocessImage(imageData);
}

/**
 * 설문 결과 계산
 */
function calculateSurveyResult() {
    // score-calculator.js의 함수 사용
    return window.calculateSurveyResult(userResponses);
}

/**
 * 설문 결과와 이미지 분석 결과 통합
 * @param {Object} surveyResult - 설문 결과
 * @param {Object} imageResult - 이미지 분석 결과
 */
function combineResults(surveyResult, imageResult) {
    // score-calculator.js의 함수 사용
    return window.combineResults(surveyResult, imageResult);
}

/**
 * 성격 유형 결정
 * @param {Object} result - 분석 결과
 */
function determinePersonalityType(result) {
    // score-calculator.js의 함수 사용
    return window.determinePersonalityType(result);
}

/**
 * 지연 로딩 설정
 * 필요한 시점에 리소스를 로드하여 초기 로딩 시간을 단축합니다.
 */
function setupLazyLoading() {
    // 성능 최적화 모듈이 로드되었는지 확인
    if (typeof window.performanceOptimizer === 'undefined') {
        console.warn('성능 최적화 모듈이 로드되지 않았습니다.');
        return;
    }
    
    // 이미지 지연 로딩 설정
    const lazyImages = document.querySelectorAll('img[data-src]');
    if (lazyImages.length > 0) {
        window.performanceOptimizer.optimizeImageLoading();
    }
    
    // 모델 지연 로딩 설정
    // 사용자가 사진 업로드 화면에 도달했을 때만 AI 모델 로드
    const originalShowPhotoUploadScreen = showPhotoUploadScreen;
    showPhotoUploadScreen = function() {
        // 원래 함수 호출
        originalShowPhotoUploadScreen();
        
        // AI 모델 미리 로드 시작 (백그라운드에서)
        setTimeout(() => {
            if (typeof window.aiModel !== 'undefined' && typeof window.aiModel.loadModel === 'function') {
                window.aiModel.loadModel()
                    .then(() => console.log('AI 모델 사전 로드 완료'))
                    .catch(error => console.warn('AI 모델 사전 로드 실패:', error));
            }
        }, 1000); // 1초 후 로드 시작
    };
    
    // 스크롤 이벤트 최적화
    const optimizedScroll = window.performanceOptimizer.throttle(() => {
        // 스크롤 시 필요한 작업 수행
    }, 100); // 100ms마다 최대 1번 실행
    
    window.addEventListener('scroll', optimizedScroll);
    
    // 리사이즈 이벤트 최적화
    const optimizedResize = window.performanceOptimizer.debounce(() => {
        // 리사이즈 시 필요한 작업 수행
    }, 200); // 200ms 동안 이벤트가 발생하지 않으면 실행
    
    window.addEventListener('resize', optimizedResize);
    
    // 주기적인 메모리 정리 설정
    // 결과 화면에서 메모리 정리 수행
    const originalShowResult = showResult;
    showResult = function(result) {
        // 원래 함수 호출
        originalShowResult(result);
        
        // 메모리 정리
        if (typeof window.performanceOptimizer.cleanupMemory === 'function') {
            window.performanceOptimizer.cleanupMemory();
        }
    };
    
    console.log('지연 로딩 설정 완료');
}