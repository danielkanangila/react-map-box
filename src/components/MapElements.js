import React from "react";
import * as turf from "@turf/turf";
import Map from "./Map";
import groomers from "./../data/groomers.json";
import Marker from "./Marker";
import MapPlaceList from "./MapPlaceList";
import mapboxgl from "mapbox-gl";

const mapBoxOptions = {
  container: "mapContainer",
  style: "mapbox://styles/mapbox/streets-v11",
  center: [-95, 40.8539], // staring position
  zoom: 3.5, // starting zoom
};

const geocoderOptions = {
  placeholder: "Find a groomer near you",
  marker: true,
};

const MapElements = () => {
  const parsePlace = (groomer) => {
    return {
      id: groomer.id,
      logo: groomer.avatarUrl,
      coordinate: [groomer.longitude, groomer.latitude],
    };
  };

  const handleGeocoderResult = (result, setState, oldState) => {
    //*** HANDLE GEOCODER RESULT HERE */
    // Clean Map marker
    if (result) {
      new mapboxgl.Marker().remove();
    }
    // Get the result place name
    const placeName = result.place_name;
    // Filter the place list to have only the place corresponding to the result
    oldState = oldState.filter(
      (item) => placeName.includes(item.city) || placeName.includes(item.state)
    );
    // setState(newState);
    /** Add distance to the state */
    const newState = [];
    for (const place of oldState) {
      const placeGeo = {
        type: "point",
        coordinates: [place.longitude, place.latitude],
      };
      const distance = turf.distance(result.geometry, placeGeo, {
        units: "miles",
      });
      newState.push({
        ...place,
        distance: `${parseFloat(distance).toFixed(2)} miles`,
      });
    }
    // Map List state
    setState(newState);
  };

  return (
    <Map
      options={mapBoxOptions}
      geocoderOptions={geocoderOptions}
      geocoderHandler={handleGeocoderResult}
      placeList={groomers}
    >
      {(map, geocoder, places) => (
        <>
          <MapPlaceList
            placeList={places}
            map={map}
            geocoder={geocoder}
            Item={MapListItem}
          />
          <div className="map-container" id="mapContainer"></div>
          <div className="hidden-markers">
            {groomers.map((groomer) => (
              <Marker
                map={map}
                place={parsePlace(groomer)}
                onClick={() => console.log(groomer)}
                key={groomer.id}
              >
                <div className="marker-pin"></div>
                <img src={groomer.avatarUrl} alt={groomer.name} />
              </Marker>
            ))}
          </div>
        </>
      )}
    </Map>
  );
};

const MapListItem = ({ map, geocoder, place }) => {
  const handleClick = (e) => {
    e.preventDefault();
    map.flyTo({
      center: [place.longitude, place.latitude],
      zoom: 15,
    });
  };
  return (
    <div className="map-place-list__item">
      <h5>
        <a onClick={handleClick} href="/test">
          {place.name}
        </a>
      </h5>
      {place.distance && <span>{place.distance}</span>}
    </div>
  );
};

export default MapElements;
