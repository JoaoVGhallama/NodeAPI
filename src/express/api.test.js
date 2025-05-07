const http = require("http");
const assert = require("assert");

// API URL base
const API_URL = "http://localhost:3000";
let falhas = 0;

// Função auxiliar para fazer requisições HTTP
function fazerRequisicao(metodo, caminho, dados = null) {
  return new Promise((resolve, reject) => {
    const opcoes = {
      method: metodo,
      hostname: "localhost",
      port: 3000,
      path: caminho,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = http.request(opcoes, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data ? JSON.parse(data) : null,
        });
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (dados) {
      req.write(JSON.stringify(dados));
    }
    req.end();
  });
}

// Teste 1: Verificar se o GET /usuarios retorna lista de usuários
async function testarListarUsuarios() {
  console.log("\nTESTE 1: Listar todos os usuários");
  try {
    const resposta = await fazerRequisicao("GET", "/usuarios");
    assert.strictEqual(resposta.statusCode, 200, "Status code deveria ser 200");
    assert(Array.isArray(resposta.body), "Resposta deveria ser um array");
    console.log("✅ PASSOU: GET /usuarios retornou lista de usuários");
  } catch (erro) {
    console.error("❌ FALHOU: GET /usuarios", erro.message);
    falhas++;
  }
}

// Teste 2: Criar um novo usuário via POST
async function testarCriarUsuario() {
  console.log("\nTESTE 2: Criar um novo usuário");
  try {
    const novoUsuario = { nome: "Carlos" };
    const resposta = await fazerRequisicao("POST", "/usuarios", novoUsuario);
    assert.strictEqual(resposta.statusCode, 201, "Status code deveria ser 201");
    assert.strictEqual(resposta.body.nome, "Carlos", "Nome deveria ser Carlos");
    assert(resposta.body.id, "ID deveria existir");
    console.log("✅ PASSOU: POST /usuarios criou um novo usuário");
    return resposta.body; // retorna o usuário criado para usar em outros testes
  } catch (erro) {
    console.error("❌ FALHOU: POST /usuarios", erro.message);
    falhas++;
    return null;
  }
}

// Teste 3: Buscar um usuário específico por ID
async function testarBuscarUsuario(id) {
  console.log("\nTESTE 3: Buscar usuário por ID");
  try {
    const resposta = await fazerRequisicao("GET", `/usuarios/${id}`);
    assert.strictEqual(resposta.statusCode, 200, "Status code deveria ser 200");
    assert.strictEqual(resposta.body.id, id, `ID deveria ser ${id}`);
    console.log(`✅ PASSOU: GET /usuarios/${id} retornou o usuário correto`);
  } catch (erro) {
    console.error(`❌ FALHOU: GET /usuarios/${id}`, erro.message);
    falhas++;
  }
}

// Teste 4: Atualizar um usuário via PUT
async function testarAtualizarUsuario(id) {
  console.log("\nTESTE 4: Atualizar um usuário");
  try {
    const dadosAtualizados = { nome: "Carlos Atualizado" };
    const resposta = await fazerRequisicao(
      "PUT",
      `/usuarios/${id}`,
      dadosAtualizados
    );
    assert.strictEqual(resposta.statusCode, 200, "Status code deveria ser 200");
    assert.strictEqual(
      resposta.body.nome,
      "Carlos Atualizado",
      "Nome deveria ser atualizado"
    );
    console.log(`✅ PASSOU: PUT /usuarios/${id} atualizou o usuário`);
  } catch (erro) {
    console.error(`❌ FALHOU: PUT /usuarios/${id}`, erro.message);
    falhas++;
  }
}

// Teste 5: Deletar um usuário via DELETE
async function testarDeletarUsuario(id) {
  console.log("\nTESTE 5: Deletar um usuário");
  try {
    const resposta = await fazerRequisicao("DELETE", `/usuarios/${id}`);
    assert.strictEqual(resposta.statusCode, 204, "Status code deveria ser 204");

    // Verificar se foi realmente deletado
    try {
      const respostaGet = await fazerRequisicao("GET", `/usuarios/${id}`);
      assert.strictEqual(
        respostaGet.statusCode,
        404,
        "Status code deveria ser 404 após deletar"
      );
      console.log(`✅ PASSOU: DELETE /usuarios/${id} removeu o usuário`);
    } catch (erroGet) {
      console.error(`❌ FALHOU na verificação após DELETE: ${erroGet.message}`);
      falhas++;
    }
  } catch (erro) {
    console.error(`❌ FALHOU: DELETE /usuarios/${id}`, erro.message);
    falhas++;
  }
}

// Função principal para executar todos os testes
async function executarTestes() {
  console.log("Iniciando testes da API de usuários...");

  await testarListarUsuarios();
  const usuarioCriado = await testarCriarUsuario();

  if (usuarioCriado) {
    const id = usuarioCriado.id;
    await testarBuscarUsuario(id);
    await testarAtualizarUsuario(id);
    await testarDeletarUsuario(id);
  } else {
    console.error("Impossível continuar testes sem criar usuário");
    falhas++;
  }

  console.log("\nTestes concluídos!");
  console.log(
    `Resultado final: ${
      falhas === 0 ? "✅ TODOS PASSARAM" : `❌ ${falhas} FALHAS`
    }`
  );

  // Retorna código de erro se houver falhas (importante para CI)
  if (falhas > 0) {
    process.exit(1);
  }
}

// Executa os testes automaticamente
executarTestes().catch((error) => {
  console.error("Erro ao executar testes:", error);
  process.exit(1);
});
