// Função para salvar dados no LocalStorage
async function salvarLocalmente(dados) {
    try {
        let imoveis = JSON.parse(localStorage.getItem('imoveis')) || [];
        imoveis.push(dados);
        localStorage.setItem('imoveis', JSON.stringify(imoveis));
        alert("Dados salvos localmente!");
    } catch (error) {
        console.error("Erro ao salvar localmente:", error);
        alert("Erro ao salvar os dados localmente.");
    }
}

// Função para salvar imóvel no servidor
async function salvarImovel(dados) {
    fetch('https://buscaimovelnovaledoribeira.com.br/wmb/imvr-pwa/php/imoveis/rurais.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(err => {
                try {
                    const errorData = JSON.parse(err);
                    throw new Error(errorData.message);
                } catch (e) {
                    throw new Error(err);
                }
            });
        }
        return response.json();
    })
    .then(data => {
        console.log("Imóvel salvo com sucesso:", data);
        alert("Imóvel salvo com sucesso!");
    })
    .catch(error => {
        console.error("Erro ao salvar imóvel:", error);
        alert("Erro ao salvar imóvel. Verifique o console para detalhes.");
    });
}

// Função para sincronizar dados com o servidor
function sincronizarDados() {
    const imoveis = JSON.parse(localStorage.getItem('imoveis')) || [];

    if (imoveis.length > 0 && navigator.onLine) {
        imoveis.forEach(dados => {
            salvarImovel(dados); // Envia cada imóvel para o servidor
        });
        localStorage.removeItem('imoveis'); // Limpa os dados locais após sincronização
        alert("Dados sincronizados com sucesso!");
    } else if (!navigator.onLine) {
        alert("Sem conexão com a internet. Os dados serão sincronizados quando a conexão for restabelecida.");
    } else {
        console.log("Nenhum dado local para sincronizar.");
    }
}

// Função para capturar dados do formulário
function capturarDadosFormulario() {
    const formData = new FormData(document.getElementById('formImovel'));
    return Object.fromEntries(formData.entries());
}

// Função para salvar e sincronizar dados
function salvarESincronizar() {
    const dados = capturarDadosFormulario();
    salvarLocalmente(dados); // Salva localmente
    sincronizarDados(); // Tenta sincronizar com o servidor
}

// Função para atualizar os botões conforme a conexão
function atualizarBotoes() {
    const btnSalvarLocalmente = document.getElementById('btnSalvarLocalmente');
    const btnSalvarImovel = document.getElementById('btnSalvarImovel');

    if (btnSalvarLocalmente && btnSalvarImovel) { // Verifica se os elementos existem
        btnSalvarImovel.style.display = navigator.onLine ? 'block' : 'none';
        btnSalvarLocalmente.style.display = navigator.onLine ? 'none' : 'block';
    } else {
        console.error("Botões 'Salvar Localmente' ou 'Salvar Imóvel' não encontrados no DOM.");
    }
}
// Função para capturar localização
function capturarLocalizacao() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            document.getElementById('coordenadas_geograficas').value = `Lat: ${lat}, Lon: ${lon}`;
            alert(`Localização capturada: Latitude ${lat}, Longitude ${lon}`);
        }, (error) => {
            alert("Erro ao capturar localização: " + error.message);
        });
    } else {
        alert("Geolocalização não suportada no seu navegador.");
    }
}

// Funções para adicionar novos itens às listas
function adicionarFinalidade() {
    const novaFinalidade = prompt("Digite a nova finalidade:");
    if (novaFinalidade) {
        const select = document.getElementById('transacao');
        const option = document.createElement('option');
        option.value = novaFinalidade.toLowerCase();
        option.textContent = novaFinalidade;
        select.appendChild(option);
    }
}

function adicionarTipoImovel() {
    const novoTipo = prompt("Digite o novo tipo de imóvel:");
    if (novoTipo) {
        const select = document.getElementById('tipoimovel');
        const option = document.createElement('option');
        option.value = novoTipo.toLowerCase();
        option.textContent = novoTipo;
        select.appendChild(option);
    }
}

function adicionarBairro() {
    const novoBairro = prompt("Digite o novo bairro:");
    if (novoBairro) {
        const select = document.getElementById('endereco_bairro');
        const option = document.createElement('option');
        option.value = novoBairro.toLowerCase();
        option.textContent = novoBairro;
        select.appendChild(option);
    }
}

// Função para capturar mídia (foto ou vídeo)
async function capturarMidia(prefixo) {
    try {
        const tipo = prompt("Deseja capturar foto (f) ou vídeo (v)?", "f").toLowerCase();
        if (tipo !== 'f' && tipo !== 'v') {
            alert("Tipo de mídia inválido.");
            return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        document.body.appendChild(video);

        if (tipo === 'f') {
            const nomeArquivo = `${prefixo}_foto${Date.now()}.jpg`;
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);

            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
            salvarMidia(blob, nomeArquivo);
        } else if (tipo === 'v') {
            const nomeArquivo = `${prefixo}_video${Date.now()}.mp4`;
            const tempoGravacao = prompt("Digite o tempo de gravação em segundos:", "5");

            const mediaRecorder = new MediaRecorder(stream);
            const chunks = [];
            mediaRecorder.ondataavailable = e => chunks.push(e.data);
            mediaRecorder.start();

            setTimeout(() => {
                mediaRecorder.stop();
                const blob = new Blob(chunks, { type: 'video/mp4' });
                salvarMidia(blob, nomeArquivo);
            }, tempoGravacao * 1000);
        }

        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(video);
    } catch (error) {
        console.error("Erro ao capturar mídia:", error);
        alert("Erro ao capturar mídia. Verifique as permissões e tente novamente.");
    }
}

// Função para salvar mídia e geolocalização
function salvarMidia(blob, nomeArquivo) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const dados = {
                ...capturarDadosFormulario(),
                nome_arquivo: nomeArquivo,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            salvarLocalmente(dados);
        },
        (error) => {
            console.error("Erro ao obter geolocalização:", error);
            const dados = {
                ...capturarDadosFormulario(),
                nome_arquivo: nomeArquivo
            };
            salvarLocalmente(dados);
        }
    );
}

// Evento DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    atualizarBotoes(); // Atualiza os botões conforme a conexão

    // Evento para o botão "Capturar Mídia"
    const btnCapturar = document.querySelector('#btnCapturarMidia');
    if (btnCapturar) {
        btnCapturar.addEventListener('click', () => capturarMidia('wmb'));
    } else {
        console.error("Botão 'Capturar Mídia' não encontrado no DOM.");
    }

    
// Evento para o botão "Salvar Localmente"
document.getElementById('btnSalvarLocalmente').addEventListener('click', () => {
    const dados = capturarDadosFormulario();
    salvarLocalmente(dados);
});

// Evento para o botão "Salvar Imóvel"
document.getElementById('btnSalvarImovel').addEventListener('click', () => {
    const dados = capturarDadosFormulario();
    salvarImovel(dados);
});

// ... (seu código) ...
    // Eventos para monitorar a conexão
    window.addEventListener('online', atualizarBotoes);
    window.addEventListener('offline', atualizarBotoes);
});
