const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Windows/local ISP routers that reject MongoDB SRV lookups (ECONNREFUSED).
// Only apply on Windows so Linux/Cloud hosts (like Render) keep their native container DNS.
if (process.platform === 'win32') {
    try {
        dns.setServers(['8.8.8.8', '8.8.4.4']);
    } catch (dnsErr) {
        // If setting custom DNS fails in restricted environment, continue with system defaults
    }
}

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        if (!uri) {
            throw new Error('No MongoDB connection string provided in MONGODB_URI or MONGO_URI.');
        }

        const conn = await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        // Log error but avoid instant hard exit so server can still serve health check
    }
};

module.exports = connectDB;
