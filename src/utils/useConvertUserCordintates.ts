export const getUserAddressGoogle = async (lat: string, lon: string) => {
  const apiKey = process.env.GOOGLE_MAPS_KEY; // or from env
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`
  );
  
  const data = await response.json();
  console.log({googleSaid:data})

  const address = data.results[0]?.address_components.find((comp: any) =>
    comp.types.includes("administrative_area_level_1")
  );
  return address?.long_name; // e.g., "Lagos State"
};
