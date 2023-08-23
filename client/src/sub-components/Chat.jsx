import { useState } from "react";
import PropTypes from "prop-types";
import UsersBar from "./UsersBar";
import ChatBox from "./ChatBox";

export default function Chat({ socket }) {
  const [selectedUser, setSelectedUser] = useState(undefined);
  function handleUserSelect(user) {
    setSelectedUser(user);
  }
  return (
    <>
      <UsersBar handleUserSelect={handleUserSelect} socket={socket} />
      <ChatBox socket={socket} selectedUser={selectedUser} />
    </>
  );
}

Chat.propTypes = {
  socket: PropTypes.object.isRequired,
};
