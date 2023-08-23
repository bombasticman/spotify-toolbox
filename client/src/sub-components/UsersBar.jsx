import { useState } from "react";
import PropTypes from "prop-types";

export default function UsersBar({ handleUserSelect, socket }) {
  const [onlineUsers, setOnlineUsers] = useState([]);

  // get active users from server on mount
  socket.on("sendActiveUsers", (users) => {
    const userIDs = Object.keys(users);
    setOnlineUsers(userIDs);
  });

  return (
    <ul>
      {onlineUsers.map((user) => {
        if (localStorage.userID != user) {
          return (
            <li key={user} onClick={() => handleUserSelect(user)}>
              {user}
            </li>
          );
        }
      })}
    </ul>
  );
}

UsersBar.propTypes = {
  handleUserSelect: PropTypes.func.isRequired,
  socket: PropTypes.object.isRequired,
};
