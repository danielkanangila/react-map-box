import React from "react";

const MapPlaceList = ({ placeList, map, geocoder, Item = () => <></> }) => {
  return (
    <div className="map-place-list">
      {placeList.map((place) => (
        <Item key={place.id} map={map} geocoder={geocoder} place={place} />
      ))}
    </div>
  );
};

export default MapPlaceList;
