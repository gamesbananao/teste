const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

let discordClient = null;
let customCommands = {};

app.post('/api/start-bot', async (req, res) => {
    const { token, commands } = req.body;
    
    if (!token) {
        return res.json({ success: false, error: 'Token não fornecido' });
    }
    
    try {
        // Criar nova instância do cliente Discord
        discordClient = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers
            ]
        });
        
        customCommands = commands || {};
        
        // Eventos do bot
        discordClient.once('ready', () => {
            console.log(`Bot logado como ${discordClient.user.tag}!`);
        });
        
        // Listener de mensagens
        discordClient.on('messageCreate', message => {
            if (message.author.bot) return;
            
            // Verificar comandos personalizados
            if (customCommands[message.content]) {
                message.reply(customCommands[message.content]);
            }
            
            // Comandos padrão
            if (message.content === '!ping') {
                message.reply('Pong!');
            }
            
            if (message.content === '!info') {
                message.reply(`Este bot está em ${discordClient.guilds.cache.size} servidores!`);
            }
        });
        
        // Login do bot
        await discordClient.login(token);
        
        res.json({ 
            success: true, 
            botTag: discordClient.user.tag,
            servers: discordClient.guilds.cache.size
        });
        
    } catch (error) {
        console.error('Erro ao iniciar bot:', error);
        res.json({ success: false, error: error.message });
    }
});

app.post('/api/stop-bot', (req, res) => {
    if (discordClient) {
        discordClient.destroy();
        discordClient = null;
    }
    res.json({ success: true });
});

app.get('/api/bot-stats', (req, res) => {
    if (discordClient && discordClient.user) {
        let totalUsers = 0;
        discordClient.guilds.cache.forEach(guild => {
            totalUsers += guild.memberCount;
        });
        
        res.json({
            success: true,
            servers: discordClient.guilds.cache.size,
            users: totalUsers,
            botName: discordClient.user.tag
        });
    } else {
        res.json({ success: false, error: 'Bot não está online' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
