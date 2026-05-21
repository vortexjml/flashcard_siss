// ===== 테마(다크모드) 토글 =====
const themeToggle = document.getElementById("theme-toggle");
const htmlEl = document.documentElement;

// 1. 저장된 테마 불러오기 (없으면 light)
const savedTheme = localStorage.getItem("theme") || "light";
htmlEl.setAttribute("data-theme", savedTheme);
themeToggle.textContent = savedTheme === "dark" ? "☀️" : "🌙";

// 2. 토글 버튼 클릭 시 테마 전환
themeToggle.addEventListener("click", () => {
  const current = htmlEl.getAttribute("data-theme");
  const next = current === "light" ? "dark" : "light";

  htmlEl.setAttribute("data-theme", next);
  themeToggle.textContent = next === "dark" ? "☀️" : "🌙";
  localStorage.setItem("theme", next);
});

console.log("Flashcard app loaded");