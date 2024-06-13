import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import KalmanFilter from "kalmanjs";
import L from "leaflet";

// Corriger les problèmes d'icône de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const MapComponent = () => {
  const [position, setPosition] = useState(null);
  const [hasLocation, setHasLocation] = useState(false);

  const latKalmanFilter = new KalmanFilter();
  const lngKalmanFilter = new KalmanFilter();

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;

          // Appliquer le filtre Kalman aux coordonnées
          const filteredLatitude = latKalmanFilter.filter(latitude);
          const filteredLongitude = lngKalmanFilter.filter(longitude);

          setPosition([filteredLatitude, filteredLongitude]);
          setHasLocation(true);
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );

      // Nettoyer l'observateur lorsqu'il n'est plus nécessaire
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      console.log(
        "La géolocalisation n'est pas prise en charge par ce navigateur."
      );
    }
  }, []);

  if (!position) {
    return <div>Chargement de votre position...</div>;
  }

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {hasLocation && (
        <Marker position={position}>
          <Popup>Vous êtes ici.</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default MapComponent;
