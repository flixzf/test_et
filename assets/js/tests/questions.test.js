/**
 * 테토-에겐 성격 유형 테스트 - 질문 모듈 테스트
 */

// 테스트 프레임워크 사용
const { describe, it, expect } = window.testFramework;

// 질문 모듈 테스트
describe('질문 모듈 테스트', function() {
    // 질문 데이터 구조 테스트
    it('질문 데이터가 올바른 구조를 가져야 함', function() {
        // 질문 모듈 로드 확인
        expect(window.questionModule).toBeTruthy();
        
        // 질문 배열 확인
        const questions = window.questionModule.getQuestions();
        expect(Array.isArray(questions)).toBeTruthy();
        expect(questions.length).toBeGreaterThan(0);
        
        // 첫 번째 질문 구조 확인
        const firstQuestion = questions[0];
        expect(firstQuestion).toHaveProperty('id');
        expect(firstQuestion).toHaveProperty('text');
        expect(firstQuestion).toHaveProperty('options');
        expect(firstQuestion).toHaveProperty('weight');
        
        // 옵션 구조 확인
        expect(Array.isArray(firstQuestion.options)).toBeTruthy();
        expect(firstQuestion.options.length).toBeGreaterThan(0);
        
        const firstOption = firstQuestion.options[0];
        expect(firstOption).toHaveProperty('text');
        expect(firstOption).toHaveProperty('tetoScore');
        expect(firstOption).toHaveProperty('egenScore');
        expect(firstOption).toHaveProperty('masculinityScore');
        expect(firstOption).toHaveProperty('femininityScore');
    });
    
    // 질문 ID 유효성 테스트
    it('모든 질문은 고유한 ID를 가져야 함', function() {
        const questions = window.questionModule.getQuestions();
        const ids = questions.map(q => q.id);
        
        // 중복 ID 확인
        const uniqueIds = [...new Set(ids)];
        expect(uniqueIds.length).toBe(questions.length);
    });
    
    // 질문 가중치 테스트
    it('모든 질문은 유효한 가중치를 가져야 함', function() {
        const questions = window.questionModule.getQuestions();
        
        for (const question of questions) {
            expect(typeof question.weight).toBe('number');
            expect(question.weight).toBeGreaterThan(0);
        }
    });
    
    // 옵션 점수 테스트
    it('모든 옵션은 유효한 점수를 가져야 함', function() {
        const questions = window.questionModule.getQuestions();
        
        for (const question of questions) {
            for (const option of question.options) {
                expect(typeof option.tetoScore).toBe('number');
                expect(typeof option.egenScore).toBe('number');
                expect(typeof option.masculinityScore).toBe('number');
                expect(typeof option.femininityScore).toBe('number');
            }
        }
    });
});