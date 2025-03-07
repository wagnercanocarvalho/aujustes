<?php

// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'rural_error.log');

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Incluir arquivo de conexão
require_once '../db/conectar.php';

// Processar dados
try {
    // Ler dados do corpo da requisição
    $input = file_get_contents('php://input');
    
    // Verificar se o conteúdo é JSON
    if ($_SERVER['CONTENT_TYPE'] === 'application/json') {
        $dados = json_decode($input, true);
    } else {
        $dados = $_POST;
    }

    // Verificar se há dados
    if (empty($dados)) {
        throw new Exception("Nenhum dado recebido");
    }
    // Processar dados como arrays
    $dados = $_POST;

    // Verificar se há erros
    if (empty($dados)) {
        throw new Exception("Nenhum dado recebido");
    }

    // Mapeamento de campos
    $campos = [
        'tipo' => 'string',
        'nome_propriedade' => 'string',
        'municipio' => 'string',
        'localizacao_imagem' => 'string',
        'coordenadas_geograficas' => 'string',
        'logistica' => 'string',
        'km_estrada_pavimentada' => 'string',
        'cidade_proxima' => 'string',
        'industriais_ao_redor' => 'array',
        'altitude' => 'string',
        'segmentacao' => 'array',
        'hidrografia' => 'array',
        'topografia' => 'array',
        'topografia_graus' => 'string',
        'tipo_solo' => 'string',
        'como_chegar' => 'string',
        'benfeitorias' => 'array',
        'energia' => 'array',
        'registros_fotograficos_videos' => 'string',
        'documentos' => 'array',
        'preco' => 'string',
        'forma_pagamento' => 'string'
    ];

    $valores = [];
    foreach ($campos as $campo => $tipo) {
        $valor = $dados[$campo] ?? null;

        if ($tipo === 'array') {
            $valores[$campo] = is_array($valor) ? implode(', ', array_map([$conn, 'real_escape_string'], $valor)) : '';
        } else {
            $valores[$campo] = $conn->real_escape_string($valor);
        }
    }

    // Inserir dados em imoveis_rurais
    $sql_imoveis = "INSERT INTO imoveis_rurais (
        tipo, nome_propriedade, municipio, localizacao_imagem, coordenadas_geograficas,
        logistica, km_estrada_pavimentada, cidade_proxima, industriais_ao_redor,
        altitude, segmentacao, hidrografia, topografia, topografia_graus, tipo_solo,
        como_chegar, benfeitorias, energia, registros_fotograficos_videos, documentos,
        preco, forma_pagamento, ativo, publicado, data_cadastro
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, NOW())";

    $stmt_imoveis = $conn->prepare($sql_imoveis);
    if (!$stmt_imoveis) {
        throw new Exception("Erro ao preparar query imoveis_rurais: " . $conn->error);
    }

    $tipos_imoveis = 'ssssssssssssssssssssss';
    $params_imoveis = [
        $valores['tipo'],
        $valores['nome_propriedade'],
        $valores['municipio'],
        $valores['localizacao_imagem'],
        $valores['coordenadas_geograficas'],
        $valores['logistica'],
        $valores['km_estrada_pavimentada'],
        $valores['cidade_proxima'],
        $valores['industriais_ao_redor'],
        $valores['altitude'],
        $valores['segmentacao'],
        $valores['hidrografia'],
        $valores['topografia'],
        $valores['topografia_graus'],
        $valores['tipo_solo'],
        $valores['como_chegar'],
        $valores['benfeitorias'],
        $valores['energia'],
        $valores['registros_fotograficos_videos'],
        $valores['documentos'],
        $valores['preco'],
        $valores['forma_pagamento']
    ];

    $stmt_imoveis->bind_param($tipos_imoveis, ...$params_imoveis);

    if (!$stmt_imoveis->execute()) {
        throw new Exception("Erro ao executar query imoveis_rurais: " . $stmt_imoveis->error);
    }

    $id_imovel = $stmt_imoveis->insert_id;

    // Inserir dados em clientes
    $sql_clientes = "INSERT INTO clientes (nome_completo, id_imovel, tipo) VALUES (?, ?, ?)";
    $stmt_clientes = $conn->prepare($sql_clientes);
    if (!$stmt_clientes) {
        throw new Exception("Erro ao preparar query clientes: " . $conn->error);
    }

    $nome_proprietario = $dados['nome_proprietario'];
    $tipo_imovel = $dados['tipo'];

    $stmt_clientes->bind_param('sss', $nome_proprietario, $id_imovel, $tipo_imovel);

    if (!$stmt_clientes->execute()) {
        throw new Exception("Erro ao executar query clientes: " . $stmt_clientes->error);
    }

    echo json_encode([
        'success' => true,
        'id' => $id_imovel,
        'confirm' => 'Cadastro realizado com sucesso! Deseja capturar fotos agora?'
    ]);

} catch (Exception $e) {
    error_log("ERRO: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} finally {
    if (isset($stmt_imoveis)) $stmt_imoveis->close();
    if (isset($stmt_clientes)) $stmt_clientes->close();
    if (isset($conn)) $conn->close();
}
?>