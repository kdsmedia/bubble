const express = require('express');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const port = 3000;

// Middleware untuk menyajikan file statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Mengatur rute dasar untuk mengirim file HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Membuat server HTTP
const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Membuat WebSocket Server
const wss = new WebSocket.Server({ server });

// Menangani koneksi WebSocket
wss.on('connection', (ws) => {
  console.log('New WebSocket connection');

  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    const data = JSON.parse(message);

    if (data.type === 'join') {
      console.log(`User joined with username: ${data.username}`);
      // Broadcast message to all clients except the sender
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'userJoined',
            username: data.username
          }));
        }
      });
    } else if (data.type === 'gift') {
      // Broadcast gift message to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'gift',
            userId: data.userId,
            userAvatar: data.userAvatar,
            giftAmount: data.giftAmount
          }));
        }
      });
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});
