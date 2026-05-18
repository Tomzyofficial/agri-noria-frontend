/* import { State, City, Country } from "country-state-city";

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
} */

/* export function getCountryName(countryCode) {
   try {
      const country = Country.getCountryByCode(countryCode);
      return country?.name || countryCode;
   } catch (error) {
      console.error("Error getting country name:", countryCode, error);
      return countryCode;
   }
}

export function formatLocation(location) {
   if (!location) return "";

   const parts = [];
   if (location.city) parts.push(location.city);
   if (location.stateName) parts.push(location.stateName);
   if (location.country && location.country !== location.stateName) parts.push(location.country);

   return parts.join(", ");
}
 */
