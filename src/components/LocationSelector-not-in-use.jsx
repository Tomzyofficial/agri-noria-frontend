"use client";
import { useState, useEffect } from "react";
import { useGeoLocation } from "@/hooks/useGeolocation";
import { State, City } from "country-state-city";
import { setLocation } from "./LocationLocalStorage-not-in-use";

export function getStatesForCountry(countryCode) {
  try {
    if (!countryCode) return [];
    return State.getStatesOfCountry(countryCode);
  } catch (error) {
    console.error("Error getting states for country:", countryCode, error);
    return [];
  }
}

export function getCitiesForState(countryCode, stateCode) {
  try {
    if (!stateCode || !countryCode) return [];
    return City.getCitiesOfState(countryCode, stateCode);
  } catch (error) {
    console.error(
      "Error getting cities for state:",
      countryCode,
      stateCode,
      error,
    );
    return [];
  }
}
// Original combined component for product details page
export function LocationSelector({ className }) {
  const { location } = useGeoLocation();
  const [countryCode, setCountryCode] = useState("");
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    // Set country based on user's detected location
    const detectedCountry = location?.country_code; // NG
    setCountryCode(detectedCountry);

    // Load states for the detected country
    const statesData = getStatesForCountry(detectedCountry);
    setStates(statesData);
  }, [location]);

  const handleStateChange = (e) => {
    const stateCode = e.target.value;
    setSelectedState(stateCode);
    setSelectedCity(""); // Reset city when state changes

    // Get cities for the selected state
    if (stateCode) {
      const citiesData = getCitiesForState(countryCode, stateCode);
      console.log(citiesData);
      setCities(citiesData);
    } else {
      setCities([]);
    }
  };

  const handleCityChange = (e) => {
    const cityName = e.target.value;
    setSelectedCity(cityName);

    if (selectedState && cityName) {
      setLocation({ state: selectedState, city: cityName });
    }
  };

  return (
    <div className={`flex gap-4 ${className}`}>
      <div className="flex-1">
        <label htmlFor="state" className="block mb-1">
          State
        </label>
        <select
          id="state"
          value={selectedState}
          onChange={handleStateChange}
          className="w-full border rounded p-2"
        >
          <option value="">Select State</option>
          {states.map((stateObj) => (
            <option key={stateObj.isoCode} value={stateObj.isoCode}>
              {stateObj.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <label htmlFor="city" className="block mb-1">
          City
        </label>
        <select
          id="city"
          value={selectedCity}
          onChange={handleCityChange}
          className="w-full border rounded p-2"
          disabled={!selectedState}
        >
          <option value="">Select City</option>
          {cities.map((cityObj) => (
            <option key={cityObj.name} value={cityObj.name}>
              {cityObj.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
