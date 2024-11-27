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
          listItem.innerHTML = `
              <a href="/perfil-diarista.html?id=${diarista.id}">
                <h3>${diarista.name}</h3>
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
