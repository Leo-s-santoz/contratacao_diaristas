function onChangeEmail() {
  toggleButtonsDisable();
  toggleEmailError();
}

function onChangePassword() {
  toggleButtonsDisable();
  togglePasswordError();
}

function isEmailValid() {
  const email = form.email().value;
  if (!email) {
    return false;
  }
  return validateEmail(email);
}

function toggleEmailError() {
  const email = form.email().value;
  (form.EmailRequiredError().style.display = email ? "none" : "block"),
    (form.EmailInvalidError().style.display = validateEmail(email)
      ? "none"
      : "block");
}

function togglePasswordError() {
  const password = form.password().value;
  form.PasswordRequiredError().style.display = password ? "none" : "block";
}

function toggleButtonsDisable() {
  const emailValid = isEmailValid();
  form.RecoverPasswordButton().disabled = !emailValid;

  const passwordValid = isPasswordValid();
  form.LoginButton().disabled = !emailValid || !passwordValid;
}

function isPasswordValid() {
  const password = form.password().value;
  return !!form.password().value;
}

function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

/*function login() {
  firebase
    .auth()
    .signInWithEmailAndPassword(form.email().value, form.password().value)
    .then((response) => {
      console.log("success", response);
    })
    .cath((error) => {
      console.log("error", error);
    });
}*/

function login() {
  window.location.href = "/pages/home/home.html";
}

function register() {
  window.location.href = "/register";
}

const form = {
  email: () => document.getElementById("email"),
  password: () => document.getElementById("password"),
  EmailRequiredError: () => document.getElementById("EmailRequiredError"),
  EmailInvalidError: () => document.getElementById("EmailInvalidError"),
  PasswordRequiredError: () => document.getElementById("PasswordRequiredError"),
  RecoverPasswordButton: () => document.getElementById("RecoverPasswordButton"),
  LoginButton: () => document.getElementById("LoginButton"),
};
