# 테토-에겐 성격 유형 테스트

설문조사와 얼굴 사진을 통해 당신이 테토남, 테토녀, 에겐남, 에겐녀 중 어떤 유형인지 알아보는 웹 애플리케이션입니다.

## 기능

- 성격 유형 설문조사
- 얼굴 사진 분석 (선택 사항)
- 테토-에겐 성격 유형 결과 제공
- 소셜 미디어 공유 기능
- 모바일 최적화
- 다국어 지원 (한국어, 영어, 중국어, 스페인어, 힌디어 등)
- 대화형 성격 유형 카드 및 정보 모달
- 향상된 랜딩 페이지 애니메이션 및 시각 효과

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
│   │   ├── landing-enhancements.css
│   │   └── performance-optimized.css
│   ├── js/
│   │   ├── app.js
│   │   ├── app-modified.js
│   │   ├── questions.js
│   │   ├── score-calculator.js
│   │   ├── camera-access.js
│   │   ├── ai-model.js
│   │   ├── share-functions.js
│   │   ├── landing-interactions.js
│   │   ├── language-utils.js
│   │   ├── language-loader.js
│   │   ├── language-translator.js
│   │   ├── language-storage.js
│   │   ├── language-dropdown.js
│   │   ├── performance-optimizer.js
│   │   ├── resource-optimizer.js
│   │   ├── code-splitter.js
│   │   ├── error-handler.js
│   │   ├── test-framework.js
│   │   └── tests/
│   │       ├── questions.test.js
│   │       ├── score-calculator.test.js
│   │       ├── ai-model.test.js
│   │       ├── language-utils.test.js
│   │       ├── language-storage.test.js
│   │       ├── language-translator.test.js
│   │       ├── language-integration.test.js
│   │       ├── language-dropdown-integration.test.js
│   │       ├── cache-mechanisms.test.js
│   │       └── integration.test.js
│   ├── languages/
│   │   ├── en.json
│   │   ├── ko.json
│   │   ├── zh.json
│   │   ├── es.json
│   │   ├── hi.json
│   │   ├── template.json
│   │   ├── config.js
│   │   ├── README.md
│   │   ├── TRANSLATION_GUIDE.md
│   │   └── translation-keys.md
│   └── images/
│       ├── favicon.png
│       ├── main-image.jpg
│       ├── food-chain.jpg
│       ├── og-image.jpg
│       ├── flags/
│       │   ├── gb.svg
│       │   ├── kr.svg
│       │   ├── cn.svg
│       │   └── ... (other flag images)
│       ├── 테토남.png
│       ├── 테토녀.png
│       ├── 에겐남.png
│       └── 에겐녀.png
├── .kiro/
│   └── specs/
│       ├── animal-face-test/
│       │   ├── requirements.md
│       │   └── tasks.md
│       └── language-dropdown/
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
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

## 파일 관계 및 기능

### 핵심 애플리케이션 파일
- `index.html`: 메인 애플리케이션 페이지
- `assets/js/app.js`: 주요 애플리케이션 로직
- `assets/js/questions.js`: 설문 질문 데이터 및 관련 함수
- `assets/js/score-calculator.js`: 점수 계산 및 성격 유형 결정 로직
- `assets/js/ai-model.js`: 얼굴 분석을 위한 AI 모델 인터페이스

### 랜딩 페이지 개선
- `assets/js/landing-interactions.js`: 랜딩 페이지 상호작용 기능 (성격 유형 카드 클릭, 애니메이션 등)
- `assets/css/landing-enhancements.css`: 랜딩 페이지 시각적 개선을 위한 스타일

### 다국어 지원 시스템
- `assets/languages/config.js`: 지원 언어 설정
- `assets/languages/*.json`: 각 언어별 번역 파일
- `assets/js/language-utils.js`: 언어 감지 및 관리 유틸리티
- `assets/js/language-loader.js`: 언어 파일 로딩 및 캐싱
- `assets/js/language-translator.js`: UI 요소 번역 적용
- `assets/js/language-storage.js`: 언어 선호도 저장 및 관리
- `assets/js/language-dropdown.js`: 언어 선택 드롭다운 UI

### 성능 최적화
- `assets/js/performance-optimizer.js`: 전반적인 성능 최적화
- `assets/js/resource-optimizer.js`: 이미지 및 리소스 최적화
- `assets/js/code-splitter.js`: 코드 분할 및 지연 로딩
- `assets/js/error-handler.js`: 오류 처리 및 사용자 피드백

### 테스트 프레임워크
- `assets/js/test-framework.js`: 테스트 실행 및 결과 표시 프레임워크
- `assets/js/tests/*.test.js`: 각 모듈에 대한 단위 및 통합 테스트

## 오류 처리

- 네트워크 오류 처리
- 리소스 로딩 오류 처리
- 사용자 입력 검증
- 브라우저 호환성 확인

## 라이선스

MIT License