/**
 * Server Entry Point
 * Initializes Express app, connects to MongoDB, and starts server
 */

require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start Server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await connectDB();

    // Start Express Server
    const server = app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║   Micro Finance Management System                          ║
║                                                            ║
║   Server Started Successfully                             ║
║   Environment: ${NODE_ENV.padEnd(50).substring(0, 50)}║
║   Port: ${String(PORT).padEnd(56).substring(0, 56)}║
║   Timestamp: ${new Date().toISOString()}║
║                                                            ║
║   Health Check: http://localhost:${PORT}/api/health${' '.repeat(15 - String(PORT).length)}║
╚════════════════════════════════════════════════════════════╝
      `);
    });

    // Handle Server Errors
    server.on('error', (error) => {
      console.error('❌ Server Error:', error);
      process.exit(1);
    });

    // Graceful Shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down server...');
      server.close(() => {
        console.log('✓ Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();
