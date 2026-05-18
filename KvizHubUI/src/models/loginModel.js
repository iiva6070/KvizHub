export default class LoginModel {
  constructor(usernameOrEmail = "", password = "") {
    this.usernameOrEmail = usernameOrEmail;
    this.password = password;
  }

  // Validacijske metode
  validateEmail(email) {
    return /^\S+@\S+\.\S+$/.test(email);
  }

  validate() {
    const errors = {};

    if (!this.usernameOrEmail) {
      errors.usernameOrEmail = "Unesite korisničko ime ili email.";
    } else if (
      this.usernameOrEmail.includes("@") &&
      !this.validateEmail(this.usernameOrEmail)
    ) {
      errors.usernameOrEmail = "Email nije validan.";
    }

    if (!this.password || this.password.length < 6) {
      errors.password = "Lozinka mora imati najmanje 6 karaktera.";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  toJSON() {
    return {
      emailOrUsername: this.usernameOrEmail,
      password: this.password,
    };
  }
}
