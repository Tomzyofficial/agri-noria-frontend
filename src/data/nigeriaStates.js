// Comprehensive list of all 36 Nigerian States + Federal Capital Territory (FCT) with their capitals
export const NIGERIA_STATES = [
  { name: "Abia", capital: "Umuahia", zone: "South East" },
  { name: "Adamawa", capital: "Yola", zone: "North East" },
  { name: "Akwa Ibom", capital: "Uyo", zone: "South South" },
  { name: "Anambra", capital: "Awka", zone: "South East" },
  { name: "Bauchi", capital: "Bauchi", zone: "North East" },
  { name: "Bayelsa", capital: "Yenagoa", zone: "South South" },
  { name: "Benue", capital: "Makurdi", zone: "North Central" },
  { name: "Borno", capital: "Maiduguri", zone: "North East" },
  { name: "Cross River", capital: "Calabar", zone: "South South" },
  { name: "Delta", capital: "Asaba", zone: "South South" },
  { name: "Ebonyi", capital: "Abakaliki", zone: "South East" },
  { name: "Edo", capital: "Benin City", zone: "South South" },
  { name: "Ekiti", capital: "Ado-Ekiti", zone: "South West" },
  { name: "Enugu", capital: "Enugu", zone: "South East" },
  { name: "Federal Capital Territory (FCT)", capital: "Abuja", zone: "North Central" },
  { name: "Gombe", capital: "Gombe", zone: "North East" },
  { name: "Imo", capital: "Owerri", zone: "South East" },
  { name: "Jigawa", capital: "Dutse", zone: "North West" },
  { name: "Kaduna", capital: "Kaduna", zone: "North West" },
  { name: "Kano", capital: "Kano", zone: "North West" },
  { name: "Katsina", capital: "Katsina", zone: "North West" },
  { name: "Kebbi", capital: "Birnin Kebbi", zone: "North West" },
  { name: "Kogi", capital: "Lokoja", zone: "North Central" },
  { name: "Kwara", capital: "Ilorin", zone: "North Central" },
  { name: "Lagos", capital: "Ikeja", zone: "South West" },
  { name: "Nasarawa", capital: "Lafia", zone: "North Central" },
  { name: "Niger", capital: "Minna", zone: "North Central" },
  { name: "Ogun", capital: "Abeokuta", zone: "South West" },
  { name: "Ondo", capital: "Akure", zone: "South West" },
  { name: "Osun", capital: "Osogbo", zone: "South West" },
  { name: "Oyo", capital: "Ibadan", zone: "South West" },
  { name: "Plateau", capital: "Jos", zone: "North Central" },
  { name: "Rivers", capital: "Port Harcourt", zone: "South South" },
  { name: "Sokoto", capital: "Sokoto", zone: "North West" },
  { name: "Taraba", capital: "Jalingo", zone: "North East" },
  { name: "Yobe", capital: "Damaturu", zone: "North East" },
  { name: "Zamfara", capital: "Gusau", zone: "North West" }
];

/**
 * Optional helper to fetch states from a public online REST API if online,
 * with immediate fallback to the bundled static data for 100% offline reliability.
 */
export async function getNigeriaStatesWithFallback() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch("https://nigerian-states-and-lga.vercel.app/", {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length >= 36) {
        return data.map((item) => ({
          name: item.name || item.state,
          capital: item.capital || "",
          zone: item.zone || ""
        }));
      }
    }
  } catch (err) {
    // Graceful fallback to static dataset
  }
  return NIGERIA_STATES;
}
