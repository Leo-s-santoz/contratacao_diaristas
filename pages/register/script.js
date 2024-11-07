//submit
function checkFormValidity() {
  const name = form.name().value;
  const cpf = form.cpf().value;
  const city = form.cities().value;
  const email = form.email().value;
  const password = form.password().value;

  const isNameValid = !!name;
  const isCpfValid = cpf && validateCpf(cpf);
  const isCityValid = !!city;
  const isEmailValid = email && validateEmail(email);
  const isPasswordValid = password && securePassword(password);

  form.submit().disabled = !(
    isNameValid &&
    isCpfValid &&
    isCityValid &&
    isEmailValid &&
    isPasswordValid
  );
}
//submit

//buttons
function disableBtn(role) {
  if (role === "Diarista") {
    form.buttonCon().style.backgroundColor = "#4C4C4C";
    form.buttonDia().style.backgroundColor = "black";
  } else {
    form.buttonDia().style.backgroundColor = "#4C4C4C";
    form.buttonCon().style.backgroundColor = "black";
  }

  form.form().style.display = "block";
}
//buttons;

//name
function toggleNameError() {
  const name = form.name().value;
  form.obrigatoryNameError().style.display = name ? "none" : "block";
  checkFormValidity();
}
//name

//cpf
function validateCpf(cpf) {
  cpf = cpf.replace(/\D/g, "");

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  function calculateDigit(cpf, factor) {
    let total = 0;
    for (let i = 0; i < factor - 1; i++) {
      total += parseInt(cpf[i]) * (factor - i);
    }
    const remainder = (total * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  }

  const digit1 = calculateDigit(cpf, 10);
  const digit2 = calculateDigit(cpf, 11);

  return digit1 === parseInt(cpf[9]) && digit2 === parseInt(cpf[10]);
}

function toggleCpfError() {
  const cpf = form.cpf().value;
  form.obrigatoryCpfError().style.display = cpf ? "none" : "block";
  form.invalidCpfError().style.display = validateCpf(cpf) ? "none" : "block";
  checkFormValidity();
}
//cpf

//city
function validateCity() {
  const city = form.cities().value;
  checkFormValidity();
  return city;
}
//city

//Email
function toggleEmailError() {
  const email = form.email().value;
  (form.emailRequiredError().style.display = email ? "none" : "block"),
    (form.emailInvalidError().style.display = isEmailValid(email)
      ? "none"
      : "block");
  checkFormValidity();
}

function isEmailValid() {
  const email = form.email().value;
  if (!email) {
    return false;
  }
  return validateEmail(email);
}

function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}
//Email

//Password
function togglePasswordError() {
  const password = form.password().value;
  (form.passwordRequiredError().style.display = password ? "none" : "block"),
    (form.passwordRequirementsError().style.display = securePassword(password)
      ? "none"
      : "block");
  checkFormValidity();
}

function securePassword(password) {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasMinLength = password.length >= 6;

  return hasUpperCase && hasLowerCase && hasNumber && hasMinLength;
}
//Password

const form = {
  form: () => document.getElementById("form"),
  buttonDia: () => document.getElementById("diaristaBtn"),
  buttonCon: () => document.getElementById("contratanteBtn"),
  name: () => document.getElementById("name"),
  obrigatoryNameError: () => document.getElementById("obrigatoryNameError"),
  cpf: () => document.getElementById("cpf"),
  obrigatoryCpfError: () => document.getElementById("obrigatoryCpfError"),
  invalidCpfError: () => document.getElementById("invalidCpfError"),
  cities: () => document.getElementById("cities"),
  email: () => document.getElementById("email"),
  emailRequiredError: () => document.getElementById("emailRequiredError"),
  emailInvalidError: () => document.getElementById("emailInvalidError"),
  password: () => document.getElementById("password"),
  passwordRequiredError: () => document.getElementById("passwordRequiredError"),
  passwordRequirementsError: () =>
    document.getElementById("passwordRequirementsError"),
  submit: () => document.getElementById("submit"),
};
