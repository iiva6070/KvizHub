export class AnswerOption {
  constructor(text = "", isCorrect = false) {
    this.text = text;
    this.isCorrect = isCorrect;
  }
}

export class Question {
  constructor(quizId = "", text = "", type = "SingleChoice", correctAnswer = "", options = []) {
    this.quizId = quizId;
    this.text = text;
    this.type = type;
    this.correctAnswer = correctAnswer;
    this.options = options;
  }
}

export class UserAnswer {
  constructor(questionId) {
    this.questionId = questionId;
    this.selectedOptionIds = [];
    this.submittedText = "";
  }
}
