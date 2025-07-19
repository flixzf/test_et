# 테토-에겐 성격 유형 테스트

설문조사와 얼굴 사진을 통해 당신이 테토남, 테토녀, 에겐남, 에겐녀 중 어떤 유형인지 알아보는 웹 애플리케이션입니다.

## 기능

- 성격 유형 설문조사
- 얼굴 사진 분석 (선택 사항)
- 테토-에겐 성격 유형 결과 제공
- 소셜 미디어 공유 기능
- 모바일 최적화

## 기술 스택

- HTML5, CSS3, JavaScript
- Bootstrap 5
- jQuery
- TensorFlow.js
- Teachable Machine

## 개발 환경 설정

1. 저장소 클론
   ```
   git clone https://github.com/yourusername/teto-egen-test.git
   cd teto-egen-test
   ```

2. 로컬 서버 실행
   ```
   # Python 3
   python -m http.server
   
   # 또는 Node.js
   npx serve
   ```

3. 브라우저에서 접속
   ```
   http://localhost:8000
   ```

## 테스트

테스트 모드에서 애플리케이션의 핵심 기능을 테스트할 수 있습니다.

1. 브라우저에서 테스트 페이지 접속
   ```
   http://localhost:8000/test.html
   ```

2. "테스트 실행" 버튼을 클릭하여 모든 테스트 실행

## 배포

이 프로젝트는 Cloudflare Pages를 통해 자동으로 배포됩니다.

### 배포 설정

1. Cloudflare 계정 설정
   - Cloudflare 계정 생성
   - Cloudflare Pages 프로젝트 생성

2. GitHub 저장소 연결
   - GitHub 저장소를 Cloudflare Pages에 연결
   - 빌드 설정 없음 (정적 사이트)

3. 환경 변수 설정
   - GitHub 저장소의 Secrets에 다음 값 설정:
     - `CLOUDFLARE_API_TOKEN`: Cloudflare API 토큰
     - `CLOUDFLARE_ACCOUNT_ID`: Cloudflare 계정 ID

4. 배포
   - `main` 브랜치에 변경사항을 푸시하면 자동으로 배포됨
   - GitHub Actions 워크플로우가 최적화 및 배포 수행

## 프로젝트 구조

```
/
├── assets/
│   ├── css/
│   │   ├── style.css
│   │   └── performance-optimized.css
│   ├── js/
│   │   ├── app.js
│   │   ├── questions.js
│   │   ├── score-calculator.js
│   │   ├── camera-access.js
│   │   ├── ai-model.js
│   │   ├── share-functions.js
│   │   ├── new-show-result.js
│   │   ├── performance-optimizer.js
│   │   ├── resource-optimizer.js
│   │   ├── code-splitter.js
│   │   ├── error-handler.js
│   │   └── tests/
│   │       ├── questions.test.js
│   │       ├── score-calculator.test.js
│   │       ├── ai-model.test.js
│   │       └── integration.test.js
│   └── images/
│       ├── favicon.png
│       ├── main-image.jpg
│       ├── food-chain.jpg
│       ├── og-image.jpg
│       ├── 테토남.png
│       ├── 테토녀.png
│       ├── 에겐남.png
│       └── 에겐녀.png
├── .github/
│   └── workflows/
│       └── cloudflare-pages-deploy.yml
├── index.html
├── test.html
└── README.md
```

## 성능 최적화

- 코드 분할 및 지연 로딩
- 이미지 최적화
- 리소스 캐싱
- 저사양 기기 지원

## 오류 처리

- 네트워크 오류 처리
- 리소스 로딩 오류 처리
- 사용자 입력 검증
- 브라우저 호환성 확인

## 라이선스

MIT License