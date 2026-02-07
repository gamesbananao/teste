// Verificar se o usuário está logado
if (!sessionStorage.getItem('isLoggedIn')) {
    window.location.href = 'index.html';
}

// Exibir nome do usuário
document.getElementById('user-display').textContent = 
    `Olá, ${sessionStorage.getItem('currentUser')}`;

// Logout
document.getElementById('logoutBtn').addEventListener('click', function() {
    sessionStorage.clear();
    window.location.href = 'index.html';
});

// Sistema de abas
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function() {
        // Remover active de todos
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        
        // Adicionar active ao clicado
        this.classList.add('active');
        const tabId = this.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// Variáveis do bot
let botToken = localStorage.getItem('botToken') || '';
let botRunning = false;
let commands = JSON.parse(localStorage.getItem('customCommands')) || {};

// Carregar token salvo
if (botToken) {
    document.getElementById('bot-token').value = botToken;
}

// Salvar Token
document.getElementById('saveTokenBtn').addEventListener('click', function() {
    const token = document.getElementById('bot-token').value;
    if (token) {
        localStorage.setItem('botToken', token);
        botToken = token;
        alert('Token salvo com sucesso!');
    } else {
        alert('Por favor, insira um token válido!');
    }
});

// Iniciar Bot
document.getElementById('startBot').addEventListener('click', function() {
    if (!botToken) {
        alert('Por favor, configure o token do bot primeiro!');
        return;
    }
    
    botRunning = true;
    document.getElementById('startBot').disabled = true;
    document.getElementById('stopBot').disabled = false;
    document.getElementById('status-text').textContent = 'Bot online';
    document.getElementById('status-text').style.color = '#48bb78';
    
    // Enviar requisição para o servidor iniciar o bot
    fetch('/api/start-bot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            token: botToken,
            commands: commands 
        })
    }).then(response => response.json())
      .then(data => {
          if (data.success) {
              updateBotStats();
              startUptimeCounter();
          } else {
              alert('Erro ao iniciar o bot: ' + data.error);
              stopBot();
          }
      }).catch(error => {
          console.log('Nota: Para funcionar completamente, você precisa configurar o servidor backend.');
      });
});

// Parar Bot
document.getElementById('stopBot').addEventListener('click', stopBot);

function stopBot() {
    botRunning = false;
    document.getElementById('startBot').disabled = false;
    document.getElementById('stopBot').disabled = true;
    document.getElementById('status-text').textContent = 'Bot desconectado';
    document.getElementById('status-text').style.color = '#e53e3e';
    
    // Resetar estatísticas
    document.getElementById('server-count').textContent = '0';
    document.getElementById('user-count').textContent = '0';
    document.getElementById('uptime').textContent = '00:00:00';
}

// Adicionar comando personalizado
document.getElementById('addCommand').addEventListener('click', function() {
    const trigger = document.getElementById('cmd-trigger').value;
    const response = document.getElementById('cmd-response').value;
    
    if (trigger && response) {
        commands[trigger] = response;
        localStorage.setItem('customCommands', JSON.stringify(commands));
        
        // Limpar inputs
        document.getElementById('cmd-trigger').value = '';
        document.getElementById('cmd-response').value = '';
        
        // Atualizar lista
        updateCommandsList();
        
        alert('Comando adicionado com sucesso!');
    } else {
        alert('Por favor, preencha todos os campos!');
    }
});

// Atualizar lista de comandos
function updateCommandsList() {
    const list = document.getElementById('commands-list');
    list.innerHTML = '';
    
    for (const [trigger, response] of Object.entries(commands)) {
        const item = document.createElement('div');
        item.className = 'command-item';
        item.innerHTML = `
            <div>
                <strong>${trigger}</strong> → ${response}
            </div>
            <button onclick="removeCommand('${trigger}')" class="btn-danger">Remover</button>
        `;
        list.appendChild(item);
    }
}

// Remover comando
window.removeCommand = function(trigger) {
    delete commands[trigger];
    localStorage.setItem('customCommands', JSON.stringify(commands));
    updateCommandsList();
}

// Atualizar credenciais
document.getElementById('updateCredentials').addEventListener('click', function() {
    const newUsername = document.getElementById('new-username').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (newPassword && newPassword !== confirmPassword) {
        alert('As senhas não coincidem!');
        return;
    }
    
    if (newUsername) {
        localStorage.setItem('username', newUsername);
    }
    
    if (newPassword) {
        localStorage.setItem('password', newPassword);
    }
    
    if (newUsername || newPassword) {
        alert('Dados atualizados com sucesso! Você será redirecionado para fazer login novamente.');
        sessionStorage.clear();
        window.location.href = 'index.html';
    } else {
        alert('Por favor, preencha pelo menos um campo!');
    }
});

// Contador de uptime
let uptimeSeconds = 0;
function startUptimeCounter() {
    setInterval(() => {
        if (botRunning) {
            uptimeSeconds++;
            const hours = Math.floor(uptimeSeconds / 3600);
            const minutes = Math.floor((uptimeSeconds % 3600) / 60);
            const seconds = uptimeSeconds % 60;
            
            document.getElementById('uptime').textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

// Atualizar estatísticas do bot (simulado)
function updateBotStats() {
    // Aqui você conectaria com o backend real
    // Por enquanto, vamos simular
    setTimeout(() => {
        if (botRunning) {
            document.getElementById('server-count').textContent = '5';
            document.getElementById('user-count').textContent = '127';
        }
    }, 2000);
}

// Carregar comandos ao iniciar
updateCommandsList();
