import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import * as turf from "@turf/turf";
import "mapbox-gl/dist/mapbox-gl.css";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "./Mapcss.css";
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;
const Map = (props) => {
  const mapContainer = useRef(null);
  const [viewport, setViewport] = useState({
    latitude: 40.8539,
    longitude: -95,
    zoom: 3.5,
  });
  const history = useHistory();
  const groomerByArea = {
    type: "FeatureCollection",
    features:
      props.groomers.length < 1
        ? console.log(props.groomers)
        : props.groomers.map((item) => {
            console.log(item);
            return {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [item.longitude, item.latitude],
              },
              properties: {
                ...item,
              },
            };
          }),
  };
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [viewport.longitude, viewport.latitude],
      zoom: viewport.zoom,
    });
    // make changes after map loads
    map.on("load", function (e) {
      map.addSource("places", {
        type: "geojson",
        data: groomerByArea,
      });
      // create a MapboxGeocoder item, add search bar, markers and groomers.
      var geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        placeholder: "Find a groomer near you",
        marker: true,
      });
      listedGroomers(groomerByArea);
      map.addControl(geocoder, "top-right");
      addMarkers();
      // Listen for when a geocoder result is returned, calculate distances and sort groomers by distance
      geocoder.on("result", function (ev) {
        // Get the coordinate of the search result
        var searchResult = ev.result.geometry;
        // For each groomer, use turf.disance to calculate the distance in miles between the searchResult and the groomer. Assign the
        // calculated value to a property called `distance`.
        var options = { units: "miles" };
        groomerByArea.features.forEach(function (item) {
          Object.defineProperty(item.properties, "distance", {
            value: turf.distance(searchResult, item.geometry, options),
            writable: true,
            enumerable: true,
            configurable: true,
          });
        });
        // Sort groomers by distance and rebuild the groomer's list
        groomerByArea.features.sort(function (a, b) {
          if (a.properties.distance > b.properties.distance) {
            return 1;
          }
          if (a.properties.distance < b.properties.distance) {
            return -1;
          }
          return 0;
        });
        var groomerList = document.getElementById("groomerList");
        while (groomerList.firstChild) {
          groomerList.removeChild(groomerList.firstChild);
        }
        listedGroomers(groomerByArea);
        // Open a popup for the closest groomer and highlight it in the list
         (groomerByArea.features[0]);
        var activeListing = document.getElementById(
          "listing-" + groomerByArea.features[0].properties.id
        );
        activeListing.classList.add("active");
      });
    });
    // Add a marker to the map for every groomer in the list
    function addMarkers() {
      // For each feature in the GeoJSON object, create a div for the marker
      groomerByArea.features.forEach(function (marker) {
        var el = document.createElement("div");
        el.id = "marker-" + marker.properties.id;
        el.className = "marker";
        // Create a marker using the div element defined above and add it to the map.
        new mapboxgl.Marker(el, { offset: [0, -23] })
          .setLngLat(marker.geometry.coordinates)
          .addTo(map);
        // onclick go to groomer forfile
        el.addEventListener("click", function (e) {
          e.stopPropagation();
          history.push(`/groomer-profile/${props.profile_id}`);
        });
      });
    }
    // Add a listing for each groomer to the sidebar
    function listedGroomers(data) {
      // if (!('features' in data)) return
      data.features.forEach(function (groomerByArea, item) {
        // Add a new listing section to the sidebar.
        var groomerList = document.getElementById("groomerList");
        var listing = groomerList.appendChild(document.createElement("div"));
        // Assign a unique `id` to the listing.
        listing.id = "listing-" + groomerByArea.properties.id;
        listing.className = "item";
        // Add details to the individual groomer.
        var details = listing.appendChild(document.createElement("div"));
        details.innerHTML =
          "<strong>" + groomerByArea.properties.name + " </strong>";
        if (groomerByArea.properties.avatarUrl) {
          details.innerHTML +=
            "<p>" +
            "<img src=" +
            groomerByArea.properties.avatarUrl +
            ">" +
            "</img>" +
            "<p>";
        }
        if (groomerByArea.properties.phone) {
          details.innerHTML += groomerByArea.properties.phone;
        }
        if (groomerByArea.properties.distance) {
          var roundedDistance =
            Math.round(groomerByArea.properties.distance * 100) / 100;
          details.innerHTML +=
            "<p><strong>" + roundedDistance + " miles away</strong></p>";
        }
        // Add the link to the individual listing created above.
        var link = listing.appendChild(document.createElement("a"));
        link.href = "#";
        link.className = "title";
        link.id = "link-" + groomerByArea.properties.id;
        link.innerHTML = groomerByArea.properties.address;
        // OnClick, update the `currentFeature` to the groomer associated with the clicked link
        // navigate to the point, highlight groomer in sidebar and  display popup
        link.addEventListener("click", function (e) {
          for (var i = 0; i < data.features.length; i++) {
            if (this.id === "link-" + data.features[i].properties.id) {
              var clickedListing = data.features[i];
              flyToGroomer(clickedListing);
               (clickedListing);
            }
          }
          var activeItem = document.getElementsByClassName("active");
          if (activeItem[0]) {
            activeItem[0].classList.remove("active");
          }
          this.parentNode.classList.add("active");
        });
      });
    }
    // navigate to a given center point.
    function flyToGroomer(currentFeature) {
      map.flyTo({
        center: currentFeature.geometry.coordinates,
        zoom: 10,
      });
    }
    // Create a Mapbox GL JS `Popup`.
    function  (currentFeature) {
      var popUps = document.getElementsByClassName("mapboxgl-popup");
      if (popUps[0]) popUps[0].remove();
      var popup = new mapboxgl.Popup({ closeOnClick: false })
        .setLngLat(currentFeature.geometry.coordinates)
        .setHTML(
          "<h4>" +
            currentFeature.properties.name +
            "</h4>" +
            "<h5>" +
            currentFeature.properties.address +
            "</h5>"
        )
        .addTo(map);
    }
  }, []);
  return (
    <div>
      <div className="sidebar">
        <div className="sidebar-heading">
          <h3>Our Groomers</h3>
        </div>
        <div id="groomerList" className="groomerList"></div>
      </div>
      <div
        ref={(el) => (mapContainer.current = el)}
        id="map"
        className="map"
      ></div>
    </div>
  );
};
export default Map;
