/**
 * 테토-에겐 성격 유형 테스트 - 통합 테스트
 */

// 테스트 프레임워크 사용
const { describe, it, expect } = window.testFramework;

// 통합 테스트
describe('통합 테스트', function() {
    // 설문 결과와 이미지 분석 결과 통합 테스트
    it('설문 결과와 이미지 분석 결과가 올바르게 통합되어야 함', function() {
        // 필요한 모듈 로드 확인
        expect(window.scoreCalculator).toBeTruthy();
        expect(window.aiModel).toBeTruthy();
        
        // 테스트용 설문 결과
        const surveyResult = {
            tetoScore: 60,
            egenScore: 40,
            masculinityScore: 55,
            femininityScore: 45
        };
        
        // 테스트용 이미지 분석 결과
        const imageAnalysisResult = {
            tetoScore: 70,
            egenScore: 30,
            masculinityScore: 65,
            femininityScore: 35,
            confidence: 0.8
        };
        
        // 결과 통합 함수 확인
        expect(typeof window.scoreCalculator.combineResults).toBe('function');
        
        // 결과 통합
        const combinedResult = window.scoreCalculator.combineResults(surveyResult, imageAnalysisResult);
        
        // 결과 구조 확인
        expect(combinedResult).toHaveProperty('tetoScore');
        expect(combinedResult).toHaveProperty('egenScore');
        expect(combinedResult).toHaveProperty('masculinityScore');
        expect(combinedResult).toHaveProperty('femininityScore');
        
        // 점수 범위 확인
        expect(combinedResult.tetoScore).toBeGreaterThan(0);
        expect(combinedResult.tetoScore).toBeLessThan(100);
        expect(combinedResult.egenScore).toBeGreaterThan(0);
        expect(combinedResult.egenScore).toBeLessThan(100);
        expect(combinedResult.masculinityScore).toBeGreaterThan(0);
        expect(combinedResult.masculinityScore).toBeLessThan(100);
        expect(combinedResult.femininityScore).toBeGreaterThan(0);
        expect(combinedResult.femininityScore).toBeLessThan(100);
        
        // 테토-에겐 점수 합계 확인
        expect(combinedResult.tetoScore + combinedResult.egenScore).toBe(100);
        
        // 남성성-여성성 점수 합계 확인
        expect(combinedResult.masculinityScore + combinedResult.femininityScore).toBe(100);
        
        // 이미지 분석 결과 반영 확인 (신뢰도에 따라 가중치 적용)
        expect(combinedResult.tetoScore).toBeGreaterThan(surveyResult.tetoScore);
        expect(combinedResult.masculinityScore).toBeGreaterThan(surveyResult.masculinityScore);
    });
    
    // 전체 테스트 흐름 테스트
    it('전체 테스트 흐름이 올바르게 작동해야 함', function() {
        // 필요한 모듈 로드 확인
        expect(window.questionModule).toBeTruthy();
        expect(window.scoreCalculator).toBeTruthy();
        expect(window.aiModel).toBeTruthy();
        
        // 1. 질문 데이터 가져오기
        const questions = window.questionModule.getQuestions();
        expect(Array.isArray(questions)).toBeTruthy();
        expect(questions.length).toBeGreaterThan(0);
        
        // 2. 테스트용 응답 생성
        const responses = questions.map(question => ({
            questionId: question.id,
            selectedOption: Math.floor(Math.random() * question.options.length),
            weight: question.weight
        }));
        
        // 3. 설문 결과 계산
        const surveyResult = window.scoreCalculator.calculateScores(responses);
        expect(surveyResult).toHaveProperty('tetoScore');
        expect(surveyResult).toHaveProperty('egenScore');
        expect(surveyResult).toHaveProperty('masculinityScore');
        expect(surveyResult).toHaveProperty('femininityScore');
        
        // 4. 이미지 분석 결과 모의 생성
        const imageAnalysisResult = window.aiModel.getMockAnalysisResult();
        
        // 5. 결과 통합
        const combinedResult = window.scoreCalculator.combineResults(surveyResult, imageAnalysisResult);
        
        // 6. 성격 유형 결정
        const personalityType = window.scoreCalculator.determinePersonalityType(combinedResult);
        expect(['테토남', '테토녀', '에겐남', '에겐녀']).toContain(personalityType);
    });
});