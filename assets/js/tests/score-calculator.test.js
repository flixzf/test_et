/**
 * 테토-에겐 성격 유형 테스트 - 점수 계산 모듈 테스트
 */

// 테스트 프레임워크 사용
const { describe, it, expect } = window.testFramework;

// 점수 계산 모듈 테스트
describe('점수 계산 모듈 테스트', function() {
    // 점수 계산 함수 테스트
    it('응답에 따라 점수를 올바르게 계산해야 함', function() {
        // 점수 계산 모듈 로드 확인
        expect(window.scoreCalculator).toBeTruthy();
        
        // 테스트용 응답 데이터
        const testResponses = [
            { questionId: 1, selectedOption: 0, weight: 1 },
            { questionId: 2, selectedOption: 1, weight: 1 },
            { questionId: 3, selectedOption: 2, weight: 1 }
        ];
        
        // 테스트용 질문 및 옵션 데이터
        const testQuestions = [
            {
                id: 1,
                text: '테스트 질문 1',
                options: [
                    { text: '옵션 1', tetoScore: 10, egenScore: 0, masculinityScore: 8, femininityScore: 2 },
                    { text: '옵션 2', tetoScore: 5, egenScore: 5, masculinityScore: 5, femininityScore: 5 },
                    { text: '옵션 3', tetoScore: 0, egenScore: 10, masculinityScore: 2, femininityScore: 8 }
                ],
                weight: 1
            },
            {
                id: 2,
                text: '테스트 질문 2',
                options: [
                    { text: '옵션 1', tetoScore: 8, egenScore: 2, masculinityScore: 9, femininityScore: 1 },
                    { text: '옵션 2', tetoScore: 4, egenScore: 6, masculinityScore: 3, femininityScore: 7 },
                    { text: '옵션 3', tetoScore: 2, egenScore: 8, masculinityScore: 1, femininityScore: 9 }
                ],
                weight: 1
            },
            {
                id: 3,
                text: '테스트 질문 3',
                options: [
                    { text: '옵션 1', tetoScore: 9, egenScore: 1, masculinityScore: 7, femininityScore: 3 },
                    { text: '옵션 2', tetoScore: 6, egenScore: 4, masculinityScore: 4, femininityScore: 6 },
                    { text: '옵션 3', tetoScore: 1, egenScore: 9, masculinityScore: 3, femininityScore: 7 }
                ],
                weight: 1
            }
        ];
        
        // 원래 질문 데이터 백업
        const originalGetQuestions = window.questionModule ? window.questionModule.getQuestions : null;
        
        // 테스트용 질문 데이터로 대체
        if (window.questionModule) {
            window.questionModule.getQuestions = function() {
                return testQuestions;
            };
        }
        
        // 점수 계산
        const result = window.scoreCalculator.calculateScores(testResponses);
        
        // 원래 질문 데이터 복원
        if (window.questionModule && originalGetQuestions) {
            window.questionModule.getQuestions = originalGetQuestions;
        }
        
        // 결과 구조 확인
        expect(result).toHaveProperty('tetoScore');
        expect(result).toHaveProperty('egenScore');
        expect(result).toHaveProperty('masculinityScore');
        expect(result).toHaveProperty('femininityScore');
        
        // 점수 범위 확인
        expect(result.tetoScore).toBeGreaterThan(0);
        expect(result.tetoScore).toBeLessThan(100);
        expect(result.egenScore).toBeGreaterThan(0);
        expect(result.egenScore).toBeLessThan(100);
        expect(result.masculinityScore).toBeGreaterThan(0);
        expect(result.masculinityScore).toBeLessThan(100);
        expect(result.femininityScore).toBeGreaterThan(0);
        expect(result.femininityScore).toBeLessThan(100);
        
        // 테토-에겐 점수 합계 확인
        expect(result.tetoScore + result.egenScore).toBe(100);
        
        // 남성성-여성성 점수 합계 확인
        expect(result.masculinityScore + result.femininityScore).toBe(100);
    });
    
    // 성격 유형 결정 테스트
    it('점수에 따라 성격 유형을 올바르게 결정해야 함', function() {
        expect(window.scoreCalculator).toBeTruthy();
        
        // 테토남 케이스
        const tetoMaleResult = window.scoreCalculator.determinePersonalityType({
            tetoScore: 70,
            egenScore: 30,
            masculinityScore: 65,
            femininityScore: 35
        });
        expect(tetoMaleResult).toBe('테토남');
        
        // 테토녀 케이스
        const tetoFemaleResult = window.scoreCalculator.determinePersonalityType({
            tetoScore: 65,
            egenScore: 35,
            masculinityScore: 40,
            femininityScore: 60
        });
        expect(tetoFemaleResult).toBe('테토녀');
        
        // 에겐남 케이스
        const egenMaleResult = window.scoreCalculator.determinePersonalityType({
            tetoScore: 35,
            egenScore: 65,
            masculinityScore: 60,
            femininityScore: 40
        });
        expect(egenMaleResult).toBe('에겐남');
        
        // 에겐녀 케이스
        const egenFemaleResult = window.scoreCalculator.determinePersonalityType({
            tetoScore: 30,
            egenScore: 70,
            masculinityScore: 35,
            femininityScore: 65
        });
        expect(egenFemaleResult).toBe('에겐녀');
    });
});