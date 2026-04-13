let idioms = [];
let questions = [];
let currentQuestion = 0;
let score = 0;

// MODE STATE
let mode = "learning";
let timeLeft = 60;
let timerInterval = null;
let lives = 3; // ❤️ NEW

// ------------------------

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

// Google Analytics
function trackEvent(name, params = {}) {
  if (typeof gtag !== "undefined") {
    gtag("event", name, params);
  }
}

// ------------------------
// LOAD DATA
// ------------------------

async function loadIdioms() {
  const response = await fetch('idioms.json');
  idioms = await response.json();

  showView("homeView");
}

// ------------------------
// VIEW MANAGEMENT
// ------------------------

function showView(view) {
  document.getElementById("homeView").style.display = "none";
  document.getElementById("quizView").style.display = "none";
  document.getElementById("leaderboardView").style.display = "none";
  document.getElementById("endView").style.display = "none";

  document.getElementById(view).style.display = "block";
}

// ------------------------
// RESET
// ------------------------

function resetGame() {
  currentQuestion = 0;
  score = 0;
  timeLeft = 60;
  lives = 3; // ❤️ RESET LIVES

  clearInterval(timerInterval);

  document.getElementById("score").textContent = "";
  document.getElementById("timer").textContent = "";
  document.getElementById("progress").textContent = "";
}

// ------------------------
// START MODES
// ------------------------

function startLearning() {
  mode = "learning";
  resetGame();

  generateQuiz(15);

  trackEvent("quiz_started", {
    mode: "learning",
    total_questions: 15
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

  document.getElementById("nextBtn").style.display = "none";

  startTimer();
  nextArcadeQuestion();
}

// ------------------------
// TIMER
// ------------------------

function startTimer() {
  const timerEl = document.getElementById("timer");
  timerEl.textContent = `⏱ ${timeLeft}s | ❤️ ${lives}`;

  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `⏱ ${timeLeft}s | ❤️ ${lives}`;

    if (timeLeft <= 0) {
      endArcade();
    }
  }, 1000);
}

// ------------------------
// LEARNING MODE
// ------------------------

function generateQuiz(total) {
  questions = shuffle(idioms).slice(0, total);
}

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

  document.getElementById("score").textContent = `Score: ${score}`;

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
      } else {
        lives--; // ❤️ LOSE LIFE
      }

      showFeedback(btn, isCorrect);

      // 💀 END IF OUT OF LIVES
      if (lives <= 0) {
        endArcade();
        return;
      }

      setTimeout(() => {
        nextArcadeQuestion();
      }, 150);
    };

    optionsDiv.appendChild(btn);
  });
}

// ------------------------
// FEEDBACK ANIMATION
// ------------------------

function showFeedback(element, isCorrect) {
  const rect = element.getBoundingClientRect();

  const feedback = document.createElement("div");
  feedback.className = `feedback ${isCorrect ? "correct" : "wrong"}`;
  feedback.textContent = isCorrect ? "✔️" : "❌";

  feedback.style.left = rect.left + rect.width / 2 + "px";
  feedback.style.top = rect.top + rect.height / 2 + "px";

  document.body.appendChild(feedback);

  setTimeout(() => {
    feedback.remove();
  }, 400);
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

  const message = timeLeft > 0 ? "💀 Out of lives!" : "⏱ Time's up!";

  showView("endView");

  document.getElementById("endView").innerHTML = `
    <h2>${message}</h2>
    <h3>Your Score: ${score}</h3>

    <input id="playerTag" maxlength="5" placeholder="Your tag (e.g. PZT)" />
    <br/><br/>
    <button onclick="submitScore(event)">Submit Score</button>
    <button onclick="startArcade()">Play Again</button>
    <button onclick="showView('homeView')">Home</button>

    <div id="leaderboard" style="margin-top:20px;"></div>
  `;
}

// ------------------------
// LEADERBOARD (unchanged)
// ------------------------

async function getTopScores() {
  const snapshot = await db
    .collection("scores")
    .orderBy("score", "desc")
    .limit(10)
    .get();

  return snapshot.docs.map(doc => doc.data());
}

async function openLeaderboard() {
  showView("leaderboardView");
  await renderHomeLeaderboard();
}

async function renderHomeLeaderboard() {
  const scores = await getTopScores();
  const leaderboardDiv = document.getElementById("homeLeaderboard");
  const medals = ["🥇", "🥈", "🥉"];

  if (!scores.length) {
    leaderboardDiv.innerHTML = `
      <p>No scores yet — be the first to set one!</p>
    `;
    return;
  }

  const listItems = scores.map((s, i) => {
    const rankLabel = i < 3 ? medals[i] : "";

    return `
      <li>
        ${rankLabel ? `${rankLabel} ` : ""}${s.tag} — ${s.score}
      </li>
    `;
  }).join("");

  leaderboardDiv.innerHTML = `
    <ol>${listItems}</ol>
  `;
}

async function saveScore(tag, score) {
  try {
    await db.collection("scores").add({
      tag: tag,
      score: score,
      mode: "timed_60",
      timestamp: Date.now()
    });
  } catch (e) {
    console.error("Error saving score:", e);
    throw e;
  }
}

async function submitScore(event) {
  const btn = event.target;

  btn.disabled = true;
  btn.textContent = "Saving...";

  const tagInput = document.getElementById("playerTag");
  let tag = tagInput.value.trim().toUpperCase();

  if (tag.length < 2) {
    alert("Enter at least 2 characters");
    btn.disabled = false;
    btn.textContent = "Submit Score";
    return;
  }

  if (tag.length > 5) {
    tag = tag.slice(0, 5);
  }

  await saveScore(tag, score);

  showLeaderboard(tag, score);
}

async function showLeaderboard(playerTag, playerScore) {
  const scores = await getTopScores();
  const leaderboardDiv = document.getElementById("leaderboard");
  const medals = ["🥇", "🥈", "🥉"];

  if (!scores.length) {
    leaderboardDiv.innerHTML = `
      <h3>🏆 Top 10</h3>
      <p>No scores yet — be the first!</p>
    `;
    return;
  }

  const listItems = scores.map((s, i) => {
    const rankLabel = i < 3 ? medals[i] : "";
    const isPlayer = s.tag === playerTag && s.score === playerScore;

    return `
      <li style="${isPlayer ? "font-weight:bold; color:#2ecc71;" : ""}">
        ${rankLabel ? `${rankLabel} ` : ""}${s.tag} — ${s.score}${isPlayer ? " 👈 YOU" : ""}
      </li>
    `;
  }).join("");

  leaderboardDiv.innerHTML = `
    <h3>🏆 Top 10</h3>
    <ol>${listItems}</ol>
  `;
}

// ------------------------

document.getElementById('nextBtn').onclick = () => {
  currentQuestion++;
  renderQuestion();
};

loadIdioms();
