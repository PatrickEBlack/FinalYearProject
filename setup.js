#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration for our files
const CONFIG = {
  environment: {
    src: path.join(__dirname, 'src/environments/environment.example.ts'),
    dest: path.join(__dirname, 'src/environments/environment.ts'),
    template: `// This file can be replaced during build by using the \`fileReplacements\` array.
// \`ng build\` replaces \`environment.ts\` with \`environment.prod.ts\`.
// The list of file replacements can be found in \`angular.json\`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  weatherApiKey: 'YOUR_WEATHER_API_KEY_HERE', 
  openWeatherApiKey: 'YOUR_OPENWEATHER_API_KEY_HERE'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as \`zone.run\`, \`zoneDelegate.invokeTask\`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
`
  },
  environmentProd: {
    src: path.join(__dirname, 'src/environments/environment.prod.example.ts'),
    dest: path.join(__dirname, 'src/environments/environment.prod.ts'),
    template: `export const environment = {
  production: true,
  apiUrl: 'https://your-production-api-url.com/api', // Update this when deploying to production
  weatherApiKey: 'YOUR_WEATHER_API_KEY_HERE', 
  openWeatherApiKey: 'YOUR_OPENWEATHER_API_KEY_HERE'
};
`
  },
  env: {
    src: path.join(__dirname, '.env.example'),
    dest: path.join(__dirname, '.env'),
    template: `MONGODB_URI=mongodb+srv://yourusername:yourpassword@yourcluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_USER=yourusername
MONGODB_PASSWORD=yourpassword
MONGODB_DB=farm-management
PORT=3000`
  }
};

// Ensure the environments directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Function to check if a file exists
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Function to copy a file
function copyFile(src, dest) {
  if (fileExists(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Created: ${dest} (copied from ${src})`);
  } else {
    // If source doesn't exist, check if we have a template
    const config = Object.values(CONFIG).find(c => c.src === src);
    if (config && config.template) {
      fs.writeFileSync(dest, config.template);
      console.log(`Created: ${dest} (from template)`);
    } else {
      throw new Error(`Source file ${src} not found and no template available`);
    }
  }
}

// Function to update a file with user input
function updateFile(filePath, searchValue, replaceValue) {
  let fileContent = fs.readFileSync(filePath, 'utf8');
  fileContent = fileContent.replace(searchValue, replaceValue);
  fs.writeFileSync(filePath, fileContent);
  console.log(`Updated: ${filePath}`);
}

// Main setup function
async function setup() {
  console.log('\n🚜 Farm Tracker Application - Setup\n');
  
  // Setup Angular environment files
  console.log('📁 Setting up Angular environment files...');
  
  // Ensure environments directory exists
  const environmentsDir = path.join(__dirname, 'src/environments');
  ensureDirectoryExists(environmentsDir);
  
  if (!fileExists(CONFIG.environment.dest)) {
    copyFile(CONFIG.environment.src, CONFIG.environment.dest);
  } else {
    console.log(`File already exists: ${CONFIG.environment.dest}`);
  }
  
  if (!fileExists(CONFIG.environmentProd.dest)) {
    copyFile(CONFIG.environmentProd.src, CONFIG.environmentProd.dest);
  } else {
    console.log(`File already exists: ${CONFIG.environmentProd.dest}`);
  }
  
  // Ask for Weather API keys
  const weatherApiKey = await askQuestion('Enter your WeatherAPI.com key (leave blank to skip): ');
  const openWeatherApiKey = await askQuestion('Enter your OpenWeather API key (leave blank to skip): ');
  
  if (weatherApiKey) {
    updateFile(CONFIG.environment.dest, 'YOUR_WEATHER_API_KEY_HERE', weatherApiKey);
    updateFile(CONFIG.environmentProd.dest, 'YOUR_WEATHER_API_KEY_HERE', weatherApiKey);
  }
  
  if (openWeatherApiKey) {
    updateFile(CONFIG.environment.dest, 'YOUR_OPENWEATHER_API_KEY_HERE', openWeatherApiKey);
    updateFile(CONFIG.environmentProd.dest, 'YOUR_OPENWEATHER_API_KEY_HERE', openWeatherApiKey);
  }
  
  // Setup backend .env file
  console.log('\n📁 Setting up backend environment file...');
  
  if (!fileExists(CONFIG.env.dest)) {
    copyFile(CONFIG.env.src, CONFIG.env.dest);
  } else {
    console.log(`File already exists: ${CONFIG.env.dest}`);
  }
  
  // Ask for MongoDB connection details
  const mongoDbUser = await askQuestion('Enter your MongoDB username (leave blank to skip): ');
  const mongoDbPassword = await askQuestion('Enter your MongoDB password (leave blank to skip): ');
  const mongoDbCluster = await askQuestion('Enter your MongoDB cluster address (e.g., cluster0.abcde.mongodb.net): ');
  
  if (mongoDbUser && mongoDbPassword && mongoDbCluster) {
    const mongoDbUri = `mongodb+srv://${mongoDbUser}:${mongoDbPassword}@${mongoDbCluster}/?retryWrites=true&w=majority`;
    updateFile(CONFIG.env.dest, 'mongodb+srv://yourusername:yourpassword@yourcluster.mongodb.net/?retryWrites=true&w=majority', mongoDbUri);
    updateFile(CONFIG.env.dest, 'yourusername', mongoDbUser);
    updateFile(CONFIG.env.dest, 'yourpassword', mongoDbPassword);
  }
  
  console.log('\n✅ Setup complete! You can now run:');
  console.log('   - Frontend: npm start');
  console.log('   - Backend: cd server && node server.js');
  
  rl.close();
}

// Helper function to ask questions
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Run the setup
setup().catch(error => {
  console.error('Error during setup:', error);
  process.exit(1);
});