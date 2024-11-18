document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (token) {
    fetch("http://localhost:3000/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao buscar perfil");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Usuário:", data.name); // Nome do usuário
        console.log("Cidade:", data.city); // Cidade do usuário
        console.log("Tipo:", data.type); // Tipo do usuário

        // Exibe as informações na página conforme necessário
        document.getElementById("username").innerText = data.name;
        document.getElementById("userCity").innerText = data.city;
        document.getElementById("userType").innerText = data.type;
      })
      .catch((error) => {
        console.error("Erro:", error);
      });
  } else {
    console.log("Token não encontrado. Usuário não está logado.");
  }
});
