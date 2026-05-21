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
    document.getElementById("btn-start-study").disabled = deck.cards.length === 0;
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
    .map((card) => {
      const total = card.correctCount + card.incorrectCount;
      const statsHtml = total > 0
        ? `<p class="card-list-item__stats">✓ ${card.correctCount} · ✗ ${card.incorrectCount}</p>`
        : "";

      return `
        <article class="card-list-item" data-card-id="${card.id}">
          <p class="card-list-item__front">${escapeHtml(card.front)}</p>
          <p class="card-list-item__back">${escapeHtml(card.back)}</p>
          ${statsHtml}
        </article>
      `;
    })
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
    const deleteBtn = document.getElementById("btn-delete-card");

    if (cardId) {
        const data = loadData();
        const deck = data.decks.find((d) => d.id === currentDeckId);
        const card = deck.cards.find((c) => c.id === cardId);
        if (!card) return;

        titleEl.textContent = "카드 편집";
        frontInput.value = card.front;
        backInput.value = card.back;
        deleteBtn.hidden = false; // 편집 모드 → 삭제 버튼 보이기
    } else {
        titleEl.textContent = "카드 추가";
        frontInput.value = "";
        backInput.value = "";
        deleteBtn.hidden = true; // 추가 모드 → 삭제 버튼 숨기기
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
// 카드 삭제
// =====================================
function deleteCard() {
    if (!editingCardId) return;

    const confirmed = confirm("정말 이 카드를 삭제할까요?");
    if (!confirmed) return;

    const data = loadData();
    const deck = data.decks.find((d) => d.id === currentDeckId);
    if (!deck) return;

    // 해당 ID를 제외한 카드들만 남기기
    deck.cards = deck.cards.filter((c) => c.id !== editingCardId);

    saveData(data);
    showDeckDetail(currentDeckId);
}

// =====================================
// 유틸: 배열 셔플 (Fisher-Yates 알고리즘)
// =====================================
function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

// =====================================
// 학습 모드 상태
// =====================================
let studyState = {
    deckId: null,
    cards: [],
    currentIndex: 0,
    isFlipped: false,
    correctCount: 0,
    incorrectCount: 0,
    answers: [], // {cardId, isCorrect} 기록
};

// =====================================
// 학습 시작
// =====================================
function startStudy(deckId) {
    const data = loadData();
    const deck = data.decks.find((d) => d.id === deckId);
    if (!deck || deck.cards.length === 0) return;

    studyState = {
        deckId,
        cards: shuffle(deck.cards),
        currentIndex: 0,
        isFlipped: false,
        correctCount: 0,
        incorrectCount: 0,
        answers: [],
    };

    renderStudyCard();
    showView("view-study");
}

// =====================================
// 현재 카드 화면에 렌더링
// =====================================
function renderStudyCard() {
    const { cards, currentIndex, isFlipped } = studyState;
    const card = cards[currentIndex];

    // 진행률 표시
    document.getElementById("study-counter").textContent =
        `${currentIndex + 1} / ${cards.length}`;
    document.getElementById("progress-fill").style.width =
        `${(currentIndex / cards.length) * 100}%`;

    // 카드 내용
    document.getElementById("study-front").textContent = card.front;
    document.getElementById("study-back").textContent = card.back;

    // 플립 상태 반영
    const cardEl = document.getElementById("study-card");
    cardEl.classList.toggle("is-flipped", isFlipped);

    // 버튼 표시 분기 (앞면일 땐 "답 보기", 뒷면일 땐 알아요/모르겠어요)
    document.getElementById("btn-flip").hidden = isFlipped;
    document.getElementById("study-answer-buttons").hidden = !isFlipped;
}

// =====================================
// 카드 뒤집기
// =====================================
function flipCard() {
    if (studyState.isFlipped) return; // 이미 뒤집힌 상태면 무시
    studyState.isFlipped = true;
    renderStudyCard();
}

// =====================================
// 답변 처리
// =====================================
function answerCard(isCorrect) {
    if (isCorrect) studyState.correctCount++;
    else studyState.incorrectCount++;

    studyState.answers.push({
        cardId: studyState.cards[studyState.currentIndex].id,
        isCorrect,
    });

    const isLastCard = studyState.currentIndex === studyState.cards.length - 1;

    if (isLastCard) {
        // 정상 종료: 결과 저장 + 결과 화면
        persistStudyResults();
        showResult();
    } else {
        // 다음 카드로
        studyState.currentIndex++;
        studyState.isFlipped = false;
        renderStudyCard();
    }
}

// =====================================
// 학습 결과를 카드 데이터에 반영 (정상 종료 시에만)
// =====================================
function persistStudyResults() {
    const data = loadData();
    const deck = data.decks.find((d) => d.id === studyState.deckId);
    if (!deck) return;

    studyState.answers.forEach(({ cardId, isCorrect }) => {
        const card = deck.cards.find((c) => c.id === cardId);
        if (!card) return;
        if (isCorrect) card.correctCount++;
        else card.incorrectCount++;
    });

    deck.lastReviewed = Date.now();
    saveData(data);
}

// =====================================
// 결과 화면 표시
// =====================================
function showResult() {
    const { correctCount, cards } = studyState;
    const total = cards.length;
    const percentage = Math.round((correctCount / total) * 100);

    document.getElementById("result-correct").textContent = correctCount;
    document.getElementById("result-total").textContent = total;
    document.getElementById("result-percentage").textContent =
        `정답률 ${percentage}%`;

    showView("view-result");
}

// =====================================
// 중도 종료 (✕ 버튼)
// =====================================
function endStudyEarly() {
    if (!confirm("학습을 종료할까요? 진행 내역은 저장되지 않아요.")) return;
    showDeckDetail(studyState.deckId);
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

// 카드 삭제 버튼
document.getElementById("btn-delete-card")
    .addEventListener("click", deleteCard);

// 학습 시작 버튼
document.getElementById("btn-start-study")
    .addEventListener("click", () => startStudy(currentDeckId));

// 카드 클릭 또는 "답 보기" 버튼 → 뒤집기
document.getElementById("study-card")
    .addEventListener("click", flipCard);
document.getElementById("btn-flip")
    .addEventListener("click", flipCard);

// 알아요 / 모르겠어요
document.getElementById("btn-correct")
    .addEventListener("click", () => answerCard(true));
document.getElementById("btn-incorrect")
    .addEventListener("click", () => answerCard(false));

// 중도 종료
document.getElementById("btn-end-study")
    .addEventListener("click", endStudyEarly);

// 결과 화면의 다시/돌아가기 버튼
document.getElementById("btn-restart-study")
    .addEventListener("click", () => startStudy(studyState.deckId));
document.getElementById("btn-back-from-result")
    .addEventListener("click", () => showDeckDetail(studyState.deckId));

// =====================================
// 학습 모드 키보드 단축키
// =====================================
function handleStudyKeyboard(e) {
  // 학습 화면이 아니면 무시
  if (document.getElementById("view-study").hidden) return;

  // 입력창에 포커스 있을 때는 무시 (혹시 모를 충돌 방지)
  const tag = e.target.tagName;
  if (tag === "TEXTAREA" || tag === "INPUT") return;

  // ESC: 학습 종료
  if (e.key === "Escape") {
    endStudyEarly();
    return;
  }

  if (!studyState.isFlipped) {
    // 앞면 상태: Space 또는 Enter로 뒤집기
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault(); // Space가 페이지 스크롤 시키는 것 방지
      flipCard();
    }
  } else {
    // 뒷면 상태: 1=모르겠어요, 2=알아요
    if (e.key === "1") {
      e.preventDefault();
      answerCard(false);
    } else if (e.key === "2") {
      e.preventDefault();
      answerCard(true);
    }
  }
}

document.addEventListener("keydown", handleStudyKeyboard);

// =====================================
// 앱 초기화
// =====================================
createSampleDeckIfNeeded();
renderHomeView();

console.log("Flashcard app loaded");