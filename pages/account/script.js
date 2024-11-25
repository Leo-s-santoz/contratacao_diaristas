document.addEventListener("DOMContentLoaded", () => {
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
        //document.getElementById("userType").innerText = data.type;
      })
      .catch((error) => {
        console.error("Erro: ", error);
      });
  } else {
    console.log("Token não encontrado. Usuário não está logado.");
  }
});

const profilePicture = document.getElementById("profilePicture");
const fileInput = document.getElementById("profilePictureInput");

function openFileInput() {
  fileInput.click();
}

fileInput.addEventListener("change", handleFileSelect);

function handleFileSelect(event) {
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
