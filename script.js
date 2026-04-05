let idioms = [];
let questions = [];
let currentQuestion = 0;
let score = 0;

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

async function loadIdioms() {
  const response = await fetch('idioms.json');
  idioms = await response.json();
  generateQuiz(20);
  renderQuestion();
}

function generateQuiz(total) {
  questions = shuffle(idioms).slice(0, total);
}

function renderQuestion() {
  const quiz = document.getElementById('quiz');
  const nextBtn = document.getElementById('nextBtn');
  nextBtn.style.display = 'none';

  if (currentQuestion >= questions.length) {
    const percentage = Math.round((score / questions.length) * 100);
    quiz.innerHTML = `
      <h2>Final Score: ${score}/${questions.length} (${percentage}%)</h2>
      <p>Great work exploring idioms 🌎</p>
    `;
    return;
  }

  const q = questions[currentQuestion];

  const wrongAnswers = shuffle(
    idioms.filter(i => i.meaning !== q.meaning)
  ).slice(0, 3).map(i => i.meaning);

  const options = shuffle([q.meaning, ...wrongAnswers]);

  quiz.innerHTML = `
    <div class="meta">Question ${currentQuestion + 1} of ${questions.length}</div>
    <h2>What does \"${q.idiom}\" mean?</h2>
    <p><em>${q.example}</em></p>
    <div id="options"></div>
    <div id="feedback"></div>
  `;

  const optionsDiv = document.getElementById('options');

  options.forEach(option => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.textContent = option;

    btn.onclick = () => {
      const allButtons = document.querySelectorAll('.option');
      allButtons.forEach(b => b.disabled = true);

      if (option === q.meaning) {
        btn.classList.add('correct');
        score++;
      } else {
        btn.classList.add('wrong');

        allButtons.forEach(button => {
          if (button.textContent === q.meaning) {
            button.classList.add('correct');
          }
        });
      }

      nextBtn.style.display = 'inline-block';
    };

    optionsDiv.appendChild(btn);
  });
loadIdioms();
