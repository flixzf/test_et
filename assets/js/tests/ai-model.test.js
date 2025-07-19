/**
 * 테토-에겐 성격 유형 테스트 - AI 모델 테스트
 */

// 테스트 프레임워크 사용
const { describe, it, expect } = window.testFramework;

// AI 모델 테스트
describe('AI 모델 테스트', function() {
    // 모델 로드 테스트
    it('AI 모델이 올바르게 로드되어야 함', function() {
        // AI 모델 모듈 로드 확인
        expect(window.aiModel).toBeTruthy();
        
        // 모델 URL 확인
        expect(window.aiModel.getModelURL()).toBeTruthy();
        expect(typeof window.aiModel.getModelURL()).toBe('string');
    });
    
    // 이미지 분석 함수 테스트
    it('이미지 분석 함수가 올바른 형식의 결과를 반환해야 함', function() {
        expect(window.aiModel).toBeTruthy();
        expect(typeof window.aiModel.analyzeImage).toBe('function');
        
        // 모의 분석 결과 확인
        const mockResult = window.aiModel.getMockAnalysisResult();
        expect(mockResult).toHaveProperty('tetoScore');
        expect(mockResult).toHaveProperty('egenScore');
        expect(mockResult).toHaveProperty('masculinityScore');
        expect(mockResult).toHaveProperty('femininityScore');
        expect(mockResult).toHaveProperty('confidence');
        
        // 점수 범위 확인
        expect(mockResult.tetoScore).toBeGreaterThan(0);
        expect(mockResult.tetoScore).toBeLessThan(100);
        expect(mockResult.egenScore).toBeGreaterThan(0);
        expect(mockResult.egenScore).toBeLessThan(100);
        expect(mockResult.masculinityScore).toBeGreaterThan(0);
        expect(mockResult.masculinityScore).toBeLessThan(100);
        expect(mockResult.femininityScore).toBeGreaterThan(0);
        expect(mockResult.femininityScore).toBeLessThan(100);
        
        // 테토-에겐 점수 합계 확인
        expect(mockResult.tetoScore + mockResult.egenScore).toBe(100);
        
        // 남성성-여성성 점수 합계 확인
        expect(mockResult.masculinityScore + mockResult.femininityScore).toBe(100);
        
        // 신뢰도 범위 확인
        expect(mockResult.confidence).toBeGreaterThan(0);
        expect(mockResult.confidence).toBeLessThan(1);
    });
});