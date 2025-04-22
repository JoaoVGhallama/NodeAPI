const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());

let usuarios = [
  { id: 1, nome: "João" },
  { id: 2, nome: "Maria" },
];

app.get("/usuarios", (req, res) => {
  res.json(usuarios);
});

app.get("/usuarios/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const usuario = usuarios.find((u) => u.id === id);
  if (!usuario)
    return res.status(404).json({ mensagem: "Usuário não encontrado" });
  res.json(usuario);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
