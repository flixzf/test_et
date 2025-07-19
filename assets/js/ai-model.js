/**
 * 테토-에겐 성격 유형 테스트 AI 모델 모듈
 * 
 * TensorFlow.js를 사용하여 이미지를 분석하는 모듈입니다.
 * 이 모듈은 얼굴 이미지를 분석하여 테토-에겐 성격 유형을 예측합니다.
 */

// 전역 변수
let model = null;
let isModelLoading = false;
let modelLoadingPromise = null;

// 모델 URL
const MODEL_URL = './assets/models/teto-egen/';

/**
 * AI 모델 로드
 * @returns {Promise} 모델 로드 완료 Promise
 */
async function loadModel() {
    // 이미 로드 중이면 기존 Promise 반환
    if (isModelLoading) {
        return modelLoadingPromise;
    }
    
    // 이미 로드되었으면 즉시 완료된 Promise 반환
    if (model !== null) {
        return Promise.resolve();
    }
    
    // 로딩 상태 설정
    isModelLoading = true;
    
    // 모델 로드 Promise 생성
    modelLoadingPromise = new Promise(async (resolve, reject) => {
        try {
            // 로딩 시작 로그
            console.log('AI 모델 로드 시작...');
            
            // TensorFlow.js가 로드되었는지 확인
            if (typeof tf === 'undefined') {
                throw new Error('TensorFlow.js가 로드되지 않았습니다.');
            }
            
            // TensorFlow.js 모델 URL
            const modelURL = MODEL_URL + 'model.json';
            
            try {
                // TensorFlow.js 모델 로드
                model = await tf.loadLayersModel(modelURL);
                console.log('TensorFlow.js 모델 로드 완료');
            } catch (error) {
                console.error('모델 로드 실패:', error);
                throw error;
            }
            
            // 모델 웜업 (첫 추론 시간 단축을 위해)
            await warmupModel();
            
            // 로딩 완료 로그
            console.log('AI 모델 로드 완료');
            
            // Promise 완료
            resolve();
        } catch (error) {
            // 오류 로그
            console.error('AI 모델 로드 실패:', error);
            
            // 모델 상태 초기화
            model = null;
            
            // Promise 거부
            reject(error);
        } finally {
            // 로딩 상태 초기화
            isModelLoading = false;
        }
    });
    
    return modelLoadingPromise;
}

/**
 * 모델 웜업 (첫 추론 시간 단축을 위해 더미 데이터로 추론 실행)
 */
async function warmupModel() {
    if (!model) return;
    
    try {
        // TensorFlow.js 모델 웜업
        // 메모리 효율성을 위해 tf.tidy 사용
        tf.tidy(() => {
            // 더미 이미지 데이터 생성 (1x224x224x3 크기의 0으로 채워진 텐서)
            const dummyTensor = tf.zeros([1, 224, 224, 3]);
            
            // 비동기 처리를 위해 즉시 실행하지 않음
            setTimeout(() => {
                model.predict(dummyTensor)
                    .then(result => {
                        result.dispose();
                        console.log('모델 웜업 완료');
                    })
                    .catch(err => console.warn('모델 웜업 실패:', err));
            }, 100);
        });
    } catch (error) {
        console.warn('모델 웜업 설정 실패:', error);
        // 웜업 실패는 치명적 오류가 아님
    }
}

/**
 * 이미지 분석
 * @param {string} imageData - Base64 인코딩된 이미지 데이터
 * @returns {Promise<Object>} 분석 결과
 */
async function analyzeImage(imageData) {
    // 모델이 로드되지 않았으면 로드
    if (!model) {
        await loadModel();
    }
    
    try {
        // 이미지 전처리
        const tensor = await preprocessImage(imageData);
        
        // 얼굴 특징 분석 (face-detection.js 모듈 사용)
        let facialFeatures = null;
        if (window.faceDetection && typeof window.faceDetection.analyzeFacialFeatures === 'function') {
            try {
                // 이미지 객체 생성
                const img = new Image();
                img.src = imageData;
                
                // 이미지 로드 대기
                await new Promise((resolve) => {
                    img.onload = resolve;
                });
                
                // 얼굴 특징 분석
                facialFeatures = await window.faceDetection.analyzeFacialFeatures(img);
                console.log('얼굴 특징 분석 결과:', facialFeatures);
            } catch (faceError) {
                console.warn('얼굴 특징 분석 실패:', faceError);
                // 얼굴 분석 실패 시에도 계속 진행
            }
        }
        
        // 모델 추론 실행
        const predictions = await runInference(tensor);
        
        // 텐서 정리
        tensor.dispose();
        
        // 얼굴 특징 분석 결과와 모델 추론 결과 통합
        if (facialFeatures) {
            // 얼굴 특징 분석 결과가 있는 경우, 두 결과를 통합
            // 얼굴 특징 분석 결과와 모델 추론 결과의 가중치 설정 (7:3)
            const modelWeight = 0.7;
            const facialWeight = 0.3;
            
            return {
                tetoScore: predictions.tetoScore * modelWeight + facialFeatures.tetoScore * facialWeight,
                egenScore: predictions.egenScore * modelWeight + facialFeatures.egenScore * facialWeight,
                masculinityScore: predictions.masculinityScore * modelWeight + facialFeatures.masculinityScore * facialWeight,
                femininityScore: predictions.femininityScore * modelWeight + facialFeatures.femininityScore * facialWeight,
                confidence: (predictions.confidence * modelWeight + facialFeatures.confidence * facialWeight),
                facialFeatures: facialFeatures.features
            };
        }
        
        // 얼굴 특징 분석 결과가 없는 경우, 모델 추론 결과만 반환
        return predictions;
    } catch (error) {
        console.error('이미지 분석 오류:', error);
        throw new Error('이미지 분석 중 오류가 발생했습니다: ' + error.message);
    }
}

/**
 * 이미지 전처리
 * @param {string} imageData - Base64 인코딩된 이미지 데이터
 * @returns {tf.Tensor} 전처리된 이미지 텐서
 */
async function preprocessImage(imageData) {
    return new Promise((resolve, reject) => {
        try {
            // 이미지 객체 생성
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                // tf.tidy를 사용하여 메모리 누수 방지
                tf.tidy(() => {
                    try {
                        // 캔버스 생성
                        const canvas = document.createElement('canvas');
                        canvas.width = 224;  // 모델 입력 크기
                        canvas.height = 224;
                        
                        // 이미지 그리기
                        const ctx = canvas.getContext('2d');
                        
                        // 이미지 비율 유지하며 중앙 크롭
                        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
                        const x = (canvas.width / 2) - (img.width / 2) * scale;
                        const y = (canvas.height / 2) - (img.height / 2) * scale;
                        
                        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                        
                        // 이미지 데이터를 텐서로 변환 (메모리 효율적인 방식)
                        const tensor = tf.browser.fromPixels(canvas)
                            .toFloat()
                            .div(255.0)  // 정규화 (0-1 범위)
                            .expandDims(0);  // 배치 차원 추가
                        
                        // 텐서를 tf.tidy 외부로 전달하기 위해 keep() 사용
                        const keepTensor = tensor.clone();
                        
                        // 결과 반환
                        resolve(keepTensor);
                    } catch (error) {
                        reject(error);
                    }
                });
            };
            
            img.onerror = () => {
                reject(new Error('이미지 로드 실패'));
            };
            
            // 이미지 로드 타임아웃 설정 (10초)
            const timeoutId = setTimeout(() => {
                img.src = '';  // 로드 중단
                reject(new Error('이미지 로드 시간 초과'));
            }, 10000);
            
            // 로드 완료 시 타임아웃 해제
            img.onload = function() {
                clearTimeout(timeoutId);
                this.onload(); // 원래 onload 함수 호출
            };
            
            // Base64 이미지 데이터 설정
            img.src = imageData;
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * 모델 추론 실행
 * @param {tf.Tensor} tensor - 전처리된 이미지 텐서
 * @returns {Object} 추론 결과
 */
async function runInference(tensor) {
    try {
        return tf.tidy(() => {
            // 모델 추론 실행
            const predictions = model.predict(tensor);
            
            // 결과 처리 (모델 출력 형식에 따라 조정 필요)
            let tetoScore, egenScore, masculinityScore, femininityScore, confidence;
            
            // 모델 출력이 단일 텐서인 경우
            if (!(predictions instanceof Array)) {
                // 예시: 출력이 [테토점수, 에겐점수, 남성성점수, 여성성점수] 형태인 경우
                // dataSync 대신 arraySync 사용 (더 효율적)
                const values = predictions.arraySync()[0];
                tetoScore = values[0] * 10;  // 0-1 값을 0-10 범위로 변환
                egenScore = values[1] * 10;
                masculinityScore = values[2] * 10;
                femininityScore = values[3] * 10;
                
                // 신뢰도 계산 (예시: 최대값과 최소값의 차이)
                const maxVal = Math.max(tetoScore, egenScore, masculinityScore, femininityScore);
                const minVal = Math.min(tetoScore, egenScore, masculinityScore, femininityScore);
                confidence = (maxVal - minVal) / 10 + 0.5;  // 0.5-1.0 범위로 조정
            } 
            // 모델 출력이 여러 텐서인 경우
            else {
                // 예시: 각 출력이 별도의 점수를 나타내는 경우
                const tetoValues = predictions[0].arraySync()[0];
                const egenValues = predictions[1].arraySync()[0];
                const mascValues = predictions[2].arraySync()[0];
                const femValues = predictions[3].arraySync()[0];
                
                tetoScore = tetoValues[0] * 10;
                egenScore = egenValues[0] * 10;
                masculinityScore = mascValues[0] * 10;
                femininityScore = femValues[0] * 10;
                
                // 신뢰도 계산
                const maxVal = Math.max(tetoScore, egenScore, masculinityScore, femininityScore);
                const minVal = Math.min(tetoScore, egenScore, masculinityScore, femininityScore);
                confidence = (maxVal - minVal) / 10 + 0.5;  // 0.5-1.0 범위로 조정
            }
            
            // 결과 객체 반환
            return {
                tetoScore,
                egenScore,
                masculinityScore,
                femininityScore,
                confidence
            };
        });
    } catch (error) {
        console.error('추론 실행 오류:', error);
        throw error;
    }
}

/**
 * 모델 언로드 (메모리 해제)
 */
function unloadModel() {
    try {
        // TensorFlow.js 모델 언로드
        if (model && typeof model.dispose === 'function') {
            model.dispose();
        }
        
        // 모델 참조 초기화
        model = null;
        
        // 메모리 정리 요청
        if (typeof tf !== 'undefined' && typeof tf.disposeVariables === 'function') {
            tf.disposeVariables();
            
            // 가비지 컬렉션 힌트
            if (typeof window.gc === 'function') {
                window.gc();
            }
        }
        
        console.log('AI 모델 언로드 완료');
    } catch (error) {
        console.error('AI 모델 언로드 실패:', error);
    }
}

/**
 * 모델 상태 확인
 * @returns {Object} 모델 상태 정보
 */
function getModelStatus() {
    return {
        isLoaded: model !== null,
        isLoading: isModelLoading
    };
}

/**
 * 모델 정보 가져오기
 * @returns {Object} 모델 정보
 */
function getModelInfo() {
    if (!model) {
        return { error: '모델이 로드되지 않았습니다.' };
    }
    
    try {
        return {
            name: '테토-에겐 분류 모델',
            inputShape: model.inputs[0].shape,
            outputShape: model.outputs[0].shape,
            layers: model.layers.length
        };
    } catch (error) {
        return { error: '모델 정보를 가져오는 중 오류가 발생했습니다.' };
    }
}

/**
 * 오류 처리 함수
 * @param {Error} error - 오류 객체
 * @returns {Object} 사용자 친화적 오류 메시지
 */
function handleModelError(error) {
    // 오류 유형에 따른 사용자 친화적 메시지
    let userMessage = '이미지 분석 중 오류가 발생했습니다.';
    let technicalDetails = error.message || '알 수 없는 오류';
    
    // 오류 유형 분류
    if (error.message.includes('load')) {
        userMessage = '모델을 로드하는 중 오류가 발생했습니다. 인터넷 연결을 확인해 주세요.';
    } else if (error.message.includes('memory')) {
        userMessage = '메모리 부족으로 이미지를 분석할 수 없습니다. 브라우저를 새로고침하고 다시 시도해 주세요.';
    } else if (error.message.includes('image')) {
        userMessage = '이미지 처리 중 오류가 발생했습니다. 다른 이미지로 시도해 주세요.';
    }
    
    return {
        userMessage,
        technicalDetails,
        timestamp: new Date().toISOString()
    };
}

// 모듈 내보내기
window.aiModel = {
    loadModel,
    analyzeImage,
    unloadModel,
    getModelStatus,
    getModelInfo,
    handleModelError
};