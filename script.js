let idioms = [];
let score = 0;

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

async function loadIdioms() {
  const response = await fetch('idioms.json');
  idioms = await response.json();
  generateQuiz(5);
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
    quiz.innerHTML = `<h2>Final Score: ${score}/${questions.length}</h2>`;
    return;
  }

  const q = questions[currentQuestion];
  const wrongAnswers = shuffle(
    idioms.filter(i => i.meaning !== q.meaning)
  ).slice(0, 3).map(i => i.meaning);

  const options = shuffle([q.meaning, ...wrongAnswers]);

  quiz.innerHTML = `
    <p><strong>Difficulty:</strong> ${q.difficulty} | <strong>Category:</strong> ${q.category}</p>
    <h2>What does "${q.idiom}" mean?</h2>
    <div id="options"></div>
    <div id="feedback"></div>
  `;

  const optionsDiv = document.getElementById('options');
  const feedback = document.getElementById('feedback');

  options.forEach(option => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.textContent = option;
    btn.onclick = () => {
      document.querySelectorAll('.option').forEach(b => b.disabled = true);

      if (option === q.meaning) {
        score++;
        feedback.innerHTML = '<p><strong>Correct!</strong></p>';
      } else {
        feedback.innerHTML = `<p><strong>Correct:</strong> ${q.meaning}</p>`;
      }

      nextBtn.style.display = 'inline-block';
    };
    optionsDiv.appendChild(btn);
  });
}

document.getElementById('nextBtn').onclick = () => {
  currentQuestion++;
  renderQuestion();
};

loadIdioms();
