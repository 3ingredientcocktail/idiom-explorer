let idioms = [];
let questions = [];
let currentQuestion = 0;
let score = 0;

// NEW STATE
let mode = "learning"; // "learning" or "arcade"
let timeLeft = 60;
let timerInterval = null;

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

// Google Analytics event helper
function trackEvent(name, params = {}) {
  if (typeof gtag !== "undefined") {
    gtag("event", name, params);
  }
}

async function loadIdioms() {
  const response = await fetch('idioms.json');
  idioms = await response.json();

  // Start on home screen instead of auto-start
  showView("homeView");
}

function generateQuiz(total) {
  questions = shuffle(idioms).slice(0, total);
}

// ------------------------
// VIEW MANAGEMENT
// ------------------------

function showView(view) {
  document.getElementById("homeView").style.display = "none";
  document.getElementById("quizView").style.display = "none";
  document.getElementById("endView").style.display = "none";

  document.getElementById(view).style.display = "block";
}

// ------------------------
// MODE STARTERS
// ------------------------

function resetGame() {
  currentQuestion = 0;
  score = 0;
  timeLeft = 60;

  clearInterval(timerInterval);

  document.getElementById("score").textContent = "";
  document.getElementById("timer").textContent = "";
  document.getElementById("progress").textContent = "";
}

function startLearning() {
  mode = "learning";
  resetGame();

  generateQuiz(20);

  trackEvent("quiz_started", {
    mode: "learning",
    total_questions: 20
  });

  showView("quizView");
  renderQuestion();
}

function startArcade() {
  mode = "arcade";
  resetGame();

  trackEvent("quiz_started", {
    mode: "arcade"
  });

  showView("quizView");

  startTimer();
  nextArcadeQuestion();
}

// ------------------------
// TIMER (ARCADE)
// ------------------------

function startTimer() {
  const timerEl = document.getElementById("timer");
  timerEl.textContent = `⏱ ${timeLeft}s`;

  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `⏱ ${timeLeft}s`;

    if (timeLeft <= 0) {
      endArcade();
    }
  }, 1000);
}

// ------------------------
// LEARNING MODE (UNCHANGED CORE)
// ------------------------

function renderQuestion() {
  const quiz = document.getElementById('quiz');
  const nextBtn = document.getElementById('nextBtn');

  nextBtn.style.display = 'none';

  if (currentQuestion >= questions.length) {
    const percentage = Math.round((score / questions.length) * 100);

    trackEvent("quiz_completed", {
      score: score,
      total: questions.length,
      percentage: percentage,
      mode: "learning"
    });

    showView("endView");

    document.getElementById("endView").innerHTML = `
      <h2>Final Score: ${score}/${questions.length} (${percentage}%)</h2>
      <p>Great work exploring idioms! 💪</p>
      <button onclick="startLearning()">Play Again</button>
      <button onclick="showView('homeView')">Home</button>
    `;
    return;
  }

  const q = questions[currentQuestion];

  // UI updates
  document.getElementById("progress").textContent =
    `Q ${currentQuestion + 1}/${questions.length}`;
  document.getElementById("score").textContent =
    `Score: ${score}`;

  const wrongAnswers = shuffle(
    idioms.filter(i => i.meaning !== q.meaning)
  )
    .slice(0, 3)
    .map(i => i.meaning);

  const options = shuffle([q.meaning, ...wrongAnswers]);

  quiz.innerHTML = `
    <h2>What does "${q.idiom}" mean?</h2>
    <p><em>${q.example}</em></p>
    <div id="options"></div>
  `;

  const optionsDiv = document.getElementById('options');

  options.forEach(option => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.textContent = option;

    btn.onclick = () => {
      const allButtons = document.querySelectorAll('.option');
      allButtons.forEach(b => (b.disabled = true));

      const isCorrect = option === q.meaning;

      trackEvent("question_answered", {
        idiom: q.idiom,
        correct: isCorrect,
        difficulty: q.difficulty,
        mode: "learning"
      });

      if (isCorrect) {
        btn.classList.add('correct');
        score++;
      } else {
        btn.classList.add('wrong');

        let missed = JSON.parse(localStorage.getItem("missedIdioms") || "[]");
        missed.push(q.idiom);
        localStorage.setItem("missedIdioms", JSON.stringify(missed));

        allButtons.forEach(button => {
          if (button.textContent === q.meaning) {
            button.classList.add('correct');
          }
        });
      }

      document.getElementById("score").textContent =
        `Score: ${score}`;

      nextBtn.style.display = 'inline-block';
    };

    optionsDiv.appendChild(btn);
  });
}

// ------------------------
// ARCADE MODE
// ------------------------

function nextArcadeQuestion() {
  const q = shuffle(idioms)[0];
  renderArcadeQuestion(q);
}

function renderArcadeQuestion(q) {
  const quiz = document.getElementById("quiz");

  document.getElementById("score").textContent =
    `Score: ${score}`;

  const wrongAnswers = shuffle(
    idioms.filter(i => i.meaning !== q.meaning)
  )
    .slice(0, 3)
    .map(i => i.meaning);

  const options = shuffle([q.meaning, ...wrongAnswers]);

  quiz.innerHTML = `
    <h2>${q.idiom}</h2>
    <p><em>${q.example}</em></p>
    <div id="options"></div>
  `;

  const optionsDiv = document.getElementById("options");

  options.forEach(option => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = option;

    btn.onclick = () => {
      const isCorrect = option === q.meaning;

      trackEvent("question_answered", {
        idiom: q.idiom,
        correct: isCorrect,
        mode: "arcade"
      });

      if (isCorrect) {
        score++;
      }

      nextArcadeQuestion(); // instant loop
    };

    optionsDiv.appendChild(btn);
  });
}

// ------------------------
// END ARCADE
// ------------------------

function endArcade() {
  clearInterval(timerInterval);

  trackEvent("quiz_completed", {
    score: score,
    mode: "arcade",
    duration: 60
  });

  showView("endView");

  document.getElementById("endView").innerHTML = `
    <h2>⏱ Time's up!</h2>
    <h3>Your Score: ${score}</h3>
    <button onclick="startArcade()">Play Again</button>
    <button onclick="showView('homeView')">Home</button>
  `;
}

// ------------------------

document.getElementById('nextBtn').onclick = () => {
  currentQuestion++;
  renderQuestion();
};

loadIdioms();
