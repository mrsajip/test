const API_URL = "https://docs.google.com/spreadsheets/d/1pzcIo8ijBwKyj0gKBBI3uMr6VD0naoRtAQ1PrQNkCp8/edit?usp=sharing";

let questions = [];
let currentIndex = 0;
let selectedAnswers = [];
let examQuestions = [];

async function loadQuestions() {
  const response = await fetch(API_URL);
  const data = await response.json();

  // Pick 10 random questions
  examQuestions = data.sort(() => 0.5 - Math.random()).slice(0, 10);

  showQuestion();
}

function showQuestion() {
  const q = examQuestions[currentIndex];
  document.getElementById("question").innerText = `${currentIndex + 1}. ${q.Question}`;

  let optionsHtml = "";
  ["Opt 1", "Opt 2", "Opt 3", "Opt 4"].forEach((opt, i) => {
    const checked = selectedAnswers[currentIndex] === q[opt] ? "checked" : "";
    optionsHtml += `
      <label class="option">
        <input type="radio" name="option" value="${q[opt]}" ${checked} 
        onchange="selectOption('${q[opt]}')"> ${q[opt]}
      </label>`;
  });

  document.getElementById("options").innerHTML = optionsHtml;
}

function selectOption(answer) {
  selectedAnswers[currentIndex] = answer;
}

function nextQuestion() {
  if (currentIndex < examQuestions.length - 1) {
    currentIndex++;
    showQuestion();
  } else {
    showSummary();
  }
}

function prevQuestion() {
  if (currentIndex > 0) {
    currentIndex--;
    showQuestion();
  }
}

function showSummary() {
  document.getElementById("exam-container").classList.add("hidden");
  document.getElementById("summary-container").classList.remove("hidden");

  let score = 0;
  let summaryHtml = "<table border='1' cellpadding='8'><tr><th>Q.No</th><th>Your Answer</th><th>Correct Answer</th></tr>";

  examQuestions.forEach((q, i) => {
    const userAns = selectedAnswers[i] || "Not Answered";
    const correct = q["Correct Answer"];
    if (userAns === correct) score++;
    summaryHtml += `<tr>
      <td>${i + 1}</td>
      <td>${userAns}</td>
      <td>${correct}</td>
    </tr>`;
  });

  summaryHtml += `</table><h2>Your Score: ${score} / ${examQuestions.length}</h2>`;
  document.getElementById("summary").innerHTML = summaryHtml;
}

function restartExam() {
  currentIndex = 0;
  selectedAnswers = [];
  document.getElementById("exam-container").classList.remove("hidden");
  document.getElementById("summary-container").classList.add("hidden");
  loadQuestions();
}

loadQuestions();
