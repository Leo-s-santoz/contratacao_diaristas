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

//recuperar accessToken global
document.addEventListener("DOMContentLoaded", async () => {
  try {
    accessToken = await getToken();
    hideProfessionalProfile();
    searchFavorites();
    listFavoriteDiaristas();

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
  } catch (error) {
    console.error("Erro ao carregar perfil: ", error);
  }
});

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
