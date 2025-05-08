/**
 * Represents a geographical location with latitude and longitude coordinates.
 */
export interface Location {
  lat: number;
  lng: number;
}

interface OpenMeteoHourlyData {
  time: string[];
  birch_pollen?: (number | null)[];
  grass_pollen?: (number | null)[];
  carbon_monoxide?: (number | null)[];
  carbon_dioxide?: (number | null)[]; // Added carbon_dioxide
  dust?: (number | null)[];
}

interface OpenMeteoAirQualityResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  hourly_units: {
    time: string;
    birch_pollen?: string;
    grass_pollen?: string;
    carbon_monoxide?: string;
    carbon_dioxide?: string; // Added carbon_dioxide unit
    dust?: string;
  };
  hourly: OpenMeteoHourlyData;
}

export interface ProcessedAirQualityData {
  birchPollen: number | null;
  grassPollen: number | null;
  birchPollenTime: string | null;
  grassPollenTime: string | null;
  birchPollenUnit?: string;
  grassPollenUnit?: string;
  carbonMonoxide: number | null;
  carbonMonoxideTime: string | null;
  carbonMonoxideUnit?: string;
  carbonDioxide: number | null; // Added carbon_dioxide
  carbonDioxideTime: string | null; // Added carbon_dioxide time
  carbonDioxideUnit?: string; // Added carbon_dioxide unit
  dust: number | null;
  dustTime: string | null;
  dustUnit?: string;
  location?: Location;
  timezone?: string;
}

/**
 * Asynchronously retrieves and processes air quality data for a given location from Open Meteo API.
 *
 * @param location The location for which to retrieve air quality data.
 * @returns A promise that resolves to ProcessedAirQualityData object.
 */
export async function getAirQuality(location: Location): Promise<ProcessedAirQualityData> {
  const { lat, lng } = location;
  // Updated API URL to include carbon_dioxide and dust. Carbon monoxide was already there.
  const apiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat.toFixed(2)}&longitude=${lng.toFixed(2)}&hourly=birch_pollen,grass_pollen,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust,pm10,pm2_5,carbon_dioxide`;


  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.reason || `API request failed with status ${response.status}`);
    }
    const data: OpenMeteoAirQualityResponse = await response.json();

    const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

    const findPollutantData = (pollutantArray: (number | null)[] | undefined): { value: number | null; time: string | null } => {
      let pollutantData: { value: number | null; time: string | null } = { value: null, time: null };
      if (data.hourly && data.hourly.time && data.hourly.time.length > 0 && pollutantArray && pollutantArray.length > 0) {
        let foundToday = false;
        for (let i = 0; i < data.hourly.time.length; i++) {
          const entryDate = data.hourly.time[i].split('T')[0];
          if (entryDate === today) {
            if (pollutantArray[i] !== null) {
              pollutantData = { value: pollutantArray[i] as number, time: data.hourly.time[i] };
              foundToday = true;
              break;
            }
          }
        }
        if (!foundToday) {
          for (let i = 0; i < data.hourly.time.length; i++) {
            if (pollutantArray[i] !== null) {
              pollutantData = { value: pollutantArray[i] as number, time: data.hourly.time[i] };
              break;
            }
          }
        }
      }
      return pollutantData;
    };
    
    const birchPollenData = findPollutantData(data.hourly.birch_pollen);
    const grassPollenData = findPollutantData(data.hourly.grass_pollen);
    const carbonMonoxideData = findPollutantData(data.hourly.carbon_monoxide);
    const carbonDioxideData = findPollutantData(data.hourly.carbon_dioxide);
    const dustData = findPollutantData(data.hourly.dust);


    return {
      birchPollen: birchPollenData.value,
      grassPollen: grassPollenData.value,
      birchPollenTime: birchPollenData.time,
      grassPollenTime: grassPollenData.time,
      birchPollenUnit: data.hourly_units?.birch_pollen,
      grassPollenUnit: data.hourly_units?.grass_pollen,
      carbonMonoxide: carbonMonoxideData.value,
      carbonMonoxideTime: carbonMonoxideData.time,
      carbonMonoxideUnit: data.hourly_units?.carbon_monoxide,
      carbonDioxide: carbonDioxideData.value,
      carbonDioxideTime: carbonDioxideData.time,
      carbonDioxideUnit: data.hourly_units?.carbon_dioxide,
      dust: dustData.value,
      dustTime: dustData.time,
      dustUnit: data.hourly_units?.dust,
      location: { lat: data.latitude, lng: data.longitude },
      timezone: data.timezone
    };
  } catch (error) {
    console.error("Failed to fetch air quality data:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("An unknown error occurred while fetching air quality data.");
  }
}
