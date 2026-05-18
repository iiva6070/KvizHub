export const emptyRegisterUser = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
};

export default class RegisterModel {
  constructor(
    username = "",
    email = "",
    password = "",
    confirmPassword = "",
    firstName = "",
    lastName = ""
  ) {
    this.username = username;
    this.email = email;
    this.password = password;
    this.confirmPassword = confirmPassword;
    this.firstName = firstName;
    this.lastName = lastName;
  }

  // Validacijske metode
  validateEmail(email) {
    return /^\S+@\S+\.\S+$/.test(email);
  }

  validate() {
    const errors = {};

    if (!this.username || this.username.length < 3) {
      errors.username = "Korisničko ime mora imati najmanje 3 karaktera.";
    }

    if (!this.email || !this.validateEmail(this.email)) {
      errors.email = "Unesite validan email.";
    }

    if (!this.password || this.password.length < 6) {
      errors.password = "Lozinka mora imati najmanje 6 karaktera.";
    }

    if (!this.confirmPassword) {
      errors.confirmPassword = "Potvrdite lozinku.";
    } else if (this.password !== this.confirmPassword) {
      errors.confirmPassword = "Lozinke se ne poklapaju.";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  toJSON() {
    return {
      username: this.username,
      email: this.email,
      password: this.password,
      confirmPassword: this.confirmPassword,
      firstName: this.firstName,
      lastName: this.lastName,
    };
  }
}
