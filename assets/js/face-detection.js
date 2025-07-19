/**
 * 테토-에겐 성격 유형 테스트 얼굴 감지 모듈
 * 
 * 이 모듈은 TensorFlow.js의 face-api.js를 사용하여 얼굴을 감지하고 분석합니다.
 */

// 전역 변수
let faceDetectionModel = null;
let isModelLoaded = false;

/**
 * 얼굴 감지 모델 로드
 * @returns {Promise} 모델 로드 완료 Promise
 */
async function loadFaceDetectionModel() {
    // 이미 로드되었으면 즉시 완료된 Promise 반환
    if (isModelLoaded) {
        return Promise.resolve();
    }

    return new Promise(async (resolve, reject) => {
        try {
            // face-api.js가 로드되었는지 확인
            if (typeof faceapi === 'undefined') {
                // face-api.js 동적 로드
                await loadScript('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js');
            }

            // 모델 경로 설정
            const modelUrl = './assets/models/face-detection';

            // 모델 로드
            await faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl);
            await faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl);

            isModelLoaded = true;
            console.log('얼굴 감지 모델 로드 완료');
            resolve();
        } catch (error) {
            console.error('얼굴 감지 모델 로드 실패:', error);
            reject(error);
        }
    });
}

/**
 * 스크립트 동적 로드
 * @param {string} url - 스크립트 URL
 * @returns {Promise} 로드 완료 Promise
 */
function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * 얼굴 감지
 * @param {HTMLCanvasElement|HTMLImageElement} imageElement - 이미지 또는 캔버스 요소
 * @returns {Promise<boolean>} 얼굴 감지 여부
 */
async function detectFace(imageElement) {
    try {
        // 얼굴 감지 모델이 로드되지 않았으면 로드 시도
        if (!isModelLoaded) {
            try {
                await loadFaceDetectionModel();
            } catch (error) {
                console.warn('얼굴 감지 모델 로드 실패, 얼굴 감지 없이 진행:', error);
                return true; // 모델 로드 실패 시에도 진행
            }
        }

        // face-api.js가 로드되지 않았으면 얼굴 감지 없이 진행
        if (typeof faceapi === 'undefined') {
            console.warn('face-api.js가 로드되지 않았습니다. 얼굴 감지 없이 진행합니다.');
            return true;
        }

        // 얼굴 감지 옵션 설정
        const options = new faceapi.TinyFaceDetectorOptions({
            inputSize: 416,
            scoreThreshold: 0.5
        });

        // 얼굴 감지 실행
        const detections = await faceapi.detectAllFaces(imageElement, options);

        // 감지된 얼굴이 있는지 확인
        const faceDetected = detections.length > 0;

        if (!faceDetected) {
            console.warn('이미지에서 얼굴을 감지할 수 없습니다.');
        } else {
            console.log(`${detections.length}개의 얼굴이 감지되었습니다.`);
        }

        return faceDetected;
    } catch (error) {
        console.error('얼굴 감지 중 오류 발생:', error);
        // 오류 발생 시에도 진행 (얼굴 감지는 선택적 기능)
        return true;
    }
}

/**
 * 이미지 품질 검사
 * @param {HTMLCanvasElement} canvas - 이미지가 그려진 캔버스
 * @returns {Object} 이미지 품질 정보
 */
function checkImageQuality(canvas) {
    try {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let brightness = 0;
        let contrast = 0;
        let sharpness = 0;

        // 밝기 계산
        let totalPixels = data.length / 4;
        let totalBrightness = 0;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // 픽셀 밝기 (0-255)
            const pixelBrightness = (r + g + b) / 3;
            totalBrightness += pixelBrightness;
        }

        // 평균 밝기 (0-255)
        const avgBrightness = totalBrightness / totalPixels;

        // 밝기 정규화 (0-1)
        brightness = avgBrightness / 255;

        // 대비 계산 (표준 편차 기반)
        let varianceSum = 0;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const pixelBrightness = (r + g + b) / 3;
            const diff = pixelBrightness - avgBrightness;
            varianceSum += diff * diff;
        }

        const variance = varianceSum / totalPixels;
        const stdDev = Math.sqrt(variance);

        // 대비 정규화 (0-1)
        contrast = stdDev / 128;

        // 선명도 계산 (간단한 에지 감지 기반)
        let edgeSum = 0;
        const width = canvas.width;

        for (let y = 1; y < canvas.height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;

                // 현재 픽셀과 주변 픽셀의 밝기 차이 계산
                const centerBrightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

                const leftIdx = (y * width + (x - 1)) * 4;
                const rightIdx = (y * width + (x + 1)) * 4;
                const topIdx = ((y - 1) * width + x) * 4;
                const bottomIdx = ((y + 1) * width + x) * 4;

                const leftBrightness = (data[leftIdx] + data[leftIdx + 1] + data[leftIdx + 2]) / 3;
                const rightBrightness = (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3;
                const topBrightness = (data[topIdx] + data[topIdx + 1] + data[topIdx + 2]) / 3;
                const bottomBrightness = (data[bottomIdx] + data[bottomIdx + 1] + data[bottomIdx + 2]) / 3;

                // 주변 픽셀과의 차이 합산
                const diff = Math.abs(centerBrightness - leftBrightness) +
                    Math.abs(centerBrightness - rightBrightness) +
                    Math.abs(centerBrightness - topBrightness) +
                    Math.abs(centerBrightness - bottomBrightness);

                edgeSum += diff;
            }
        }

        // 평균 에지 강도 계산
        const edgePixels = (canvas.width - 2) * (canvas.height - 2);
        const avgEdge = edgeSum / (edgePixels * 4);

        // 선명도 정규화 (0-1)
        sharpness = Math.min(avgEdge / 30, 1);

        // 품질 판단
        const quality = brightness >= 0.2 && brightness <= 0.8 && contrast >= 0.1 && sharpness >= 0.05;

        return {
            brightness,
            contrast,
            sharpness,
            quality
        };
    } catch (error) {
        console.error('이미지 품질 검사 중 오류 발생:', error);
        // 오류 발생 시 기본값 반환
        return {
            brightness: 0.5,
            contrast: 0.5,
            sharpness: 0.5,
            quality: true
        };
    }
}

/**
 * 얼굴 이미지 분석 및 특징 추출
 * @param {HTMLCanvasElement|HTMLImageElement} imageElement - 이미지 또는 캔버스 요소
 * @returns {Promise<Object>} 얼굴 특징 분석 결과
 */
async function analyzeFacialFeatures(imageElement) {
    try {
        // 얼굴 감지 모델이 로드되지 않았으면 로드 시도
        if (!isModelLoaded) {
            try {
                await loadFaceDetectionModel();
            } catch (error) {
                console.warn('얼굴 감지 모델 로드 실패:', error);
                return null; // 모델 로드 실패 시 null 반환
            }
        }

        // face-api.js가 로드되지 않았으면 null 반환
        if (typeof faceapi === 'undefined') {
            console.warn('face-api.js가 로드되지 않았습니다.');
            return null;
        }

        // 얼굴 감지 및 랜드마크 추출 옵션 설정
        const options = new faceapi.TinyFaceDetectorOptions({
            inputSize: 416,
            scoreThreshold: 0.5
        });

        // 얼굴 감지 및 랜드마크 추출 실행
        const detections = await faceapi.detectAllFaces(imageElement, options)
            .withFaceLandmarks();

        // 감지된 얼굴이 없으면 null 반환
        if (detections.length === 0) {
            console.warn('이미지에서 얼굴을 감지할 수 없습니다.');
            return null;
        }

        // 가장 큰 얼굴 선택 (여러 얼굴이 감지된 경우)
        let mainFace = detections[0];
        let maxArea = 0;

        detections.forEach(detection => {
            const box = detection.detection.box;
            const area = box.width * box.height;
            if (area > maxArea) {
                maxArea = area;
                mainFace = detection;
            }
        });

        // 얼굴 랜드마크 추출
        const landmarks = mainFace.landmarks;
        const points = landmarks.positions;

        // 얼굴 특징 분석
        const features = analyzeFaceFeatures(points, mainFace.detection.box);

        return features;
    } catch (error) {
        console.error('얼굴 특징 분석 중 오류 발생:', error);
        return null;
    }
}

/**
 * 얼굴 특징 분석
 * @param {Array} points - 얼굴 랜드마크 포인트 배열
 * @param {Object} box - 얼굴 경계 상자
 * @returns {Object} 분석된 얼굴 특징
 */
function analyzeFaceFeatures(points, box) {
    // 얼굴 비율 및 특징 계산

    // 1. 얼굴 형태 분석 (얼굴 너비/높이 비율)
    const faceWidth = box.width;
    const faceHeight = box.height;
    const faceRatio = faceWidth / faceHeight;

    // 2. 눈 크기 및 간격 분석
    const leftEye = points.slice(36, 42);
    const rightEye = points.slice(42, 48);

    const leftEyeWidth = distance(leftEye[0], leftEye[3]);
    const rightEyeWidth = distance(rightEye[0], rightEye[3]);
    const eyeDistance = distance(
        { x: (leftEye[0].x + leftEye[3].x) / 2, y: (leftEye[0].y + leftEye[3].y) / 2 },
        { x: (rightEye[0].x + rightEye[3].x) / 2, y: (rightEye[0].y + rightEye[3].y) / 2 }
    );

    const eyeRatio = (leftEyeWidth + rightEyeWidth) / (2 * eyeDistance);

    // 3. 입 크기 분석
    const mouth = points.slice(48, 60);
    const mouthWidth = distance(mouth[0], mouth[6]);
    const mouthHeight = distance(
        { x: (mouth[3].x + mouth[9].x) / 2, y: (mouth[3].y + mouth[9].y) / 2 },
        { x: (mouth[0].x + mouth[6].x) / 2, y: (mouth[0].y + mouth[6].y) / 2 }
    );

    const mouthRatio = mouthWidth / faceWidth;

    // 4. 턱선 각도 분석
    const jawline = points.slice(0, 17);
    const jawAngle = calculateJawAngle(jawline);

    // 5. 눈썹 형태 분석
    const leftEyebrow = points.slice(17, 22);
    const rightEyebrow = points.slice(22, 27);

    const leftEyebrowAngle = calculateEyebrowAngle(leftEyebrow);
    const rightEyebrowAngle = calculateEyebrowAngle(rightEyebrow);
    const eyebrowAngle = (leftEyebrowAngle + rightEyebrowAngle) / 2;

    // 6. 코 크기 분석
    const nose = points.slice(27, 36);
    const noseWidth = distance(nose[4], nose[8]);
    const noseHeight = distance(nose[0], nose[6]);
    const noseRatio = noseWidth / faceWidth;

    // 특징 점수 계산 (0-10 범위로 정규화)

    // 테토-에겐 점수 계산
    // - 각진 턱, 작은 눈, 넓은 눈 간격 = 테토 성향
    // - 부드러운 턱, 큰 눈, 좁은 눈 간격 = 에겐 성향
    let tetoScore = 5; // 기본값

    // 턱 각도 기여도 (각진 턱 = 테토 성향)
    tetoScore += (jawAngle > 0.5) ? (jawAngle - 0.5) * 10 : (jawAngle - 0.5) * 10;

    // 눈 크기 기여도 (작은 눈 = 테토 성향)
    tetoScore += (0.15 - eyeRatio) * 30;

    // 눈썹 각도 기여도 (각진 눈썹 = 테토 성향)
    tetoScore += eyebrowAngle * 5;

    // 남성성-여성성 점수 계산
    // - 넓은 얼굴, 큰 코, 작은 입 = 남성적 특징
    // - 좁은 얼굴, 작은 코, 큰 입 = 여성적 특징
    let masculinityScore = 5; // 기본값

    // 얼굴 비율 기여도 (넓은 얼굴 = 남성적 특징)
    masculinityScore += (faceRatio - 0.75) * 20;

    // 코 크기 기여도 (큰 코 = 남성적 특징)
    masculinityScore += (noseRatio - 0.25) * 30;

    // 입 크기 기여도 (작은 입 = 남성적 특징)
    masculinityScore += (0.5 - mouthRatio) * 15;

    // 점수 범위 제한 (0-10)
    tetoScore = Math.max(0, Math.min(10, tetoScore));
    const egenScore = 10 - tetoScore;

    masculinityScore = Math.max(0, Math.min(10, masculinityScore));
    const femininityScore = 10 - masculinityScore;

    // 신뢰도 계산 (특징 추출의 명확성 기반)
    const confidence = calculateConfidence(points, box);

    return {
        tetoScore,
        egenScore,
        masculinityScore,
        femininityScore,
        confidence,
        features: {
            faceRatio,
            eyeRatio,
            mouthRatio,
            noseRatio,
            jawAngle,
            eyebrowAngle
        }
    };
}

/**
 * 두 점 사이의 거리 계산
 * @param {Object} p1 - 첫 번째 점 {x, y}
 * @param {Object} p2 - 두 번째 점 {x, y}
 * @returns {number} 두 점 사이의 거리
 */
function distance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

/**
 * 턱선 각도 계산
 * @param {Array} jawline - 턱선 포인트 배열
 * @returns {number} 턱선 각도 (0-1, 값이 클수록 각진 턱)
 */
function calculateJawAngle(jawline) {
    // 턱선의 각도 변화 계산
    let angleSum = 0;

    for (let i = 1; i < jawline.length - 1; i++) {
        const prev = jawline[i - 1];
        const curr = jawline[i];
        const next = jawline[i + 1];

        // 세 점으로 이루어진 각도 계산
        const angle = calculateAngle(prev, curr, next);
        angleSum += angle;
    }

    // 평균 각도 계산 및 정규화 (0-1)
    const avgAngle = angleSum / (jawline.length - 2);

    // 각도가 작을수록 각진 턱 (0에 가까울수록 각진 턱)
    // 정규화: 0도(완전히 각진 턱)=1, 180도(완전히 부드러운 턱)=0
    return 1 - (avgAngle / Math.PI);
}

/**
 * 세 점으로 이루어진 각도 계산
 * @param {Object} p1 - 첫 번째 점 {x, y}
 * @param {Object} p2 - 두 번째 점 (각도의 꼭지점) {x, y}
 * @param {Object} p3 - 세 번째 점 {x, y}
 * @returns {number} 각도 (라디안)
 */
function calculateAngle(p1, p2, p3) {
    const a = distance(p2, p3);
    const b = distance(p1, p2);
    const c = distance(p1, p3);

    // 코사인 법칙을 사용한 각도 계산
    const cosAngle = (Math.pow(a, 2) + Math.pow(b, 2) - Math.pow(c, 2)) / (2 * a * b);

    // 부동소수점 오류 방지
    const clampedCosAngle = Math.max(-1, Math.min(1, cosAngle));

    return Math.acos(clampedCosAngle);
}

/**
 * 눈썹 각도 계산
 * @param {Array} eyebrow - 눈썹 포인트 배열
 * @returns {number} 눈썹 각도 (0-1, 값이 클수록 각진 눈썹)
 */
function calculateEyebrowAngle(eyebrow) {
    // 눈썹의 시작점, 중간점, 끝점
    const start = eyebrow[0];
    const middle = eyebrow[Math.floor(eyebrow.length / 2)];
    const end = eyebrow[eyebrow.length - 1];

    // 세 점으로 이루어진 각도 계산
    const angle = calculateAngle(start, middle, end);

    // 각도 정규화 (0-1)
    // 각도가 작을수록 각진 눈썹 (0에 가까울수록 각진 눈썹)
    return 1 - (angle / Math.PI);
}

/**
 * 신뢰도 계산
 * @param {Array} points - 얼굴 랜드마크 포인트 배열
 * @param {Object} box - 얼굴 경계 상자
 * @returns {number} 신뢰도 (0-1)
 */
function calculateConfidence(points, box) {
    // 얼굴 크기 기반 신뢰도 (작은 얼굴 = 낮은 신뢰도)
    const faceSize = box.width * box.height;
    const sizeFactor = Math.min(1, faceSize / 10000); // 10000 픽셀 이상이면 최대 신뢰도

    // 얼굴 포인트 분포 기반 신뢰도 (포인트가 고르게 분포되어 있을수록 높은 신뢰도)
    let distSum = 0;
    let distCount = 0;

    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            distSum += distance(points[i], points[j]);
            distCount++;
        }
    }

    const avgDist = distSum / distCount;
    const distFactor = Math.min(1, avgDist / 50); // 평균 거리가 50 이상이면 최대 신뢰도

    // 종합 신뢰도 계산
    const confidence = (sizeFactor * 0.7 + distFactor * 0.3);

    return confidence;
}

/**
 * 이미지에서 얼굴 추출
 * @param {HTMLCanvasElement|HTMLImageElement} imageElement - 이미지 또는 캔버스 요소
 * @returns {Promise<HTMLCanvasElement>} 추출된 얼굴 이미지가 그려진 캔버스
 */
async function extractFace(imageElement) {
    try {
        // 얼굴 감지 모델이 로드되지 않았으면 로드 시도
        if (!isModelLoaded) {
            try {
                await loadFaceDetectionModel();
            } catch (error) {
                console.warn('얼굴 감지 모델 로드 실패:', error);
                return null; // 모델 로드 실패 시 null 반환
            }
        }

        // face-api.js가 로드되지 않았으면 null 반환
        if (typeof faceapi === 'undefined') {
            console.warn('face-api.js가 로드되지 않았습니다.');
            return null;
        }

        // 얼굴 감지 옵션 설정
        const options = new faceapi.TinyFaceDetectorOptions({
            inputSize: 416,
            scoreThreshold: 0.5
        });

        // 얼굴 감지 실행
        const detections = await faceapi.detectAllFaces(imageElement, options);

        // 감지된 얼굴이 없으면 null 반환
        if (detections.length === 0) {
            console.warn('이미지에서 얼굴을 감지할 수 없습니다.');
            return null;
        }

        // 가장 큰 얼굴 선택 (여러 얼굴이 감지된 경우)
        let mainFace = detections[0];
        let maxArea = 0;

        detections.forEach(detection => {
            const box = detection.box;
            const area = box.width * box.height;
            if (area > maxArea) {
                maxArea = area;
                mainFace = detection;
            }
        });

        // 얼굴 추출을 위한 캔버스 생성
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 얼굴 영역에 여백 추가 (얼굴 크기의 20%)
        const padding = {
            x: mainFace.box.width * 0.2,
            y: mainFace.box.height * 0.2
        };

        // 추출할 영역 계산
        const extractRegion = {
            x: Math.max(0, mainFace.box.x - padding.x),
            y: Math.max(0, mainFace.box.y - padding.y),
            width: Math.min(imageElement.width - mainFace.box.x, mainFace.box.width + padding.x * 2),
            height: Math.min(imageElement.height - mainFace.box.y, mainFace.box.height + padding.y * 2)
        };

        // 캔버스 크기 설정
        canvas.width = extractRegion.width;
        canvas.height = extractRegion.height;

        // 얼굴 영역 추출
        ctx.drawImage(
            imageElement,
            extractRegion.x, extractRegion.y, extractRegion.width, extractRegion.height,
            0, 0, canvas.width, canvas.height
        );

        return canvas;
    } catch (error) {
        console.error('얼굴 추출 중 오류 발생:', error);
        return null;
    }
}

/**
 * 이미지 검증 및 전처리
 * @param {string} imageData - Base64 인코딩된 이미지 데이터
 * @returns {Promise<Object>} 처리된 이미지 데이터 및 검증 결과
 */
async function validateAndPreprocessImage(imageData) {
    return new Promise((resolve, reject) => {
        // 이미지 객체 생성
        const img = new Image();
        img.onload = async function () {
            try {
                // 이미지 크기 검증
                if (img.width < 100 || img.height < 100) {
                    reject(new Error('이미지 크기가 너무 작습니다. 최소 100x100 픽셀 이상의 이미지를 사용해 주세요.'));
                    return;
                }

                // 이미지 크기 조정 (최대 500x500)
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                let width = img.width;
                let height = img.height;

                // 이미지 크기 조정
                if (width > 500 || height > 500) {
                    if (width > height) {
                        height = Math.round(height * (500 / width));
                        width = 500;
                    } else {
                        width = Math.round(width * (500 / height));
                        height = 500;
                    }
                }

                // 캔버스 크기 설정
                canvas.width = width;
                canvas.height = height;

                // 이미지 그리기
                ctx.drawImage(img, 0, 0, width, height);

                // 이미지 품질 검사
                const qualityInfo = checkImageQuality(canvas);

                // 이미지 품질이 낮은 경우 경고
                if (!qualityInfo.quality) {
                    if (qualityInfo.brightness < 0.2) {
                        reject(new Error('이미지가 너무 어둡습니다. 밝은 조명에서 촬영한 사진을 사용해 주세요.'));
                        return;
                    }
                    if (qualityInfo.brightness > 0.8) {
                        reject(new Error('이미지가 너무 밝습니다. 적절한 조명에서 촬영한 사진을 사용해 주세요.'));
                        return;
                    }
                    if (qualityInfo.contrast < 0.1) {
                        reject(new Error('이미지의 대비가 낮습니다. 선명한 사진을 사용해 주세요.'));
                        return;
                    }
                    if (qualityInfo.sharpness < 0.05) {
                        reject(new Error('이미지가 흐릿합니다. 선명한 사진을 사용해 주세요.'));
                        return;
                    }
                }

                // 얼굴 감지
                const faceDetected = await detectFace(canvas);

                if (!faceDetected) {
                    reject(new Error('이미지에서 얼굴을 감지할 수 없습니다. 정면 얼굴이 포함된 사진을 사용해 주세요.'));
                    return;
                }

                // 얼굴 추출
                const faceCanvas = await extractFace(canvas);

                // 얼굴 추출에 실패한 경우 원본 이미지 사용
                const processedCanvas = faceCanvas || canvas;

                // 처리된 이미지 데이터 반환
                resolve({
                    imageData: processedCanvas.toDataURL('image/jpeg', 0.9),
                    width: processedCanvas.width,
                    height: processedCanvas.height,
                    quality: qualityInfo,
                    faceDetected: true,
                    faceExtracted: faceCanvas !== null
                });
            } catch (error) {
                reject(error);
            }
        };

        img.onerror = function () {
            reject(new Error('이미지 로드에 실패했습니다.'));
        };

        img.src = imageData;
    });
}

// 모듈 내보내기
window.faceDetection = {
    detectFace,
    checkImageQuality,
    loadFaceDetectionModel,
    analyzeFacialFeatures,
    extractFace,
    validateAndPreprocessImage
};