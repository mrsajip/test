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
