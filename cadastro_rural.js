// Definição da função carregarDadosSalvos (MOVER PARA O TOPO)
function carregarDadosSalvos() {
    const dados = JSON.parse(localStorage.getItem('dadosImovel'));
    if (dados) {
        for (const [key, value] of Object.entries(dados)) {
            const campo = document.querySelector(`[name="${key}"]`);
            if (campo) {
                campo.value = value;
            }
        }
        console.log("Dados carregados do LocalStorage.");
    }
}
// Funções de tema e geolocalização
function setTheme(themeName) {
    localStorage.setItem('theme', themeName);
    document.documentElement.className = themeName + '-theme';
}

function applyTheme() {
    const themeName = localStorage.getItem('theme') || 'light';
    setTheme(themeName);
    document.querySelector(`input[name="theme"][value="${themeName}"]`).checked = true;
}

function capturarLocalizacao() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            document.getElementById('coordenadas_geograficas').value = latitude + ', ' + longitude;

            const googleEarthLink = document.getElementById('google_earth_link');
            googleEarthLink.href = 'https://earth.google.com/web/search/' + latitude + ',' + longitude;
            googleEarthLink.style.display = 'inline-block';
        }, function() {
            alert('Não foi possível obter a localização.');
        });
    } else {
        alert('Geolocalização não suportada pelo navegador.');
    }
}

// Funções do formulário

 //função salvarCadastro() fora do escopo do DOMContentLoaded
 function salvarCadastro() {
    const formData = obterDadosDoFormulario();

    if (!navigator.onLine) {
        salvarOffline(formData);
        alert("Cadastro salvo localmente (offline). Será sincronizado quando a conexão retornar.");
    } else {
        enviarParaServidor(formData);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    
    document.addEventListener('DOMContentLoaded', () => {
        applyTheme(); // Aplica o tema salvo
        atualizarBotoes(); // Atualiza os botões conforme a conexão
        carregarDadosSalvos(); // Carrega dados salvos no LocalStorage
        if (navigator.onLine) {
            sincronizarDadosOffline(); // Sincroniza dados offline se houver conexão
        }
        document.getElementById('formImovel').addEventListener('input', salvarAutomaticamente); // Auto-save
    });
    
    window.addEventListener('online', () => {
        console.log("Conexão restabelecida. Atualizando botões...");
        atualizarBotoes();
        sincronizarDadosOffline(); // Sincroniza dados offline ao reconectar
    });
    
    window.addEventListener('offline', () => {
        console.log("Sem conexão. Atualizando botões...");
        atualizarBotoes();
    });
    
    // Carregar itens dos selects
    loadSelectItems('industriais_ao_redor');
    loadSelectItems('segmentacao');
    loadSelectItems('hidrografia');
    loadSelectItems('topografia');
    loadSelectItems('documentos_registros');
    loadSelectItems('benfeitorias');
    loadSelectItems('energia');
});

function loadSelectItems(selectId) {
    const select = document.getElementById(selectId);
    fetch(`get_select_items.php?name=${selectId}`)
        .then(response => response.json())
        .then(items => {
            items.forEach(item => {
                const option = document.createElement('option');
                option.value = item.ref;
                option.text = item.ref;
                select.add(option);
            });
        });

const form = document.getElementById('cadastroRuralForm');


// ... (seu código) ...

function obterDadosDoFormulario() {
    const data = {};
    const formElements = form.elements;

    for (let i = 0; i < formElements.length; i++) {
        const element = formElements[i];
        if (element.name) {
            let valor = element.value;
            if (typeof valor === 'string') {
                valor = removerCaracteresDeControle(valor);
            }

            if (element.type === 'radio' || element.type === 'checkbox') {
                if (element.checked) {
                    data[element.name] = valor;
                }
            } else if (element.type === 'select-multiple') {
                const selectedOptions = Array.from(element.selectedOptions).map(option => removerCaracteresDeControle(option.value));
                data[element.name] = selectedOptions;
            } else if (element.name.endsWith('[]')) {
                if (!data[element.name]) {
                    data[element.name] = [];
                }
                if (valor) {
                    data[element.name].push(valor);
                }
            } else {
                data[element.name] = valor;
            }
        }
    }

    for (const key in data) {
        if (data[key] === '' || (Array.isArray(data[key]) && data[key].length === 0)) {
            delete data[key];
        }
    }

    console.log("Dados a serem enviados:", data); // Dados como objeto JavaScript
    return data;
}

function addItem(selectId) {
    const select = document.getElementById(selectId);
    const newItemInput = select.parentElement.nextElementSibling.querySelector('.new-item-input');
    const newItem = newItemInput.value.trim();

    if (newItem) {
        // Separa os novos itens por vírgula
        const newItems = newItem.split(',').map(item => item.trim());

        // Adiciona os novos itens ao array
        newItems.forEach(item => {
            // Verifica se o item já existe no array
            if (!Array.from(select.options).some(option => option.value === item)) {
                const option = document.createElement('option');
                option.value = item;
                option.text = item;
                select.add(option);
            }
        });

        newItemInput.value = ''; // Limpa o campo de entrada
    }
}

function salvarOffline(formData) {
    const timestamp = Date.now();
    const offlineData = {
        data: formData,
        timestamp: timestamp,
        status: 'pending'
    };
    localStorage.setItem('cadastroRuralOffline_' + timestamp, JSON.stringify(offlineData));
    form.reset();
}

async function enviarParaServidor(formData) {
    try {
        const response = await fetch('https://buscaimovelnovaledoribeira/wmb/imvr-pwa/php/imoveis/rurais.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            const result = await response.json();
            alert(result.message);

            // Novo redirecionamento para fotos/index.html
            if (confirm('Deseja adicionar fotos agora?')) {
                window.location.href = `../../html/camera/camera.html?id_imovel=${result.id}`;
            }
        } else {
            throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error("Erro ao enviar dados:", error);
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            alert("Erro: Falha ao conectar ao servidor. Verifique sua conexão com a internet.");
        } else {
            alert("Erro ao enviar dados. Cadastro salvo localmente.");
        }
        salvarOffline(formData);
    }
    
}

function limparDadosOfflineSincronizados() {
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('cadastroRuralOffline_')) {
            localStorage.removeItem(key);
        }
    }
}

async function sincronizarDadosOffline() {
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('cadastroRuralOffline_')) {
            const offlineData = JSON.parse(localStorage.getItem(key));
            if (offlineData.status === 'pending') {
                try {
                    await enviarParaServidor(offlineData.data);
                    localStorage.removeItem(key);
                } catch (error) {
                    console.error("Erro ao sincronizar:", error);
                }
            }
        }
    }
}
window.onload = function() {
    if (navigator.onLine) {
        sincronizarDadosOffline();
    }
    };
}