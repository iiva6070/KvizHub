export default class Quiz {
  constructor(
    id = null,
    title = "",
    description = "",
    timeLimitSeconds = 0,
    difficulty = "",
    category = "",
    createdByUserId = null,
    questionCount = 0,
    createdAt = null
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.timeLimitSeconds = timeLimitSeconds;
    this.difficulty = difficulty;
    this.category = category;
    this.createdByUserId = createdByUserId;
    this.questionCount = questionCount;
    this.createdAt = createdAt;
  }

  // Getter za timeLimit u minutama
  get timeLimit() {
    return Math.ceil(this.timeLimitSeconds / 60);
  }

  // Setter za timeLimit u minutama
  set timeLimit(minutes) {
    this.timeLimitSeconds = minutes * 60;
  }

  validate() {
    const errors = {};

    if (!this.title || this.title.trim().length < 3) {
      errors.title = "Naziv kviza mora imati najmanje 3 karaktera.";
    }

    if (!this.description || this.description.trim().length < 10) {
      errors.description = "Opis kviza mora imati najmanje 10 karaktera.";
    }

    if (!this.timeLimitSeconds || this.timeLimitSeconds < 60) {
      errors.timeLimit = "Vremensko ograničenje mora biti najmanje 1 minut.";
    }

    if (!this.difficulty) {
      errors.difficulty = "Izaberite težinu kviza.";
    }

    if (!this.category) {
      errors.category = "Izaberite kategoriju kviza.";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  getFormattedDuration() {
    const minutes = this.timeLimit;
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}min`
      : `${hours}h`;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      timeLimitSeconds: this.timeLimitSeconds,
      difficulty: this.difficulty,
      category: this.category,
      createdByUserId: this.createdByUserId,
      questionCount: this.questionCount,
      createdAt: this.createdAt,
    };
  }

  static fromAPI(apiData) {
    return new Quiz(
      apiData.id,
      apiData.title,
      apiData.description,
      apiData.timeLimitSeconds,
      apiData.difficulty,
      apiData.category,
      apiData.createdByUserId,
      apiData.questionCount,
      apiData.createdAt
    );
  }
}
