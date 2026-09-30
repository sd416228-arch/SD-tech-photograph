require('dotenv').config();
const app = require('./app');

const PORT = Number(process.env.PORT || 8000);

const server = app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});

function shutdown(signal) {
  console.log(`${signal} received. Closing server...`);
  server.close(() => process.exit(0));
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
