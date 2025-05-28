// app/api/bus_location/route.js

import { promises as fs } from 'fs';
import path from 'path';

const busesPath = path.join(process.cwd(), 'buses.json');

export async function GET() {
  try {
    const busesRaw = await fs.readFile(busesPath, 'utf-8');
    const buses = JSON.parse(busesRaw);
    // isActive true olanları filtrele
    const activeBuses = Object.entries(buses)
      .filter(([_, bus]) => bus.isActive)
      .map(([name, bus]) => ({
        name,
        lat: bus.lat,
        lng: bus.lng
      }));
    return Response.json({ success: true, buses: activeBuses });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
