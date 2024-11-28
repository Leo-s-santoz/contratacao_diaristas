document.addEventListener("DOMContentLoaded", function () {
  listDiaristas();
});

async function listDiaristas() {
  const accessToken = sessionStorage.getItem("accessToken");

  if (accessToken) {
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
      } else {
        console.error("Falha ao obter diaristas:", data.message);
      }
    } catch (error) {
      console.error("Erro:", error);
    }
  } else {
    console.error("Access token not found.");
  }
}
