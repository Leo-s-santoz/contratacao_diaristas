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
