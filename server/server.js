const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const config = require('./config');

// Routes
const livestockRoutes = require('./routes/livestock.routes');
const vaccinationRoutes = require('./routes/vaccination.routes');
const settingsRoutes = require('./routes/settings.routes');

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow any origin during development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
// Hide sensitive credentials in logs
const redactedURI = config.MONGODB_URI.replace(/\/\/[^:]+:([^@]+)@/, '//***:***@');
console.log('Attempting to connect to MongoDB with URI:', redactedURI);

// Connection options for Mongoose
mongoose.set('strictQuery', false); // Avoid deprecation warning

// Set up mongoose debug logging
mongoose.set('debug', true);

// Log all MongoDB-related events
mongoose.connection.on('connecting', () => console.log('MongoDB: Connecting to database...'));
mongoose.connection.on('connected', () => console.log('MongoDB: Connected to database'));
mongoose.connection.on('disconnecting', () => console.log('MongoDB: Disconnecting from database...'));
mongoose.connection.on('disconnected', () => console.log('MongoDB: Disconnected from database'));
mongoose.connection.on('reconnected', () => console.log('MongoDB: Reconnected to database'));
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection event error:', JSON.stringify({
    name: err.name,
    message: err.message,
    stack: err.stack,
    code: err.code,
    errorLabels: err.errorLabels,
    connectionGeneration: err.connectionGeneration
  }, null, 2));
});

// Connect to MongoDB with detailed error handling
console.log('Attempting MongoDB connection with options:', {
  uri: redactedURI,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 20000,
    heartbeatFrequencyMS: 10000,
    socketTimeoutMS: 45000,
    family: 4
  }
});

// Attempt connection
mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 20000, // 20 second timeout
  heartbeatFrequencyMS: 10000, // Check server status every 10 seconds
  socketTimeoutMS: 45000, // Socket timeout setting
  family: 4 // Use IPv4, avoid IPv6 issues
})
.then(() => {
  console.log('Connected to MongoDB Atlas successfully!');
  
  // Display detailed connection information
  const conn = mongoose.connection;
  console.log('Connection Details:', JSON.stringify({
    readyState: conn.readyState,
    readyStateDescription: ['disconnected', 'connected', 'connecting', 'disconnecting'][conn.readyState],
    host: conn.host,
    port: conn.port,
    name: conn.name,
    user: conn.user ? '(authenticated)' : '(no user)',
    models: Object.keys(conn.models),
    modelNames: conn.modelNames(),
    config: {
      autoIndex: conn.config.autoIndex,
      bufferCommands: conn.config.bufferCommands,
      useCreateIndex: conn.config.useCreateIndex,
      useFindAndModify: conn.config.useFindAndModify
    }
  }, null, 2));
  
  // Test the connection with a simple query
  return mongoose.connection.db.admin().ping();
})
.then(() => {
  console.log('MongoDB server ping successful!');
  // Try listing collections to verify database access
  return mongoose.connection.db.listCollections().toArray();
})
.then(collections => {
  console.log(`Found ${collections.length} collections in database:`);
  collections.forEach(collection => {
    console.log(`- ${collection.name} (type: ${collection.type})`);
  });
})
.catch(err => {
  console.error('===== MONGODB CONNECTION ERROR =====');
  console.error('Error connecting to MongoDB:', {
    errorType: err.name,
    message: err.message,
    code: err.code,
    codeName: err.codeName,
    errorLabels: err.errorLabels || [],
    connectionString: redactedURI,
    serverHost: err.serverHost || 'unknown',
    topology: err.topology ? {
      type: err.topology.description ? err.topology.description.type : 'unknown',
      servers: err.topology.description ? Object.keys(err.topology.description.servers).length : 0
    } : 'unknown',
    drivers: err.drivers || 'unknown',
    message: err.message
  });
  
  // Print full error object for maximum debugging information
  console.error('Full error details:');
  console.error(JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
  
  // Provide troubleshooting guidance based on error type
  if (err.name === 'MongoServerSelectionError') {
    console.error('\nTROUBLESHOOTING GUIDE - Server Selection Error:');
    console.error('1. Check network connectivity to MongoDB Atlas');
    console.error('2. Verify IP address is whitelisted in MongoDB Atlas Network Access');
    console.error('3. Confirm username and password are correct');
    console.error('4. Check if MongoDB Atlas cluster is active (not paused)');
    console.error('5. Verify the cluster name in connection string is correct');
  } else if (err.name === 'MongoNetworkError') {
    console.error('\nTROUBLESHOOTING GUIDE - Network Error:');
    console.error('1. Check internet connectivity');
    console.error('2. Verify firewall settings allow outbound connections to MongoDB Atlas');
    console.error('3. Confirm MongoDB Atlas cluster is available');
  } else if (err.name === 'MongoError' && err.code === 18) {
    console.error('\nTROUBLESHOOTING GUIDE - Authentication Error:');
    console.error('1. Verify username and password in connection string');
    console.error('2. Confirm user has appropriate permissions');
    console.error('3. Check if user is associated with the correct database');
  } else if (err.name === 'MongoParseError') {
    console.error('\nTROUBLESHOOTING GUIDE - Parse Error:');
    console.error('1. Check connection string format is correct');
    console.error('2. Verify special characters in username/password are properly URL encoded');
  }
  
  console.error('\nFor MongoDB Atlas issues, check:');
  console.error('- https://status.mongodb.com/ for service status');
  console.error('- https://cloud.mongodb.com/ to verify connection settings');
});

// API Routes
app.use('/api/livestock', livestockRoutes);
app.use('/api/vaccinations', vaccinationRoutes);
app.use('/api/settings', settingsRoutes);

// Serve static files from the Angular app build directory
app.use(express.static(path.join(__dirname, '../dist')));

// Health check routes for API
app.get('/api', (req, res) => {
  res.send('Farm Management API is running');
});

// API test endpoint - for troubleshooting frontend connectivity
app.get('/api/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API connectivity test successful',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', async (req, res) => {
  const connectionStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const mongoState = connectionStates[mongoose.connection.readyState] || 'unknown';
  
  let dbPingSuccess = false;
  let collections = [];
  
  // Test the MongoDB connection with a ping if connected
  if (mongoose.connection.readyState === 1) {
    try {
      await mongoose.connection.db.admin().ping();
      dbPingSuccess = true;
      
      // Get list of collections
      const collectionsList = await mongoose.connection.db.listCollections().toArray();
      collections = collectionsList.map(col => col.name);
    } catch (error) {
      console.error('Health check - DB ping error:', error);
    }
  }
  
  res.status(200).json({
    service: 'Farm Management API',
    status: 'UP',
    mongodb: {
      state: mongoState,
      readyState: mongoose.connection.readyState,
      connected: mongoose.connection.readyState === 1,
      dbName: mongoose.connection.name,
      pingSuccess: dbPingSuccess,
      collections: collections
    },
    timestamp: new Date().toISOString()
  });
});

// All other routes should be handled by the Angular app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start server
app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});