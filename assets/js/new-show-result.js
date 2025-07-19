/**
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
                <div class="col-md-10 col-lg-8">
                    <div class="result-container text-center">
                        <h2 class="result-title personality-color">당신의 테토-에겐 성격 유형은</h2>
                        <h1 class="result-personality-type">${personalityType.personalityType}</h1>
                        
                        ${personalityType.typeModifier || personalityType.genderModifier ? 
                            `<div class="modifier-badge mb-3">
                                ${personalityType.typeModifier ? `<span class="badge bg-primary me-2">${personalityType.typeModifier}</span>` : ''}
                                ${personalityType.genderModifier ? `<span class="badge bg-secondary">${personalityType.genderModifier}</span>` : ''}
                            </div>` : ''
                        }
                        
                        <div class="result-image-container">
                            <img src="assets/images/${personalityType.personalityType}.jpg" alt="${personalityType.personalityType}" class="result-image personality-border">
                        </div>
                        
                        <div class="result-description">
                            <p>${description}</p>
                        </div>
                        
                        <div class="characteristics-section">
                            <h3 class="characteristics-title">${personalityType.personalityType}의 특징</h3>
                            <div class="characteristics-grid">
    `;
    
    // 특징 목록 HTML 생성
    characteristics.forEach(characteristic => {
        html += `
            <div class="characteristic-item">
                <i class="fas fa-check-circle personality-color"></i>
                <span>${characteristic}</span>
            </div>
        `;
    });
    
    html += `
                            </div>
                        </div>
    `;
    
    // 점수 그래프 표시
    html += `
        <div class="score-section">
            <h3 class="score-title">성향 점수</h3>
            <div class="score-item">
                <div class="score-label">
                    <span>테토 성향</span>
                    <span class="score-value">${personalityType.tetoScore.toFixed(1)}</span>
                </div>
                <div class="progress">
                    <div class="progress-bar bg-primary" role="progressbar" style="width: ${personalityType.tetoScore * 10}%" 
                        aria-valuenow="${personalityType.tetoScore * 10}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            </div>
            <div class="score-item">
                <div class="score-label">
                    <span>에겐 성향</span>
                    <span class="score-value">${personalityType.egenScore.toFixed(1)}</span>
                </div>
                <div class="progress">
                    <div class="progress-bar bg-success" role="progressbar" style="width: ${personalityType.egenScore * 10}%" 
                        aria-valuenow="${personalityType.egenScore * 10}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            </div>
            <div class="score-item">
                <div class="score-label">
                    <span>남성성</span>
                    <span class="score-value">${personalityType.masculinityScore.toFixed(1)}</span>
                </div>
                <div class="progress">
                    <div class="progress-bar bg-info" role="progressbar" style="width: ${personalityType.masculinityScore * 10}%" 
                        aria-valuenow="${personalityType.masculinityScore * 10}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            </div>
            <div class="score-item">
                <div class="score-label">
                    <span>여성성</span>
                    <span class="score-value">${personalityType.femininityScore.toFixed(1)}</span>
                </div>
                <div class="progress">
                    <div class="progress-bar bg-danger" role="progressbar" style="width: ${personalityType.femininityScore * 10}%" 
                        aria-valuenow="${personalityType.femininityScore * 10}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            </div>
        </div>
    `;
    
    // 얼굴 분석 결과가 있는 경우 표시
    if (result.facialAnalysis && result.imageAnalysisApplied) {
        html += `
            <div class="facial-analysis-section">
                <h3 class="facial-analysis-title">
                    <i class="fas fa-face-smile"></i>
                    얼굴 특징 분석
                </h3>
        `;
        
        // 얼굴 특징 분석 설명 추가
        result.facialAnalysis.descriptions.forEach(description => {
            html += `
                <div class="facial-feature-item">
                    <i class="fas fa-check-circle"></i>
                    ${description}
                </div>
            `;
        });
        
        // 설문과 이미지 분석 결과 일치도 표시
        if (result.surveyImageConsistency) {
            html += `
                <div class="consistency-info mt-4">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        ${result.consistencyMessage || '설문 응답과 얼굴 이미지 분석 결과의 일치도: ' + result.surveyImageConsistency + '%'}
                    </div>
                </div>
            `;
        }
        
        html += `</div>`;
    }
    
    // 카테고리별 분석 결과가 있는 경우 표시
    if (personalityType.categoryAnalysis && personalityType.categoryAnalysis.insights.length > 0) {
        html += `
            <div class="category-analysis-section">
                <h3 class="section-title personality-color">카테고리별 분석</h3>
                <div class="card">
                    <div class="card-body">
        `;
        
        personalityType.categoryAnalysis.insights.forEach(insight => {
            html += `<p class="mb-2"><i class="fas fa-chart-pie me-2 personality-color"></i>${insight}</p>`;
        });
        
        html += `
                    </div>
                </div>
            </div>
        `;
    }
    
    // 연애 먹이사슬 관계 표시
    html += `
        <div class="relationship-section">
            <h3 class="relationship-title">
                <i class="fas fa-heart"></i>
                연애 먹이사슬
            </h3>
            <p class="text-center mb-3">${personalityType.relationshipAnalysis.description}</p>
            
            <div class="food-chain-visual">
                <div class="food-chain-item ${personalityType.personalityType === '에겐녀' ? 'current' : ''}">에겐녀</div>
                <div class="food-chain-arrow"><i class="fas fa-arrow-right"></i></div>
                <div class="food-chain-item ${personalityType.personalityType === '에겐남' ? 'current' : ''}">에겐남</div>
                <div class="food-chain-arrow"><i class="fas fa-arrow-right"></i></div>
                <div class="food-chain-item ${personalityType.personalityType === '테토녀' ? 'current' : ''}">테토녀</div>
                <div class="food-chain-arrow"><i class="fas fa-arrow-right"></i></div>
                <div class="food-chain-item ${personalityType.personalityType === '테토남' ? 'current' : ''}">테토남</div>
                <div class="food-chain-arrow"><i class="fas fa-arrow-right"></i></div>
                <div class="food-chain-item ${personalityType.personalityType === '에겐녀' ? 'current' : ''}">에겐녀</div>
            </div>
        </div>
    `;
    
    // 결과 신뢰도 표시
    html += `
        <div class="reliability-section">
            <h3 class="reliability-title">
                <i class="fas fa-shield-alt"></i>
                결과 신뢰도
            </h3>
            <div class="reliability-meter">
                <div class="reliability-circle" style="--reliability: ${personalityType.resultReliability}">
                    <span class="reliability-percentage">${personalityType.resultReliability}%</span>
                </div>
            </div>
            <p class="text-center mt-3">
                ${personalityType.resultReliability >= 80 ? '매우 높은 신뢰도' : 
                  personalityType.resultReliability >= 60 ? '높은 신뢰도' : 
                  personalityType.resultReliability >= 40 ? '보통 신뢰도' : '낮은 신뢰도'}
            </p>
        </div>
        
        <div class="share-section">
            <h3 class="share-title">결과 공유하기</h3>
            <div class="share-buttons">
                <button class="share-btn" data-platform="facebook">
                    <i class="fab fa-facebook-f"></i>
                </button>
                <button class="share-btn" data-platform="twitter">
                    <i class="fab fa-twitter"></i>
                </button>
                <button class="share-btn" data-platform="line">
                    <i class="fab fa-line"></i>
                </button>
                <button class="share-btn" data-platform="kakaotalk">
                    <i class="fas fa-comment"></i>
                </button>
                <button class="share-btn" data-platform="link">
                    <i class="fas fa-link"></i>
                </button>
                <button id="download-result" class="share-btn">
                    <i class="fas fa-download"></i>
                </button>
            </div>
        </div>
        
        <div class="restart-section">
            <button id="restart-test" class="btn btn-lg btn-outline-primary">다시 테스트하기</button>
        </div>
    `;
    
    html += `
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // HTML 삽입
    $('#result-screen').html(html);
    $('#result-screen').addClass('active');
    
    // 이벤트 리스너 등록
    setupResultEvents(personalityType);
}

/**
 * 결과 화면 이벤트 설정
 * @param {Object} personalityType - 성격 유형 결과 객체
 */
function setupResultEvents(personalityType) {
    // 다시 테스트하기 버튼 클릭 이벤트
    $('#restart-test').on('click', function() {
        resetTest();
    });
    
    // 공유 버튼 클릭 이벤트
    $('.share-btn').on('click', function() {
        const platform = $(this).data('platform');
        
        // 다운로드 버튼인 경우
        if ($(this).attr('id') === 'download-result') {
            if (window.shareModule && typeof window.shareModule.downloadResultImage === 'function') {
                window.shareModule.downloadResultImage(personalityType);
            } else {
                alert('결과 이미지 다운로드 기능을 사용할 수 없습니다.');
            }
            return;
        }
        
        // 공유 모듈이 있는 경우 새 공유 기능 사용
        if (window.shareModule && typeof window.shareModule.shareResult === 'function') {
            window.shareModule.shareResult(platform, personalityType);
        } else {
            // 기존 공유 기능 사용 (fallback)
            shareResult(platform);
        }
    });
    
    // 카카오톡 SDK 초기화 (앱 키는 실제 배포 시 변경 필요)
    if (window.shareModule && typeof window.shareModule.initKakaoSDK === 'function') {
        // 실제 배포 시 아래 앱 키를 실제 카카오톡 앱 키로 교체해야 함
        window.shareModule.initKakaoSDK('YOUR_KAKAO_APP_KEY');
    }
}

/**
 * 테스트 초기화 (app.js의 resetTest 함수 호출)
 */
function resetTest() {
    if (typeof window.resetTest === 'function') {
        window.resetTest();
    } else {
        // 기본 초기화 동작
        location.reload();
    }
}