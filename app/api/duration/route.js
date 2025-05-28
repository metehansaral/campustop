export async function POST(req) {
  const { origin, destination } = await req.json();

  if (!origin || !destination) {
    return new Response(
      JSON.stringify({ success: false, error: "origin ve destination zorunlu" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const apiKey = "AIzaSyD2W3DQeg09MCYYj-Kh9JGa0ycqBp5nLwQ";
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}&language=tr`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (
      data.status !== "OK" ||
      !data.rows?.[0]?.elements?.[0] ||
      data.rows[0].elements[0].status !== "OK"
    ) {
      return new Response(
        JSON.stringify({ success: false, error: "Rota bulunamadı" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const durationText = data.rows[0].elements[0].duration.text;
    const durationValue = data.rows[0].elements[0].duration.value;

    return new Response(
      JSON.stringify({ success: true, duration: durationText, seconds: durationValue }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: "Google API hatası" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
