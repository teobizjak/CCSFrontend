import { io } from "socket.io-client"; // import connection function

const socket = io(process.env.REACT_APP_SOCKET_CONNECTION); // initialize websocket connection

export default socket;