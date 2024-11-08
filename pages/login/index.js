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

async function login() {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    // faz uma requisição POST para a rota /login
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }), // wnvia email e senha
    });

    const result = await response.json();

    // verifica a resposta do backend
    if (result.success) {
      // Verificação corrigida
      alert(result.message);
      window.location.href = "/pages/home/home.html"; // redireciona o usuario
    } else {
      alert(result.message); // alerta de falha no login
    }
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    alert("Erro ao conectar ao servidor. Tente novamente.");
  }
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
