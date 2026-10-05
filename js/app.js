console.log('script.js підключено: Робота з Fetch API');

const API_URL = 'https://opentdb.com/api.php?amount=10&type=multiple';

const startBtn = document.querySelector('#start-btn');
const loadingText = document.querySelector('#loading-text');
const errorMessage = document.querySelector('#error-message');
const quizContent = document.querySelector('#quiz-content');

const form = document.querySelector('#quiz-form');
const questionText = document.querySelector('#question-text');
const optionsContainer = document.querySelector('#options-container');
const submitBtn = document.querySelector('#submit-btn');
const nextBtn = document.querySelector('#next-btn');
const resultMessage = document.querySelector('#result-message');
const questionCounter = document.querySelector('#question-counter');
const progressBarFill = document.querySelector('#progress-bar-fill');

let quizQuestions = [];
let currentQuestionIndex = 0;
let correctCount = 0;

function decodeHTML(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}
async function loadData() {
  // Крок 7: Показати стан завантаження
  startBtn.style.display = 'none';
  errorMessage.style.display = 'none';
  loadingText.style.display = 'block';
  quizContent.style.display = 'none';

  try {
    const response = await fetch(API_URL);

    
    if (!response.ok) {
      throw new Error(`Помилка сервера: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
       throw new Error('Немає питань для завантаження.');
    }

    
    quizQuestions = data.results.map(item => {
      const allOptions = [...item.incorrect_answers, item.correct_answer];
      allOptions.sort(() => Math.random() - 0.5);

      return {
        question: decodeHTML(item.question), 
        options: allOptions.map(decodeHTML),
        answer: decodeHTML(item.correct_answer)
      };
    });

    currentQuestionIndex = 0;
    correctCount = 0;
    quizContent.style.display = 'block'; 
    renderQuestion();

  } catch (error) {
    console.error('Деталі помилки:', error);
    errorMessage.textContent = 'Не вдалося завантажити питання. Перевірте з\'єднання або спробуйте пізніше.';
    errorMessage.style.display = 'block';
    startBtn.style.display = 'inline-block'; 
  } finally {
    loadingText.style.display = 'none';
  }
}

// Функція рендеру поточного питання (Безпечна версія без innerHTML для опцій)
function renderQuestion() {
  const currentData = quizQuestions[currentQuestionIndex];
  
  questionText.textContent = currentData.question;
  questionCounter.textContent = `Питання ${currentQuestionIndex + 1} з ${quizQuestions.length}`;
  progressBarFill.style.width = `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%`;
  
  optionsContainer.innerHTML = '';
  resultMessage.style.display = 'none';
  submitBtn.style.display = 'inline-block';
  nextBtn.style.display = 'none';

  currentData.options.forEach((option, index) => {
    const div = document.createElement('div');
    div.style.marginBottom = '10px';
    
    // БЕЗПЕЧНЕ СТВОРЕННЯ INPUT (Без innerHTML, щоб лапки не ламали value)
    const input = document.createElement('input');
    input.type = 'radio';
    input.id = `option-${index}`;
    input.name = 'quiz-option';
    input.value = option; // Присвоєння через властивість захищає від зламу розмітки
    input.required = true;
    
    // БЕЗПЕЧНЕ СТВОРЕННЯ LABEL
    const label = document.createElement('label');
    label.htmlFor = `option-${index}`;
    label.textContent = option; // textContent екранує будь-які HTML-теги та спецсимволи
    
    // Додаємо згенеровані елементи у div, а div — у контейнер
    div.append(input, label);
    optionsContainer.append(div);
  });
}

form.addEventListener('submit', (event) => {
  event.preventDefault(); 
  const selectedOption = document.querySelector('input[name="quiz-option"]:checked').value;
  const correctAnswer = quizQuestions[currentQuestionIndex].answer;

  resultMessage.style.display = 'block';
  if (selectedOption === correctAnswer) {
    resultMessage.textContent = 'Правильно ✔';
    resultMessage.style.color = 'green';
    correctCount++;
  } else {
    resultMessage.textContent = `Неправильно ✘ (Правильна: ${correctAnswer})`;
    resultMessage.style.color = 'red';
  }

  submitBtn.style.display = 'none';
  nextBtn.style.display = 'inline-block';
});

nextBtn.addEventListener('click', () => {
  currentQuestionIndex++;

  if (currentQuestionIndex < quizQuestions.length) {
    form.reset(); 
    renderQuestion();
  } else {
    questionText.textContent = 'Вікторина завершена!';
    optionsContainer.innerHTML = `<h3>Твій результат: ${correctCount} з ${quizQuestions.length}</h3>`;
    submitBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    resultMessage.style.display = 'none';
    
    startBtn.textContent = 'Почати нову гру';
    startBtn.style.display = 'inline-block';
  }
});

startBtn.addEventListener('click', loadData);