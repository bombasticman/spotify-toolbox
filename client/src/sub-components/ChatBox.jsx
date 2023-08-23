import PropTypes from "prop-types";
import { useEffect, useState } from "react";

export default function ChatBox({ socket, selectedUser }) {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    socket.emit("requestChatHistory", selectedUser);
    socket.on("deliverChatHistory", (data) => {
      setChatHistory(data);
    });
  }, [selectedUser]);

  function sendMessage() {
    if (message != "" && message != undefined && selectedUser != undefined) {
      socket.emit("sendMessage", {
        message: message,
        user: selectedUser,
      });
      const timeStamp = new Date();
      setChatHistory([
        ...chatHistory,
        {
          message: message,
          sender: localStorage.userID,
          timeStamp: timeStamp.toISOString(),
        },
      ]);
    }
  }

  socket.on("deliverMessage", (data) => {
    console.log(data);
    if (data.sender == selectedUser) {
      setChatHistory([...chatHistory, data]);
    }
  });

  return (
    <>
      <>
        <ul>
          {chatHistory.map((message) => {
            return (
              <li key={message.timeStamp}>
                {message.sender}: {message.message}
              </li>
            );
          })}
        </ul>
        <input onChange={(e) => setMessage(e.target.value)} />
        <button onClick={sendMessage}>Send Message</button>
        {selectedUser != undefined && (
          <h1 key="currentSelectedUser">Current Chat: {selectedUser}</h1>
        )}
      </>
    </>
  );
}

ChatBox.propTypes = {
  socket: PropTypes.object.isRequired,
  selectedUser: PropTypes.string,
};
