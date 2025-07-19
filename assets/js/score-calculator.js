/**
 * 테토-에겐 성격 유형 테스트 점수 계산 모듈
 * 
 * 이 모듈은 설문 응답과 이미지 분석 결과를 통합하여 테토-에겐 성격 유형을 결정합니다.
 * 요구사항 2.5, 3.1에 따라 구현되었습니다.
 */

/**
 * 설문 결과 계산
 * @param {Array} userResponses - 사용자 응답 배열
 * @returns {Object} 계산된 점수 객체
 */
function calculateSurveyResult(userResponses) {
    let tetoScore = 0;
    let egenScore = 0;
    let masculinityScore = 0;
    let femininityScore = 0;
    let totalWeight = 0;
    let totalConfidence = 0;
    
    // 카테고리별 점수 집계를 위한 객체
    const categoryScores = {};
    Object.values(QUESTION_CATEGORIES).forEach(category => {
        categoryScores[category] = {
            tetoScore: 0,
            egenScore: 0,
            masculinityScore: 0,
            femininityScore: 0,
            count: 0
        };
    });
    
    // 각 응답의 점수 합산
    userResponses.forEach((response, index) => {
        const question = questions[index];
        const option = question.options[response.selectedOption];
        const weight = question.weight || 1;
        const confidenceWeight = option.confidenceWeight || 1;
        const category = question.category;
        
        // 전체 점수 합산
        tetoScore += option.tetoScore * weight * confidenceWeight;
        egenScore += option.egenScore * weight * confidenceWeight;
        masculinityScore += option.masculinityScore * weight * confidenceWeight;
        femininityScore += option.femininityScore * weight * confidenceWeight;
        
        // 카테고리별 점수 합산
        categoryScores[category].tetoScore += option.tetoScore;
        categoryScores[category].egenScore += option.egenScore;
        categoryScores[category].masculinityScore += option.masculinityScore;
        categoryScores[category].femininityScore += option.femininityScore;
        categoryScores[category].count++;
        
        totalWeight += weight * confidenceWeight;
        totalConfidence += confidenceWeight;
    });
    
    // 가중치로 나누어 평균 계산
    tetoScore /= totalWeight;
    egenScore /= totalWeight;
    masculinityScore /= totalWeight;
    femininityScore /= totalWeight;
    
    // 카테고리별 평균 계산
    Object.keys(categoryScores).forEach(category => {
        if (categoryScores[category].count > 0) {
            categoryScores[category].tetoScore /= categoryScores[category].count;
            categoryScores[category].egenScore /= categoryScores[category].count;
            categoryScores[category].masculinityScore /= categoryScores[category].count;
            categoryScores[category].femininityScore /= categoryScores[category].count;
        }
    });
    
    // 신뢰도 계산 (응답의 일관성 기반)
    const consistency = calculateConsistency(userResponses);
    
    // 결과 신뢰도 계산 (응답 일관성 + 응답 신뢰도 가중치)
    const confidence = (consistency + (totalConfidence / userResponses.length)) / 2;
    
    // 성향 강도 계산 (테토-에겐 차이와 남성성-여성성 차이)
    const tetoEgenDiff = Math.abs(tetoScore - egenScore);
    const masculinityFemininityDiff = Math.abs(masculinityScore - femininityScore);
    
    // 성향 확실성 계산 (0-10 스케일)
    const certainty = (tetoEgenDiff + masculinityFemininityDiff) / 2 * 10;
    
    return {
        tetoScore,
        egenScore,
        masculinityScore,
        femininityScore,
        categoryScores,
        confidence,
        consistency,
        tetoEgenDiff,
        masculinityFemininityDiff,
        certainty
    };
}

/**
 * 설문 결과와 이미지 분석 결과 통합
 * @param {Object} surveyResult - 설문 결과
 * @param {Object} imageResult - 이미지 분석 결과
 * @returns {Object} 통합된 결과
 */
function combineResults(surveyResult, imageResult) {
    // 설문 결과와 이미지 분석 결과를 7:3 비율로 통합
    const surveyWeight = 0.7;
    const imageWeight = 0.3;
    
    // 이미지 결과가 없는 경우 설문 결과만 반환
    if (!imageResult) {
        return {
            ...surveyResult,
            imageAnalysisApplied: false,
            resultReliability: calculateResultReliability(surveyResult.confidence, null, surveyResult.consistency)
        };
    }
    
    // 이미지 분석 신뢰도가 낮은 경우 설문 결과 비중 증가
    const adjustedSurveyWeight = imageResult.confidence < 0.5 
        ? surveyWeight + ((0.5 - imageResult.confidence) * imageWeight)
        : surveyWeight;
    
    const adjustedImageWeight = 1 - adjustedSurveyWeight;
    
    // 얼굴 특징 정보 추출
    const facialFeatures = imageResult.facialFeatures || null;
    
    // 테토-에겐 점수 및 남성성-여성성 점수 통합
    const tetoScore = surveyResult.tetoScore * adjustedSurveyWeight + imageResult.tetoScore * adjustedImageWeight;
    const egenScore = surveyResult.egenScore * adjustedSurveyWeight + imageResult.egenScore * adjustedImageWeight;
    const masculinityScore = surveyResult.masculinityScore * adjustedSurveyWeight + imageResult.masculinityScore * adjustedImageWeight;
    const femininityScore = surveyResult.femininityScore * adjustedSurveyWeight + imageResult.femininityScore * adjustedImageWeight;
    
    // 성향 강도 계산 (테토-에겐 차이와 남성성-여성성 차이)
    const tetoEgenDiff = Math.abs(tetoScore - egenScore);
    const masculinityFemininityDiff = Math.abs(masculinityScore - femininityScore);
    
    // 성향 확실성 계산 (0-10 스케일)
    const certainty = (tetoEgenDiff + masculinityFemininityDiff) / 2 * 10;
    
    // 결과 신뢰도 계산 (설문 신뢰도, 이미지 신뢰도, 응답 일관성 기반)
    const resultConfidence = surveyResult.confidence * adjustedSurveyWeight + imageResult.confidence * adjustedImageWeight;
    const resultReliability = calculateResultReliability(surveyResult.confidence, imageResult.confidence, surveyResult.consistency);
    
    // 설문 결과와 이미지 분석 결과 일치도 계산
    const surveyImageConsistency = calculateSurveyImageConsistency(surveyResult, imageResult);
    
    const result = {
        tetoScore,
        egenScore,
        masculinityScore,
        femininityScore,
        categoryScores: surveyResult.categoryScores,
        confidence: resultConfidence,
        consistency: surveyResult.consistency,
        imageAnalysisApplied: true,
        imageConfidence: imageResult.confidence,
        tetoEgenDiff,
        masculinityFemininityDiff,
        certainty,
        resultReliability,
        surveyImageConsistency
    };
    
    // 얼굴 특징 정보가 있는 경우 추가
    if (facialFeatures) {
        result.facialFeatures = facialFeatures;
        
        // 얼굴 특징 기반 설명 추가
        result.facialAnalysis = generateFacialAnalysis(facialFeatures);
    }
    
    return result;
}

/**
 * 결과 신뢰도 계산
 * @param {number} surveyConfidence - 설문 신뢰도
 * @param {number|null} imageConfidence - 이미지 분석 신뢰도 (없을 경우 null)
 * @param {number} consistency - 응답 일관성
 * @returns {number} 결과 신뢰도 (0-100%)
 */
function calculateResultReliability(surveyConfidence, imageConfidence, consistency) {
    // 설문 신뢰도 가중치 (이미지가 없는 경우 100%, 있는 경우 70%)
    const surveyWeight = imageConfidence === null ? 1.0 : 0.7;
    
    // 이미지 신뢰도 가중치 (이미지가 없는 경우 0%, 있는 경우 30%)
    const imageWeight = imageConfidence === null ? 0.0 : 0.3;
    
    // 응답 일관성 가중치 (항상 20% 반영)
    const consistencyWeight = 0.2;
    
    // 기본 신뢰도 계산 (설문 신뢰도 + 이미지 신뢰도)
    const baseReliability = (surveyConfidence * surveyWeight) + 
                           (imageConfidence !== null ? imageConfidence * imageWeight : 0);
    
    // 응답 일관성 반영
    const adjustedReliability = baseReliability * (0.8 + consistency * consistencyWeight);
    
    // 백분율로 변환 (0-100%)
    return Math.min(100, Math.round(adjustedReliability * 100));
}

/**
 * 설문 결과와 이미지 분석 결과 일치도 계산
 * @param {Object} surveyResult - 설문 결과
 * @param {Object} imageResult - 이미지 분석 결과
 * @returns {number} 일치도 (0-100%)
 */
function calculateSurveyImageConsistency(surveyResult, imageResult) {
    // 테토-에겐 성향 일치 여부
    const tetoEgenMatch = (surveyResult.tetoScore > surveyResult.egenScore) === 
                         (imageResult.tetoScore > imageResult.egenScore);
    
    // 남성성-여성성 일치 여부
    const genderMatch = (surveyResult.masculinityScore > surveyResult.femininityScore) === 
                       (imageResult.masculinityScore > imageResult.femininityScore);
    
    // 테토-에겐 점수 차이
    const tetoEgenDiff = Math.abs(
        (surveyResult.tetoScore - surveyResult.egenScore) - 
        (imageResult.tetoScore - imageResult.egenScore)
    ) / 10; // 0-1 범위로 정규화
    
    // 남성성-여성성 점수 차이
    const genderDiff = Math.abs(
        (surveyResult.masculinityScore - surveyResult.femininityScore) - 
        (imageResult.masculinityScore - imageResult.femininityScore)
    ) / 10; // 0-1 범위로 정규화
    
    // 방향 일치 가중치 (60%)
    const directionWeight = 0.6;
    
    // 크기 일치 가중치 (40%)
    const magnitudeWeight = 0.4;
    
    // 방향 일치도 계산
    const directionConsistency = ((tetoEgenMatch ? 1 : 0) + (genderMatch ? 1 : 0)) / 2;
    
    // 크기 일치도 계산 (차이가 작을수록 일치도 높음)
    const magnitudeConsistency = 1 - ((tetoEgenDiff + genderDiff) / 2);
    
    // 종합 일치도 계산
    const consistency = (directionConsistency * directionWeight) + 
                       (magnitudeConsistency * magnitudeWeight);
    
    // 백분율로 변환 (0-100%)
    return Math.min(100, Math.round(consistency * 100));
}

/**
 * 얼굴 특징 분석 결과에 기반한 설명 생성
 * @param {Object} features - 얼굴 특징 정보
 * @returns {Object} 얼굴 특징 분석 설명
 */
function generateFacialAnalysis(features) {
    const analysis = {
        descriptions: []
    };
    
    // 얼굴 비율 분석
    if (features.faceRatio > 0.85) {
        analysis.descriptions.push("넓은 얼굴형을 가지고 있으며, 이는 일반적으로 결단력과 자신감을 나타냅니다.");
    } else if (features.faceRatio < 0.7) {
        analysis.descriptions.push("갸름한 얼굴형을 가지고 있으며, 이는 일반적으로 섬세함과 감수성을 나타냅니다.");
    }
    
    // 눈 크기 및 간격 분석
    if (features.eyeRatio < 0.12) {
        analysis.descriptions.push("눈 간격이 넓고 작은 눈을 가지고 있으며, 이는 테토 성향의 특징입니다.");
    } else if (features.eyeRatio > 0.18) {
        analysis.descriptions.push("눈 간격이 좁고 큰 눈을 가지고 있으며, 이는 에겐 성향의 특징입니다.");
    }
    
    // 입 크기 분석
    if (features.mouthRatio > 0.5) {
        analysis.descriptions.push("입이 크고 표현력이 풍부한 특징을 가지고 있습니다.");
    } else if (features.mouthRatio < 0.4) {
        analysis.descriptions.push("입이 작고 절제된 표현을 선호하는 특징을 가지고 있습니다.");
    }
    
    // 턱선 각도 분석
    if (features.jawAngle > 0.6) {
        analysis.descriptions.push("각진 턱선을 가지고 있으며, 이는 결단력과 추진력을 나타냅니다.");
    } else if (features.jawAngle < 0.4) {
        analysis.descriptions.push("부드러운 턱선을 가지고 있으며, 이는 온화함과 조화로움을 나타냅니다.");
    }
    
    // 눈썹 형태 분석
    if (features.eyebrowAngle > 0.6) {
        analysis.descriptions.push("각진 눈썹을 가지고 있으며, 이는 논리적이고 분석적인 성향을 나타냅니다.");
    } else if (features.eyebrowAngle < 0.4) {
        analysis.descriptions.push("부드러운 곡선의 눈썹을 가지고 있으며, 이는 감성적이고 공감 능력이 뛰어난 성향을 나타냅니다.");
    }
    
    // 설명이 없는 경우 기본 설명 추가
    if (analysis.descriptions.length === 0) {
        analysis.descriptions.push("얼굴 특징이 균형적이며, 테토와 에겐 성향이 고르게 나타납니다.");
    }
    
    return analysis;
}

/**
 * 성격 유형 결정
 * @param {Object} result - 분석 결과
 * @returns {Object} 성격 유형 정보
 */
function determinePersonalityType(result) {
    // 테토-에겐 성향 결정
    const isTeto = result.tetoScore > result.egenScore;
    
    // 남성성-여성성 결정
    const isMasculine = result.masculinityScore > result.femininityScore;
    
    // 성격 유형 결정
    let personalityType;
    if (isTeto && isMasculine) {
        personalityType = PERSONALITY_TYPES.TETO_MALE;
    } else if (isTeto && !isMasculine) {
        personalityType = PERSONALITY_TYPES.TETO_FEMALE;
    } else if (!isTeto && isMasculine) {
        personalityType = PERSONALITY_TYPES.EGEN_MALE;
    } else {
        personalityType = PERSONALITY_TYPES.EGEN_FEMALE;
    }
    
    // 성향 강도 계산
    const tetoEgenDiff = result.tetoEgenDiff || Math.abs(result.tetoScore - result.egenScore);
    const masculinityFemininityDiff = result.masculinityFemininityDiff || Math.abs(result.masculinityScore - result.femininityScore);
    
    // 성향 강도에 따른 확실성 계산
    const certainty = result.certainty || (tetoEgenDiff + masculinityFemininityDiff) / 2 * 10; // 0-10 스케일로 변환
    
    // 성향 강도에 따른 유형 설명 수정자 결정
    let typeModifier = '';
    if (tetoEgenDiff < 1.0) {
        // 테토-에겐 차이가 작은 경우 (중간 성향)
        typeModifier = isTeto ? '약한 테토' : '약한 에겐';
    } else if (tetoEgenDiff > 3.0) {
        // 테토-에겐 차이가 큰 경우 (강한 성향)
        typeModifier = isTeto ? '강한 테토' : '강한 에겐';
    }
    
    let genderModifier = '';
    if (masculinityFemininityDiff < 1.0) {
        // 남성성-여성성 차이가 작은 경우 (중성적 성향)
        genderModifier = '중성적';
    } else if (masculinityFemininityDiff > 3.0) {
        // 남성성-여성성 차이가 큰 경우 (강한 성향)
        genderModifier = isMasculine ? '강한 남성성' : '강한 여성성';
    }
    
    // 결과 신뢰도 계산 (이미 계산되어 있지 않은 경우)
    const resultReliability = result.resultReliability || 
        (result.confidence ? Math.min(100, Math.round(result.confidence * 100)) : 70);
    
    // 카테고리별 주요 특성 분석
    const categoryAnalysis = analyzeCategoryScores(result.categoryScores);
    
    // 연애 먹이사슬 관계 분석
    const relationshipAnalysis = analyzeRelationships(personalityType);
    
    // 결과 객체 생성
    const personalityResult = {
        personalityType,
        characteristics: personalityCharacteristics[personalityType],
        description: personalityDescriptions[personalityType],
        tetoScore: result.tetoScore,
        egenScore: result.egenScore,
        masculinityScore: result.masculinityScore,
        femininityScore: result.femininityScore,
        tetoEgenDiff,
        masculinityFemininityDiff,
        certainty,
        typeModifier,
        genderModifier,
        confidence: result.confidence,
        resultReliability,
        categoryScores: result.categoryScores,
        categoryAnalysis,
        relationshipAnalysis,
        imageAnalysisApplied: result.imageAnalysisApplied || false,
        imageConfidence: result.imageConfidence || 0
    };
    
    // 이미지 분석 결과가 있는 경우 추가 정보
    if (result.imageAnalysisApplied && result.surveyImageConsistency) {
        personalityResult.surveyImageConsistency = result.surveyImageConsistency;
        
        // 설문과 이미지 분석 결과 일치도에 따른 해석
        if (result.surveyImageConsistency >= 80) {
            personalityResult.consistencyMessage = "설문 응답과 얼굴 이미지 분석 결과가 매우 일치합니다.";
        } else if (result.surveyImageConsistency >= 60) {
            personalityResult.consistencyMessage = "설문 응답과 얼굴 이미지 분석 결과가 대체로 일치합니다.";
        } else if (result.surveyImageConsistency >= 40) {
            personalityResult.consistencyMessage = "설문 응답과 얼굴 이미지 분석 결과가 부분적으로 일치합니다.";
        } else {
            personalityResult.consistencyMessage = "설문 응답과 얼굴 이미지 분석 결과에 차이가 있습니다.";
        }
    }
    
    // 얼굴 분석 결과가 있는 경우 추가
    if (result.facialAnalysis) {
        personalityResult.facialAnalysis = result.facialAnalysis;
    }
    
    return personalityResult;
}

/**
 * 카테고리별 점수 분석
 * @param {Object} categoryScores - 카테고리별 점수
 * @returns {Object} 카테고리 분석 결과
 */
function analyzeCategoryScores(categoryScores) {
    if (!categoryScores) return null;
    
    const analysis = {
        dominantCategories: [],
        insights: []
    };
    
    // 각 카테고리별 테토-에겐, 남성성-여성성 성향 분석
    Object.entries(categoryScores).forEach(([category, scores]) => {
        // 테토-에겐 차이
        const tetoEgenDiff = scores.tetoScore - scores.egenScore;
        
        // 남성성-여성성 차이
        const genderDiff = scores.masculinityScore - scores.femininityScore;
        
        // 절대값이 2 이상인 경우 강한 성향으로 판단
        if (Math.abs(tetoEgenDiff) >= 2 || Math.abs(genderDiff) >= 2) {
            let insight = `${category} 영역에서는 `;
            
            if (Math.abs(tetoEgenDiff) >= 2) {
                insight += tetoEgenDiff > 0 ? '테토 성향이 ' : '에겐 성향이 ';
                insight += Math.abs(tetoEgenDiff) >= 4 ? '매우 강하게 ' : '강하게 ';
                insight += '나타납니다. ';
                
                // 주요 카테고리로 추가
                analysis.dominantCategories.push({
                    category,
                    type: tetoEgenDiff > 0 ? 'teto' : 'egen',
                    strength: Math.abs(tetoEgenDiff)
                });
            }
            
            if (Math.abs(genderDiff) >= 2) {
                insight += genderDiff > 0 ? '남성적 성향이 ' : '여성적 성향이 ';
                insight += Math.abs(genderDiff) >= 4 ? '매우 강하게 ' : '강하게 ';
                insight += '나타납니다.';
                
                // 주요 카테고리에 성별 성향 추가
                if (!analysis.dominantCategories.find(c => c.category === category)) {
                    analysis.dominantCategories.push({
                        category,
                        type: genderDiff > 0 ? 'masculine' : 'feminine',
                        strength: Math.abs(genderDiff)
                    });
                }
            }
            
            analysis.insights.push(insight);
        }
    });
    
    // 주요 카테고리가 없는 경우
    if (analysis.dominantCategories.length === 0) {
        analysis.insights.push("모든 영역에서 균형 잡힌 성향을 보입니다.");
    }
    
    return analysis;
}

/**
 * 연애 먹이사슬 관계 분석
 * @param {string} personalityType - 성격 유형
 * @returns {Object} 관계 분석 결과
 */
function analyzeRelationships(personalityType) {
    const relationships = {
        attracted: [],
        attractedBy: [],
        description: ""
    };
    
    // 연애 먹이사슬: 에겐녀 → 에겐남 → 테토녀 → 테토남 → 에겐녀
    switch (personalityType) {
        case PERSONALITY_TYPES.TETO_MALE:
            relationships.attracted.push(PERSONALITY_TYPES.EGEN_FEMALE);
            relationships.attractedBy.push(PERSONALITY_TYPES.TETO_FEMALE);
            relationships.description = "테토남은 에겐녀에게 끌리며, 테토녀가 테토남에게 끌립니다.";
            break;
            
        case PERSONALITY_TYPES.TETO_FEMALE:
            relationships.attracted.push(PERSONALITY_TYPES.TETO_MALE);
            relationships.attractedBy.push(PERSONALITY_TYPES.EGEN_MALE);
            relationships.description = "테토녀는 테토남에게 끌리며, 에겐남이 테토녀에게 끌립니다.";
            break;
            
        case PERSONALITY_TYPES.EGEN_MALE:
            relationships.attracted.push(PERSONALITY_TYPES.TETO_FEMALE);
            relationships.attractedBy.push(PERSONALITY_TYPES.EGEN_FEMALE);
            relationships.description = "에겐남은 테토녀에게 끌리며, 에겐녀가 에겐남에게 끌립니다.";
            break;
            
        case PERSONALITY_TYPES.EGEN_FEMALE:
            relationships.attracted.push(PERSONALITY_TYPES.EGEN_MALE);
            relationships.attractedBy.push(PERSONALITY_TYPES.TETO_MALE);
            relationships.description = "에겐녀는 에겐남에게 끌리며, 테토남이 에겐녀에게 끌립니다.";
            break;
    }
    
    return relationships;
}

/**
 * 응답 일관성 계산
 * @param {Array} userResponses - 사용자 응답 배열
 * @returns {number} 일관성 점수 (0-1)
 */
function calculateConsistency(userResponses) {
    // 카테고리별 응답 분류
    const categoryResponses = {};
    
    userResponses.forEach((response, index) => {
        const question = questions[index];
        const category = question.category;
        const option = question.options[response.selectedOption];
        
        if (!categoryResponses[category]) {
            categoryResponses[category] = [];
        }
        
        categoryResponses[category].push({
            tetoScore: option.tetoScore,
            egenScore: option.egenScore,
            masculinityScore: option.masculinityScore,
            femininityScore: option.femininityScore
        });
    });
    
    // 카테고리별 일관성 계산
    let totalConsistency = 0;
    let categoryCount = 0;
    
    Object.keys(categoryResponses).forEach(category => {
        const responses = categoryResponses[category];
        if (responses.length < 2) return; // 카테고리별 응답이 2개 미만이면 일관성 계산 불가
        
        let categoryConsistency = 0;
        let comparisonCount = 0;
        
        // 카테고리 내 응답 간 일관성 계산
        for (let i = 0; i < responses.length; i++) {
            for (let j = i + 1; j < responses.length; j++) {
                const resp1 = responses[i];
                const resp2 = responses[j];
                
                // 테토-에겐 일관성
                const tetoEgenConsistency = 
                    ((resp1.tetoScore > resp1.egenScore) === (resp2.tetoScore > resp2.egenScore)) ? 1 : 0;
                
                // 남성성-여성성 일관성
                const genderConsistency = 
                    ((resp1.masculinityScore > resp1.femininityScore) === (resp2.masculinityScore > resp2.femininityScore)) ? 1 : 0;
                
                categoryConsistency += (tetoEgenConsistency + genderConsistency) / 2;
                comparisonCount++;
            }
        }
        
        if (comparisonCount > 0) {
            categoryConsistency /= comparisonCount;
            totalConsistency += categoryConsistency;
            categoryCount++;
        }
    });
    
    return categoryCount > 0 ? totalConsistency / categoryCount : 0.5;
}

/**
 * 결과 데이터 정규화 및 검증
 * @param {Object} result - 분석 결과
 * @returns {Object} 정규화된 결과
 */
function normalizeResult(result) {
    // 점수 범위 제한 (0-10)
    result.tetoScore = Math.max(0, Math.min(10, result.tetoScore));
    result.egenScore = Math.max(0, Math.min(10, result.egenScore));
    result.masculinityScore = Math.max(0, Math.min(10, result.masculinityScore));
    result.femininityScore = Math.max(0, Math.min(10, result.femininityScore));
    
    // 신뢰도 범위 제한 (0-1)
    if (result.confidence !== undefined) {
        result.confidence = Math.max(0, Math.min(1, result.confidence));
    }
    
    // 일관성 범위 제한 (0-1)
    if (result.consistency !== undefined) {
        result.consistency = Math.max(0, Math.min(1, result.consistency));
    }
    
    // 결과 신뢰도 범위 제한 (0-100)
    if (result.resultReliability !== undefined) {
        result.resultReliability = Math.max(0, Math.min(100, result.resultReliability));
    }
    
    return result;
}

/**
 * 결과 요약 생성
 * @param {Object} personalityResult - 성격 유형 결과
 * @returns {Object} 결과 요약
 */
function generateResultSummary(personalityResult) {
    const summary = {
        personalityType: personalityResult.personalityType,
        mainCharacteristics: personalityResult.characteristics.slice(0, 3), // 주요 특징 3개
        relationshipSummary: personalityResult.relationshipAnalysis.description,
        strengthLevel: personalityResult.certainty >= 7 ? '매우 강함' : 
                      personalityResult.certainty >= 5 ? '강함' : 
                      personalityResult.certainty >= 3 ? '보통' : '약함',
        reliabilityLevel: personalityResult.resultReliability >= 80 ? '매우 높음' : 
                         personalityResult.resultReliability >= 60 ? '높음' : 
                         personalityResult.resultReliability >= 40 ? '보통' : '낮음'
    };
    
    // 성향 수정자가 있는 경우 추가
    if (personalityResult.typeModifier || personalityResult.genderModifier) {
        let modifierText = '';
        
        if (personalityResult.typeModifier) {
            modifierText += personalityResult.typeModifier;
        }
        
        if (personalityResult.genderModifier) {
            if (modifierText) modifierText += ', ';
            modifierText += personalityResult.genderModifier;
        }
        
        summary.modifierText = modifierText;
    }
    
    return summary;
}