/**
 * 모바일 카메라 접근 기능 구현
 * 
 * 이 모듈은 모바일 기기에서 카메라에 접근하여 사진을 촬영하고
 * 테토-에겐 성격 유형 테스트에 사용할 수 있도록 하는 기능을 제공합니다.
 */

// 전역 변수
let currentStream = null;
let facingMode = 'user'; // 기본값은 전면 카메라

/**
 * 카메라 직접 촬영 기능 구현
 */
function setupCameraCapture() {
    // 모달 HTML 생성
    const modalHtml = `
        <div class="modal fade" id="cameraModal" tabindex="-1" aria-labelledby="cameraModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="cameraModalLabel">사진 촬영</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="camera-container">
                            <video id="camera-preview" autoplay playsinline style="width: 100%; border-radius: 8px;"></video>
                            <canvas id="camera-canvas" style="display: none;"></canvas>
                            <div id="camera-error" class="alert alert-danger mt-3" style="display: none;">
                                <i class="fas fa-exclamation-circle me-2"></i>
                                <span id="camera-error-message">카메라에 접근할 수 없습니다.</span>
                            </div>
                            <div id="camera-loading" class="text-center py-5">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                                <p class="mt-2">카메라 접근 중...</p>
                            </div>
                        </div>
                        <div class="camera-controls mt-3 text-center">
                            <button id="capture-btn" class="btn btn-primary">
                                <i class="fas fa-camera me-2"></i>촬영하기
                            </button>
                            <button id="retake-btn" class="btn btn-secondary" style="display: none;">
                                <i class="fas fa-redo me-2"></i>다시 촬영
                            </button>
                            <button id="use-photo-btn" class="btn btn-success" style="display: none;">
                                <i class="fas fa-check me-2"></i>이 사진 사용하기
                            </button>
                            <button id="switch-camera-btn" class="btn btn-outline-secondary ms-2">
                                <i class="fas fa-sync me-2"></i>카메라 전환
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 모달이 없으면 body에 추가
    if (!document.getElementById('cameraModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
    
    // 카메라 모달 객체 생성
    const cameraModal = new bootstrap.Modal(document.getElementById('cameraModal'));
    
    // 카메라 버튼에 이벤트 리스너 추가
    $('#camera-btn').off('click').on('click', function() {
        // 모바일 브라우저에서 MediaDevices API 지원 확인
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // 모달 표시
            cameraModal.show();
            
            // 카메라 스트림 시작
            startCameraStream();
        } else {
            // MediaDevices API를 지원하지 않는 경우 기본 파일 선택 다이얼로그 표시
            $('#file-input').attr('capture', 'camera');
            $('#file-input').click();
        }
    });
    
    // 카메라 전환 버튼 이벤트 리스너
    $('#switch-camera-btn').on('click', function() {
        switchCamera();
    });
    
    // 모달이 닫힐 때 스트림 정지
    $('#cameraModal').on('hidden.bs.modal', function() {
        stopCameraStream();
    });
}

/**
 * 카메라 스트림 시작
 */
function startCameraStream() {
    const video = document.getElementById('camera-preview');
    const canvas = document.getElementById('camera-canvas');
    const captureBtn = document.getElementById('capture-btn');
    const retakeBtn = document.getElementById('retake-btn');
    const usePhotoBtn = document.getElementById('use-photo-btn');
    const cameraError = document.getElementById('camera-error');
    const cameraLoading = document.getElementById('camera-loading');
    
    // 초기 상태 설정
    video.style.display = 'none';
    cameraError.style.display = 'none';
    cameraLoading.style.display = 'block';
    captureBtn.style.display = 'none';
    retakeBtn.style.display = 'none';
    usePhotoBtn.style.display = 'none';
    
    // 이전 스트림 정지
    if (currentStream) {
        stopCameraStream();
    }
    
    // 카메라 제약 조건 설정
    const constraints = {
        video: {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
        },
        audio: false
    };
    
    // 카메라 스트림 요청
    navigator.mediaDevices.getUserMedia(constraints)
        .then(function(stream) {
            // 스트림 저장
            currentStream = stream;
            
            // 비디오 요소에 스트림 연결
            video.srcObject = stream;
            
            // 비디오 로드 완료 시 UI 업데이트
            video.onloadedmetadata = function() {
                cameraLoading.style.display = 'none';
                video.style.display = 'block';
                captureBtn.style.display = 'inline-block';
                
                // 캔버스 크기 설정
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            };
            
            // 촬영 버튼 클릭 이벤트
            captureBtn.onclick = function() {
                // 비디오 프레임을 캔버스에 그리기
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                // 캔버스에서 이미지 데이터 추출
                const imageData = canvas.toDataURL('image/jpeg');
                
                // UI 업데이트
                video.style.display = 'none';
                canvas.style.display = 'block';
                captureBtn.style.display = 'none';
                retakeBtn.style.display = 'inline-block';
                usePhotoBtn.style.display = 'inline-block';
                
                // 다시 촬영 버튼 클릭 이벤트
                retakeBtn.onclick = function() {
                    // UI 초기화
                    video.style.display = 'block';
                    canvas.style.display = 'none';
                    captureBtn.style.display = 'inline-block';
                    retakeBtn.style.display = 'none';
                    usePhotoBtn.style.display = 'none';
                };
                
                // 사진 사용 버튼 클릭 이벤트
                usePhotoBtn.onclick = function() {
                    // 모달 닫기
                    const cameraModal = bootstrap.Modal.getInstance(document.getElementById('cameraModal'));
                    cameraModal.hide();
                    
                    // 스트림 정지
                    stopCameraStream();
                    
                    // 이미지 검증 및 전처리
                    validateAndPreprocessImage(imageData)
                        .then(result => {
                            // 이미지 미리보기 표시
                            $('#image-preview').attr('src', result.imageData);
                            $('#preview-container').fadeIn(300);
                            $('#upload-submit').prop('disabled', false);
                            uploadedImage = result.imageData;
                        })
                        .catch(error => {
                            alert(error.message || '이미지 처리 중 오류가 발생했습니다.');
                        });
                };
            };
        })
        .catch(function(error) {
            console.error('카메라 접근 오류:', error);
            
            // 오류 메시지 표시
            cameraLoading.style.display = 'none';
            cameraError.style.display = 'block';
            
            // 오류 유형에 따른 메시지 설정
            let errorMessage = '카메라에 접근할 수 없습니다.';
            
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                errorMessage = '카메라 접근 권한이 거부되었습니다. 설정에서 카메라 권한을 허용해 주세요.';
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                errorMessage = '카메라를 찾을 수 없습니다. 카메라가 연결되어 있는지 확인해 주세요.';
            } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                errorMessage = '카메라가 이미 다른 애플리케이션에서 사용 중입니다.';
            } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
                errorMessage = '요청한 카메라 설정을 지원하지 않습니다.';
            }
            
            document.getElementById('camera-error-message').textContent = errorMessage;
        });
}

/**
 * 카메라 스트림 정지
 */
function stopCameraStream() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
}

/**
 * 카메라 전환 (전면/후면)
 */
function switchCamera() {
    // 현재 모드 전환
    facingMode = facingMode === 'user' ? 'environment' : 'user';
    
    // 카메라 스트림 재시작
    startCameraStream();
}

/**
 * 기기 카메라 지원 여부 확인
 * @returns {boolean} 카메라 지원 여부
 */
function isCameraSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

/**
 * 다중 카메라 지원 여부 확인
 * @returns {Promise<boolean>} 다중 카메라 지원 여부
 */
async function hasMultipleCameras() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return false;
    }
    
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        return videoDevices.length > 1;
    } catch (error) {
        console.error('카메라 장치 확인 오류:', error);
        return false;
    }
}