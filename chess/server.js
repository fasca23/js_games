const path = require('path');
const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');

const app = express();
app.use(express.static(__dirname));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// roomId -> {
//   players: [ws1, ws2],
//   turn: 'w',
//   history: [ { move, promotionTo } ],   // для реплея
// }
const rooms = new Map();

function broadcast(room, payload) {
  const data = JSON.stringify(payload);
  room.players.forEach(p => { if (p.readyState === 1) p.send(data); });
}

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    let msg;
    try { msg = JSON.parse(data); } catch { return; }

    if (msg.type === 'join') {
      let room = rooms.get(msg.roomId);
      if (!room) {
        room = { players: [], turn: 'w', history: [] };
        rooms.set(msg.roomId, room);
      }
      room.players = room.players.filter(p => p.readyState === 1);

      if (room.players.length >= 2) {
        ws.send(JSON.stringify({ type: 'error', message: 'room full' }));
        return;
      }

      // цвет: первый свободный
      // если кто-то уже сидит за белых — новый за чёрных, и наоборот
      const taken = new Set(room.players.map(p => p.myColor));
      const color = !taken.has('w') ? 'w' : 'b';

      room.players.push(ws);
      ws.roomId = msg.roomId;
      ws.myColor = color;

      ws.send(JSON.stringify({
        type: 'assigned',
        color,
        roomId: msg.roomId,
        // синхронизация: вся история + чей ход
        history: room.history,
        turn: room.turn
      }));

      if (room.players.length === 2) {
        broadcast(room, { type: 'opponent_joined' });
      }
    }

    if (msg.type === 'move') {
      const room = rooms.get(ws.roomId);
      if (!room) return;
      if (ws.myColor !== room.turn) {
        ws.send(JSON.stringify({ type: 'error', message: 'not your turn' }));
        return;
      }
      room.history.push({
        move: msg.move,
        promotionTo: msg.move.promotionTo || null
      });
      room.turn = room.turn === 'w' ? 'b' : 'w';
      broadcast(room, { type: 'move', move: msg.move });
    }
  });

  ws.on('close', () => {
    const room = rooms.get(ws.roomId);
    if (!room) return;
    room.players = room.players.filter(p => p !== ws);
    broadcast(room, { type: 'opponent_left' });
    if (room.players.length === 0) rooms.delete(ws.roomId);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log('Server running on port ' + PORT));