import React, { useState, useRef, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  LoadScript,
  InfoWindow,
} from "@react-google-maps/api";

function VisitMap({ markers, mapCenter }) {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [directions, setDirections] = useState(null);
  const [error, setError] = useState(null); // New state to handle errors
  const mapRef = useRef(null);

  const mapContainerStyle = {
    height: "400px",
    width: "90%",
  };

  useEffect(() => {
    if (mapRef.current && markers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      markers.forEach((marker) =>
        bounds.extend(new window.google.maps.LatLng(marker.lat, marker.lng)),
      );
      mapRef.current.fitBounds(bounds);
    }
  }, [markers]);

  const calculateDirections = () => {
    if (markers.length > 1) {
      const waypoints = markers.slice(1, -1).map((marker) => ({
        location: { lat: marker.lat, lng: marker.lng },
        stopover: true,
      }));

      const origin = { lat: markers[0].lat, lng: markers[0].lng };
      const destination = {
        lat: markers[markers.length - 1].lat,
        lng: markers[markers.length - 1].lng,
      };

      const service = new window.google.maps.DirectionsService();
      service.route(
        {
          origin,
          destination,
          waypoints,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
            setError(null); // Clear any previous errors
          } else {
            setError("Error fetching directions");
            console.error(`Error fetching directions ${result}`);
          }
        },
      );
    } else {
      setError("At least two markers are required to calculate directions");
    }
  };

  useEffect(() => {
    calculateDirections();
  }, [markers]);

  return (
    <LoadScript googleMapsApiKey="abcd">
      {" "}
      {/* Use an environment variable */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={10}
        onLoad={(map) => (mapRef.current = map)}
      >
        {markers.map(
          (marker, index) =>
            marker &&
            marker.lat &&
            marker.lng && (
              <Marker
                key={index}
                position={{ lat: marker.lat, lng: marker.lng }}
                label={marker.label || ""}
                onClick={() => setSelectedMarker(marker)}
              />
            ),
        )}

        {selectedMarker && (
          <InfoWindow
            position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div>
              <h4>{selectedMarker.companyName}</h4>
              <p>
                <strong>Dealer:</strong> {selectedMarker.dealerName}
              </p>
              <p>
                <strong>Visit Time:</strong> {selectedMarker.visitTime}
              </p>
              <p>
                <strong>Dealer Mobile:</strong> {selectedMarker.mobileNo}
              </p>
            </div>
          </InfoWindow>
        )}

        {directions && <DirectionsRenderer directions={directions} />}

        {error && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              background: "rgba(255, 255, 255, 0.7)",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            <p style={{ color: "red" }}>{error}</p>
          </div>
        )}
      </GoogleMap>
    </LoadScript>
  );
}

export default VisitMap;
