import '../App.css'

function ChatLog(props) {

  return (
    <ul className="chatbox">
      {props.chat.map((message, index) => (
        <li class="chat-incoming chat">
          <p>{message}</p>
        </li>
      ))}
    </ul>
  );
}

export default ChatLog;