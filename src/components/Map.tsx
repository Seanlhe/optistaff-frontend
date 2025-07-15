import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  useMap,
  Circle,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Singapore's approximate boundaries
const SINGAPORE_BOUNDS: L.LatLngBoundsExpression = [
  [1.229, 103.6], // Southwest corner
  [1.4784, 104.012], // Northeast corner
];

// Singapore center coordinates
const SINGAPORE_CENTER: L.LatLngExpression = [1.3521, 103.8198];

// Component to set map bounds
const MapBounds: React.FC = () => {
  const map = useMap();

  useEffect(() => {
    map.setMaxBounds(SINGAPORE_BOUNDS);
    map.fitBounds(SINGAPORE_BOUNDS);
  }, [map]);

  return null;
};

export const Map: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<[number, number]>([
    1.3521, 103.8198,
  ]); // Start with center selected
  const [radius, setRadius] = useState(2000); // Default radius

  // function to handle map clicks ( to set location )
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        setSelectedLocation([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
  };

  return (
    <div className="">
      <h2 className="text-xl font-semibold mb-10">Preferred Work Locations</h2>

      <div className="rounded-lg shadow-lg" style={{ height: "500px" }}>
        <MapContainer
          center={SINGAPORE_CENTER}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
          minZoom={11.2}
          maxZoom={18}
          zoomControl={true}
          scrollWheelZoom={true}
          className="rounded-lg"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapBounds />
          <MapClickHandler />

          {/* Add radius circle*/}
          <Circle
            center={selectedLocation}
            radius={radius}
            fillColor="card-red"
            fillOpacity={0.2}
            color="card-red"
            weight={1}
          />

          {/* Small dot in the center */}
          <Circle
            center={selectedLocation}
            radius={50}
            fillColor="card-red-accent"
            fillOpacity={1}
            color="card-red-accent"
          />
        </MapContainer>
      </div>

      {/* radius slider */}
      <div className="mb-6">
        <p className="mt-6 mb-4">Adjust Radius</p>
        <div className="flex">
          <input
            type="range"
            className="w-64"
            min="500"
            max="50000"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value, 10))}
          />
        </div>
      </div>
    </div>
  );
};

export default Map;
