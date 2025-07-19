/**
 * 테토-에겐 성격 유형 테스트 테스트 프레임워크
 * 
 * 이 모듈은 애플리케이션의 핵심 기능을 테스트하기 위한 단위 및 통합 테스트 프레임워크를 제공합니다.
 */

const TestFramework = {
    // 테스트 결과 저장
    results: {
        passed: 0,
        failed: 0,
        skipped: 0,
        total: 0,
        tests: []
    },
    
    // 현재 실행 중인 테스트 스위트
    currentSuite: null,
    
    // 테스트 실행 상태
    isRunning: false,
    
    /**
     * 테스트 스위트 정의
     * @param {string} name - 테스트 스위트 이름
     * @param {Function} callback - 테스트 케이스를 정의하는 콜백 함수
     */
    describe: function(name, callback) {
        const previousSuite = this.currentSuite;
        this.currentSuite = name;
        
        try {
            callback();
        } catch (error) {
            console.error(`테스트 스위트 "${name}" 실행 중 오류 발생:`, error);
        }
        
        this.currentSuite = previousSuite;
    },
    
    /**
     * 테스트 케이스 정의
     * @param {string} name - 테스트 케이스 이름
     * @param {Function} callback - 테스트 로직을 포함하는 콜백 함수
     * @param {boolean} skip - 테스트 건너뛰기 여부
     */
    it: function(name, callback, skip = false) {
        if (skip || !this.isRunning) {
            this.results.skipped++;
            this.results.total++;
            this.results.tests.push({
                suite: this.currentSuite,
                name: name,
                status: 'skipped',
                error: null
            });
            return;
        }
        
        this.results.total++;
        
        try {
            callback();
            this.results.passed++;
            this.results.tests.push({
                suite: this.currentSuite,
                name: name,
                status: 'passed',
                error: null
            });
        } catch (error) {
            this.results.failed++;
            this.results.tests.push({
                suite: this.currentSuite,
                name: name,
                status: 'failed',
                error: error.message
            });
            console.error(`테스트 "${name}" 실패:`, error);
        }
    },
    
    /**
     * 건너뛸 테스트 케이스 정의
     * @param {string} name - 테스트 케이스 이름
     * @param {Function} callback - 테스트 로직을 포함하는 콜백 함수
     */
    xit: function(name, callback) {
        this.it(name, callback, true);
    },
    
    /**
     * 테스트 전 설정
     * @param {Function} callback - 설정 로직을 포함하는 콜백 함수
     */
    beforeEach: function(callback) {
        if (!this.isRunning) return;
        
        this._beforeEachCallbacks = this._beforeEachCallbacks || [];
        this._beforeEachCallbacks.push(callback);
    },
    
    /**
     * 테스트 후 정리
     * @param {Function} callback - 정리 로직을 포함하는 콜백 함수
     */
    afterEach: function(callback) {
        if (!this.isRunning) return;
        
        this._afterEachCallbacks = this._afterEachCallbacks || [];
        this._afterEachCallbacks.push(callback);
    },
    
    /**
     * 테스트 실행 전 설정 실행
     */
    _runBeforeEach: function() {
        if (!this._beforeEachCallbacks) return;
        
        for (const callback of this._beforeEachCallbacks) {
            try {
                callback();
            } catch (error) {
                console.error('beforeEach 실행 중 오류 발생:', error);
            }
        }
    },
    
    /**
     * 테스트 실행 후 정리 실행
     */
    _runAfterEach: function() {
        if (!this._afterEachCallbacks) return;
        
        for (const callback of this._afterEachCallbacks) {
            try {
                callback();
            } catch (error) {
                console.error('afterEach 실행 중 오류 발생:', error);
            }
        }
    },
    
    /**
     * 어설션 함수들
     */
    expect: function(actual) {
        return {
            toBe: function(expected) {
                if (actual !== expected) {
                    throw new Error(`예상값 ${expected}이(가) 실제값 ${actual}과(와) 다릅니다.`);
                }
            },
            
            notToBe: function(expected) {
                if (actual === expected) {
                    throw new Error(`${actual}이(가) ${expected}과(와) 같지 않아야 합니다.`);
                }
            },
            
            toEqual: function(expected) {
                const actualStr = JSON.stringify(actual);
                const expectedStr = JSON.stringify(expected);
                
                if (actualStr !== expectedStr) {
                    throw new Error(`예상값 ${expectedStr}이(가) 실제값 ${actualStr}과(와) 다릅니다.`);
                }
            },
            
            toContain: function(expected) {
                if (Array.isArray(actual)) {
                    if (!actual.includes(expected)) {
                        throw new Error(`${expected}이(가) 배열 ${JSON.stringify(actual)}에 포함되어 있지 않습니다.`);
                    }
                } else if (typeof actual === 'string') {
                    if (!actual.includes(expected)) {
                        throw new Error(`${expected}이(가) 문자열 "${actual}"에 포함되어 있지 않습니다.`);
                    }
                } else {
                    throw new Error(`toContain은 배열 또는 문자열에만 사용할 수 있습니다.`);
                }
            },
            
            toBeTruthy: function() {
                if (!actual) {
                    throw new Error(`${actual}이(가) truthy 값이어야 합니다.`);
                }
            },
            
            toBeFalsy: function() {
                if (actual) {
                    throw new Error(`${actual}이(가) falsy 값이어야 합니다.`);
                }
            },
            
            toBeGreaterThan: function(expected) {
                if (!(actual > expected)) {
                    throw new Error(`${actual}이(가) ${expected}보다 커야 합니다.`);
                }
            },
            
            toBeLessThan: function(expected) {
                if (!(actual < expected)) {
                    throw new Error(`${actual}이(가) ${expected}보다 작아야 합니다.`);
                }
            },
            
            toBeInstanceOf: function(expected) {
                if (!(actual instanceof expected)) {
                    throw new Error(`${actual}이(가) ${expected.name}의 인스턴스여야 합니다.`);
                }
            },
            
            toHaveProperty: function(prop) {
                if (!(prop in actual)) {
                    throw new Error(`객체에 '${prop}' 속성이 있어야 합니다.`);
                }
            }
        };
    },
    
    /**
     * 모든 테스트 실행
     * @returns {Promise} 테스트 결과 Promise
     */
    runTests: function() {
        // 테스트 결과 초기화
        this.results = {
            passed: 0,
            failed: 0,
            skipped: 0,
            total: 0,
            tests: []
        };
        
        this.isRunning = true;
        
        // 테스트 모듈 로드
        return this._loadTestModules()
            .then(() => {
                // 테스트 결과 반환
                this.isRunning = false;
                return this.results;
            })
            .catch(error => {
                console.error('테스트 실행 중 오류 발생:', error);
                this.isRunning = false;
                throw error;
            });
    },
    
    /**
     * 테스트 모듈 로드
     * @returns {Promise} 모듈 로드 Promise
     */
    _loadTestModules: function() {
        // 테스트 모듈 목록
        const testModules = [
            'assets/js/tests/questions.test.js',
            'assets/js/tests/score-calculator.test.js',
            'assets/js/tests/ai-model.test.js',
            'assets/js/tests/integration.test.js'
        ];
        
        // 모듈 로드 Promise 배열
        const loadPromises = testModules.map(modulePath => {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = modulePath;
                script.onload = resolve;
                script.onerror = () => reject(new Error(`테스트 모듈 로드 실패: ${modulePath}`));
                document.head.appendChild(script);
            });
        });
        
        // 모든 모듈 로드 대기
        return Promise.all(loadPromises);
    },
    
    /**
     * 테스트 결과 표시
     * @param {HTMLElement} container - 결과를 표시할 컨테이너 요소
     */
    displayResults: function(container) {
        if (!container) return;
        
        // 결과 요약
        const summary = document.createElement('div');
        summary.className = 'test-summary';
        
        const totalTests = this.results.total;
        const passedTests = this.results.passed;
        const failedTests = this.results.failed;
        const skippedTests = this.results.skipped;
        
        const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
        
        summary.innerHTML = `
            <h3>테스트 결과 요약</h3>
            <div class="test-stats">
                <div class="test-stat">
                    <span class="stat-label">전체:</span>
                    <span class="stat-value">${totalTests}</span>
                </div>
                <div class="test-stat">
                    <span class="stat-label">통과:</span>
                    <span class="stat-value passed">${passedTests}</span>
                </div>
                <div class="test-stat">
                    <span class="stat-label">실패:</span>
                    <span class="stat-value failed">${failedTests}</span>
                </div>
                <div class="test-stat">
                    <span class="stat-label">건너뜀:</span>
                    <span class="stat-value skipped">${skippedTests}</span>
                </div>
                <div class="test-stat">
                    <span class="stat-label">통과율:</span>
                    <span class="stat-value">${passRate}%</span>
                </div>
            </div>
            <div class="progress">
                <div class="progress-bar bg-success" role="progressbar" style="width: ${passRate}%" 
                    aria-valuenow="${passRate}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
        `;
        
        // 테스트 결과 목록
        const resultsList = document.createElement('div');
        resultsList.className = 'test-results-list';
        
        // 스위트별로 그룹화
        const suites = {};
        this.results.tests.forEach(test => {
            if (!suites[test.suite]) {
                suites[test.suite] = [];
            }
            suites[test.suite].push(test);
        });
        
        // 각 스위트 결과 표시
        for (const [suiteName, tests] of Object.entries(suites)) {
            const suiteElement = document.createElement('div');
            suiteElement.className = 'test-suite';
            
            const suiteHeader = document.createElement('h4');
            suiteHeader.className = 'suite-header';
            suiteHeader.textContent = suiteName;
            suiteElement.appendChild(suiteHeader);
            
            const testList = document.createElement('ul');
            testList.className = 'test-list';
            
            tests.forEach(test => {
                const testItem = document.createElement('li');
                testItem.className = `test-item ${test.status}`;
                
                let statusIcon = '';
                switch (test.status) {
                    case 'passed':
                        statusIcon = '<i class="fas fa-check-circle text-success"></i>';
                        break;
                    case 'failed':
                        statusIcon = '<i class="fas fa-times-circle text-danger"></i>';
                        break;
                    case 'skipped':
                        statusIcon = '<i class="fas fa-minus-circle text-warning"></i>';
                        break;
                }
                
                testItem.innerHTML = `
                    <div class="test-header">
                        <span class="test-status">${statusIcon}</span>
                        <span class="test-name">${test.name}</span>
                    </div>
                `;
                
                if (test.error) {
                    const errorElement = document.createElement('div');
                    errorElement.className = 'test-error';
                    errorElement.textContent = test.error;
                    testItem.appendChild(errorElement);
                }
                
                testList.appendChild(testItem);
            });
            
            suiteElement.appendChild(testList);
            resultsList.appendChild(suiteElement);
        }
        
        // 컨테이너에 결과 추가
        container.innerHTML = '';
        container.appendChild(summary);
        container.appendChild(resultsList);
        
        // 스타일 추가
        const style = document.createElement('style');
        style.textContent = `
            .test-summary {
                margin-bottom: 20px;
                padding: 15px;
                background-color: #f8f9fa;
                border-radius: 8px;
            }
            
            .test-stats {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
                margin: 15px 0;
            }
            
            .test-stat {
                padding: 8px 15px;
                border-radius: 4px;
                background-color: #e9ecef;
            }
            
            .stat-label {
                font-weight: bold;
                margin-right: 5px;
            }
            
            .stat-value.passed {
                color: #28a745;
            }
            
            .stat-value.failed {
                color: #dc3545;
            }
            
            .stat-value.skipped {
                color: #ffc107;
            }
            
            .test-suite {
                margin-bottom: 20px;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                overflow: hidden;
            }
            
            .suite-header {
                padding: 10px 15px;
                background-color: #e9ecef;
                margin: 0;
            }
            
            .test-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .test-item {
                padding: 10px 15px;
                border-top: 1px solid #dee2e6;
            }
            
            .test-item.failed {
                background-color: rgba(220, 53, 69, 0.1);
            }
            
            .test-item.passed {
                background-color: rgba(40, 167, 69, 0.1);
            }
            
            .test-item.skipped {
                background-color: rgba(255, 193, 7, 0.1);
            }
            
            .test-status {
                margin-right: 10px;
            }
            
            .test-error {
                margin-top: 10px;
                padding: 10px;
                background-color: rgba(220, 53, 69, 0.2);
                border-radius: 4px;
                font-family: monospace;
                white-space: pre-wrap;
            }
        `;
        
        document.head.appendChild(style);
    },
    
    /**
     * 테스트 UI 생성
     * @returns {HTMLElement} 테스트 UI 컨테이너
     */
    createTestUI: function() {
        // 테스트 UI 컨테이너
        const container = document.createElement('div');
        container.id = 'test-container';
        container.className = 'test-container';
        
        // 테스트 헤더
        const header = document.createElement('div');
        header.className = 'test-header';
        header.innerHTML = `
            <h2>테토-에겐 성격 유형 테스트 - 테스트 모드</h2>
            <p>애플리케이션의 핵심 기능을 테스트합니다.</p>
        `;
        
        // 테스트 컨트롤
        const controls = document.createElement('div');
        controls.className = 'test-controls';
        controls.innerHTML = `
            <button id="run-tests-btn" class="btn btn-primary">
                <i class="fas fa-play"></i> 테스트 실행
            </button>
        `;
        
        // 테스트 결과 컨테이너
        const results = document.createElement('div');
        results.id = 'test-results';
        results.className = 'test-results';
        
        // 컨테이너에 요소 추가
        container.appendChild(header);
        container.appendChild(controls);
        container.appendChild(results);
        
        // 스타일 추가
        const style = document.createElement('style');
        style.textContent = `
            .test-container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            
            .test-header {
                margin-bottom: 20px;
                text-align: center;
            }
            
            .test-controls {
                margin-bottom: 20px;
                text-align: center;
            }
            
            .test-results {
                margin-top: 20px;
            }
        `;
        
        document.head.appendChild(style);
        
        // 이벤트 리스너 추가
        setTimeout(() => {
            const runTestsBtn = document.getElementById('run-tests-btn');
            if (runTestsBtn) {
                runTestsBtn.addEventListener('click', () => {
                    runTestsBtn.disabled = true;
                    runTestsBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 테스트 실행 중...';
                    
                    this.runTests()
                        .then(() => {
                            this.displayResults(document.getElementById('test-results'));
                            runTestsBtn.disabled = false;
                            runTestsBtn.innerHTML = '<i class="fas fa-play"></i> 테스트 실행';
                        })
                        .catch(error => {
                            console.error('테스트 실행 오류:', error);
                            runTestsBtn.disabled = false;
                            runTestsBtn.innerHTML = '<i class="fas fa-play"></i> 테스트 실행';
                        });
                });
            }
        }, 0);
        
        return container;
    }
};

// 전역 객체로 내보내기
window.testFramework = TestFramework;