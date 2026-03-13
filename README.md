# FITO
> 운동을 일상으로, 함께하는 재미를 알아가는 라이브 피트니스 FITO

![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![Flask](https://img.shields.io/badge/flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white)
![Bootstrap](https://img.shields.io/badge/bootstrap-%23563D7C.svg?style=for-the-badge&logo=bootstrap&logoColor=white)

## ✨ 프로젝트 소개
추후 작성 예정
- **목적:** 추후 작성 예정
- **도구:** VS Code, SourceTree, GitHub

## 🛠 기술 스택
- **Backend:** Python, Flask
- **Frontend:** HTML5, CSS3 (Bootstrap 5)
- **Version Control:** Git, SourceTree

## 📂 프로젝트 구조
fito/
├── app.py           # 서버 실행 파일
├── static/          # CSS, JS, 이미지 파일
├── templates/       # HTML 파일 (Flask 전용)
└── README.md        # 프로젝트 설명서

---

1.  **app.py**: 메인 서버 코드
2.  **templates 폴더**: HTML 파일들을 넣는 곳
3.  **static 폴더**: 사진이나 CSS 디자인 파일을 넣는 곳


---

### 3. 소스트리(SourceTree) 활용 팁
명령어(CLI)가 어려울 때는 소스트리가 정말 편합니다. 아까 발생한 오류를 소스트리에서 해결하는 순서.

1.  **Stage All**: 새로 만든 `app.py`, `README.md` 등을 '스테이지에 올리기' 함.
2.  **Commit**: 하단에 "Initial Commit"이라고 적고 커밋 버튼을 누름.
3.  **Branch**: 상단 '브랜치' 아이콘을 눌러 `(영어이름)`이라는 이름을 입력하고 생성. (본인 이름으로 해도 됨.)
4.  **Push**: 깃허브(GitHub) 온라인 저장소로 코드를 보냄.

---

### 4. 템플릿을 더 예쁘게 만들려면?
Flask 앱의 HTML 파일 안에서 **Bootstrap CDN** 한 줄 추가해보기

```html
<!DOCTYPE html>
<html>
<head>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="container mt-5">
    <h1 class="text-primary">하은님의 Flask 앱</h1>
    <button class="btn btn-success">작동 버튼</button>
</body>
</html>