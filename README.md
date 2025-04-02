# Travel AI - Interactive Travel Itinerary Planner

A modern web application that helps users plan and visualize their travel itineraries with an interactive map interface. Built with React, TypeScript, and Leaflet maps.

## Features

- 🗺️ Interactive map visualization of travel itineraries
- 📍 Automatic geocoding of locations
- 🚗 Route visualization between consecutive activities
- 📅 Day-by-day itinerary organization
- 🎯 Activity markers with detailed information


## Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm

## API Key

The application requires an API key to function. When you first load the application, you'll be prompted to enter your API key. This key will be stored in your browser's local storage for future use.

You can obtain an API key from:
- [OpenAI Developer Portal](https://platform.openai.com/api-keys)

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/travel-ai.git
cd travel-ai
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit the `.env` file with your required API keys and configuration.

4. Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
travel-ai/
├── src/
│   ├── features/
│   │   └── map/
│   │       ├── components/
│   │       ├── services/
│   │       └── types/
│   └── ...
├── public/
└── ...
```

## Key Components

- `ItineraryMap`: Main map component that displays activities and routes
- `MapController`: Handles map interactions and viewport management
- `GeocodingService`: Converts location names to coordinates
- `RoutingService`: Calculates routes between consecutive activities

## Available Scripts

- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm preview`: Preview production build
- `pnpm lint`: Run ESLint

## Technologies Used

- React 19
- TypeScript
- Vite
- Leaflet Maps
- Tailwind CSS
- React Hot Toast
- React Vertical Timeline