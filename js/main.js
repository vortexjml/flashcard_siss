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
            {
                id: "card_" + (now + 1), front: "Stack과 Queue의 차이는?",
                back: "Stack은 LIFO(후입선출), Queue는 FIFO(선입선출)",
                correctCount: 0, incorrectCount: 0, lastReviewed: null
            },
            {
                id: "card_" + (now + 2), front: "프로세스와 스레드의 차이는?",
                back: "프로세스는 독립된 메모리 공간을 가지고, 스레드는 프로세스 내에서 메모리를 공유한다",
                correctCount: 0, incorrectCount: 0, lastReviewed: null
            },
            {
                id: "card_" + (now + 3), front: "HTTP와 HTTPS의 차이는?",
                back: "HTTPS는 SSL/TLS로 통신을 암호화한 HTTP",
                correctCount: 0, incorrectCount: 0, lastReviewed: null
            },
            {
                id: "card_" + (now + 4), front: "Big-O 표기법이란?",
                back: "알고리즘의 시간/공간 복잡도를 입력 크기에 대한 점근적 상한으로 표현한 것",
                correctCount: 0, incorrectCount: 0, lastReviewed: null
            },
            {
                id: "card_" + (now + 5), front: "REST API의 핵심 원칙 하나는?",
                back: "자원(URI)과 행위(HTTP 메서드)를 분리하여 표현한다",
                correctCount: 0, incorrectCount: 0, lastReviewed: null
            },
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
// 유틸: HTML 특수문자 이스케이프 (XSS 방지)
// =====================================
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
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
          <h3 class="deck-card__name">${escapeHtml(deck.name)}</h3>
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
// 화면 전환 (SPA 패턴)
// =====================================
function showView(viewId) {
    document.querySelectorAll(".app-main section").forEach((section) => {
        section.hidden = true;
    });
    document.getElementById(viewId).hidden = false;
}

// =====================================
// 새 덱 만들기
// =====================================
function createNewDeck() {
    const name = prompt("새 덱 이름을 입력하세요:");
    if (!name || name.trim() === "") return; // 취소하거나 빈 값이면 무시

    const data = loadData();
    const now = Date.now();

    const newDeck = {
        id: "deck_" + now,
        name: name.trim(),
        createdAt: now,
        lastReviewed: null,
        cards: [],
    };

    data.decks.push(newDeck);
    saveData(data);
    renderHomeView();
}

// =====================================
// 덱 상세 화면 표시
// =====================================
let currentDeckId = null; // 현재 보고 있는 덱

function showDeckDetail(deckId) {
  const data = loadData();
  const deck = data.decks.find((d) => d.id === deckId);
  if (!deck) return;

  currentDeckId = deckId;
  document.getElementById("deck-detail-name").textContent = deck.name;
  document.getElementById("deck-detail-info").textContent =
    `${deck.cards.length}장 · ${formatLastReviewed(deck.lastReviewed)}`;

  renderCardList(deck);
  showView("view-deck");
}
// =====================================
// 카드 리스트 렌더링
// =====================================
function renderCardList(deck) {
  const container = document.getElementById("card-list");

  if (deck.cards.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>아직 카드가 없어요.</p>
        <p>+ 버튼으로 카드를 추가해보세요.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = deck.cards
    .map(
      (card) => `
        <article class="card-list-item" data-card-id="${card.id}">
          <p class="card-list-item__front">${escapeHtml(card.front)}</p>
          <p class="card-list-item__back">${escapeHtml(card.back)}</p>
        </article>
      `
    )
    .join("");
}

// =====================================
// 카드 편집 화면 표시
// (cardId 없으면 새 카드 추가, 있으면 기존 카드 편집)
// =====================================
let editingCardId = null;

function showCardEditView(cardId = null) {
  editingCardId = cardId;

  const titleEl = document.getElementById("card-edit-title");
  const frontInput = document.getElementById("input-front");
  const backInput = document.getElementById("input-back");

  if (cardId) {
    // 편집 모드: 기존 값 채우기
    const data = loadData();
    const deck = data.decks.find((d) => d.id === currentDeckId);
    const card = deck.cards.find((c) => c.id === cardId);
    if (!card) return;

    titleEl.textContent = "카드 편집";
    frontInput.value = card.front;
    backInput.value = card.back;
  } else {
    // 추가 모드: 빈 상태
    titleEl.textContent = "카드 추가";
    frontInput.value = "";
    backInput.value = "";
  }

  showView("view-card-edit");
  frontInput.focus();
}

// =====================================
// 카드 저장 (추가 또는 편집)
// =====================================
function saveCard(e) {
  e.preventDefault(); // 폼 기본 동작 (새로고침) 막기

  const front = document.getElementById("input-front").value.trim();
  const back = document.getElementById("input-back").value.trim();
  if (!front || !back) return;

  const data = loadData();
  const deck = data.decks.find((d) => d.id === currentDeckId);
  if (!deck) return;

  if (editingCardId) {
    // 편집: 기존 카드 업데이트
    const card = deck.cards.find((c) => c.id === editingCardId);
    if (card) {
      card.front = front;
      card.back = back;
    }
  } else {
    // 추가: 새 카드 push
    const now = Date.now();
    deck.cards.push({
      id: "card_" + now,
      front,
      back,
      correctCount: 0,
      incorrectCount: 0,
      lastReviewed: null,
    });
  }

  saveData(data);
  showDeckDetail(currentDeckId);
}

// =====================================
// 이벤트 바인딩
// =====================================
// FAB → 새 덱 만들기
document.getElementById("btn-new-deck")
    .addEventListener("click", createNewDeck);

// 뒤로가기 → 홈으로
document.getElementById("btn-back-to-home")
    .addEventListener("click", () => showView("view-home"));

// 덱 카드 클릭 → 덱 상세로 (이벤트 위임)
document.getElementById("deck-list").addEventListener("click", (e) => {
    const card = e.target.closest(".deck-card");
    if (!card) return;
    showDeckDetail(card.dataset.deckId);
});

// 카드 추가 FAB → 새 카드 편집 화면
document.getElementById("btn-add-card")
  .addEventListener("click", () => showCardEditView());

// 편집 화면 취소 (← 버튼) → 덱 상세로
document.getElementById("btn-cancel-edit")
  .addEventListener("click", () => showDeckDetail(currentDeckId));

// 폼 제출 → 카드 저장
document.getElementById("card-edit-form")
  .addEventListener("submit", saveCard);

// 카드 리스트에서 카드 클릭 → 편집 (이벤트 위임)
document.getElementById("card-list").addEventListener("click", (e) => {
  const item = e.target.closest(".card-list-item");
  if (!item) return;
  showCardEditView(item.dataset.cardId);
});

// =====================================
// 앱 초기화
// =====================================
createSampleDeckIfNeeded();
renderHomeView();

console.log("Flashcard app loaded");