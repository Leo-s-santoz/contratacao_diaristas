//recuperar accessToken global
document.addEventListener("DOMContentLoaded", async () => {
  try {
    accessToken = await getToken();
    console.log(accessToken);

    if (!accessToken) {
      throw new Error("AccessToken não recuperado com sucesso.");
    }

    await hideProfessionalProfile();
    await searchFavorites();
    await listFavoriteDiaristas();

    const response = await fetch("/account-info", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar perfil");
    }
  } catch (error) {
    console.error("Erro ao carregar perfil: ", error);
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

let accessToken;

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

    window.location.href = `/pages/profile/profile.html?id=${data.user.id}`;
  } catch (error) {
    console.log("Erro: ", error);
  }
}

//esconder opção de perfil profissional para contratantes
async function hideProfessionalProfile() {
  if (!accessToken) {
    console.error("Token de acesso não encontrado.");
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

//listar diaristas favoritados
async function searchFavorites() {
  if (!accessToken) {
    console.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await fetch("/search-favorites", {
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

    const data = response.json();

    console.log(data);
  } catch (error) {}
}

async function listFavoriteDiaristas() {
  const listContainer = document.getElementById("diaristas-list");

  if (!accessToken) {
    console.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await fetch("/search-favorites", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Erro ao buscar favoritos. Status: ${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json();

    listContainer.innerHTML = "";

    if (data.success && data.data.length > 0) {
      const favorites = data.data;

      favorites.forEach((favorite) => {
        const listItem = document.createElement("li");

        const profilePicture = favorite.profilePicture
          ? favorite.profilePicture
          : "/img/icons/profile-placeholder.jpg";

        listItem.innerHTML = `
            <a href="/profile/profile.html?id=${favorite.id}">
                <div class="profile-list-item">
                    <div class="profile-picture-container">
                        <img class="profile-picture" src="${profilePicture}" alt="Foto de perfil">
                    </div>
                    <div class="profile-details">
                        <h3>${favorite.name}</h3>
                        <p>${favorite.city}</p>
                    </div>
                </div>
            </a>
          `;

        listContainer.appendChild(listItem);
      });
    } else {
      listContainer.innerHTML = `
          <li class="no-favorites">
            Nenhum favorito encontrado.
          </li>
        `;
    }
  } catch (error) {
    console.error("Erro ao buscar favoritos:", error);
    listContainer.innerHTML = `
        <li class="error-message">
          Não foi possível carregar a lista de favoritos.
        </li>
      `;
  }
}
