function onChangeEmail() {
  toggleButtonsDisable();
  toggleEmailError();
}
function onChangePassword() {
  toggleButtonsDisable();
  togglePasswordError();
}

function isEmailValid() {
  const email = document.getElementById("email").value;
  if (!email) {
    return false;
  }
  return validateEmail(email);
}

function toggleEmailError() {
  const email = document.getElementById("email").value;
  if (!email) {
    document.getElementById("EmailRequiredError").style.display = "block";
    document.getElementById("EmailInvalidError").style.display = "none";
  } else {
    document.getElementById("EmailRequiredError").style.display = "none";

    if (validateEmail(email)) {
      document.getElementById("EmailInvalidError").style.display = "none";
    } else {
      document.getElementById("EmailInvalidError").style.display = "block";
    }
  }
}

function togglePasswordError() {
  const password = document.getElementById("password").value;
  if (!password) {
    document.getElementById("PasswordRequiredError").style.display = "block";
  } else {
    document.getElementById("PasswordRequiredError").style.display = "none";
  }
}

function toggleButtonsDisable() {
  const emailValid = isEmailValid();
  document.getElementById("RecoverPasswordButton").disabled = !emailValid;

  const passwordValid = isPasswordValid();
  document.getElementById("LoginButton").disabled =
    !emailValid || !passwordValid;
}

function isPasswordValid() {
  const password = document.getElementById("password").value;
  if (!password) {
    return false;
  }
  return true;
}

function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}
