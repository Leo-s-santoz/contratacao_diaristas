function disableBtn(role) {
  if (role === "Diarista") {
    form.buttonDia().disabled = true;
    form.buttonCon().disabled = false;
  } else {
    form.buttonDia().disabled = false;
    form.buttonCon().disabled = true;
  }

  form.form().style.display = "block";
}
const form = {
  form: () => document.getElementById("form"),
  buttonDia: () => document.getElementById("DiaristaBtn"),
  buttonCon: () => document.getElementById("ContratanteBtn"),
  name: () => document.getElementById("name"),
  obrigatoryFieldError: () => document.getElementById("ObrigatoryFieldError"),
  cpf: () => document.getElementById("cpf"),
  obrigatoryCpfError: () => document.getElementById("ObrigatoryCpfError"),
  validCpfError: () => document.getElementById("ValidCpfError"),
  cities: () => document.getElementById("cities"),
  email: () => document.getElementById("email"),
  emailRequiredError: () => document.getElementById("EmailRequiredError"),
  emailInvalidError: () => document.getElementById("EmailInvalidError"),
  password: () => document.getElementById("password"),
  passwordRequiredError: () => document.getElementById("PasswordRequiredError"),
  submit: () => document.getElementById("submit"),
};
