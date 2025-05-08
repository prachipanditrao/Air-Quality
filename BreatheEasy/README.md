# BreatheEasy - Air Quality Monitoring

BreatheEasy is a web application designed to provide users with real-time air quality information for any location they select on an interactive map. It leverages the Open-Meteo API to fetch air quality data, including levels of Carbon Monoxide (CO), Carbon Dioxide (CO₂), and Dust.

## Features

- **Interactive Map:** Users can click on any location on a Google Map to get air quality data.
- **Real-time Data:** Fetches the latest available air quality metrics from the Open-Meteo API.
- **Pollutant Breakdown:** Displays levels for key pollutants:
    - Carbon Monoxide (CO)
    - Carbon Dioxide (CO₂)
    - Dust
- **Health Indicators:** Provides qualitative indicators (Low, Moderate, High, Very High) for each pollutant based on their concentration.
- **Location Information:** Shows latitude, longitude, and timezone for the selected location.
- **Responsive Design:** Adapts to different screen sizes for a seamless experience on desktop and mobile devices.
- **Clear UI:** Uses ShadCN UI components and Tailwind CSS for a modern and clean interface.

## Technologies Used

- **Frontend:** Next.js (React framework), TypeScript
- **Mapping:** Google Maps API (via `@vis.gl/react-google-maps`)
- **Styling:** Tailwind CSS, ShadCN UI
- **Data Source:** Open-Meteo Air Quality API
- **Deployment:** (Could be deployed on Firebase or any Next.js compatible platform)

## Getting Started

To run this project locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/prachipanditrao/Air-Quality.git
    cd BreatheEasy
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of your project and add your Google Maps API key and Map ID:
    ```env
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
    NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=YOUR_GOOGLE_MAPS_MAP_ID
    ```
    - `YOUR_GOOGLE_MAPS_API_KEY`: Your Google Maps JavaScript API Key. Ensure it has "Maps JavaScript API" enabled and appropriate billing setup.
    - `YOUR_GOOGLE_MAPS_MAP_ID`: Your Google Maps Cloud-based Map Styling ID (optional for basic map, required for advanced features like custom styling and Advanced Markers).

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application will typically be available at `http://localhost:3000` (or the port specified in your `dev` script, like `9002` for this project).

## Project Structure

-   `src/app/`: Contains the main application pages and layout.
    -   `page.tsx`: The main page component displaying the map and air quality data.
    -   `layout.tsx`: The root layout for the application.
    -   `globals.css`: Global styles and ShadCN theme variables.
-   `src/components/`: Reusable UI components.
    -   `map-picker.tsx`: The Google Maps component for location selection.
    -   `air-quality-display.tsx`: Component to display fetched air quality data.
    -   `ui/`: ShadCN UI components.
-   `src/services/`: Contains services for fetching data from external APIs.
    -   `air-quality.ts`: Logic for fetching and processing air quality data from Open-Meteo.
-   `src/lib/`: Utility functions.
-   `public/`: Static assets.
-   `next.config.ts`: Next.js configuration file.
-   `tailwind.config.ts`: Tailwind CSS configuration.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any bugs or feature requests.
```