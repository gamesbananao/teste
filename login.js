// Credenciais padrão
let credentials = {
    username: localStorage.getItem('username') || 'samuelxzz',
    password: localStorage.getItem('password') || 'SENHATESTE'
};

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-message');
    
    if (username === credentials.username && password === credentials.password) {
        // Login bem-sucedido
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('currentUser', username);
        window.location.href = 'dashboard.html';
    } else {
        // Login falhou
        errorMsg.textContent = 'Usuário ou senha incorretos!';
        setTimeout(() => {
            errorMsg.textContent = '';
        }, 3000);
    }
});
