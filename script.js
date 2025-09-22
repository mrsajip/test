// script.js - updated: robust dark mode + working toggles on every page.
// Replace your previous script.js with this file.

const API_URL = "https://opensheet.elk.sh/1pzcIo8ijBwKyj0gKBBI3uMr6VD0naoRtAQ1PrQNkCp8/Questions";

let allQuestions = [];
let examQuestions = [];
let selectedAnswers = [];
let currentIndex = 0;
let mode = ""; // "tutorial" or "test"
let showingAnswer = false;
let loaded = false;

// load questions once
async function loadQuestions() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Network response not ok");
    allQuestions = await res.json();
    loaded = Array.isArray(allQuestions) && allQuestions.length > 0;
  } catch (err) {
    console.error("Failed to load questions:", err);
    alert("Failed to load questions. Check your API link / network.");
  }
}
loadQuestions();

/* ---------- DARK MODE ---------- */
function updateToggleIcons() {
  document.querySelectorAll(".toggleDarkBtn").forEach(btn => {
    btn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
  });
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");
  updateToggleIcons();
}

// initialize dark mode (script loaded at bottom so DOM exists)
(function initDarkMode() {
  const saved = localStorage.getItem("darkMode");
  if (saved === "enabled") document.body.classList.add("dark");
  updateToggleIcons();
})();

/* ---------- UTIL ---------- */
function shuffle(arr) {
  // Fisher-Yates
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escapeHTML(str) {
  if (typeof str !== "string") return "";
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
}

/* ---------- MODE START ---------- */
function startTutorial() {
  if (!loaded) return alert("Questions are still loading. Please wait and try again.");
  mode = "tutorial";
  examQuestions = shuffle([...allQuestions]); // all questions in random order
  selectedAnswers = new Array(examQuestions.length);
  currentIndex = 0;
  showingAnswer = false;
  showContainer("exam");
  document.getElementById("modeTitle").innerText = "Tutorial Mode";
  showQuestion();
}

function startTest() {
  if (!loaded) return alert("Questions are still loading. Please wait and try again.");
  mode = "test";
  examQuestions = shuffle([...allQuestions]).slice(0, 10); // pick 10
  selectedAnswers = new Array(examQuestions.length);
  currentIndex = 0;
  showingAnswer = false;
  showContainer("exam");
  document.getElementById("modeTitle").innerText = "Test Mode";
  showQuestion();
}

/* ---------- UI helpers ---------- */
function showContainer(name) {
  document.getElementById("home-container").classList.toggle("hidden", name !== "home");
  document.getElementById("exam-container").classList.toggle("hidden", name !== "exam");
  document.getElementById("summary-container").classList.toggle("hidden", name !== "summary");
  // ensure toggle icons reflect current state
  updateToggleIcons();
}

/* ---------- QUESTIONS ---------- */
function showQuestion() {
  const q = examQuestions[currentIndex];
  document.getElementById("question").innerText = `${currentIndex + 1}. ${q.Question || ""}`;

  // prepare options and shuffle them
  let options = ["Opt 1", "Opt 2", "Opt 3", "Opt 4"].map(k => q[k] || "");
  options = shuffle(options);

  // figure checked index if user already answered
  const prevAnswer = selectedAnswers[currentIndex];
  const checkedIndex = prevAnswer != null ? options.indexOf(prevAnswer) : -1;

  // build HTML using data-value indexes to avoid issues with quotes
  let html = "";
  options.forEach((opt, idx) => {
    const safe = escapeHTML(opt);
    const checked = idx === checkedIndex ? "checked" : "";
    html += `
      <label class="option" data-idx="${idx}">
        <input type="radio" name="option" ${checked} data-value="${idx}" />
        <span class="option-text">${safe}</span>
        <span class="option-icon" aria-hidden="true"></span>
      </label>`;
  });

  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = html;

  // attach listeners to inputs to capture answer (use closure of options array)
  document.querySelectorAll("#options input[type=radio]").forEach(input => {
    input.addEventListener("change", (e) => {
      const idx = parseInt(e.target.getAttribute("data-value"), 10);
      selectedAnswers[currentIndex] = options[idx];
    });
  });

  // Reset button visibility depending on state
  if (mode === "tutorial" && showingAnswer) {
    document.getElementById("prevBtn").classList.add("hidden");
    document.getElementById("backBtn").classList.remove("hidden");
  } else {
    document.getElementById("prevBtn").classList.remove("hidden");
    document.getElementById("backBtn").classList.add("hidden");
  }
}

/* ---------- NAVIGATION ---------- */
function nextQuestion() {
  const q = examQuestions[currentIndex];

  // Tutorial feedback stage: show highlights first
  if (mode === "tutorial" && !showingAnswer) {
    const userAns = selectedAnswers[currentIndex];
    const correctAns = q["Correct Answer"];

    // disable inputs and highlight labels
    document.querySelectorAll("#options .option").forEach(label => {
      const input = label.querySelector("input");
      const text = label.querySelector(".option-text").textContent;
      input.disabled = true;

      // remove any previous classes
      label.classList.remove("correct", "wrong");
      label.querySelector(".option-icon").textContent = "";

      if (text === correctAns) {
        label.classList.add("correct");
        label.querySelector(".option-icon").textContent = " ✅";
      }
      if (userAns != null && text === userAns && userAns !== correctAns) {
        label.classList.add("wrong");
        label.querySelector(".option-icon").textContent = " ❌";
      }
    });

    // also if user didn't answer, still show correct option
    showingAnswer = true;
    document.getElementById("prevBtn").classList.add("hidden");
    document.getElementById("backBtn").classList.remove("hidden");
    return;
  }

  // normal forward navigation
  showingAnswer = false;
  if (currentIndex < examQuestions.length - 1) {
    currentIndex++;
    showQuestion();
  } else {
    if (mode === "test") showSummary();
    else goHome();
  }
}

function prevQuestion() {
  // go to previous question if exists
  if (currentIndex > 0) {
    currentIndex--;
    showingAnswer = false;
    showQuestion();
  }
}

/* ---------- SUMMARY ---------- */
// Show only wrong questions (question text + correct answer only)
function showSummary() {
  showContainer("summary");

  let wrongCount = 0;
  let html = "<div class='summary-table-wrap'><table><thead><tr><th>Q.No</th><th>Question</th><th>Correct Answer</th></tr></thead><tbody>";

  examQuestions.forEach((q, i) => {
    const userAns = selectedAnswers[i];
    const correct = q["Correct Answer"];
    if (userAns !== correct) {
      wrongCount++;
      html += `<tr>
        <td>${i + 1}</td>
        <td>${escapeHTML(q.Question || "")}</td>
        <td style="color:green">${escapeHTML(correct || "")}</td>
      </tr>`;
    }
  });

  html += `</tbody></table></div>`;
  html += `<h2>Your Score: ${ (examQuestions.length - wrongCount) } / ${ examQuestions.length }</h2>`;
  if (wrongCount === 0) {
    html += `<p>Great! All answers were correct.</p>`;
  } else {
    html += `<p>Only the incorrectly answered questions are shown above.</p>`;
  }

  document.getElementById("summary").innerHTML = html;
}

/* ---------- HOME ---------- */
function goHome() {
  showContainer("home");
}

/* ---------- EXPORTS for inline onclick handlers in HTML ---------- */
window.startTutorial = startTutorial;
window.startTest = startTest;
window.nextQuestion = nextQuestion;
window.prevQuestion = prevQuestion;
window.goHome = goHome;
window.toggleDarkMode = toggleDarkMode;

// update toggle icons in case there are multiple toggle buttons created later
updateToggleIcons();
