# Google Drive 동기화 세팅 가이드

`docs/` 폴더의 MD 파일이 `main` 브랜치에 push되면 자동으로 DOCX로 변환되어 Google Drive에 업로드됩니다.

---

## 1단계: GCP 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. **새 프로젝트** 생성 (예: `admin-dashboard-docs`)
3. 프로젝트 선택 후 진행

## 2단계: Google Drive API 활성화

1. 좌측 메뉴 → **API 및 서비스** → **라이브러리**
2. `Google Drive API` 검색 → **사용** 클릭

## 3단계: 서비스 계정 생성

1. **API 및 서비스** → **사용자 인증 정보** → **사용자 인증 정보 만들기** → **서비스 계정**
2. 서비스 계정 이름: `docs-sync` (임의)
3. 역할: 설정하지 않아도 됨 (Drive API만 사용)
4. 생성 완료 후 서비스 계정 클릭 → **키** 탭 → **키 추가** → **JSON**
5. 다운로드된 JSON 파일 내용을 복사해둠

## 4단계: Google Drive 폴더 공유

1. Google Drive에서 문서를 저장할 폴더 생성 (예: `Admin Dashboard Specs`)
2. 해당 폴더를 **서비스 계정 이메일**과 공유
   - 서비스 계정 이메일 형식: `docs-sync@프로젝트ID.iam.gserviceaccount.com`
   - 권한: **편집자**
3. 폴더 URL에서 **폴더 ID** 복사
   - URL: `https://drive.google.com/drive/folders/XXXXXXXXX`
   - `XXXXXXXXX` 부분이 폴더 ID

## 5단계: GitHub Secrets 등록

GitHub 레포지토리 → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret 이름 | 값 |
| :--- | :--- |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | 3단계에서 다운로드한 JSON 파일의 전체 내용 |
| `GOOGLE_DRIVE_FOLDER_ID` | 4단계에서 복사한 폴더 ID |

## 6단계: 테스트

```bash
# docs/ 폴더의 md 파일 수정 후
git add docs/
git commit -m "docs: update specs"
git push origin main
```

GitHub Actions 탭에서 **Docs → Google Drive 동기화** 워크플로우가 실행되는지 확인합니다.

---

## 동작 방식

1. `docs/**/*.md` 파일이 변경되어 `main`에 push되면 워크플로우 자동 실행
2. `pandoc`으로 MD → DOCX 변환
3. Google Drive API로 업로드 (같은 이름 파일이 있으면 업데이트, 없으면 신규 생성)
4. 업로드된 DOCX는 Google Docs로 자동 변환되어 브라우저에서 바로 열람/편집 가능
5. Drive 미설정 시에도 GitHub Actions → Artifacts에서 DOCX 다운로드 가능 (30일 보관)

## 수동 실행

GitHub → Actions → **Docs → Google Drive 동기화** → **Run workflow** 버튼으로 수동 실행도 가능합니다.

## 참고

- 서비스 계정 JSON 키는 절대 커밋하지 마세요. GitHub Secrets에만 저장합니다.
- Google Drive 무료 계정으로 충분합니다 (15GB 용량 내).
- 업로드 시 `mimeType: application/vnd.google-apps.document`로 지정하여 Google Docs 형식으로 자동 변환됩니다.
