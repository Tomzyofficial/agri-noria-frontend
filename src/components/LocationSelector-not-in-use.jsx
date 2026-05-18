"use client";
import { useState, useEffect } from "react";
import { useGeoLocation } from "@/hooks/useGeolocations";
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
      console.error("Error getting cities for state:", countryCode, stateCode, error);
      return [];
   }
}

// Used in the vendor register page
/* export function LocalStates({ value = "", onChange, id, name = "user_state", disabled = false }) {
   const [states, setStates] = useState([]);
   const [selected, setSelected] = useState(value);
   const { location } = useGeoLocation();

   useEffect(() => {
      // Get states based on user's detected country
      const countryCode = location?.country_code || "NG"; // Default to Nigeria
      const statesData = getStatesForCountry(countryCode);
      setStates(statesData);
   }, [location]);

   useEffect(() => {
      if (value) {
         setSelected(value);
      }
   }, [value]);

   const handleStateChange = (e) => {
      const newState = e.target.value;
      setSelected(newState);
      if (onChange) {
         onChange(e);
      }
   };

   return (
      <div className="w-full">
         <label htmlFor={id || name} className="block mb-1">
            State
         </label>
         <select
            id={id || name}
            name={name}
            value={selected}
            onChange={handleStateChange}
            disabled={disabled}
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
   );
} */

/* export function StateSelector({ value = "", onChange }) {
   const [state, setState] = useState(value);
   const [states, setStates] = useState([]);
   const { location } = useGeoLocation();

   useEffect(() => {
      // Get states based on user's detected country
      const countryCode = location?.country_code || "NG"; // Default to Nigeria
      const statesData = getStatesForCountry(countryCode);
      setStates(statesData);
   }, [location]);

   useEffect(() => {
      if (value) {
         setState(value);
      }
   }, [value]);

   const handleStateChange = (e) => {
      const newState = e.target.value;
      setState(newState);
      if (onChange) {
         onChange(newState);
      }
   };

   return (
      <div className="w-full">
         <label htmlFor="state" className="block mb-1">
            State
         </label>
         <select
            id="state"
            value={state}
            name="state"
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
   );
}

export function CitySelector({ state = "", value = "", onChange }) {
   const [city, setCity] = useState(value);
   const [cities, setCities] = useState([]);
   const { location } = useGeoLocation();

   useEffect(() => {
      if (value) {
         setCity(value);
      }
   }, [value]);

   useEffect(() => {
      if (state) {
         const countryCode = location?.country_code || "NG"; // Default to Nigeria
         const citiesData = getCitiesForState(countryCode, state);
         setCities(citiesData);
      } else {
         setCities([]);
      }
   }, [state, location]);

   const handleCityChange = (e) => {
      const newCity = e.target.value;
      setCity(newCity);
      if (onChange) {
         onChange(newCity);
      }
   };

   return (
      <div className="w-full">
         <label htmlFor="city" className="block mb-1">
            City
         </label>
         <select id="city" value={city} name="city" onChange={handleCityChange} className="w-full border rounded p-2">
            <option value="">Select City</option>
            {cities.map((cityObj) => (
               <option key={cityObj.name} value={cityObj.name}>
                  {cityObj.name}
               </option>
            ))}
         </select>
      </div>
   );
} */

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

      // Call the callback with the selected location
      // if (onLocationChange && selectedState && cityName) {
      //    onLocationChange({
      //       country: countryCode,
      //       state: selectedState,
      //       city: cityName,
      //       stateName: states.find((s) => s.isoCode === selectedState)?.name,
      //    });
      // }
   };

   return (
      <div className={`flex gap-4 ${className}`}>
         <div className="flex-1">
            <label htmlFor="state" className="block mb-1">
               State
            </label>
            <select id="state" value={selectedState} onChange={handleStateChange} className="w-full border rounded p-2">
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
