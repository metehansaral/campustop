"use client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React from "react";

const busIcon = new L.Icon({
  iconUrl: "/bus-icon.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const userIcon = new L.Icon({
  iconUrl: "/pin.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const altinbasIcon = new L.Icon({
  iconUrl: "/altinbas.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const campusPins = [
  {
    position: [41.06995077773232, 29.01285636408775],
    name: "Gayrettepe Kampüsü",
    color: "#0074D9", // Mavi
  },
  {
    position: [41.05740047410192, 28.820389963048207],
    name: "Mahmutbey Kampüsü",
    color: "#FF4136", // Kırmızı
  },
  {
    position: [40.98309094546604, 28.872312012309017],
    name: "Bakırköy Kampüsü",
    color: "#145A32", // Koyu Yeşil
  },
];

function RecenterMap({ center }) {
  const map = useMap();
  const hasCenteredRef = React.useRef(false);

  React.useEffect(() => {
    if (center && Array.isArray(center) && !hasCenteredRef.current) {
      map.setView(center);
      hasCenteredRef.current = true;
    }
  }, [center, map]);

  return null;
}

export default function MapView({ center, buses, userLocation, showUserPin = true }) {
  return (
    <MapContainer center={center} zoom={13} zoomControl={false} style={{ height: "100vh", width: "100%" }}>
      <RecenterMap center={center} />
      <TileLayer
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {buses.map((bus) => (
        <Marker key={bus.name} position={[bus.lat, bus.lng]} icon={busIcon}>
          <Popup>{bus.name}</Popup>
        </Marker>
      ))}
      {/* Campus Pins */}
      {campusPins.map((campus, idx) => (
        <Marker key={campus.name} position={campus.position} icon={altinbasIcon}>
          <Popup>
            <span style={{ color: campus.color, fontWeight: 'bold' }}>{campus.name}</span>
          </Popup>
        </Marker>
      ))}
      {userLocation && showUserPin && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>Benim Konumum</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
