// Função para verificar a validade do formulário antes de habilitar o botão de submit
function checkFormValidity() {
  const userType = form.userType().value;
  const description = form.description().value;
  const name = form.name().value;
  const phone = form.phone().value;
  const cpf = form.cpf().value;
  const city = form.cities().value;
  const email = form.email().value;
  const password = form.password().value;

  const isUserTypeValid = !!userType;
  const isDescriptionValid = !!description || userType != "Diarista";
  const isNameValid = !!name;
  const isPhoneValid = !!phone && validatePhone(phone);
  const isCpfValid = cpf && validateCpf(cpf);
  const isCityValid = !!city;
  const isEmailValid = email && validateEmail(email);
  const isPasswordValid = password && securePassword(password);

  const isFormValid =
    isUserTypeValid &&
    isDescriptionValid &&
    isNameValid &&
    isPhoneValid &&
    isCpfValid &&
    isCityValid &&
    isEmailValid &&
    isPasswordValid;

  console.log({
    userType,
    description,
    name,
    phone,
    cpf,
    city,
    email,
    password,
    isUserTypeValid,
    isDescriptionValid,
    isNameValid,
    isPhoneValid,
    isCpfValid,
    isCityValid,
    isEmailValid,
    isPasswordValid,
    isFormValid,
  });

  form.submit().disabled = !isFormValid;
}

// Função para exibir ou ocultar o erro de campo obrigatório para a descrição
function toggleDescriptionError() {
  const description = form.description().value;
  form.obrigatoryDescriptionError().style.display = description
    ? "none"
    : "block";
}

//habilita inserção de descrição
function addDescription() {
  const userType = form.userType().value;
  if (userType == "Diarista") {
    form.description().style.display = "block";
  } else {
    form.description().style.display = "none";
  }
}

// Função para exibir ou ocultar o erro de campo obrigatório para o nome
function toggleNameError() {
  const name = form.name().value;
  form.obrigatoryNameError().style.display = name ? "none" : "block";
  checkFormValidity();
}
// Função para exibir ou ocultar o erro de campo obrigatório para o celular

function validatePhone(phone) {
  // Remove espaços, traços e parênteses
  const cleaned = phone.replace(/\D/g, "");

  // Verifica se o número tem 11 dígitos e começa com o DDD correto
  const phonePattern = /^[1-9]{2}9[0-9]{8}$/;

  return phonePattern.test(cleaned);
}

function togglePhoneError() {
  // Obtém o valor do telefone e formata enquanto o usuário digita
  const phoneInput = form.phone();
  formatPhoneNumber(phoneInput); // Chama a função de formatação

  // Realiza as validações de obrigatoriedade e formato
  const phone = phoneInput.value;
  form.obrigatoryPhoneError().style.display = phone ? "none" : "block";
  form.invalidPhoneError().style.display = validatePhone(phone)
    ? "none"
    : "block";
  checkFormValidity();
}

// Função de formatação (sem alterações)
function formatPhoneNumber(input) {
  const phoneNumber = input.value.replace(/\D/g, "");

  if (phoneNumber.length > 11) {
    phoneNumber = phoneNumber.slice(0, 11);
  }

  if (phoneNumber.length > 10) {
    input.value = `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(
      2,
      3
    )} ${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7, 11)}`;
  } else if (phoneNumber.length > 6) {
    input.value = `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(
      2,
      3
    )} ${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7)}`;
  } else if (phoneNumber.length > 2) {
    input.value = `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
  } else {
    input.value = phoneNumber;
  }
}

// Função para validar CPF
function validateCpf(cpf) {
  // Remove todos os caracteres não numéricos
  cpf = cpf.replace(/\D/g, "");

  // Verifica se o CPF tem 11 dígitos e não é uma sequência repetida (ex.: 11111111111)
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  // Função para calcular o dígito verificador
  function calculateDigit(cpf, factor) {
    let total = 0;
    for (let i = 0; i < factor - 1; i++) {
      total += parseInt(cpf[i]) * (factor - i);
    }
    const remainder = (total * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  }

  // Calcula os dígitos verificadores
  const digit1 = calculateDigit(cpf, 10);
  const digit2 = calculateDigit(cpf, 11);

  // Retorna verdadeiro se os dígitos calculados correspondem aos dígitos fornecidos no CPF
  return digit1 === parseInt(cpf[9]) && digit2 === parseInt(cpf[10]);
}

// Função para exibir/ocultar mensagens de erro para o CPF
function toggleCpfError() {
  const cpf = form.cpf().value;
  form.obrigatoryCpfError().style.display = cpf ? "none" : "block";
  form.invalidCpfError().style.display = validateCpf(cpf) ? "none" : "block";
  checkFormValidity();
}

// Função para validar a seleção de cidade
function validateCity() {
  const city = form.cities().value;
  checkFormValidity();
  return city;
}

// Função para exibir/ocultar mensagens de erro de campo obrigatório para o email
function toggleEmailError() {
  const email = form.email().value;
  form.emailRequiredError().style.display = email ? "none" : "block";
  form.emailInvalidError().style.display = validateEmail(email)
    ? "none"
    : "block";
  checkFormValidity();
}

// Função para verificar a validade do email
function isEmailValid() {
  const email = form.email().value;
  if (!email) {
    return false;
  }
  return validateEmail(email);
}

// Função que usa regex para validar o formato do email
function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

// Função para exibir/ocultar mensagens de erro de campo obrigatório para senha
function togglePasswordError() {
  const password = form.password().value;
  form.passwordRequiredError().style.display = password ? "none" : "block";
  form.passwordRequirementsError().style.display = securePassword(password)
    ? "none"
    : "block";
  checkFormValidity();
}

// Função para validar requisitos de segurança da senha
function securePassword(password) {
  const hasUpperCase = /[A-Z]/.test(password); // Contém letra maiúscula
  const hasLowerCase = /[a-z]/.test(password); // Contém letra minúscula
  const hasNumber = /\d/.test(password); // Contém número
  const hasMinLength = password.length >= 6; // Tem pelo menos 6 caracteres

  return hasUpperCase && hasLowerCase && hasNumber && hasMinLength;
}

// Objeto `form` para mapear os elementos do formulário, facilitando o acesso aos elementos HTML
const form = {
  form: () => document.getElementById("form"),
  description: () => document.getElementById("descriptionInput"),
  obrigatoryDescriptionError: () =>
    document.getElementById("obrigatoryDescriptionError"),
  userType: () => document.getElementById("userType"),
  name: () => document.getElementById("name"),
  obrigatoryNameError: () => document.getElementById("obrigatoryNameError"),
  cpf: () => document.getElementById("cpf"),
  phone: () => document.getElementById("phone"),
  obrigatoryPhoneError: () => document.getElementById("obrigatoryPhoneError"),
  invalidPhoneError: () => document.getElementById("invalidPhoneError"),
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
