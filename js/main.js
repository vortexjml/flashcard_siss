// =====================================
// 데이터 레이어 (localStorage CRUD)
// =====================================
const STORAGE_KEY = "flashcard_data";

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { decks: [], sampleDeckCreated: false };
  }
  return JSON.parse(raw);
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// =====================================
// 샘플 덱 자동 생성 (최초 1회만)
// =====================================
function createSampleDeckIfNeeded() {
  const data = loadData();
  if (data.sampleDeckCreated) return;

  const now = Date.now();
  const sampleDeck = {
    id: "deck_" + now,
    name: "CS 기초 (예시)",
    createdAt: now,
    lastReviewed: null,
    cards: [
      { id: "card_" + (now + 1), front: "Stack과 Queue의 차이는?",
        back: "Stack은 LIFO(후입선출), Queue는 FIFO(선입선출)",
        correctCount: 0, incorrectCount: 0, lastReviewed: null },
      { id: "card_" + (now + 2), front: "프로세스와 스레드의 차이는?",
        back: "프로세스는 독립된 메모리 공간을 가지고, 스레드는 프로세스 내에서 메모리를 공유한다",
        correctCount: 0, incorrectCount: 0, lastReviewed: null },
      { id: "card_" + (now + 3), front: "HTTP와 HTTPS의 차이는?",
        back: "HTTPS는 SSL/TLS로 통신을 암호화한 HTTP",
        correctCount: 0, incorrectCount: 0, lastReviewed: null },
      { id: "card_" + (now + 4), front: "Big-O 표기법이란?",
        back: "알고리즘의 시간/공간 복잡도를 입력 크기에 대한 점근적 상한으로 표현한 것",
        correctCount: 0, incorrectCount: 0, lastReviewed: null },
      { id: "card_" + (now + 5), front: "REST API의 핵심 원칙 하나는?",
        back: "자원(URI)과 행위(HTTP 메서드)를 분리하여 표현한다",
        correctCount: 0, incorrectCount: 0, lastReviewed: null },
    ],
  };

  data.decks.push(sampleDeck);
  data.sampleDeckCreated = true;
  saveData(data);
}

// =====================================
// 유틸: 마지막 학습일 포맷팅
// =====================================
function formatLastReviewed(timestamp) {
  if (!timestamp) return "학습 안 함";
  const diff = Date.now() - timestamp;
  const day = 24 * 60 * 60 * 1000;
  if (diff < day) return "오늘";
  if (diff < 2 * day) return "어제";
  return Math.floor(diff / day) + "일 전";
}

// =====================================
// 홈 화면 렌더링
// =====================================
function renderHomeView() {
  const data = loadData();
  const container = document.getElementById("deck-list");

  if (data.decks.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>아직 덱이 없어요.</p>
        <p>첫 덱을 만들어보세요!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = data.decks
    .map(
      (deck) => `
        <article class="deck-card" data-deck-id="${deck.id}">
          <h3 class="deck-card__name">${deck.name}</h3>
          <p class="deck-card__meta">
            ${deck.cards.length}장 · ${formatLastReviewed(deck.lastReviewed)}
          </p>
        </article>
      `
    )
    .join("");
}

// =====================================
// 테마(다크모드) 토글
// =====================================
const themeToggle = document.getElementById("theme-toggle");
const htmlEl = document.documentElement;

const savedTheme = localStorage.getItem("theme") || "light";
htmlEl.setAttribute("data-theme", savedTheme);
themeToggle.textContent = savedTheme === "dark" ? "☀️" : "🌙";

themeToggle.addEventListener("click", () => {
  const current = htmlEl.getAttribute("data-theme");
  const next = current === "light" ? "dark" : "light";
  htmlEl.setAttribute("data-theme", next);
  themeToggle.textContent = next === "dark" ? "☀️" : "🌙";
  localStorage.setItem("theme", next);
});

// =====================================
// 앱 초기화
// =====================================
createSampleDeckIfNeeded();
renderHomeView();

console.log("Flashcard app loaded");