const configContainer = document.querySelector(".config-container");
const quizContainer = document.querySelector(".quiz-container");
const answerOptions = quizContainer.querySelector(".answer-options");
const nextQuestionBtn = quizContainer.querySelector(".next-question-btn");
const questionStatus = quizContainer.querySelector(".question-status");
const timerDisplay = quizContainer.querySelector(".timer-duration");
const resultContainer = document.querySelector(".result-container");
//above are different references 
const limit = 60; //time limit for each question is 60 seconds.
let currentTime = limit; 
let timer = null;
let quizCategory = "Chemistry";
let numberquestions = 15; //default settings chemistry and 15 
let current = null;
const questionsIndexHistory = [];
let correctamount = 0; 
let disableSelection = false; //user can not answer if time is up for each question

// toggle button 
const darkToggleBtn = document.getElementById("darkModeToggle");
darkToggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

const result = () => {
  clearInterval(timer);
  document.querySelector(".quiz-popup").classList.remove("active");
  document.querySelector(".result-popup").classList.add("active"); // for results, results screen show

  const resultText = `<b>${correctamount}</b> out of <b>${numberquestions}</b> questions correct`;
  resultContainer.querySelector(".result-message").innerHTML = resultText;
};

const resetTimer = () => { // timer reset 
  clearInterval(timer);
  currentTime = limit; //set to default 
  timerDisplay.textContent = `${currentTime}s`;
};

const startTimer = () => { // timer is started when a new question above 
  timer = setInterval(() => {
    currentTime--; // as seconds go on, time is less 
    timerDisplay.textContent = `${currentTime}s`;

    if (currentTime <= 0) { //handled logic once timer goes to zero 
      clearInterval(timer);
      disableSelection = true; //user can not answer question
      nextQuestionBtn.style.visibility = "visible";
      quizContainer.querySelector(".quiz-timer").style.background = "#c31402";
      highlightCorrectAnswer(); //correct answer shows 
      answerOptions.querySelectorAll(".answer-option").forEach(option => option.style.pointerEvents = "none");
    }
  }, 1000);
};

const getCategoryKey = (name) => { // used for normalized categories name 
  return name.trim().toLowerCase().replace(/[^a-z]/g, ""); //Important because it matches keys in my questions.js file and converts string to lower case and removes space and this is done so questions can be assesed . 
};

const getRandomQuestion = () => { //random question from category selected 
  const categoryKey = getCategoryKey(quizCategory);
  const categoryQuestions = questions[categoryKey] || [];
// once number of questions are over result shown and quiz is over 
  if (questionsIndexHistory.length >= Math.min(numberquestions, categoryQuestions.length)) {
    return result();
  }
// questions are not shown twice filtered out 
  const availableQuestions = categoryQuestions.filter((_, i) => !questionsIndexHistory.includes(i));
  const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
// random question order above
  questionsIndexHistory.push(categoryQuestions.indexOf(randomQuestion));
  return randomQuestion; //index of questions are tracked 
};

const highlightCorrectAnswer = () => {
  const correctOption = answerOptions.querySelectorAll(".answer-option")[current.correctAnswer];
  correctOption.classList.add("correct");
  correctOption.insertAdjacentHTML("beforeend", `<span class="material-symbols-rounded"> check_circle </span>`);
};

const handleAnswer = (option, answerIndex) => {
  if (disableSelection) return;

  clearInterval(timer); // timer stopped if you can't choose an answer choice.
  disableSelection = true;

  const isCorrect = current.correctAnswer === answerIndex; //if the answer choice is correct is checked 
  option.classList.add(isCorrect ? "correct" : "incorrect");
  if (!isCorrect) highlightCorrectAnswer();
  else correctamount++; // if answer selected is correct add to number of correct answered questions

  const iconHTML = `<span class="material-symbols-rounded">${isCorrect ? "check_circle" : "cancel"}</span>`;
  option.insertAdjacentHTML("beforeend", iconHTML);
// once user selects answer option next button is shown
  answerOptions.querySelectorAll(".answer-option").forEach(option => option.style.pointerEvents = "none");
  nextQuestionBtn.style.visibility = "visible";
};

const renderQuestion = () => { // new question 
  current = getRandomQuestion();
  if (!current) return;
  disableSelection = false;

  resetTimer(); // timer starts again 
  startTimer();

  nextQuestionBtn.style.visibility = "hidden"; //before user answers next button does not show
  quizContainer.querySelector(".quiz-timer").style.background = "#32313C";
  quizContainer.querySelector(".question-text").textContent = current.question;
  questionStatus.innerHTML = `<b>${questionsIndexHistory.length}</b> of <b>${numberquestions}</b> Questions`;
  //shows how many questions have been answered.
  answerOptions.innerHTML = "";
// for question answer choices go through loop
  current.options.forEach((option, index) => {
    const li = document.createElement("li");
    li.classList.add("answer-option");
    li.textContent = option;
    answerOptions.append(li);
    li.addEventListener("click", () => handleAnswer(li, index));
  });
};

const startQuiz = () => {
  document.querySelector(".config-popup").classList.remove("active");
  document.querySelector(".quiz-popup").classList.add("active");
// quiz screen pops up 
  quizCategory = configContainer.querySelector(".category-option.active").textContent;
  const difficultyBtn = configContainer.querySelector(".question-option.active");
  //the difficulty the user wants is obtained
  
  numberquestions = parseInt(difficultyBtn.getAttribute("data-questions"));

  renderQuestion(); //quiz starts 
};

configContainer.querySelectorAll(".category-option, .question-option").forEach(option => {
  option.addEventListener("click", () => {
    option.parentNode.querySelector(".active")?.classList.remove("active");
    option.classList.add("active");
  }); // active class is the one user clicked on 
});

const resetQuiz = () => { // reset quiz 
  resetTimer();
  correctamount = 0; //correct amount questions answered reset
  questionsIndexHistory.length = 0; 
  document.querySelector(".config-popup").classList.add("active");
  document.querySelector(".result-popup").classList.remove("active");
};

nextQuestionBtn.addEventListener("click", renderQuestion);

resultContainer.querySelector(".try-again-btn").addEventListener("click", resetQuiz);
//user can go to home page when try again button clicked 
configContainer.querySelector(".start-quiz-btn").addEventListener("click", startQuiz);
// once start button clicked quiz starts
