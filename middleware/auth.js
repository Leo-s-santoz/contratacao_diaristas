const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Invalid authorization header" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token not provided" });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(403).json({ message: "Token expired" });
      }
      return res.status(403).json({ message: "Invalid token" });
    }

    req.user = user; // Passa o usuário decodificado para o próxima /rota
    next();
  });
}

module.exports = authenticateToken;
