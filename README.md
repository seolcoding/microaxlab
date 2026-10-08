# MicroAXLab

가게의 작은 불편부터 함께 살펴보는 MicroAXLab의 제품 소개 홈페이지입니다. 부산 부전시장에서 준비하는 첫 현장 파일럿과 메뉴 사진으로 만드는 짧은 홍보영상 예시를 소개합니다.

공개 주소: [microaxlab.com](https://microaxlab.com/)

GitHub Pages에서 호스팅하며, Hostinger는 도메인과 메일 DNS를 관리합니다.

## 실행

Node.js 24 이상을 사용합니다. 외부 패키지 설치 없이 HTML, CSS, JavaScript와 정적 자산을 빌드합니다.

```sh
npm run build
npm run preview
```

미리보기는 [127.0.0.1:4192](http://127.0.0.1:4192/)에서 열립니다. 서버는 이 컴퓨터에서만 접속할 수 있습니다. 영상 재생과 탐색을 확인할 수 있도록 HTTP Range 요청을 지원합니다.

GitHub Pages와 같은 프로젝트 하위 경로를 확인하려면 다음과 같이 실행합니다.

```sh
SITE_URL=https://seolcoding.github.io/microaxlab/ npm run build
PORT=4191 npm run preview -- --base /microaxlab/
```

주소는 [127.0.0.1:4191/microaxlab/](http://127.0.0.1:4191/microaxlab/)입니다. `PORT`, `SERVE_ROOT`, `BASE_PATH` 환경변수로 포트, 출력 폴더, 경로를 바꿀 수 있습니다.

## 빌드와 배포

`npm run build`는 공개 파일만 `out/public/`에 생성합니다. 빌드에 포함된 검사는 누락된 이미지·영상·스타일·섹션 링크, 프로젝트 하위 경로, 공유 메타, 사이트맵과 허용 목록 밖의 파일을 확인합니다. 검사만 다시 하려면 `npm run check:public`을 실행합니다.

출력 폴더에 예상하지 않은 파일이 있으면 삭제하지 않고 빌드를 중단합니다. 해당 파일을 폴더 밖으로 옮긴 뒤 다시 실행합니다. 기존 출력 파일은 같은 이름으로 갱신합니다.

기본 주소는 `https://microaxlab.com/`입니다. 다른 주소로 빌드할 때는 `SITE_URL`을 지정합니다. canonical, 공유 주소, 사이트맵에 반영됩니다.

```sh
SITE_URL=https://microaxlab.com/ npm run build
```

GitHub 저장소의 **Settings → Pages → Source**는 **GitHub Actions**를 사용합니다. `main`에 반영하거나 `Deploy GitHub Pages` 워크플로를 수동 실행하면 Node.js 24로 검사한 `out/public/`만 배포합니다. 사용자 지정 도메인은 Pages 설정의 `microaxlab.com`으로 관리합니다. 워크플로가 Pages의 현재 주소를 읽어 검색·공유 메타를 생성하므로 `CNAME` 파일은 필요하지 않습니다. Hostinger의 웹사이트 A 레코드와 www CNAME만 GitHub Pages로 연결하고 메일 DNS는 유지합니다.

## 공개 소스 범위

저장소에 필요한 파일은 다음과 같습니다.

- `.gitignore`, `README.md`, `package.json`
- `.github/workflows/pages.yml`
- `scripts/build.mjs`, `scripts/check-public.mjs`, `scripts/serve.mjs`
- `src/launch-page.mjs`, `src/launch-content.mjs`, `src/launch.js`, `src/styles/launch.css`
- `src/assets/` 안의 아래 13개 파일

```text
PretendardVariable.woff2       Pretendard-LICENSE.txt
favicon.svg                   founder.jpg
gukbap-kitchen.jpg             gukbap-bowl.jpg
gimbap-plate.jpg               jokbal-board.jpg
microaxlab_food_v2.mp4         microaxlab_food_v2_poster.jpg
gukbap_promo.mp4               gukbap_promo_poster.jpg
social-preview.jpg
```

식당·음식 장면은 AI로 만든 연출 예시이며 실제 고객 실적이 아닙니다. 대표 이미지는 본인의 프로필 사진입니다. 공개하는 25초 소개 영상과 8초 음식 예시 영상은 무음입니다. Pretendard의 라이선스는 자산 폴더에 함께 제공합니다.

## 기존 로컬 비교 화면

이전 검수 소스가 남아 있는 원래 작업 폴더에서는 `npm run build:review`와 `npm run dev`로 `dist/`의 비교 화면을 [127.0.0.1:4188](http://127.0.0.1:4188/)에서 열 수 있습니다. 이 명령은 로컬 개발 전용이며, 검수 소스는 공개 저장소에 포함하지 않습니다. 공개 저장소를 새로 받은 경우에는 위의 `build`와 `preview`를 사용합니다.
