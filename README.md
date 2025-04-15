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
git clone https://github.com/yourusername/farm-management.git
cd farm-management
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

1. Create environment files for Angular:
   - Copy `src/environments/environment.example.ts` to `src/environments/environment.ts`
   - Copy `src/environments/environment.prod.example.ts` to `src/environments/environment.prod.ts`
   - Update the API keys in both files

2. Create .env file for the backend:
   - Copy `.env.example` to `.env`
   - Update the MongoDB connection URI with your credentials
   - Set other environment variables as needed

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