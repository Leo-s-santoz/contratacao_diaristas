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

async function encryptToken(token) {
  if (!token) {
    throw new Error("Token não encontrado");
  }
  try {
    const response = await fetch("/encrypt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });
    const result = await response.json();
    return result.encryptedToken;
  } catch (error) {
    console.error("Erro ao encriptar token: ", error);
    throw error;
  }
}

async function login() {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (result.success) {
      const encryptAccessToken = await encryptToken(result.accessToken);
      const encryptRefreshToken = await encryptToken(result.refreshToken);

      sessionStorage.setItem("accessToken", JSON.stringify(encryptAccessToken));
      localStorage.setItem("refreshToken", JSON.stringify(encryptRefreshToken));

      if (result.userType == "Diarista") {
        window.location.href = `/pages/profile/profile.html?id=${result.id}`;
        return;
      }
      window.location.href = "/pages/home/home.html";
      document.getElementById("LoginCredentialError").style.display = "block";
    }
  } catch (error) {
    console.error("Erro ao fazer login:", error);
  }
}

function register() {
  window.location.href = "/pages/register/register.html";
}

const form = {
  email: () => document.getElementById("email"),
  password: () => document.getElementById("password"),
  EmailRequiredError: () => document.getElementById("EmailRequiredError"),
  EmailInvalidError: () => document.getElementById("EmailInvalidError"),
  PasswordRequiredError: () => document.getElementById("PasswordRequiredError"),
  LoginCredentialError: () => document.getElementById("LoginCredentialError"),
  RecoverPasswordButton: () => document.getElementById("RecoverPasswordButton"),
  LoginButton: () => document.getElementById("LoginButton"),
};
