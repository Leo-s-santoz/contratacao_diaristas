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

// Inicializa accessToken e urlId ao carregar a página
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    urlId = urlParams.get("id");

    accessToken = await getToken();
    listDiaristas();
    hideProfessionalProfile();
  } catch (error) {
    console.error("Erro durante o carregamento da página:", error.message);
  }
});

const profissionalProfile = document.getElementById("profissionalProfile");

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

//listar diaristas
async function listDiaristas() {
  if (!accessToken) {
    console.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await fetch("/list-diaristas", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorMessage = `Erro ao buscar diaristas. Status: ${response.status} - ${response.statusText}`;
      console.error(errorMessage);

      // Adicionar mensagem no HTML
      const listContainer = document.getElementById("diaristas-list");
      listContainer.innerHTML = `
        <li class="error-message">
          <p>Sem diaristas disponíveis na sua cidade.</p>
        </li>
      `;
      return;
    }

    const data = await response.json();

    if (data.success) {
      const diaristasList = data.data;
      console.log(diaristasList);
      const listContainer = document.getElementById("diaristas-list");

      diaristasList.forEach((diarista) => {
        const listItem = document.createElement("li");

        const profilePicture = diarista.profilePicture
          ? diarista.profilePicture
          : "/img/icons/profile-placeholder.jpg";

        listItem.innerHTML = `
            <a href="/profile/profile.html?id=${diarista.id}">
                <div class="profile-list-item">
                    <div class="profile-picture-container">
                        <img class="profile-picture" src="${profilePicture}" alt="Foto de perfil">
                    </div>
                    <div class="profile-details">
                        <h3>${diarista.name}</h3>
                    </div>
                </div>
            </a>
        `;
        listContainer.appendChild(listItem);
      });

      console.log(data);
    } else {
      console.error("Falha ao obter diaristas:", data.message);
    }
  } catch (error) {
    console.error("Erro:", error);
  }
}

// Redirecionar para o perfil da diarista logada
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
      throw new Error(`Erro ao buscar perfil. Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.user || !data.user.id) {
      throw new Error("Dados do usuário inválidos ou incompletos.");
    }

    console.log(data);

    window.location.href = `/pages/profile/profile.html?id=${data.user.id}`;
  } catch (error) {
    console.error("Erro ao redirecionar para o perfil:", error);
  }
}
