const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Windows/local ISP routers that reject MongoDB SRV lookups (ECONNREFUSED)
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (dnsErr) {
    // If setting custom DNS fails in restricted environment, continue with system defaults
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
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
