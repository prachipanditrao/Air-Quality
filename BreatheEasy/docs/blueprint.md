# **App Name**: BreatheEasy

## Core Features:

- Interactive Map: Display an interactive world map using a React component where users can select a location.
- API Integration: Upon location selection, retrieve the latitude and longitude coordinates and send a request to the Open Meteo Air Quality API (https://air-quality-api.open-meteo.com/v1/air-quality?latitude=52.52&longitude=13.41&hourly=birch_pollen,grass_pollen).
- Air Quality Display: Display the retrieved air quality metrics (e.g., birch pollen, grass pollen) in a user-friendly format on the UI.

## Style Guidelines:

- Primary color: White or light grey for the background to ensure readability.
- Secondary color: A calming blue (#3498db) for interactive elements and headers.
- Accent: Green (#2ecc71) to highlight good air quality metrics and warnings for poor conditions.
- Clean and modern layout with clear sections for the map and air quality data.
- Use simple, recognizable icons to represent different air quality metrics (e.g., pollen count, pollution levels).
- Subtle transitions and animations when updating the air quality data or selecting a new location on the map.