import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function LocationMap({ latLong }) {
    const [latitude, longitude] = latLong.split(',');

    return (
        <MapContainer center={[latitude, longitude]} zoom={15} style={{ height: '400px', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[latitude, longitude]}>
                <Popup>
                    Latitude: {latitude} <br /> Longitude: {longitude}
                </Popup>
            </Marker>
        </MapContainer>
    );
}

export default LocationMap;
