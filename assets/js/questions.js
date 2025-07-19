/**
 * 테토-에겐 성격 유형 테스트 질문 데이터
 * 
 * 각 질문은 다음 속성을 가집니다:
 * - id: 질문 고유 ID
 * - text: 질문 내용
 * - options: 선택지 배열
 * - weight: 질문 가중치 (기본값: 1)
 * - category: 질문 카테고리 (성격, 행동, 취향, 관계, 가치관)
 * - imageUrl: 질문 관련 이미지 URL (선택 사항)
 * 
 * 각 선택지는 다음 속성을 가집니다:
 * - text: 선택지 텍스트
 * - tetoScore: 테토 점수 (높을수록 테토 성향)
 * - egenScore: 에겐 점수 (높을수록 에겐 성향)
 * - masculinityScore: 남성성 점수 (높을수록 남성적 성향)
 * - femininityScore: 여성성 점수 (높을수록 여성적 성향)
 * - confidenceWeight: 신뢰도 가중치 (기본값: 1, 높을수록 결과에 더 큰 영향)
 */

// 질문 카테고리 정의
const QUESTION_CATEGORIES = {
    PERSONALITY: '성격',
    BEHAVIOR: '행동',
    PREFERENCE: '취향',
    RELATIONSHIP: '관계',
    VALUES: '가치관'
};

// 성격 유형 정의
const PERSONALITY_TYPES = {
    TETO_MALE: '테토남',
    TETO_FEMALE: '테토녀',
    EGEN_MALE: '에겐남',
    EGEN_FEMALE: '에겐녀'
};

const questions = [
    {
        id: 1,
        text: "새로운 사람들을 만날 때 당신은 어떤 편인가요?",
        category: QUESTION_CATEGORIES.BEHAVIOR,
        options: [
            {
                text: "적극적으로 먼저 다가가 대화를 시작한다",
                tetoScore: 8,
                egenScore: 4,
                masculinityScore: 7,
                femininityScore: 3,
                confidenceWeight: 1.2
            },
            {
                text: "상대방이 먼저 다가오길 기다리는 편이다",
                tetoScore: 3,
                egenScore: 7,
                masculinityScore: 3,
                femininityScore: 7,
                confidenceWeight: 1.2
            },
            {
                text: "분위기를 살피며 자연스럽게 어울린다",
                tetoScore: 5,
                egenScore: 5,
                masculinityScore: 5,
                femininityScore: 5,
                confidenceWeight: 1.0
            },
            {
                text: "새로운 만남이 불편해서 피하는 편이다",
                tetoScore: 2,
                egenScore: 8,
                masculinityScore: 4,
                femininityScore: 6,
                confidenceWeight: 1.2
            }
        ],
        weight: 1.2
    },
    {
        id: 2,
        text: "의견 충돌이 있을 때 당신의 대처 방식은?",
        category: QUESTION_CATEGORIES.BEHAVIOR,
        options: [
            {
                text: "내 의견이 맞다고 생각하면 끝까지 주장한다",
                tetoScore: 9,
                egenScore: 2,
                masculinityScore: 8,
                femininityScore: 2,
                confidenceWeight: 1.3
            },
            {
                text: "상대방의 의견도 존중하며 타협점을 찾는다",
                tetoScore: 5,
                egenScore: 5,
                masculinityScore: 5,
                femininityScore: 5,
                confidenceWeight: 1.0
            },
            {
                text: "갈등을 피하기 위해 내 의견을 쉽게 양보한다",
                tetoScore: 2,
                egenScore: 8,
                masculinityScore: 2,
                femininityScore: 8,
                confidenceWeight: 1.3
            },
            {
                text: "논쟁보다는 분위기를 부드럽게 만드는 데 집중한다",
                tetoScore: 3,
                egenScore: 7,
                masculinityScore: 3,
                femininityScore: 7,
                confidenceWeight: 1.2
            }
        ],
        weight: 1.5
    },
    {
        id: 3,
        text: "당신이 선호하는 패션 스타일은?",
        category: QUESTION_CATEGORIES.PREFERENCE,
        options: [
            {
                text: "심플하고 클래식한 스타일 (기본 티셔츠, 청바지 등)",
                tetoScore: 7,
                egenScore: 3,
                masculinityScore: 6,
                femininityScore: 4,
                confidenceWeight: 1.1
            },
            {
                text: "트렌디하고 세련된 스타일",
                tetoScore: 3,
                egenScore: 7,
                masculinityScore: 4,
                femininityScore: 6,
                confidenceWeight: 1.2
            },
            {
                text: "편안함을 중시하는 캐주얼 스타일",
                tetoScore: 6,
                egenScore: 4,
                masculinityScore: 5,
                femininityScore: 5,
                confidenceWeight: 1.0
            },
            {
                text: "독특하고 개성 있는 스타일",
                tetoScore: 4,
                egenScore: 6,
                masculinityScore: 4,
                femininityScore: 6,
                confidenceWeight: 1.1
            }
        ],
        weight: 1
    },
    {
        id: 4,
        text: "당신은 어떤 유형의 영화나 드라마를 선호하나요?",
        category: QUESTION_CATEGORIES.PREFERENCE,
        options: [
            {
                text: "액션, 스릴러, 스포츠 등 긴장감 있는 장르",
                tetoScore: 8,
                egenScore: 2,
                masculinityScore: 8,
                femininityScore: 2,
                confidenceWeight: 1.2
            },
            {
                text: "로맨스, 멜로, 감성적인 장르",
                tetoScore: 2,
                egenScore: 8,
                masculinityScore: 2,
                femininityScore: 8,
                confidenceWeight: 1.2
            },
            {
                text: "판타지, SF 등 상상력을 자극하는 장르",
                tetoScore: 5,
                egenScore: 5,
                masculinityScore: 6,
                femininityScore: 4,
                confidenceWeight: 1.0
            },
            {
                text: "다큐멘터리, 역사물 등 교육적인 콘텐츠",
                tetoScore: 6,
                egenScore: 4,
                masculinityScore: 5,
                femininityScore: 5,
                confidenceWeight: 1.1
            }
        ],
        weight: 1
    },
    {
        id: 5,
        text: "낯선 환경에서 잠을 자야 할 때 당신은?",
        category: QUESTION_CATEGORIES.BEHAVIOR,
        options: [
            {
                text: "어디서든 쉽게 잘 수 있다",
                tetoScore: 9,
                egenScore: 1,
                masculinityScore: 7,
                femininityScore: 3,
                confidenceWeight: 1.3
            },
            {
                text: "익숙해지는 데 시간이 조금 필요하다",
                tetoScore: 5,
                egenScore: 5,
                masculinityScore: 5,
                femininityScore: 5,
                confidenceWeight: 1.0
            },
            {
                text: "편안한 환경이 아니면 잠들기 어렵다",
                tetoScore: 2,
                egenScore: 8,
                masculinityScore: 3,
                femininityScore: 7,
                confidenceWeight: 1.2
            },
            {
                text: "내 침대가 아니면 거의 잠을 못 잔다",
                tetoScore: 1,
                egenScore: 9,
                masculinityScore: 2,
                femininityScore: 8,
                confidenceWeight: 1.3
            }
        ],
        weight: 1.2
    },
    {
        id: 6,
        text: "의사 결정을 할 때 당신은 주로?",
        category: QUESTION_CATEGORIES.PERSONALITY,
        options: [
            {
                text: "논리와 사실에 기반해 결정한다",
                tetoScore: 8,
                egenScore: 2,
                masculinityScore: 7,
                femininityScore: 3,
                confidenceWeight: 1.3
            },
            {
                text: "감정과 직관에 따라 결정한다",
                tetoScore: 2,
                egenScore: 8,
                masculinityScore: 3,
                femininityScore: 7,
                confidenceWeight: 1.3
            },
            {
                text: "다른 사람들의 의견을 참고해 결정한다",
                tetoScore: 4,
                egenScore: 6,
                masculinityScore: 4,
                femininityScore: 6,
                confidenceWeight: 1.1
            },
            {
                text: "장단점을 꼼꼼히 분석한 후 결정한다",
                tetoScore: 6,
                egenScore: 4,
                masculinityScore: 6,
                femininityScore: 4,
                confidenceWeight: 1.2
            }
        ],
        weight: 1.3
    },
    {
        id: 7,
        text: "친구들과의 관계에서 당신은?",
        category: QUESTION_CATEGORIES.RELATIONSHIP,
        options: [
            {
                text: "넓고 다양한 친구 관계를 유지한다",
                tetoScore: 8,
                egenScore: 2,
                masculinityScore: 6,
                femininityScore: 4,
                confidenceWeight: 1.2
            },
            {
                text: "소수의 깊은 친구 관계를 선호한다",
                tetoScore: 3,
                egenScore: 7,
                masculinityScore: 4,
                femininityScore: 6,
                confidenceWeight: 1.2
            },
            {
                text: "친구 모임에서 주로 리더 역할을 한다",
                tetoScore: 9,
                egenScore: 1,
                masculinityScore: 8,
                femininityScore: 2,
                confidenceWeight: 1.3
            },
            {
                text: "혼자 있는 시간도 중요하게 생각한다",
                tetoScore: 4,
                egenScore: 6,
                masculinityScore: 5,
                femininityScore: 5,
                confidenceWeight: 1.0
            }
        ],
        weight: 1.2
    },
    {
        id: 8,
        text: "당신의 취미나 관심사는 주로?",
        category: QUESTION_CATEGORIES.PREFERENCE,
        options: [
            {
                text: "스포츠, 아웃도어 활동, 모험적인 활동",
                tetoScore: 9,
                egenScore: 1,
                masculinityScore: 8,
                femininityScore: 2,
                confidenceWeight: 1.3
            },
            {
                text: "예술, 문화, 창작 활동",
                tetoScore: 3,
                egenScore: 7,
                masculinityScore: 3,
                femininityScore: 7,
                confidenceWeight: 1.2
            },
            {
                text: "기술, 과학, 분석적인 활동",
                tetoScore: 7,
                egenScore: 3,
                masculinityScore: 7,
                femininityScore: 3,
                confidenceWeight: 1.2
            },
            {
                text: "사회 활동, 봉사, 사람들과 어울리는 활동",
                tetoScore: 5,
                egenScore: 5,
                masculinityScore: 4,
                femininityScore: 6,
                confidenceWeight: 1.0
            }
        ],
        weight: 1
    },
    {
        id: 9,
        text: "도전과 모험에 대한 당신의 태도는?",
        category: QUESTION_CATEGORIES.PERSONALITY,
        options: [
            {
                text: "새로운 도전을 적극적으로 찾아 나선다",
                tetoScore: 9,
                egenScore: 1,
                masculinityScore: 7,
                femininityScore: 3,
                confidenceWeight: 1.3
            },
            {
                text: "안정적인 상황을 더 선호한다",
                tetoScore: 2,
                egenScore: 8,
                masculinityScore: 3,
                femininityScore: 7,
                confidenceWeight: 1.3
            },
            {
                text: "적절한 위험은 감수하지만 신중하게 접근한다",
                tetoScore: 6,
                egenScore: 4,
                masculinityScore: 6,
                femininityScore: 4,
                confidenceWeight: 1.1
            },
            {
                text: "다른 사람들이 먼저 시도한 후에 참여한다",
                tetoScore: 3,
                egenScore: 7,
                masculinityScore: 4,
                femininityScore: 6,
                confidenceWeight: 1.2
            }
        ],
        weight: 1.4
    },
    {
        id: 10,
        text: "외모나 패션에 신경 쓰는 정도는?",
        category: QUESTION_CATEGORIES.PREFERENCE,
        options: [
            {
                text: "실용성과 편안함을 중시하고 꾸미는 데 큰 관심이 없다",
                tetoScore: 8,
                egenScore: 2,
                masculinityScore: 7,
                femininityScore: 3,
                confidenceWeight: 1.2
            },
            {
                text: "트렌드를 따르고 외모에 많은 신경을 쓴다",
                tetoScore: 2,
                egenScore: 8,
                masculinityScore: 3,
                femininityScore: 7,
                confidenceWeight: 1.3
            },
            {
                text: "TPO에 맞게 적절히 신경 쓴다",
                tetoScore: 5,
                egenScore: 5,
                masculinityScore: 5,
                femininityScore: 5,
                confidenceWeight: 1.0
            },
            {
                text: "나만의 스타일을 중요시하며 개성을 표현한다",
                tetoScore: 6,
                egenScore: 4,
                masculinityScore: 6,
                femininityScore: 4,
                confidenceWeight: 1.1
            }
        ],
        weight: 1.1
    }
];

// 성격 유형별 특징 데이터
const personalityCharacteristics = {
    "테토남": [
        "공격성과 사냥 본능이 강함",
        "자기주장이 강하며 리더십이 있음",
        "감정보다 논리를 우선시함",
        "친구가 많거나 무리 생활에 익숙함",
        "외부 세계에 관심이 많음",
        "분석하고 판단하는 것을 좋아하며, 현실 지향적임",
        "추상적 이념보다는 실질적 성과를 선호함",
        "단순하고, 한 번 결정한 것은 밀어붙이는 스타일",
        "도전과 모험을 좋아함",
        "패션, 향수 등에 큰 관심이 없는 경우가 많음"
    ],
    "테토녀": [
        "활발하고 에너지가 넘치는 성격",
        "사교성이 좋고 친구 관계가 넓음",
        "직설적이고 솔직한 표현을 선호함",
        "목표 지향적이고 성취 욕구가 강함",
        "경쟁을 즐기고 도전적인 상황을 선호함",
        "감정 표현이 풍부하고 열정적임",
        "실용적이고 현실적인 접근 방식을 선호함",
        "독립적이고 자기주도적인 성향이 강함",
        "결단력이 있고 빠른 의사결정을 함",
        "외향적이고 사회적 활동을 즐김"
    ],
    "에겐남": [
        "섬세하고 감성적인 성향이 있음",
        "트렌드에 민감하고 패션, 미용에 관심이 많음",
        "타인의 감정을 잘 이해하고 공감 능력이 뛰어남",
        "조화와 균형을 중시하는 평화주의적 성향",
        "예술적 감각과 창의성이 풍부함",
        "세심한 배려와 친절함을 보임",
        "갈등보다는 타협과 조정을 선호함",
        "감정 표현이 풍부하고 소통 능력이 좋음",
        "심미적 가치를 중요시함",
        "인간관계에서 깊이 있는 교류를 추구함"
    ],
    "에겐녀": [
        "차분하고 내면적인 성향이 강함",
        "섬세하고 감수성이 풍부함",
        "타인의 감정에 민감하게 반응함",
        "조용하고 신중한 태도를 보임",
        "안정적이고 편안한 환경을 선호함",
        "깊이 있는 관계와 소통을 중시함",
        "예술적 감각과 심미안이 뛰어남",
        "자기 성찰과 내적 성장에 관심이 많음",
        "배려심이 깊고 이타적인 성향이 있음",
        "직관적이고 통찰력이 있음"
    ]
};

// 성격 유형별 설명 데이터
const personalityDescriptions = {
    "테토남": "테토남은 생물학적 수치와는 무관하게, 사회적·행동적 특성에서 남성적인 자질이 강하게 드러나는 남성을 의미합니다. 자기주장이 강하고 리더십이 있으며, 논리적이고 분석적인 사고를 선호합니다. 친구 관계가 넓고 외부 세계에 관심이 많으며, 도전과 모험을 즐깁니다. 패션이나 외모에 크게 신경 쓰지 않는 편이며, 실용적이고 단순한 스타일을 선호합니다. 결단력이 있고 한 번 결정한 일은 끝까지 밀어붙이는 추진력이 있습니다.",
    
    "테토녀": "테토녀는 활발하고 에너지가 넘치며, 사교성이 좋고 친구 관계가 넓은 여성을 의미합니다. 직설적이고 솔직한 표현을 선호하며, 목표 지향적이고 성취 욕구가 강합니다. 경쟁을 즐기고 도전적인 상황을 선호하며, 감정 표현이 풍부하고 열정적입니다. 실용적이고 현실적인 접근 방식을 선호하며, 독립적이고 자기주도적인 성향이 강합니다. 결단력이 있고 빠른 의사결정을 하는 특징이 있습니다.",
    
    "에겐남": "에겐남은 섬세하고 감성적인 성향이 있는 남성을 의미합니다. 트렌드에 민감하고 패션, 미용에 관심이 많으며, 타인의 감정을 잘 이해하고 공감 능력이 뛰어납니다. 조화와 균형을 중시하는 평화주의적 성향을 가지고 있으며, 예술적 감각과 창의성이 풍부합니다. 세심한 배려와 친절함을 보이며, 갈등보다는 타협과 조정을 선호합니다. 감정 표현이 풍부하고 소통 능력이 좋으며, 심미적 가치를 중요시합니다.",
    
    "에겐녀": "에겐녀는 차분하고 내면적인 성향이 강한 여성을 의미합니다. 섬세하고 감수성이 풍부하며, 타인의 감정에 민감하게 반응합니다. 조용하고 신중한 태도를 보이며, 안정적이고 편안한 환경을 선호합니다. 깊이 있는 관계와 소통을 중시하며, 예술적 감각과 심미안이 뛰어납니다. 자기 성찰과 내적 성장에 관심이 많으며, 배려심이 깊고 이타적인 성향이 있습니다. 직관적이고 통찰력이 있는 특징을 가지고 있습니다."
};