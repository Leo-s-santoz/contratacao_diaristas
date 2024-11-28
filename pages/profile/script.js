const profilePicture = document.getElementById("profilePicture");
const fileInput = document.getElementById("profilePictureInput");
const description = document.getElementById("description");
const descriptionInput = document.getElementById("description-input");
const editButton = document.getElementById("edit-description-button");
const saveButton = document.getElementById("save-description-button");
const accessToken = sessionStorage.getItem("accessToken");
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("id");

document.addEventListener("DOMContentLoaded", () => {
  informationSearch();
  descriptionSearch();
  cancelEdit();
});

//esconder possibilidade de edição
async function cancelEdit() {
  if (!userId) {
    console.error("ID do usuário não encontrado na URL.");
    return;
  }

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
    // Verifica se o ID do URL é diferente do ID do usuário logado
    if (userId != data.user.id) {
      if (editButton) {
        editButton.style.display = "none";
      } else {
        console.warn("Botão de edição não encontrado no DOM.");
      }
    }
  } catch (error) {
    console.error("Erro no cancelEdit:", error.message);
  }
}

//buscar informações
async function informationSearch() {
  // Captura os parâmetros da URL

  if (!userId) {
    console.error("ID do usuário não encontrado na URL.");
    return;
  }
  if (!accessToken) {
    throw new Error("Token de acesso não encontrado. Faça login novamente.");
  }
  try {
    const response = await fetch(`/info/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar perfil");
    }

    const data = await response.json();

    document.getElementById("name").innerText = data.user.name;
    document.getElementById("city").innerText = data.user.city;

    if (data.user.profilePicture) {
      profilePicture.src = data.user.profilePicture;
    } else {
      profilePicture.src = "/img/icons/profile-placeholder.jpg";
    }
  } catch (error) {
    console.error("Erro: ", error);
  }
}

//buscar descricao
async function descriptionSearch() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("id");

    if (!userId) {
      console.error("ID do usuário não encontrado na URL.");
      return;
    }

    if (!accessToken) {
      throw new Error("Token de acesso não encontrado. Faça login novamente.");
    }

    const response = await fetch(`/description/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Erro ao buscar dados. Tente novamente mais tarde.");
      }
    }

    const data = await response.json();

    if (data.description) {
      const descriptionElement = document.getElementById("description");
      if (descriptionElement) {
        descriptionElement.textContent = data.description;
      }
    }
  } catch (error) {
    console.error("Erro:", error);
    const errorElement = document.getElementById("error-message");
    if (errorElement) {
      errorElement.textContent = error.message;
    }
  }
}

//alterar informações
function alterDescription() {
  // Mostra o campo de edição e o botão de salvar
  descriptionInput.value = description.textContent;
  description.classList.add("hidden");
  descriptionInput.classList.remove("hidden");
  editButton.classList.add("hidden");
  saveButton.classList.remove("hidden");
}

function saveDescription() {
  // Salva o novo texto e restaura a exibição
  description.textContent = descriptionInput.value;
  description.classList.remove("hidden");
  descriptionInput.classList.add("hidden");
  editButton.classList.remove("hidden");
  saveButton.classList.add("hidden");

  updateDescription(description.textContent);
}

async function updateDescription(description) {
  try {
    if (!accessToken) {
      return;
    }

    const response = await fetch("/update-information", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ description }),
    });

    const data = await response.json();

    if (data.success) {
      console.log("Descrição atualizada com sucesso:", data.message);
    } else {
      console.warn("A atualização falhou:", data.message);
    }
  } catch (error) {
    if (error.message.includes("Failed to update")) {
      console.error("Server-side error:", error.message);
    } else {
      console.error("Unexpected error:", error.message);
    }
  }
}

function openFileInput() {
  fileInput.click();
}

fileInput.addEventListener("change", handleFileSelect);

function handleFileSelect() {
  const file = fileInput.files[0];

  if (!file) {
    return;
  }

  uploadPhoto(file);
}

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
    console.error("erro ao atualziar foto de perfil: ", error);
    alert("Algo deu errado, tente novamente mais tarde");
  }
}
