import React, { useEffect, useState } from "react";
import mapBoxGl from "mapbox-gl/dist/mapbox-gl";
import MapBoxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

mapBoxGl.accessToken =
  "pk.eyJ1IjoiZGFuaWVsa2FuYW5naWxhIiwiYSI6ImNraGdscTB6czBjMzMycXFtM3IzZW5xYjMifQ.yYPfYoQl0KVTlgRYszZ5Rg";

const Map = ({ options, geocoderOptions, children }) => {
  const [map, setMap] = useState(undefined);
  const [geocoder, setGeocoder] = useState(undefined);

  /** Initialize Map box */
  useEffect(() => {
    const mapBox = new mapBoxGl.Map(options);
    setMap(mapBox);
  }, [options]);

  /** Initialize geocoder */
  useEffect(() => {
    if (geocoderOptions) {
      const mGeocoder = new MapBoxGeocoder({
        accessToken: mapBoxGl.accessToken,
        mapboxgl: mapBoxGl,
        ...geocoderOptions,
      });
      setGeocoder(mGeocoder);
      if (map) map.on("load", () => map.addControl(mGeocoder, "top-right"));
    }
  }, [geocoderOptions, map]);

  return <div className="map-elements">{children(map, geocoder)}</div>;
};

export default Map;
