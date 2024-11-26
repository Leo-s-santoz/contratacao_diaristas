const profilePicture = document.getElementById("profilePicture");
const fileInput = document.getElementById("profilePictureInput");

document.addEventListener("DOMContentLoaded", () => {
  informationSearch();
  descriptionSearch();
});

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
    const accessToken = sessionStorage.getItem("accessToken");

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

//buscar informações
async function informationSearch() {
  const accessToken = sessionStorage.getItem("accessToken");

  if (accessToken) {
    fetch("/info", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao buscar perfil");
        }
        return response.json();
      })
      .then((data) => {
        document.getElementById("name").innerText = data.name;
        document.getElementById("city").innerText = data.city;
        if (data.profilePicture) {
          profilePicture.src = data.profilePicture;
        } else {
          profilePicture.src = "/img/icons/profile-placeholder.jpg";
        }
      })
      .catch((error) => {
        console.error("Erro: ", error);
      });
  } else {
    console.log("Token não encontrado. Usuário não está logado.");
  }
}

//buscar descricao
async function descriptionSearch() {
  try {
    const accessToken = sessionStorage.getItem("accessToken");

    if (!accessToken) {
      throw new Error("Token de acesso não encontrado. Faça login novamente.");
    }

    const response = await fetch("/diarista", {
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
        descriptionElement.textContent = data.description; // Insere a descrição no elemento
      }
    }
  } catch (error) {
    console.error("Erro:", error);
    const errorElement = document.getElementById("error-message"); // Certifique-se de ter um elemento com esse ID
    if (errorElement) {
      errorElement.textContent = error.message;
    }
  }
}
