const mongoose = require("mongoose");

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

const connectDB = async (attempt = 1) => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error(" MONGO_URI is not defined. Check that .env is loaded correctly.");
    process.exit(1);
  }

  try {
    mongoose.connection.on("error", (err) => {
      // Log but do NOT crash the process — mongoose will keep trying to reconnect.
      console.error(" MongoDB connection error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn(" MongoDB disconnected. Waiting for reconnect...");
    });

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      autoIndex: true,
    });

    console.log(` MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(` MongoDB connection failed (attempt ${attempt}/${MAX_RETRIES}):`, err.message);

    if (err.message && err.message.includes("querySrv")) {
      console.error(" DNS resolution for the Atlas SRV record failed. Retrying with a direct connection...");
      try {
        const directUri = uri.replace(/^mongodb\+srv:\/\//, "mongodb://");
        const conn = await mongoose.connect(directUri, {
          serverSelectionTimeoutMS: 10000,
          connectTimeoutMS: 10000,
          socketTimeoutMS: 45000,
        });
        console.log(` MongoDB connected (direct): ${conn.connection.host}`);
        return conn;
      } catch (directErr) {
        console.error(" Direct connection also failed:", directErr.message);
      }
    }

    if (attempt < MAX_RETRIES) {
      console.log(` Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDB(attempt + 1);
    }

    console.error(" Unable to connect to MongoDB after multiple attempts. Exiting.");
    process.exit(1);
  }
};

module.exports = connectDB;
