"use server"

import driversData from "../../../drivers.json";

export async function POST(req) {
  const drivers = driversData.drivers;

  try {
    const body = await req.json();
    const { number, password } = body;

    if (!number || !password) {
      return new Response(JSON.stringify({ error: "Eksik parametre" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const numStr = number.toString();

    if (numStr.length === 4) {
      const driver = drivers.find(
        (d) => d.driver_number === parseInt(numStr) && d.password === password
      );

      if (driver) {
        return new Response(JSON.stringify({ success: true, driver }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } else {
        return new Response(JSON.stringify({ error: "Bilgiler yanlış" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
    } else {
      // öğrenci kontrolü
      return new Response(JSON.stringify({ message: "Diğer kontrol kısmı" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: "Geçersiz istek" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
}
