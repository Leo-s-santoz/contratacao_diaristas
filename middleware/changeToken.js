//verificar e atualizar o token se necessário
function refreshAccessToken() {
  const refreshToken = sessionStorage.getItem("refresh_token");
  if (refreshToken) {
    fetch("/api/refresh-token", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.accessToken) {
          sessionStorage.setItem("access_token", data.accessToken);
        }
      })
      .catch((err) => {
        console.log("Error refreshing token:", err);
      });
  }
}

module.exports = { refreshAccessToken };
