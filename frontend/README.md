# Login & Register Frontend

A Vue.js frontend application for user authentication with login and register functionality.

## Features

- User registration
- User login
- Protected routes
- Responsive design

## Setup Instructions

### Prerequisites

- Node.js
- npm or yarn

### Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables:
   - Create or edit `.env` file with the backend API URL:
   ```
   VUE_APP_API_URL=http://localhost:5000/api
   ```

3. Start the development server:
   ```
   npm run serve
   ```

4. Build for production:
   ```
   npm run build
   ```

## Project Structure

- `src/views/` - Vue components for different pages
- `src/router/` - Vue Router configuration
- `src/store/` - Vuex store for state management
- `src/services/` - API service for backend communication

## Usage

1. Start the backend server first
2. Start the frontend development server
3. Access the application at http://localhost:8080

## Default User

You can login with the default user:
- Email: natcha@gmail.com
- Password: Natcha1234