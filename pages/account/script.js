// Função para recuperar o accessToken
async function getToken() {
  const encryptedToken = JSON.parse(sessionStorage.getItem("accessToken"));

  if (!encryptedToken) {
    throw new Error("Token não encontrado no sessionStorage.");
  }

  try {
    const response = await fetch("/decrypt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(encryptedToken),
    });

    const result = await response.json();

    if (result.decryptedToken) {
      return result.decryptedToken;
    } else {
      throw new Error("Falha ao descriptografar o token.");
    }
  } catch (error) {
    console.error("Erro ao recuperar o token:", error);
  }
}

let accessToken;

const profilePicture = document.getElementById("profilePicture");
const fileInput = document.getElementById("profilePictureInput");

// Inicializa o accessToken e carrega os dados ao carregar a página
document.addEventListener("DOMContentLoaded", async () => {
  try {
    accessToken = await getToken();
    hideProfessionalProfile();

    if (!accessToken) {
      console.log("Token não encontrado. Usuário não está logado.");
      return;
    }

    const response = await fetch("/account-info", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar perfil");
    }

    const data = await response.json();

    // Atualiza as informações do perfil no DOM
    document.getElementById("name").innerText = data.user.name;
    document.getElementById("city").innerText = data.user.city;

    profilePicture.src = data.user.profilePicture
      ? data.user.profilePicture
      : "/img/icons/profile-placeholder.jpg";
  } catch (error) {
    console.error("Erro ao carregar perfil: ", error);
  }
});

// Abre o seletor de arquivos
function openFileInput() {
  fileInput.click();
}

// Listener para o evento de alteração no seletor de arquivos
fileInput.addEventListener("change", handleFileSelect);

function handleFileSelect() {
  const file = fileInput.files[0];

  if (!file) {
    return;
  }

  uploadPhoto(file);
}

// Função para enviar a foto de perfil ao servidor
async function uploadPhoto(file) {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch("/upload-profile-picture", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      alert("Foto de perfil atualizada com sucesso");
      profilePicture.src = data.imageUrl;
    } else {
      alert(`Erro: ${data.message}`);
    }
  } catch (error) {
    console.error("Erro ao atualizar foto de perfil: ", error);
    alert("Algo deu errado, tente novamente mais tarde.");
  }
}

// Função para redirecionar para o perfil da diarista logada
async function redirectDiaristaProfile() {
  if (!accessToken) {
    console.error("Token de acesso não encontrado. Faça login novamente.");
    return;
  }

  try {
    const response = await fetch(`/account-info`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar perfil");
    }

    const data = await response.json();

    console.log(data);

    window.location.href = `/pages/profile/profile.html?id=${data.user.id}`;
  } catch (error) {
    console.log("Erro: ", error);
  }
}

// Função para esconder/mostrar o perfil profissional
async function hideProfessionalProfile() {
  if (!accessToken) {
    console.error("Token de acesso não encontrado. Faça login novamente.");
    return;
  }

  try {
    const response = await fetch("/account-info", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Erro ao buscar perfil. Status: ${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json();

    if (data.user.userType === "Diarista") {
      profissionalProfile.style.display = "block";
    } else {
      profissionalProfile.style.display = "none";
    }
  } catch (error) {
    console.error("Erro ao buscar perfil ou manipular DOM: ", error);
  }
}
