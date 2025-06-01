# 🍳 AI 냉장고 파먹기 (Ingredient-Dish-Recommender)

> 냉장고에 있는 재료만으로 맛있는 요리를 추천받아보세요!

AI 기반 재료-요리 추천 서비스로, 사용자가 보유한 식재료를 입력하면 해당 재료로 만들 수 있는 최적의 레시피를 추천해드립니다. **BERT 기반 임베딩**과 **정확한 재료 매칭** 하이브리드 시스템으로 더욱 정밀한 추천을 제공합니다.

![Next.js](https://img.shields.io/badge/Next.js-15.3.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.5-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-2.49.4-3ecf8e)
![AI](https://img.shields.io/badge/BERT-Embedding-ff6b6b)

## ✨ 주요 기능

### 🎨 현대적 UI/UX 디자인
- **유리형 효과(Glass Effect)**: 세련된 반투명 카드 디자인
- **그라데이션 디자인**: 따뜻하고 현대적인 컬러 팔레트
- **반응형 레이아웃**: 모든 디바이스에서 최적화된 경험
- **부드러운 애니메이션**: 인터랙션에 따른 자연스러운 전환 효과

### 🔍 스마트 재료 입력 시스템
- **실시간 자동완성**: 데이터베이스 기반 재료 검색
- **태그 기반 관리**: 직관적인 재료 추가/제거
- **중복 방지**: 동일 재료 중복 입력 자동 차단
- **재료 검증**: DB에 등록된 재료만 입력 허용

### 🤖 하이브리드 AI 추천 시스템

#### 1차: BERT 임베딩 기반 추천
- **의미적 유사도**: BERT 모델을 통한 재료 간 의미 분석
- **벡터 유사도 계산**: 코사인 유사도로 레시피 매칭
- **동적 임계값 조정**: 결과 품질에 따른 임계값 자동 조정 (0.6 → 0.3)

#### 2차: 정확한 재료 매칭 (Fallback)
- **3단계 매칭 프로세스**:
  1. 실제 재료 테이블에서 일치하는 재료 검색
  2. 해당 재료를 포함하는 레시피 조회
  3. 가중치 기반 점수 계산

- **고도화된 점수 계산 시스템**:
  ```
  가중치 점수 = (매칭 개수 × 2.0) + (사용자 재료 활용도 × 1.5) + (레시피 완성도 × 1.0)
  ```

#### 하이브리드 알고리즘 흐름
```
재료 입력 → BERT 임베딩 추천 시도 → 결과 충분? 
   ↓                                    ↓ (Yes)
   결과 부족 시                          추천 완료
   ↓                                    
   정확한 재료 매칭으로 전환 → 추천 완료
```

### 📊 투명한 추천 결과
- **매칭 재료 수**: "일치하는 재료 N개" 표시
- **사용된 재료 목록**: 실제 매칭된 재료명 표시
- **점수 표시**: 백분율로 환산된 추천 점수
- **정렬 우선순위**: 매칭 재료 수 → 가중치 점수 순

### 📱 최적화된 사용자 경험
- **로딩 애니메이션**: 아름다운 요리 관련 애니메이션
- **에러 핸들링**: 친근한 404 페이지 및 오류 메시지
- **성능 최적화**: 병렬 처리 및 쿼리 최적화
- **접근성**: 시맨틱 HTML 및 키보드 네비게이션 지원

### 📖 상세 레시피 정보
- **재료 파싱**: raw 데이터에서 실제 재료명 추출
- **단계별 조리법**: 구조화된 조리 과정
- **영양 정보**: 칼로리 및 영양소 정보 (데이터 제공 시)
- **요리 팁**: 전문가 조리 팁 및 주의사항

## 🛠 기술 스택

### Frontend
- **Next.js 15.3.1** - React 기반 풀스택 프레임워크
- **TypeScript** - 완전한 타입 안정성 구현
- **Tailwind CSS 4.1.5** - 유틸리티 우선 CSS 프레임워크
- **React Icons** - 일관된 아이콘 시스템

### Backend & Database
- **Supabase** - PostgreSQL 기반 백엔드 서비스
- **RPC Functions** - 벡터 유사도 계산을 위한 데이터베이스 함수
- **Server Actions** - Next.js 15 서버 액션을 통한 안전한 API 처리

### AI & Data Processing
- **BERT Embeddings** - 한국어 재료명 의미 벡터화
- **Vector Similarity Search** - pgvector를 통한 고속 벡터 검색
- **Hybrid Recommendation** - 임베딩 + 규칙 기반 이중 추천 시스템

### Development Tools
- **pnpm** - 빠른 패키지 매니저
- **ESLint** - 엄격한 코드 품질 관리
- **Turbopack** - 차세대 번들러로 빠른 개발 환경
- **TypeScript Strict Mode** - 최대 타입 안정성

## 🚀 설치 및 실행

### 사전 요구사항
- Node.js 18.0 이상
- pnpm 9.0 이상
- Supabase 프로젝트 (pgvector 확장 활성화 필요)

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/ingredient-dish-recommender.git
cd ingredient-dish-recommender
```

### 2. 의존성 설치
```bash
pnpm install
```

### 3. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 데이터베이스 설정
Supabase에서 다음 확장을 활성화하세요:
```sql
-- 벡터 유사도 검색을 위한 확장
CREATE EXTENSION IF NOT EXISTS vector;

-- 벡터 유사도 검색 함수 (match_recipes)
-- 프로젝트 설정에서 RPC 함수를 생성하세요
```

### 5. 개발 서버 실행
```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

### 6. 빌드 및 배포
```bash
# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start
```

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── page.tsx           # 메인 페이지 (재료 입력)
│   ├── results/           # 추천 결과 페이지
│   │   ├── page.tsx       # 결과 목록
│   │   └── loading.tsx    # 로딩 컴포넌트
│   ├── recipe/[id]/       # 레시피 상세 페이지
│   │   ├── page.tsx       # 상세 내용
│   │   └── loading.tsx    # 로딩 컴포넌트
│   ├── globals.css        # 전역 스타일 (유리형 효과, 그라데이션)
│   ├── layout.tsx         # 공통 레이아웃
│   └── not-found.tsx      # 404 페이지
├── components/            # 재사용 가능한 컴포넌트
│   ├── IngredientInput.tsx # 고급 재료 입력 컴포넌트
│   ├── RecipeCard.tsx     # 모던 레시피 카드
│   ├── Header.tsx         # 그라데이션 헤더
│   └── Footer.tsx         # 현대적 푸터
├── lib/                   # 핵심 비즈니스 로직
│   ├── recipe-utils.ts    # 하이브리드 추천 시스템
│   ├── ingredient-utils.ts # 재료 검색 로직
│   ├── supabase.ts        # 데이터베이스 클라이언트
│   └── types.ts           # TypeScript 타입 정의
└── styles/               # 추가 스타일 파일
```

## 🎯 사용 방법

### 1. 재료 입력
- 메인 페이지에서 재료명을 입력하기 시작
- 자동완성 드롭다운에서 정확한 재료 선택
- 선택된 재료가 태그 형태로 표시됨
- 필요에 따라 여러 재료 추가 가능

### 2. AI 추천 받기
- "요리 추천받기" 버튼 클릭
- 하이브리드 AI 시스템이 최적의 레시피 분석
- 로딩 중 요리 관련 애니메이션 표시

### 3. 결과 확인
- 매칭도가 높은 레시피 목록 표시
- 각 레시피별 매칭 재료 수와 점수 확인
- 사용된 재료 하이라이트 표시

### 4. 상세 레시피 보기
- 원하는 레시피 카드 클릭
- 상세 조리법 및 재료 정보 확인
- 요리 팁과 주의사항 참고

## 🧠 AI 추천 시스템 상세

### BERT 임베딩 기반 추천
```typescript
// 재료 임베딩 벡터 조회
const embeddings = await getIngredientsEmbeddings(ingredients);

// 평균 벡터 계산
const avgEmbedding = calculateAverageEmbedding(validEmbeddings);

// 정규화 및 유사도 검색
const normalized = normalizeEmbedding(avgEmbedding);
const results = await findSimilarRecipes(normalized, threshold);
```

### 정확한 재료 매칭 시스템
```typescript
// 1단계: 실제 재료 검색
const matchingIngredients = await supabase
  .from('ingredients')
  .select('id, name')
  .or(ingredients.map(ing => `name.ilike.%${ing}%`).join(','));

// 2단계: 레시피-재료 매핑 조회
const recipeIds = await supabase
  .from('recipe_ingredients')
  .select('recipe_id, ingredient_id')
  .in('ingredient_id', matchingIngredientIds);

// 3단계: 가중치 점수 계산
const weightedScore = (
  matchCount * 2 + 
  userIngredientCoverage * 1.5 + 
  recipeIngredientCoverage * 1.0
) / (2 + 1.5 + 1.0);
```

## 📊 성능 최적화

### 데이터베이스 최적화
- **인덱싱**: 재료명 및 레시피 ID에 대한 복합 인덱스
- **벡터 검색**: pgvector를 통한 고속 유사도 계산
- **쿼리 최적화**: JOIN 쿼리 최소화 및 필요한 컬럼만 선택

### 프론트엔드 최적화
- **병렬 처리**: 독립적인 작업의 동시 실행
- **Turbopack**: Next.js 15의 차세대 번들러 활용
- **코드 스플리팅**: 페이지별 자동 코드 분할
- **이미지 최적화**: Next.js Image 컴포넌트 활용

## 🔧 개발 도구 및 품질 관리

### 코드 품질
- **TypeScript Strict Mode**: 엄격한 타입 검사
- **ESLint**: 일관된 코딩 스타일 강제
- **Prettier**: 자동 코드 포맷팅

### 디버깅 및 로깅
```typescript
console.log(`[하이브리드 추천] 시작: ${ingredients.join(', ')}`);
console.log(`[임베딩 추천] 최종 threshold: ${threshold}, 결과: ${results.length}개`);
console.log(`[추천 시스템] 발견된 재료: ${matchingIngredients.map(i => i.name).join(', ')}`);
```

## 🤝 기여하기

1. 이 저장소를 Fork 합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/새로운기능`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add: 새로운 기능 추가'`)
4. 브랜치에 Push 합니다 (`git push origin feature/새로운기능`)
5. Pull Request를 생성합니다

### 개발 가이드라인
- TypeScript 타입 안정성 유지
- 컴포넌트 재사용성 고려
- 접근성 표준 준수
- 성능 최적화 고려

## 🎨 디자인 시스템

### 컬러 팔레트
```css
:root {
  --color-primary: #ff6b6b;      /* 메인 레드 */
  --color-secondary: #4ecdc4;    /* 민트 그린 */
  --color-accent: #45b7d1;       /* 블루 */
  --color-warning: #f7b731;      /* 옐로우 */
  --color-success: #5cb85c;      /* 그린 */
}
```

### 유리형 효과 (Glass Effect)
```css
.glass-effect {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 👥 개발팀

**AI 종합설계 1조**

- 데이터 출처: [만개의 레시피](https://www.10000recipe.com/)
- AI 모델: BERT 기반 임베딩 시스템
- 프로젝트 기간: 2024년

## 📈 향후 계획

- [ ] 사용자 맞춤형 추천 시스템
- [ ] 요리 난이도별 필터링
- [ ] 영양 정보 기반 추천
- [ ] 사용자 리뷰 및 평점 시스템
- [ ] 레시피 북마크 기능
- [ ] 소셜 공유 기능

## 📞 문의

프로젝트에 대한 문의사항이나 개선 제안이 있으시면 Issues를 통해 연락주세요.

---

<div align="center">
  <strong>🍳 똑똑한 AI와 함께하는 맛있는 요리의 시작 🍳</strong><br>
  <em>Powered by BERT Embeddings & Advanced Matching Algorithm</em>
</div>