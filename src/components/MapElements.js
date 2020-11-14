import React from "react";
import * as turf from "@turf/turf";
import Map from "./Map";
import groomers from "./../data/groomers.json";
import Marker from "./Marker";
import MapPlaceList from "./MapPlaceList";

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
    // const resultGeometry = result.geom
    // const newState = oldState.filter((item) => placeName.includes(item.city));
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
        distance,
      });
    }
    setState(newState);
  };

  return (
    <Map options={mapBoxOptions} geocoderOptions={geocoderOptions}>
      {(map, geocoder) => (
        <>
          <MapPlaceList
            placeList={groomers}
            map={map}
            geocoder={geocoder}
            geocoderHandler={handleGeocoderResult}
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
      zoom: 10,
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
