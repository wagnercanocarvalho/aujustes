<?php
include 'php/db/conectar.php';
include 'php/db/conect.php';

// Log inicial para verificar se o script está sendo executado
error_log("upload_camera.php: Script iniciou", 0);

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    error_log("upload_camera.php: Requisição POST recebida", 0); // Log de requisição POST

    $imagens_base64 = $_POST['images'];
    $legendas = $_POST['captions'];

    if (empty($imagens_base64)) {
        error_log("upload_camera.php: Erro - Nenhuma imagem recebida", 0); // Log de erro: nenhuma imagem
        echo "Erro: Nenhuma imagem foi recebida.";
        exit;
    }

    $diretorio_imagens = 'images/';

    if (!is_dir($diretorio_imagens)) {
        if (!mkdir($diretorio_imagens, 0777, true)) {
            error_log("upload_camera.php: Erro ao criar diretório de imagens", 0); // Log de erro: falha ao criar diretório
            echo "Erro ao criar o diretório de imagens.";
            exit;
        }
    }

    foreach ($imagens_base64 as $index => $imagem_base64) {
        $legenda = isset($legendas[$index]) ? $legendas[$index] : '';
        $id_imovel = 'IMOVEL_' . date('YmdHis') . '_' . ($index + 1);

        $imagem_decodificada = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $imagem_base64));

        if ($imagem_decodificada === false) {
            error_log("upload_camera.php: Erro ao decodificar imagem base64 - Index: " . $index, 0); // Log de erro: decodificação base64
            echo "Erro ao decodificar a imagem base64.";
            continue;
        }

        $nome_arquivo = $id_imovel . '_' . ($index + 1) . '.jpg';
        $caminho_arquivo = $diretorio_imagens . $nome_arquivo;

        if (file_put_contents($caminho_arquivo, $imagem_decodificada)) {
            $data_captura = date('Y-m-d H:i:s');
            $metadata = json_encode(['data_captura' => $data_captura, 'legenda' => $legenda]);

            $sql = "INSERT INTO camera_images (id_imovel, legenda, data_captura, caminho_imagem, metadata) VALUES (?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            if ($stmt) {
                $stmt->bind_param("sssss", $id_imovel, $legenda, $data_captura, $caminho_arquivo, $metadata);
                if ($stmt->execute()) {
                    // Sucesso ao inserir no banco de dados
                    error_log("upload_camera.php: Imagem e dados inseridos no banco - Arquivo: " . $caminho_arquivo, 0); // Log de sucesso
                    } else {
                    error_log("upload_camera.php: Erro ao inserir dados no banco de dados: " . $stmt->error . " - Arquivo: " . $caminho_arquivo, 0); // Log de erro: SQL execute
                    echo "Erro ao inserir dados da imagem no banco de dados: " . $stmt->error;
                }
                $stmt->close();
            } else {
                error_log("upload_camera.php: Erro na preparação da query SQL: " . $conn->error, 0); // Log de erro: SQL prepare
                echo "Erro na preparação da query SQL: " . $conn->error;
            }


        } else {
            error_log("upload_camera.php: Erro ao salvar a imagem no servidor - Arquivo: " . $caminho_arquivo, 0); // Log de erro: falha ao salvar arquivo
            echo "Erro ao salvar a imagem no servidor.";
        }
    }

    error_log("upload_camera.php: Fotos e dados processados com sucesso!", 0); // Log de sucesso geral
    echo "Fotos enviadas e dados salvos com sucesso!";
    echo "<script>window.location.href = 'html/geo/index.html?id_imovel=$id_imovel';</script>";
} else {
    error_log("upload_camera.php: Requisição inválida (não POST)", 0); // Log de erro: requisição não POST
    echo "Requisição inválida.";
}

$conn->close();

?>