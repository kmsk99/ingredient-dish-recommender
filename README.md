# 🍳 AI 냉장고 파먹기 (Ingredient-Dish-Recommender)

> 냉장고에 있는 재료만으로 맛있는 요리를 추천받아보세요!

AI 기반 재료-요리 추천 서비스로, 사용자가 보유한 식재료를 입력하면 해당 재료로 만들 수 있는 최적의 레시피를 추천해드립니다.

![Next.js](https://img.shields.io/badge/Next.js-15.3.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.5-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-2.49.4-3ecf8e)

## ✨ 주요 기능

### 🔍 스마트 재료 입력
- 보유 재료를 간편하게 입력
- 자동완성 및 태그 기반 재료 관리
- 재료별 카테고리 분류

### 🤖 AI 기반 레시피 추천
- 입력한 재료와 매칭도가 높은 레시피 추천
- 재료 활용도에 따른 우선순위 정렬
- 다양한 요리 카테고리 지원

### 📱 반응형 웹 디자인
- 모바일, 태블릿, 데스크톱 최적화
- 직관적이고 사용하기 쉬운 UI/UX
- 접근성을 고려한 디자인

### 📖 상세 레시피 정보
- 단계별 조리 방법
- 필요한 재료 및 분량
- 예상 조리 시간 및 난이도
- 요리 팁 및 주의사항

## 🛠 기술 스택

### Frontend
- **Next.js 15.3.1** - React 기반 풀스택 프레임워크
- **TypeScript** - 타입 안정성을 위한 정적 타입 언어
- **Tailwind CSS 4.1.5** - 유틸리티 우선 CSS 프레임워크
- **React Icons** - 아이콘 라이브러리

### Backend & Database
- **Supabase** - PostgreSQL 기반 백엔드 서비스
- **Server Actions** - Next.js 서버 액션을 통한 API 처리

### Development Tools
- **pnpm** - 패키지 매니저
- **ESLint** - 코드 품질 관리
- **Prettier** - 코드 포맷팅
- **Turbopack** - 고속 빌드 도구

## 🚀 설치 및 실행

### 사전 요구사항
- Node.js 18.0 이상
- pnpm 9.0 이상

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

### 4. 개발 서버 실행
```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

### 5. 빌드 및 배포
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
│   ├── recipe/[id]/       # 레시피 상세 페이지
│   └── layout.tsx         # 공통 레이아웃
├── components/            # 재사용 가능한 컴포넌트
│   ├── IngredientInput.tsx # 재료 입력 컴포넌트
│   ├── RecipeCard.tsx     # 레시피 카드 컴포넌트
│   ├── Header.tsx         # 헤더 컴포넌트
│   └── Footer.tsx         # 푸터 컴포넌트
├── lib/                   # 유틸리티 및 공통 함수
├── supabase/             # Supabase 설정 및 타입
└── styles/               # 전역 스타일
```

## 🎯 사용 방법

1. **재료 입력**: 메인 페이지에서 보유한 재료를 쉼표로 구분하여 입력
2. **추천받기**: "추천받기" 버튼을 클릭하여 레시피 검색
3. **결과 확인**: 입력한 재료와 매칭도가 높은 레시피 목록 확인
4. **상세 보기**: 원하는 레시피를 클릭하여 상세 조리법 확인

## 🤝 기여하기

1. 이 저장소를 Fork 합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/새로운기능`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add: 새로운 기능 추가'`)
4. 브랜치에 Push 합니다 (`git push origin feature/새로운기능`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 👥 개발팀

**AI 종합설계 1조**

- 데이터 출처: [만개의 레시피](https://www.10000recipe.com/)
- 프로젝트 기간: 2024년

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 Issues를 통해 연락주세요.

---

<div align="center">
  <strong>🍳 맛있는 요리의 시작, AI 냉장고 파먹기 🍳</strong>
</div>