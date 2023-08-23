import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getTopItems } from "../utils/fetchInfo.js";
import { useState } from "react";
import Chat from "../sub-components/Chat.jsx";
import io from "socket.io-client";

export default function Finder() {
  // State variables
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [markers, setMarkers] = useState([]);
  const [chatSwitch, setChatSwitch] = useState(false);
  const [socket, setSocket] = useState(null);
  const [promptState, setPromptState] = useState(true);

  // Function to generate the map and fetch nearby users
  async function generateMap() {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      setLocation({ latitude, longitude });
      const currentUser = await saveCurrentUser(latitude, longitude);
      const usersNearby = await fetchUsersNearby(latitude, longitude);
      if (currentUser.topItems != undefined) {
        generateNearbyMarkers(currentUser.topItems, usersNearby);
      }
    });
  }

  // Function to save the current user's data to the server
  async function saveCurrentUser(latitude, longitude) {
    const url = "http://localhost:3001/save";
    const topItems = await getTopItems(50, 50);
    let data;
    if (localStorage.userID == "spsagkibsyzswn7gw4yz684am") {
      data = {
        id: localStorage.userID,
        latitude: latitude,
        longitude: longitude,
        topItems: ["Hallucinate"],
      };
    } else if (topItems == undefined) {
      data = {
        id: localStorage.userID,
        latitude: latitude,
        longitude: longitude,
        topItems: undefined,
      };
    } else {
      const topItemsNames = topItems.map((item) => item.name);
      data = {
        id: localStorage.userID,
        latitude: latitude,
        longitude: longitude,
        topItems: topItemsNames,
      };
    }
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).catch((error) => {
      console.error(error);
    });
    return data;
  }

  // Function to fetch nearby users from the server based on the current user's location
  async function fetchUsersNearby(latitude, longitude) {
    try {
      const response = await fetch(
        `http://localhost:3001/search?latitude=${latitude}&longitude=${longitude}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Request failed with status " + response.status);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      throw new Error("An error occurred while fetching users nearby.");
    }
  }

  // Function to generate markers for nearby users with compatibility rating higher than 5
  function generateNearbyMarkers(topItems, usersNearby) {
    const compatibleUsers = [];
    for (let i = 0; i < usersNearby.length; i++) {
      const otherUser = usersNearby[i];
      if (otherUser.topItems !== null && otherUser.id !== localStorage.userID) {
        const rating = rateCompatibility(topItems, otherUser.topItems);

        if (rating >= 0) {
          const otherUserInfo = {
            id: otherUser.id,
            latitude: otherUser.location.coordinates[1],
            longitude: otherUser.location.coordinates[0],
          };
          compatibleUsers.push(otherUserInfo);
        }
      }
      setMarkers(compatibleUsers);
    }
  }

  // Function to calculate compatibility rating between the current user and another user
  function rateCompatibility(userTopItems, otherUserTopItems) {
    const userSet = new Set(userTopItems);
    let rating = 0;

    for (const item of otherUserTopItems) {
      if (userSet.has(item)) {
        rating += 1;
      }
    }
    return rating;
  }

  // User accepted socket.io connections
  function handleAccept() {
    const socket = io.connect("http://localhost:3001", {
      auth: { userID: localStorage.userID },
    });
    setChatSwitch(true);
    setPromptState(false);
    setSocket(socket);
  }

  return (
    <>
      {location.latitude == null && location.longitude == null && (
        <>
          <h1>
            Here you can see other people who listen to similar tracks and
            artists you listen to!
          </h1>
          <button
            className="geolocation-share"
            onClick={async () => await generateMap()}
          >
            🗺️Share Location🗺️
          </button>
        </>
      )}
      {location.latitude !== null && location.longitude !== null && (
        <MapContainer
          className="map"
          center={[location.latitude, location.longitude]}
          zoom={13}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[location.latitude, location.longitude]}>
            <Popup>This is you!</Popup>
          </Marker>
          {markers.map((user) => (
            <Marker key={user.id} position={[user.latitude, user.longitude]}>
              <Popup>
                <p className="username">{user.id}</p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
      {location.latitude !== null &&
        location.longitude !== null &&
        promptState && (
          <>
            <h1>
              Would you like to make yourself avaliable for chat with other
              users?
            </h1>
            <div>
              <button onClick={handleAccept}>YES</button>
              <button onClick={() => setPromptState(false)}>NO</button>
            </div>
          </>
        )}
      {chatSwitch && <Chat socket={socket} />}
    </>
  );
}
