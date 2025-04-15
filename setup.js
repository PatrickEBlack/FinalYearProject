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
    dest: path.join(__dirname, 'src/environments/environment.ts')
  },
  environmentProd: {
    src: path.join(__dirname, 'src/environments/environment.prod.example.ts'),
    dest: path.join(__dirname, 'src/environments/environment.prod.ts')
  },
  env: {
    src: path.join(__dirname, '.env.example'),
    dest: path.join(__dirname, '.env')
  }
};

// Function to check if a file exists
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Function to copy a file
function copyFile(src, dest) {
  fs.copyFileSync(src, dest);
  console.log(`Created: ${dest}`);
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