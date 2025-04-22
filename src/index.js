const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());

let usuarios = [
  { id: 1, nome: "João" },
  { id: 2, nome: "Maria" },
];

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
