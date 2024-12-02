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
let accessToken;
let urlId;

const profilePicture = document.getElementById("profilePicture");
const fileInput = document.getElementById("profilePictureInput");

// Inicializa o accessToken e carrega os dados ao carregar a página
document.addEventListener("DOMContentLoaded", async () => {
  try {
    urlId = new URLSearchParams(window.location.search).get("id");
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
    document.getElementById("phone").innerText = data.user.phone;
    document.getElementById("email").innerText = data.user.email;

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

//mostrar e ocultar a seleção de cidades
function showCitySelect() {
  document.getElementById("city-select").classList.remove("hidden");
  document.getElementById("save-city-button").classList.remove("hidden");
  document.getElementById("edit-city-button").classList.add("hidden");
}

//salvar mudança de cidade e fazer logout
async function saveCity() {
  const selectedCity = document.getElementById("city-select").value;

  document.getElementById("city-select").classList.add("hidden");
  document.getElementById("save-city-button").classList.add("hidden");
  document.getElementById("edit-city-button").classList.remove("hidden");

  try {
    const updateCity = await fetch("/update-city", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ city: selectedCity }),
    });

    if (updateCity.ok) {
      alert(
        "Sua cidade foi atualizada. É necessário entrar novamente para atualizar os dados."
      );

      //limpando o refreshToken
      const encryptedToken = JSON.parse(localStorage.getItem("refreshToken"));

      if (!encryptedToken) {
        throw new Error("Token não encontrado no localStorage.");
      }

      const response = await fetch("/decrypt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(encryptedToken),
      });

      const decryptedToken = await response.json();

      //remove da lista de refeshTokens autorizados
      const logout = await fetch("/logout", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          token: decryptedToken,
        }),
      });

      if (logout.ok) {
        localStorage.clear();
        sessionStorage.clear();

        window.location.href = "/pages/login/index.html";
      }
    } else {
      const response = await updateCity.json();
      console.error("Erro ao salvar a cidade:", response);
    }
  } catch (error) {
    console.error("Erro ao salvar a cidade:", error);
  }
}
