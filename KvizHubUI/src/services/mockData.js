// Mock kategorije kvizova
export const mockCategories = [
  "Programiranje",
  "Matematika",
  "Istorija",
  "Geografija",
  "Nauka",
  "Sport",
  "Umetnost",
  "Literatura",
];

// Mock kvizovi
export const mockQuizzes = [
  {
    id: 1,
    title: "Osnove JavaScript-a",
    description: "Test osnovnih znanja JavaScript programskog jezika",
    category: "Programiranje",
    difficulty: "Početnik",
    timeLimit: 15, // minuti
    questionCount: 10,
    averageScore: 78,
    attemptsCount: 245,
  },
  {
    id: 2,
    title: "Svetska istorija",
    description: "Kviz o važnim događajima iz svetske istorije",
    category: "Istorija",
    difficulty: "Srednji",
    timeLimit: 20,
    questionCount: 15,
    averageScore: 65,
    attemptsCount: 189,
  },
  {
    id: 3,
    title: "Osnove React-a",
    description:
      "Test znanja React biblioteke za razvoj korisničkih interfejsa",
    category: "Programiranje",
    difficulty: "Napredni",
    timeLimit: 25,
    questionCount: 12,
    averageScore: 82,
    attemptsCount: 156,
  },
  {
    id: 4,
    title: "Evropska geografija",
    description:
      "Kviz o zemljama, glavnim gradovima i geografskim karakteristikama Evrope",
    category: "Geografija",
    difficulty: "Srednji",
    timeLimit: 18,
    questionCount: 20,
    averageScore: 71,
    attemptsCount: 298,
  },
  {
    id: 5,
    title: "Osnove fizike",
    description:
      "Test osnovnih koncepata iz fizike - mehanika, termodinamika, elektromagnetizam",
    category: "Nauka",
    difficulty: "Početnik",
    timeLimit: 30,
    questionCount: 25,
    averageScore: 69,
    attemptsCount: 134,
  },
  {
    id: 6,
    title: "Fudbalske legende",
    description: "Kviz o najpoznatijim fudbalerima i klubovima kroz istoriju",
    category: "Sport",
    difficulty: "Početnik",
    timeLimit: 12,
    questionCount: 8,
    averageScore: 85,
    attemptsCount: 412,
  },
];

// Mock pitanja za kvizove
export const mockQuestions = [
  // Pitanja za JavaScript kviz (id: 1)
  {
    id: 1,
    quizId: 1,
    type: "SingleChoice",
    text: "Koja je ispravna sintaksa za deklarisanje varijable u JavaScript-u?",
    options: [
      { id: 1, text: "var myVar = 5;", isCorrect: true },
      { id: 2, text: "variable myVar = 5;", isCorrect: false },
      { id: 3, text: "v myVar = 5;", isCorrect: false },
      { id: 4, text: "declare myVar = 5;", isCorrect: false },
    ],
  },
  {
    id: 2,
    quizId: 1,
    type: "MultipleChoice",
    text: "Koji od sledećih su ispravni načini da deklariše funkciju u JavaScript-u?",
    options: [
      { id: 5, text: "function myFunction() {}", isCorrect: true },
      { id: 6, text: "const myFunction = function() {}", isCorrect: true },
      { id: 7, text: "const myFunction = () => {}", isCorrect: true },
      { id: 8, text: "def myFunction() {}", isCorrect: false },
    ],
  },
  {
    id: 3,
    quizId: 1,
    type: "TrueFalse",
    text: "JavaScript je striktno tipiziran programski jezik.",
    options: [
      { id: 9, text: "Tačno", isCorrect: false },
      { id: 10, text: "Netačno", isCorrect: true },
    ],
  },
  {
    id: 4,
    quizId: 1,
    type: "FillInBlank",
    text: "Metoda _____ se koristi za dodavanje elementa na kraj niza u JavaScript-u.",
    correctAnswer: "push",
  },
  {
    id: 5,
    quizId: 1,
    type: "SingleChoice",
    text: "Šta će biti rezultat: console.log(typeof null)?",
    options: [
      { id: 11, text: "null", isCorrect: false },
      { id: 12, text: "undefined", isCorrect: false },
      { id: 13, text: "object", isCorrect: true },
      { id: 14, text: "boolean", isCorrect: false },
    ],
  },

  // Pitanja za Istorija kviz (id: 2)
  {
    id: 6,
    quizId: 2,
    type: "SingleChoice",
    text: "U kojoj godini je počeo Prvi svetski rat?",
    options: [
      { id: 15, text: "1912", isCorrect: false },
      { id: 16, text: "1914", isCorrect: true },
      { id: 17, text: "1916", isCorrect: false },
      { id: 18, text: "1918", isCorrect: false },
    ],
  },
  {
    id: 7,
    quizId: 2,
    type: "MultipleChoice",
    text: "Koje su bile glavne sile Osovine tokom Drugog svetskog rata?",
    options: [
      { id: 19, text: "Nemačka", isCorrect: true },
      { id: 20, text: "Italija", isCorrect: true },
      { id: 21, text: "Japan", isCorrect: true },
      { id: 22, text: "Francuska", isCorrect: false },
    ],
  },
  {
    id: 8,
    quizId: 2,
    type: "FillInBlank",
    text: "Napoleon je poražen u bici kod _____ 1815. godine.",
    correctAnswer: "Waterloo",
  },

  // Pitanja za React kviz (id: 3)
  {
    id: 9,
    quizId: 3,
    type: "SingleChoice",
    text: "Šta je JSX u React-u?",
    options: [
      { id: 23, text: "JavaScript ekstenzija", isCorrect: false },
      { id: 24, text: "Sintaksna ekstenzija za JavaScript", isCorrect: true },
      { id: 25, text: "Novi programski jezik", isCorrect: false },
      { id: 26, text: "CSS framework", isCorrect: false },
    ],
  },
  {
    id: 10,
    quizId: 3,
    type: "TrueFalse",
    text: "React komponente mogu vratiti samo jedan root element.",
    options: [
      { id: 27, text: "Tačno", isCorrect: false },
      { id: 28, text: "Netačno", isCorrect: true },
    ],
  },
  {
    id: 11,
    quizId: 3,
    type: "MultipleChoice",
    text: "Koji React Hook-ovi se koriste za upravljanje stanjem komponente?",
    options: [
      { id: 29, text: "useState", isCorrect: true },
      { id: 30, text: "useReducer", isCorrect: true },
      { id: 31, text: "useEffect", isCorrect: false },
      { id: 32, text: "useContext", isCorrect: false },
    ],
  },

  // Pitanja za Geografija kviz (id: 4)
  {
    id: 12,
    quizId: 4,
    type: "SingleChoice",
    text: "Koji je glavni grad Nemačke?",
    options: [
      { id: 33, text: "Minhen", isCorrect: false },
      { id: 34, text: "Berlin", isCorrect: true },
      { id: 35, text: "Hamburg", isCorrect: false },
      { id: 36, text: "Frankfurt", isCorrect: false },
    ],
  },
  {
    id: 13,
    quizId: 4,
    type: "FillInBlank",
    text: "Najduža reka u Evropi je _____.",
    correctAnswer: "Volga",
  },
  {
    id: 14,
    quizId: 4,
    type: "MultipleChoice",
    text: "Koje zemlje graniče sa Francuskom?",
    options: [
      { id: 37, text: "Španija", isCorrect: true },
      { id: 38, text: "Italija", isCorrect: true },
      { id: 39, text: "Nemačka", isCorrect: true },
      { id: 40, text: "Poljska", isCorrect: false },
    ],
  },

  // Pitanja za Fizika kviz (id: 5)
  {
    id: 15,
    quizId: 5,
    type: "SingleChoice",
    text: "Kolika je brzina svetlosti u vakuumu?",
    options: [
      { id: 41, text: "300,000 km/s", isCorrect: false },
      { id: 42, text: "299,792,458 m/s", isCorrect: true },
      { id: 43, text: "150,000 km/s", isCorrect: false },
      { id: 44, text: "500,000 km/s", isCorrect: false },
    ],
  },
  {
    id: 16,
    quizId: 5,
    type: "TrueFalse",
    text: "Newtonov prvi zakon se naziva i zakon inercije.",
    options: [
      { id: 45, text: "Tačno", isCorrect: true },
      { id: 46, text: "Netačno", isCorrect: false },
    ],
  },
  {
    id: 17,
    quizId: 5,
    type: "FillInBlank",
    text: "Formula za kinetičku energiju je KE = 1/2 * m * _____.",
    correctAnswer: "v²",
  },

  // Pitanja za Sport kviz (id: 6)
  {
    id: 18,
    quizId: 6,
    type: "SingleChoice",
    text: "Ko je rekorder po broju osvojenih Zlatnih lopti?",
    options: [
      { id: 47, text: "Cristiano Ronaldo", isCorrect: false },
      { id: 48, text: "Lionel Messi", isCorrect: true },
      { id: 49, text: "Pelé", isCorrect: false },
      { id: 50, text: "Maradona", isCorrect: false },
    ],
  },
  {
    id: 19,
    quizId: 6,
    type: "MultipleChoice",
    text: "Koji klubovi su poznati kao 'El Clasico' rivali?",
    options: [
      { id: 51, text: "Real Madrid", isCorrect: true },
      { id: 52, text: "Barcelona", isCorrect: true },
      { id: 53, text: "Atletico Madrid", isCorrect: false },
      { id: 54, text: "Valencia", isCorrect: false },
    ],
  },
  {
    id: 20,
    quizId: 6,
    type: "FillInBlank",
    text: "Svetsko prvenstvo u fudbalu se održava svake _____ godine.",
    correctAnswer: "četiri",
  },
];

// Mock korisničkih rezultata
export const mockUserResults = [
  {
    id: 1,
    quizId: 1,
    quizTitle: "Osnove JavaScript-a",
    quizCategory: "Programiranje",
    dateTaken: "2025-09-08T14:30:00.000Z",
    score: 85,
    totalQuestions: 10,
    correctAnswers: 8,
    timeSpent: 720, // sekunde (12 minuta)
    timeLimit: 900, // 15 minuta
    percentage: 80,
    rank: 12,
    totalParticipants: 245,
  },
  {
    id: 2,
    quizId: 2,
    quizTitle: "Svetska istorija",
    quizCategory: "Istorija",
    dateTaken: "2025-09-07T16:45:00.000Z",
    score: 92,
    totalQuestions: 15,
    correctAnswers: 12,
    timeSpent: 1080, // 18 minuta
    timeLimit: 1200, // 20 minuta
    percentage: 80,
    rank: 8,
    totalParticipants: 189,
  },
  {
    id: 3,
    quizId: 1,
    quizTitle: "Osnove JavaScript-a",
    quizCategory: "Programiranje",
    dateTaken: "2025-09-05T10:15:00.000Z",
    score: 76,
    totalQuestions: 10,
    correctAnswers: 7,
    timeSpent: 850, // 14 min 10 sec
    timeLimit: 900,
    percentage: 70,
    rank: 28,
    totalParticipants: 240,
  },
  {
    id: 4,
    quizId: 4,
    quizTitle: "Evropska geografija",
    quizCategory: "Geografija",
    dateTaken: "2025-09-04T19:20:00.000Z",
    score: 88,
    totalQuestions: 20,
    correctAnswers: 16,
    timeSpent: 1050, // 17 min 30 sec
    timeLimit: 1080, // 18 minuta
    percentage: 80,
    rank: 15,
    totalParticipants: 298,
  },
  {
    id: 5,
    quizId: 6,
    quizTitle: "Fudbalske legende",
    quizCategory: "Sport",
    dateTaken: "2025-09-03T20:10:00.000Z",
    score: 95,
    totalQuestions: 8,
    correctAnswers: 8,
    timeSpent: 480, // 8 minuta
    timeLimit: 720, // 12 minuta
    percentage: 100,
    rank: 3,
    totalParticipants: 412,
  },
  {
    id: 6,
    quizId: 5,
    quizTitle: "Osnove fizike",
    quizCategory: "Nauka",
    dateTaken: "2025-09-01T11:30:00.000Z",
    score: 72,
    totalQuestions: 25,
    correctAnswers: 18,
    timeSpent: 1650, // 27 min 30 sec
    timeLimit: 1800, // 30 minuta
    percentage: 72,
    rank: 45,
    totalParticipants: 134,
  },
];

// Mock detaljnih rezultata za pojedinačni kviz
export const mockDetailedResults = {
  1: {
    // result ID
    resultId: 1,
    quizId: 1,
    quizTitle: "Osnove JavaScript-a",
    score: 30,
    totalQuestions: 5,
    correctAnswers: 3,
    timeSpent: 720, // 12 minuta u sekundama
    dateTaken: "2024-01-15T10:30:00Z",
    questions: [
      {
        id: 1,
        text: "Koja je ispravna sintaksa za deklarisanje varijable u JavaScript-u?",
        type: "SingleChoice",
        userAnswer: {
          selectedOption: "var myVar = 5;",
          selectedOptionIds: ["option1"],
        },
        correctAnswer: {
          selectedOption: "var myVar = 5;",
          selectedOptionIds: ["option1"],
        },
        isCorrect: true,
        explanation:
          "var, let i const su validne ključne reči za deklarisanje varijabli u JavaScript-u.",
      },
      {
        id: 2,
        text: "Koji od sledećih su ispravni načini da deklariše funkciju u JavaScript-u?",
        type: "MultipleChoice",
        userAnswer: {
          selectedOptions: [
            "function myFunction() {}",
            "const myFunction = function() {}",
          ],
          selectedOptionIds: ["option1", "option2"],
        },
        correctAnswer: {
          selectedOptions: [
            "function myFunction() {}",
            "const myFunction = function() {}",
            "const myFunction = () => {}",
          ],
          selectedOptionIds: ["option1", "option2", "option3"],
        },
        isCorrect: false,
        explanation:
          "Funkcije u JavaScript-u se mogu deklarisati na više načina: function declaration, function expression i arrow functions.",
      },
      {
        id: 3,
        text: "JavaScript je striktno tipiziran programski jezik.",
        type: "TrueFalse",
        userAnswer: {
          selectedOptionIds: ["false"],
        },
        correctAnswer: {
          selectedOptionIds: ["false"],
        },
        isCorrect: true,
        explanation:
          "JavaScript je dinamički tipiziran jezik, što znači da se tipovi varijabli mogu menjati tokom izvršavanja.",
      },
      {
        id: 4,
        text: "Metoda _____ se koristi za dodavanje elementa na kraj niza u JavaScript-u.",
        type: "FillInBlank",
        userAnswer: {
          submittedText: "push",
        },
        correctAnswer: {
          submittedText: "push",
        },
        isCorrect: true,
        explanation:
          "Metoda push() dodaje jedan ili više elemenata na kraj niza i vraća novu dužinu niza.",
      },
      {
        id: 5,
        text: "Šta će biti rezultat: console.log(typeof null)?",
        type: "SingleChoice",
        userAnswer: {
          selectedOption: "null",
          selectedOptionIds: ["option2"],
        },
        correctAnswer: {
          selectedOption: "object",
          selectedOptionIds: ["option1"],
        },
        isCorrect: false,
        explanation:
          "Ovo je poznata greška u JavaScript-u - typeof null vraća 'object', a ne 'null' kako bi se očekivalo.",
      },
    ],
  },
  2: {
    resultId: 2,
    quizId: 2,
    quizTitle: "Svetska istorija",
    score: 60,
    totalQuestions: 4,
    correctAnswers: 3,
    timeSpent: 900, // 15 minuta
    dateTaken: "2024-01-10T14:20:00Z",
    questions: [
      {
        id: 1,
        text: "Kada je počeo Prvi svetski rat?",
        type: "SingleChoice",
        userAnswer: {
          selectedOption: "1914",
          selectedOptionIds: ["option1"],
        },
        correctAnswer: {
          selectedOption: "1914",
          selectedOptionIds: ["option1"],
        },
        isCorrect: true,
        explanation: "Prvi svetski rat je počeo 28. jula 1914. godine.",
      },
      {
        id: 2,
        text: "Ko je bio car Rusije tokom Februarske revolucije 1917?",
        type: "FillInBlank",
        userAnswer: {
          submittedText: "Nikolaj II",
        },
        correctAnswer: {
          submittedText: "Nikolaj II",
        },
        isCorrect: true,
        explanation:
          "Car Nikolaj II je bio poslednji car Rusije, abdicirao je tokom Februarske revolucije 1917.",
      },
      {
        id: 3,
        text: "Berlin je bio podeljen tokom Hladnog rata.",
        type: "TrueFalse",
        userAnswer: {
          selectedOptionIds: ["true"],
        },
        correctAnswer: {
          selectedOptionIds: ["true"],
        },
        isCorrect: true,
        explanation:
          "Berlin je bio podeljen Berlinskim zidom od 1961. do 1989. godine.",
      },
      {
        id: 4,
        text: "Koje zemlje su bile član trojnog saveza?",
        type: "MultipleChoice",
        userAnswer: {
          selectedOptions: ["Nemačka", "Austro-Ugarska"],
          selectedOptionIds: ["option1", "option2"],
        },
        correctAnswer: {
          selectedOptions: ["Nemačka", "Austro-Ugarska", "Italija"],
          selectedOptionIds: ["option1", "option2", "option3"],
        },
        isCorrect: false,
        explanation: "Trojni savez je činio Nemačka, Austro-Ugarska i Italija.",
      },
    ],
  },
};

// Mock podatci za globalnu rang listu
export const mockLeaderboardData = [
  {
    userId: "user123",
    userName: "Marko Petrović",
    userLevel: 5,
    quizId: 1,
    quizTitle: "Osnove JavaScript-a",
    quizCategory: "Programiranje",
    score: 95,
    percentage: 95,
    timeSpent: 720, // 12 minuta
    dateTaken: "2024-01-15T10:30:00Z",
  },
  {
    userId: "user456",
    userName: "Ana Marić",
    userLevel: 7,
    quizId: 1,
    quizTitle: "Osnove JavaScript-a",
    quizCategory: "Programiranje",
    score: 90,
    percentage: 90,
    timeSpent: 650,
    dateTaken: "2024-01-14T14:20:00Z",
  },
  {
    userId: "user789",
    userName: "Stefan Nikolić",
    userLevel: 3,
    quizId: 1,
    quizTitle: "Osnove JavaScript-a",
    quizCategory: "Programiranje",
    score: 85,
    percentage: 85,
    timeSpent: 800,
    dateTaken: "2024-01-13T09:15:00Z",
  },
  {
    userId: "user123",
    userName: "Marko Petrović",
    userLevel: 5,
    quizId: 2,
    quizTitle: "Svetska istorija",
    quizCategory: "Istorija",
    score: 88,
    percentage: 88,
    timeSpent: 1200, // 20 minuta
    dateTaken: "2024-01-12T16:45:00Z",
  },
  {
    userId: "user321",
    userName: "Milica Jovanović",
    userLevel: 4,
    quizId: 2,
    quizTitle: "Svetska istorija",
    quizCategory: "Istorija",
    score: 92,
    percentage: 92,
    timeSpent: 980,
    dateTaken: "2024-01-11T11:30:00Z",
  },
  {
    userId: "user654",
    userName: "Nikola Stanković",
    userLevel: 6,
    quizId: 3,
    quizTitle: "Osnove React-a",
    quizCategory: "Programiranje",
    score: 98,
    percentage: 98,
    timeSpent: 1500, // 25 minuta
    dateTaken: "2024-01-10T08:00:00Z",
  },
  {
    userId: "user987",
    userName: "Jovana Mitrović",
    userLevel: 8,
    quizId: 3,
    quizTitle: "Osnove React-a",
    quizCategory: "Programiranje",
    score: 94,
    percentage: 94,
    timeSpent: 1350,
    dateTaken: "2024-01-09T13:20:00Z",
  },
  {
    userId: "user456",
    userName: "Ana Marić",
    userLevel: 7,
    quizId: 4,
    quizTitle: "Osnove matematike",
    quizCategory: "Matematika",
    score: 87,
    percentage: 87,
    timeSpent: 900,
    dateTaken: "2024-01-08T15:10:00Z",
  },
  {
    userId: "user111",
    userName: "Petar Pavlović",
    userLevel: 2,
    quizId: 4,
    quizTitle: "Osnove matematike",
    quizCategory: "Matematika",
    score: 91,
    percentage: 91,
    timeSpent: 850,
    dateTaken: "2024-01-07T10:05:00Z",
  },
  {
    userId: "user222",
    userName: "Marija Stojanović",
    userLevel: 9,
    quizId: 5,
    quizTitle: "Evropska geografija",
    quizCategory: "Geografija",
    score: 96,
    percentage: 96,
    timeSpent: 780,
    dateTaken: "2024-01-06T12:40:00Z",
  },
  {
    userId: "user333",
    userName: "Miloš Živković",
    userLevel: 1,
    quizId: 5,
    quizTitle: "Evropska geografija",
    quizCategory: "Geografija",
    score: 89,
    percentage: 89,
    timeSpent: 820,
    dateTaken: "2024-01-05T17:25:00Z",
  },
  {
    userId: "user444",
    userName: "Tijana Milić",
    userLevel: 6,
    quizId: 6,
    quizTitle: "Fizika i hemija",
    quizCategory: "Nauka",
    score: 93,
    percentage: 93,
    timeSpent: 1100,
    dateTaken: "2024-01-04T09:30:00Z",
  },
  {
    userId: "user555",
    userName: "Aleksandar Đorđević",
    userLevel: 4,
    quizId: 6,
    quizTitle: "Fizika i hemija",
    quizCategory: "Nauka",
    score: 86,
    percentage: 86,
    timeSpent: 1150,
    dateTaken: "2024-01-03T14:15:00Z",
  },
  {
    userId: "user666",
    userName: "Jelena Kostić",
    userLevel: 7,
    quizId: 7,
    quizTitle: "Svetska književnost",
    quizCategory: "Literatura",
    score: 97,
    percentage: 97,
    timeSpent: 960,
    dateTaken: "2024-01-02T11:45:00Z",
  },
  {
    userId: "user777",
    userName: "Mihailo Radović",
    userLevel: 3,
    quizId: 7,
    quizTitle: "Svetska književnost",
    quizCategory: "Literatura",
    score: 84,
    percentage: 84,
    timeSpent: 1020,
    dateTaken: "2024-01-01T16:00:00Z",
  },
];
