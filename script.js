const API_URL = "https://opensheet.elk.sh/1pzcIo8ijBwKyj0gKBBI3uMr6VD0naoRtAQ1PrQNkCp8/Questions";
let allQuestions = [];
let examQuestions = [];
let selectedAnswers = [];
let currentIndex = 0;
let mode = ""; // "tutorial" or "test"
let showingAnswer = false;

// Load questions once when page opens
async function loadQuestions() {
  try {
    const response = await fetch(API_URL);
    allQuestions = await response.json();
  } catch (err) {
    alert("Failed to load questions. Please check your API link.");
  }
}
loadQuestions();

function startTutorial() {
  if (!allQuestions.length) return alert("Questions are still loading... try again.");

  mode = "tutorial";
  examQuestions = shuffle([...allQuestions]); // all questions
  currentIndex = 0;
  selectedAnswers = [];
  showingAnswer = false;

  document.getElementById("home-container").classList.add("hidden");
  document.getElementById("exam-container").classList.remove("hidden");
  document.getElementById("modeTitle").innerText = "Tutorial Mode";
  showQuestion();
}

function startTest() {
  if (!allQuestions.length) return alert("Questions are still loading... try again.");

  mode = "test";
  examQuestions = shuffle([...allQuestions]).slice(0, 10); // 10 random
  currentIndex = 0;
  selectedAnswers = [];
  showingAnswer = false;

  document.getElementById("home-container").classList.add("hidden");
  document.getElementById("exam-container").classList.remove("hidden");
  document.getElementById("modeTitle").innerText = "Test Mode";
  showQuestion();
}

function showQuestion() {
  const q = examQuestions[currentIndex];
  document.getElementById("question").innerText = `${currentIndex + 1}. ${q.Question}`;

  let options = ["Opt 1", "Opt 2", "Opt 3", "Opt 4"].map(opt => q[opt]);
  options = shuffle(options);

  let optionsHtml = "";
  options.forEach(opt => {
    const checked = selectedAnswers[currentIndex] === opt ? "checked" : "";
    optionsHtml += `
      <label class="option">
        <input type="radio" name="option" value="${opt}" ${checked} onchange="selectOption('${opt}')"> ${opt}
      </label>`;
  });

  document.getElementById("options").innerHTML = optionsHtml;

  // Switch buttons in tutorial answer stage
  if (mode === "tutorial" && showingAnswer) {
    document.getElementById("prevBtn").classList.add("hidden");
    document.getElementById("backBtn").classList.remove("hidden");
  } else {
    document.getElementById("prevBtn").classList.remove("hidden");
    document.getElementById("backBtn").classList.add("hidden");
  }
}

function selectOption(answer) {
  selectedAnswers[currentIndex] = answer;
}

function nextQuestion() {
  const q = examQuestions[currentIndex];

  if (mode === "tutorial" && !showingAnswer) {
    const userAns = selectedAnswers[currentIndex];
    const correctAns = q["Correct Answer"];
    const optionElements = document.querySelectorAll("#options input");

    optionElements.forEach(input => {
      input.disabled = true; // disable all options
      const label = input.parentElement;

      if (input.value === correctAns) {
        // highlight correct answer
        label.style.background = "#d4edda"; // light green
        label.style.border = "2px solid green";
        label.innerHTML += " ✅";
      }

      if (input.value === userAns && userAns !== correctAns) {
        // highlight wrong selected answer
        label.style.background = "#f8d7da"; // light red
        label.style.border = "2px solid red";
        label.innerHTML += " ❌";
      }
    });

    showingAnswer = true;
    document.getElementById("prevBtn").classList.add("hidden");
    document.getElementById("backBtn").classList.remove("hidden");
    return;
  }

  // Normal navigation after feedback
  showingAnswer = false;
  if (currentIndex < examQuestions.length - 1) {
    currentIndex++;
    showQuestion();
  } else {
    if (mode === "test") {
      showSummary();
    } else {
      goHome(); // tutorial ends back to home
    }
  }
}
function prevQuestion() {
  if (currentIndex > 0) {
    currentIndex--;
    showingAnswer = false;
    showQuestion();
  }
}

function showSummary() {
  document.getElementById("exam-container").classList.add("hidden");
  document.getElementById("summary-container").classList.remove("hidden");

  let score = 0;
  let summaryHtml = "<table><tr><th>Q.No</th><th>Question</th><th>Your Answer</th><th>Correct Answer</th></tr>";

  examQuestions.forEach((q, i) => {
    const userAns = selectedAnswers[i] || "Not Answered";
    const correct = q["Correct Answer"];
    if (userAns === correct) {
      score++;
    } else {
      summaryHtml += `<tr>
        <td>${i + 1}</td>
        <td>${q.Question}</td>
        <td style="color:red;">${userAns}</td>
        <td style="color:green;">${correct}</td>
      </tr>`;
    }
  });

  summaryHtml += `</table><h2>Your Score: ${score} / ${examQuestions.length}</h2>`;
  document.getElementById("summary").innerHTML = summaryHtml;
}

function goHome() {
  document.getElementById("exam-container").classList.add("hidden");
  document.getElementById("summary-container").classList.add("hidden");
  document.getElementById("home-container").classList.remove("hidden");
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}


