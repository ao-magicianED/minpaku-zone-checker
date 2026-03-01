import { geocodeAddress } from '../src/lib/geocoding';
import { getZoningByLatLon } from '../src/lib/reinfolib';
import { findMunicipality } from '../src/lib/municipality-data';

async function test() {
  const address = '京都府京都市左京区下鴨泉川町';
  console.log(`Testing with address: ${address}`);
  try {
    const geo = await geocodeAddress(address);
    if (!geo.ok) {
        console.log("Geocode Error:", geo);
        return;
    }
    console.log("Geocode:", {
        lat: geo.data.lat,
        lon: geo.data.lon,
        prefecture: geo.data.prefecture,
        city: geo.data.city,
        source: geo.data.source
    });

    const zoning = await getZoningByLatLon(geo.data.lat, geo.data.lon);
    console.log("Zoning detected:", zoning.detected);

    const muni = findMunicipality(geo.data.prefecture, geo.data.city);
    console.log("Municipality found:", !!muni);
    
  } catch (e) {
    console.error("Caught error:", e);
  }
}

test();
