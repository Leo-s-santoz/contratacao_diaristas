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
      body: JSON.stringify(encryptedToken), // Envia o objeto completo
    });

    const result = await response.json();

    if (result.decryptedToken) {
      return result.decryptedToken; // Retorna o token original
    } else {
      throw new Error("Falha ao descriptografar o token.");
    }
  } catch (error) {
    console.error("Erro ao recuperar o token:", error);
  }
}
