import { promises as fs } from 'fs';
import path from 'path';

const busesPath = path.join(process.cwd(), 'buses.json');

export async function POST(request) {
  try {
    const body = await request.json();
    const { routeId, location, isActive, driverNumber, startedAt, stoppedAt } = body;

    // buses.json oku
    const busesRaw = await fs.readFile(busesPath, 'utf-8');
    const buses = JSON.parse(busesRaw);
    if (!buses[routeId]) {
      return Response.json({ success: false, message: 'Hat bulunamadı.' }, { status: 404 });
    }

    // Sürüş başlatma veya güncelleme
    if (isActive) {
      buses[routeId] = {
        ...buses[routeId],
        lat: location.lat,
        lng: location.lng,
        isActive: true,
        driverNumber: driverNumber,
        startedAt: startedAt ?? buses[routeId].startedAt ?? new Date().toISOString(),
        stoppedAt: null
      };
    } else {
      // Sürüş bitirme
      buses[routeId] = {
        ...buses[routeId],
        lat: location?.lat ?? buses[routeId].lat,
        lng: location?.lng ?? buses[routeId].lng,
        isActive: false,
        driverNumber: null,
        startedAt: buses[routeId].startedAt,
        stoppedAt: stoppedAt ?? new Date().toISOString()
      };
    }

    await fs.writeFile(busesPath, JSON.stringify(buses, null, 2));
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
