# Farm Management App - MongoDB Backend

This is the backend server for the Farm Management application. It provides a REST API for managing livestock, vaccinations, settings, and other data stored in MongoDB.

## Setup Instructions

1. Install dependencies:
   ```
   cd server
   npm install
   ```

2. Create a `.env` file in the server directory with your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://yourusername:yourpassword@yourcluster.mongodb.net/?retryWrites=true&w=majority
   PORT=3000
   ```

3. Start the server:
   ```
   npm start
   ```

## API Endpoints

### Livestock

- `GET /api/livestock?userId=:userId` - Get all livestock for a user
- `GET /api/livestock/:id` - Get a specific livestock record
- `POST /api/livestock` - Create a new livestock record
- `PUT /api/livestock/:id` - Update a livestock record
- `DELETE /api/livestock/:id` - Delete a livestock record
- `POST /api/livestock/:id/vaccinations` - Add a vaccination to a livestock record

### Settings

- `GET /api/settings/:userId` - Get settings for a user
- `PUT /api/settings/:userId` - Update settings for a user

## Data Models

### Livestock

```javascript
{
  type: String,         // required
  quantity: Number,     // required
  breed: String,
  birthDate: Date,
  pasture: String,
  dateAdded: Date,      // default: now
  herdNumber: String,
  tagNumber: String,
  vaccinations: [       // array of vaccination objects
    {
      name: String,     // required
      date: Date,       // required
      nextDue: Date,
      notes: String
    }
  ],
  userId: String        // required
}
```

### Settings

```javascript
{
  userId: String,       // required, unique
  preferences: {
    theme: String,      // default: 'light'
    notifications: Boolean, // default: true
    language: String,   // default: 'en'
    units: String       // default: 'metric'
  },
  farmInfo: {
    name: String,
    location: String,
    size: Number,
    sizeUnit: String    // default: 'acres'
  }
}
```

## Security Considerations

- Ensure your MongoDB Atlas IP whitelist is properly configured
- Update the production MongoDB connection string in the `.env` file
- Never commit your `.env` file to version control
- Set up proper authentication for your API in production