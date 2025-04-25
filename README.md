# Farm Management Application

A comprehensive farm management application built with Angular and Ionic for the frontend and Express.js with MongoDB for the backend. The application helps farmers manage livestock, monitor health, track weather conditions, and streamline farm operations.

## Features

- User authentication and account management
- Livestock inventory management
- Animal health monitoring and vaccination tracking
- Weather forecasting for farm location
- Farm task management
- Pasture management
- Responsive design for mobile and desktop usage

## Tech Stack

### Frontend
- Angular 18
- Ionic 8
- TypeScript
- SCSS
- RxJS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- MongoDB Atlas account or local MongoDB installation
- OpenWeather API key
- WeatherAPI.com API key

## Installation

### Clone the repository
```bash
git clone https://github.com/PatrickEBlack/FinalYearProject.git
cd FinalYearProject
```

### Install dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Environment setup

#### Option 1: Automated Setup (Recommended)

Run the setup script which will guide you through the process:

```bash
npm run setup
```

This interactive script will:
- Create all necessary environment files (even if example files don't exist)
- Create required directories if they don't exist
- Prompt you for API keys and MongoDB credentials
- Configure both frontend and backend environments in one step

#### Option 2: Manual Setup

1. Create a `.env` file in the root directory with the following content:

```
MONGODB_URI=your_mongodb_connection_string
MONGODB_USER=your_mongodb_username
MONGODB_PASSWORD=your_mongodb_password
MONGODB_DB=your_database_name
PORT=3000

# API Keys
OPEN_WEATHER_API_KEY=your_openweather_api_key
WEATHER_API_KEY=your_weatherapi_key

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_APP_ID=your_firebase_app_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
```

2. The application is designed to fetch API keys securely from the server, so you don't need to modify the frontend environment files directly

#### Security Note

For security reasons, API keys and database credentials are loaded from environment variables and served to the frontend via a secure endpoint. This approach prevents exposing sensitive keys in your GitHub repository or client-side code.

If deploying to Heroku or another cloud service, make sure to set the following environment variables:
- `MONGODB_URI` (or the individual components: `MONGODB_USER`, `MONGODB_PASSWORD`, `MONGODB_DB`)
- `OPEN_WEATHER_API_KEY`
- `WEATHER_API_KEY`
- All the Firebase configuration variables (`FIREBASE_PROJECT_ID`, `FIREBASE_API_KEY`, etc.)

You can set these on Heroku using the following command:
```bash
heroku config:set OPEN_WEATHER_API_KEY=your_key WEATHER_API_KEY=your_other_key
```

## Running the application

### Development mode

```bash
# Start the backend server
cd server
node server.js
# or use nodemon for auto-reloading
# nodemon server.js

# In a separate terminal, start the frontend
cd ..
npm start
```

The application will be available at `http://localhost:4200/`

### Production build

```bash
# Create production build
npm run build

# Serve the production build
npm run serve:prod
```

## Project Structure

```
farm-management/
├── src/                        # Frontend source code
│   ├── app/                    # Angular application
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Application pages
│   │   ├── services/           # Angular services
│   │   └── tabs/               # Tab components
│   ├── assets/                 # Static assets
│   └── environments/           # Environment configurations
├── server/                     # Backend source code
│   ├── controllers/            # API controllers
│   ├── models/                 # Mongoose models
│   ├── routes/                 # API routes
│   └── server.js               # Main server entry point
└── ...                         # Configuration files
```

## API Documentation

The backend API provides endpoints for managing livestock, vaccinations, and farm settings. For detailed documentation, see the server/README.md file.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Weather data provided by OpenWeatherMap and WeatherAPI.com
- Icons from Ionicons
