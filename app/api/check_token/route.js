"use server"

import driversData from "../../../drivers.json";

export async function POST(req) {
  const drivers = driversData.drivers;

  const body = await req.json();
  const { token } = body; 

  const [id, password] = token.split("-");

  if (id && password && /^\d{4}$/.test(id)) {
    const driver = drivers.find(
      (d) => d.driver_number === parseInt(id) && d.password === password
    );

    if (driver) {
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
  } else {
    console.log("Token 4 haneli değil:", token);
    
    return new Response(
      JSON.stringify({ success: false }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
