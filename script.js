document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prev-slide-btn');
    const nextBtn = document.getElementById('next-slide-btn');
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const nextQuestionBtn = document.getElementById('next-question-btn');
    const restartPresentationBtn = document.getElementById('restart-presentation-btn');

    const questionTextEl = document.getElementById('question-text');
    const optionsListEl = document.getElementById('options-list');
    const feedbackAreaEl = document.getElementById('feedback-area');
    const scoreEl = document.getElementById('score');
    const totalQuestionsEl = document.getElementById('total-questions');
    const resultMessageEl = document.getElementById('result-message');
    
    const navButtonsContainer = document.getElementById('navigation-buttons');

    // Interaktywne elementy JS na slajdach
    const cookieNameInput = document.getElementById('cookieNameInput');
    const cookieValueInput = document.getElementById('cookieValueInput');
    const setCookieFeedbackEl = document.getElementById('setCookieFeedback');
    const readDeleteCookieFeedbackEl = document.getElementById('readDeleteCookieFeedback');


    let currentSlideIndex = 0;
    let currentQuestionIndex = 0;
    let score = 0;
    let questionsAnswered = false;

    const quizQuestions = [
        {
            question: "Czym są pliki cookies?",
            options: [
                "Małymi programami instalowanymi na komputerze.",
                "Małymi plikami tekstowymi przechowywanymi przez przeglądarkę.",
                "Rodzajem wirusa internetowego.",
                "Obrazkami wyświetlanymi na stronach."
            ],
            correctAnswer: 1
        },
        {
            question: "Które cookies są usuwane po zamknięciu przeglądarki?",
            options: [
                "Cookies trwałe (Persistent Cookies)",
                "Wszystkie cookies",
                "Cookies sesyjne (Session Cookies)",
                "Cookies stron trzecich (Third-party Cookies)"
            ],
            correctAnswer: 2
        },
        {
            question: "Cookies ustawiane przez domenę, którą aktualnie odwiedzasz, to:",
            options: [
                "Cookies stron trzecich (Third-party Cookies)",
                "Super Cookies",
                "Cookies własne (First-party Cookies)",
                "Mega Cookies"
            ],
            correctAnswer: 2
        },
        {
            question: "Jak w JavaScript uzyskać dostęp do wszystkich cookies zapisanych dla danej strony?",
            options: [
                "window.cookies",
                "navigator.getCookies()",
                "document.cookie",
                "localStorage.getItem('cookies')"
            ],
            correctAnswer: 2
        },
        {
            question: "Aby usunąć cookie w JavaScript, należy:",
            options: [
                "Użyć funkcji `document.deleteCookie('nazwa')`.",
                "Ustawić jego wartość na `null`.",
                "Ustawić jego datę wygaśnięcia na datę w przeszłości.",
                "Wyczyścić cały `localStorage`."
            ],
            correctAnswer: 2
        },
        {
            question: "Który atrybut cookie zapobiega dostępowi do niego przez JavaScript po stronie klienta?",
            options: [
                "Secure",
                "HttpOnly",
                "SameSite",
                "Domain"
            ],
            correctAnswer: 1
        },
        {
            question: "RODO (GDPR) wymaga od stron internetowych:",
            options: [
                "Blokowania wszystkich cookies domyślnie.",
                "Informowania użytkowników o używaniu cookies i uzyskiwania zgody na te niebędące niezbędnymi.",
                "Używania tylko cookies sesyjnych.",
                "Szyfrowania wszystkich danych w cookies."
            ],
            correctAnswer: 1
        }
    ];

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        currentSlideIndex = index;
        updateNavButtons();

        // Ukryj/pokaż przyciski nawigacyjne w zależności od slajdu
        if (slides[index].id === 'quiz-container' || slides[index].id === 'quiz-results-slide') {
            navButtonsContainer.style.display = 'none';
        } else {
            navButtonsContainer.style.display = 'block';
        }
    }

    function updateNavButtons() {
        prevBtn.disabled = currentSlideIndex === 0;
        // Następny przycisk jest wyłączany na ostatnim slajdzie *przed* quizem (quiz-start-slide)
        // lub gdy jesteśmy na ostatnim slajdzie prezentacji
        const lastContentSlideIndex = Array.from(slides).findIndex(slide => slide.id === 'quiz-start-slide');
        nextBtn.disabled = currentSlideIndex === lastContentSlideIndex || currentSlideIndex === slides.length -1 ;
    }

    function nextSlide() {
        if (currentSlideIndex < slides.length - 1) {
            // Sprawdzamy, czy następny slajd to nie jest quiz, który powinien być uruchomiony przez przycisk
            const nextSlideId = slides[currentSlideIndex + 1].id;
            if (nextSlideId === 'quiz-container' || nextSlideId === 'quiz-results-slide') {
                // Nie przechodź automatycznie do quizu/wyników przez 'Następny'
                // Zamiast tego, upewnij się, że użytkownik kliknął 'Zacznij Quiz'
                if (slides[currentSlideIndex].id === 'quiz-start-slide'){
                    // Nic nie rób, czekaj na kliknięcie start-quiz-btn
                } else {
                     showSlide(currentSlideIndex + 1);
                }
            } else {
                showSlide(currentSlideIndex + 1);
            }
        }
    }

    function prevSlide() {
        if (currentSlideIndex > 0) {
            showSlide(currentSlideIndex - 1);
        }
    }

    function startQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        questionsAnswered = false;
        feedbackAreaEl.textContent = ''; // Wyczyść feedback
        const quizSlideIndex = Array.from(slides).findIndex(slide => slide.id === 'quiz-container');
        showSlide(quizSlideIndex);
        loadQuestion();
    }

    function loadQuestion() {
        if (currentQuestionIndex < quizQuestions.length) {
            const questionData = quizQuestions[currentQuestionIndex];
            questionTextEl.textContent = `${currentQuestionIndex + 1}. ${questionData.question}`;
            optionsListEl.innerHTML = ''; // Wyczyść poprzednie opcje
            feedbackAreaEl.textContent = '';
            nextQuestionBtn.style.display = 'none';
            questionsAnswered = false;

            questionData.options.forEach((option, index) => {
                const li = document.createElement('li');
                li.textContent = option;
                li.addEventListener('click', () => selectAnswer(index, questionData.correctAnswer, li));
                optionsListEl.appendChild(li);
            });
        } else {
            showResults();
        }
    }

    function selectAnswer(selectedIndex, correctIndex, selectedLi) {
        if (questionsAnswered) return; // Zapobiegaj wielokrotnemu odpowiadaniu
        questionsAnswered = true;

        // Dezaktywuj wszystkie opcje
        Array.from(optionsListEl.children).forEach(li => li.classList.add('disabled'));

        if (selectedIndex === correctIndex) {
            score++;
            selectedLi.classList.add('correct');
            feedbackAreaEl.textContent = 'Poprawna odpowiedź!';
            feedbackAreaEl.style.color = 'green';
        } else {
            selectedLi.classList.add('incorrect');
            optionsListEl.children[correctIndex].classList.add('correct'); // Pokaż poprawną
            feedbackAreaEl.textContent = 'Niestety, zła odpowiedź.';
            feedbackAreaEl.style.color = 'red';
        }
        nextQuestionBtn.style.display = 'inline-block';
        if (currentQuestionIndex === quizQuestions.length - 1) {
            nextQuestionBtn.textContent = 'Zobacz wyniki';
        } else {
            nextQuestionBtn.textContent = 'Następne pytanie';
        }
    }

    function showResults() {
        const resultsSlideIndex = Array.from(slides).findIndex(slide => slide.id === 'quiz-results-slide');
        showSlide(resultsSlideIndex);
        scoreEl.textContent = score;
        totalQuestionsEl.textContent = quizQuestions.length;

        let message = "";
        const percentage = (score / quizQuestions.length) * 100;
        if (percentage >= 80) {
            message = "Świetnie! Znasz się na cookies!";
        } else if (percentage >= 50) {
            message = "Całkiem dobrze, ale jest jeszcze pole do poprawy.";
        } else {
            message = "Warto powtórzyć materiał. Spróbuj jeszcze raz!";
        }
        resultMessageEl.textContent = message;
    }

    function restartPresentation() {
        showSlide(0);
        feedbackAreaEl.textContent = '';
        // Można też zresetować stan quizu, jeśli użytkownik wróci
        currentQuestionIndex = 0;
        score = 0;
    }

    // --- Interaktywne funkcje dla slajdów z JS ---
    window.setExampleCookie = function() {
        const name = cookieNameInput.value.trim();
        const value = cookieValueInput.value.trim();
        if (name && value) {
            document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=3600`; // Wygasa po godzinie
            setCookieFeedbackEl.textContent = `Cookie "${name}" ustawione!`;
            setCookieFeedbackEl.style.color = 'green';
        } else {
            setCookieFeedbackEl.textContent = 'Nazwa i wartość nie mogą być puste.';
            setCookieFeedbackEl.style.color = 'red';
        }
    }
    
    function getCookie(name) {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [cookieName, cookieValue] = cookie.trim().split('=');
            if (decodeURIComponent(cookieName) === name) {
                return decodeURIComponent(cookieValue);
            }
        }
        return null;
    }

    window.readExampleCookie = function() {
        const name = cookieNameInput.value.trim() || "mojeCookie"; // Domyślnie czytaj 'mojeCookie'
        const value = getCookie(name);
        if (value !== null) {
            readDeleteCookieFeedbackEl.textContent = `Wartość cookie "${name}": ${value}`;
            readDeleteCookieFeedbackEl.style.color = 'blue';
        } else {
            readDeleteCookieFeedbackEl.textContent = `Cookie "${name}" nie znaleziono.`;
            readDeleteCookieFeedbackEl.style.color = 'orange';
        }
    }

    window.deleteExampleCookie = function() {
        const name = cookieNameInput.value.trim() || "mojeCookie";
        document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        readDeleteCookieFeedbackEl.textContent = `Cookie "${name}" usunięte (jeśli istniało).`;
        readDeleteCookieFeedbackEl.style.color = 'green';
    }


    // Inicjalizacja
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);
    startQuizBtn.addEventListener('click', startQuiz);
    nextQuestionBtn.addEventListener('click', () => {
        currentQuestionIndex++;
        loadQuestion();
    });
    restartPresentationBtn.addEventListener('click', restartPresentation);

    showSlide(0); // Pokaż pierwszy slajd na starcie
});