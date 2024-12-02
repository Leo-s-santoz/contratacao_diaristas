const profilePicture = document.getElementById("profilePicture");
const fileInput = document.getElementById("profilePictureInput");
const description = document.getElementById("description");
const descriptionInput = document.getElementById("description-input");
const editButton = document.getElementById("edit-description-button");
const saveButton = document.getElementById("save-description-button");
const contactButton = document.getElementById("contact-button");

let accessToken;
let urlId;

document.addEventListener("DOMContentLoaded", async () => {
  try {
    urlId = new URLSearchParams(window.location.search).get("id");
    accessToken = await getToken();
    console.log(accessToken);

    if (!accessToken) {
      throw new Error("AccessToken não recuperado com sucesso.");
    }

    await informationSearch();
    await descriptionSearch();
    await cancelEdit();
    await cancelEmail();
    await verifyFavorite();
  } catch (error) {
    console.error("Erro durante o carregamento da página:", error.message);
  }
});

async function getToken() {
  const encryptedToken = JSON.parse(sessionStorage.getItem("accessToken"));
  const refreshToken = JSON.parse(localStorage.getItem("refreshToken"));

  if (!encryptedToken || !refreshToken) {
    throw new Error("Tokens não encontrados no armazenamento.");
  }

  try {
    // Descriptografar o access token
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
    }

    // Caso o token esteja expirado
    if (result.error === "Token expirado" && refreshToken) {
      const refreshResponse = await fetch("/new-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(refreshToken),
      });

      const refreshResult = await refreshResponse.json();

      if (refreshResult.accessToken) {
        // Encriptar o novo token
        const responseNewToken = await fetch("/encrypt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: refreshResult.accessToken }),
        });

        const newEncryptedToken = await responseNewToken.json();

        if (newEncryptedToken && newEncryptedToken.encryptedToken) {
          sessionStorage.setItem(
            "accessToken",
            JSON.stringify(newEncryptedToken.encryptedToken)
          );
          return refreshResult.accessToken;
        } else {
          throw new Error("Erro ao encriptar o novo token.");
        }
      } else {
        throw new Error("Falha ao renovar o token.");
      }
    } else {
      throw new Error("Falha ao descriptografar o token.");
    }
  } catch (error) {
    console.error("Erro ao recuperar o token:", error);
    accessToken = null; //Em ultimo caso atribui nulo
    throw error;
  }
}

//desabilitar edição caso não seja o dono do perfil
async function cancelEdit() {
  if (!urlId) {
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
    if (urlId != data.user.id) {
      fileInput.disabled = true;

      if (editButton) {
        editButton.style.display = "none";
      } else {
        console.warn("Botão de edição não encontrado no DOM.");
      }
    } else {
      const favoriteButton = document.getElementById("favorite");
      favoriteButton.disabled = true;
    }
  } catch (error) {
    console.error("Erro no cancelEdit:", error.message);
  }
}

//desabilitar botão de envio de email
async function cancelEmail() {
  if (!urlId) {
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

    if (!response) {
      console.error("Erro ao obter informações de usuario");
      return;
    }

    const data = await response.json();

    if (data.user.id == urlId) {
      if (contactButton) {
        contactButton.disabled = true;
      }
    }
  } catch (error) {
    console.error("Erro ao desabilitar envio de email: ", error);
  }
}

async function informationSearch() {
  if (!urlId) {
    console.error("ID do usuário não encontrado na URL.");
    return;
  }

  if (!accessToken) {
    throw new Error("Token de acesso não encontrado. Faça login novamente.");
  }

  try {
    const response = await fetch(`/info/${urlId}`, {
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
    document.getElementById("phone").innerText = data.user.phone;

    if (data.user.profilePicture) {
      profilePicture.src = data.user.profilePicture;
    } else {
      profilePicture.src = "/img/icons/profile-placeholder.jpg";
    }
  } catch (error) {
    console.error("Erro: ", error);
  }
}

async function descriptionSearch() {
  if (!urlId) {
    console.error("ID do usuário não encontrado na URL.");
    return;
  }

  if (!accessToken) {
    throw new Error("Token de acesso não encontrado. Faça login novamente.");
  }

  try {
    const response = await fetch(`/description/${urlId}`, {
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

function alterDescription() {
  descriptionInput.value = description.textContent;
  description.classList.add("hidden");
  descriptionInput.classList.remove("hidden");
  editButton.classList.add("hidden");
  saveButton.classList.remove("hidden");
}

function saveDescription() {
  description.textContent = descriptionInput.value;
  description.classList.remove("hidden");
  descriptionInput.classList.add("hidden");
  editButton.classList.remove("hidden");
  saveButton.classList.add("hidden");

  updateDescription(description.textContent);
}

//atualizar descrição de diarista logada
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
        "diarista-id": urlId,
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

//enviar foto de perfil para o servidor
async function uploadPhoto(file) {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch("/upload-profile-picture", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "diarista-id": urlId,
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
    console.error("erro ao atualizar foto de perfil: ", error);
    alert("Algo deu errado, tente novamente mais tarde");
  }
}

//favorite
async function toggleFavorite() {
  const checkbox = document.getElementById("favorite");
  const isFavorited = checkbox.checked;

  const data = {
    token: accessToken,
    urlId: urlId,
    favorited: isFavorited,
  };

  try {
    const response = await fetch("/update-favorite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      console.log(
        `Favorito ${isFavorited ? "adicionado" : "removido"} com sucesso!`
      );
    } else {
      console.error("Erro ao atualizar favorito.");
    }
  } catch (error) {
    console.error("Erro de conexão:", error);
  }
}

//verifica quais perfis estão favotitados
async function verifyFavorite() {
  const checkbox = document.getElementById("favorite");

  try {
    const response = await fetch(`/verify-favorite/${urlId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      checkbox.checked = data.isFavorited;
    }
  } catch (error) {
    console.error("Erro de conexão: ", error);
  }
}

//enviar email para diarista entrar em contato com contratante
async function sendEmail() {
  if (!accessToken || !urlId) {
    console.error("São necessários dados válidos");
    return;
  }
  try {
    const responseContratante = await fetch(`/account-info`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const responseDiarista = await fetch(`/info/${urlId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!responseContratante.ok || !responseDiarista.ok) {
      console.error("Erro ao recuperar dados de usuarios");
      return;
    }

    const dataContratante = await responseContratante.json();
    const dataDiarista = await responseDiarista.json();

    if (dataContratante && dataDiarista) {
      try {
        const response = await fetch("/send-mail", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json", // Define o tipo do conteúdo
          },
          body: JSON.stringify({
            dataContratante,
            dataDiarista,
          }),
        });

        if (!response.ok) {
          console.error("Erro ao enviar e-mail");
        } else {
          alert("Email enviado com Sucesso ;)");
        }
      } catch (error) {
        console.error("Erro ao enviar e-mail:", error);
      }
    }
  } catch (error) {
    console.error("Erro ao buscar informações:", error);
  }
}
