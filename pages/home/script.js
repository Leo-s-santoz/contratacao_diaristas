// Pegar o accessToken globalmente
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
let urlId;

// Inicializa accessToken e urlId ao carregar a página
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    urlId = urlParams.get("id");

    accessToken = await getToken(); // Carrega o token
    listDiaristas();
    hideProfessionalProfile();
  } catch (error) {
    console.error("Erro durante o carregamento da página:", error.message);
  }
});

// Elementos do DOM
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

// Função para listar diaristas
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
      throw new Error(
        `Erro ao buscar diaristas. Status: ${response.status} - ${response.statusText}`
      );
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
