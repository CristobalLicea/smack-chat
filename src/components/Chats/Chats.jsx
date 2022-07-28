import React, { useContext, useEffect, useState } from "react";
import './Chats.css'
import { UserContext } from "../../App";
import UserAvatar from "../UserAvatar/userAvatar";
import socket from "socket.io-client/lib/socket";
import Message from "./ChatMsg";

const Chats = () => {
  const { authService, chatService, appSelectedChannel, socketService } = useContext(UserContext);
  const [messages, setMessages] = useState([]);
  const [messageBody, setMessageBody] = useState('');
  const [typingMessage, setTypingMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if(appSelectedChannel.id) {
      chatService.getChannelMessages(appSelectedChannel.id)
        .then((res) => setMessages(res))
    }
  }, [appSelectedChannel]);

  useEffect(() => {
    socketService.getChatMessage(() => {
      setMessages([...chatService.messages])
    })
  }, [])

  useEffect(() => {
    socketService.getUserTyping((users) => {
      let names = '';
      let usersTyping = 0;
      for (const [typingUser, chId] of Object.entries(users)) {
        if(typingUser !== authService.name && appSelectedChannel.id === chId) {
          names = (names === '' ? typingUser : `${names}, ${typingUser}`)
          usersTyping += 1;
        }
      }
      if (usersTyping > 0) {
        const verb = (usersTyping > 1) ? 'are' : 'is';
        setTypingMessage(`${names} ${verb} typing a message...`);
      } else {
        setTypingMessage('');
      }
    })
  }, [appSelectedChannel])

  const onTyping = ({ target: { value }}) => {
    if(!value.length) {
      setIsTyping(false);
      socketService.stopTyping(authService.name)
    } else if (!isTyping) {
      socketService.startTyping(authService.name, appSelectedChannel.id)
    } else {
      setIsTyping(true);
    }
    setMessageBody(value);
  }

  const sendMessage = (e) => {
    e.preventDefault();
    const { name, id, avatarName, avatarColor } = authService;
    const user = {
      userName: name,
      userId: id,
      userAvatar: avatarName,
      userAvatarColor: avatarColor,
    }
    socketService.addMessage(messageBody, appSelectedChannel.id, user);
    socketService.stopTyping(authService.name)
    setMessageBody('');
  }

  const update = () => {
    chatService.getChannelMessages(appSelectedChannel.id)
        .then((res) => setMessages(res))
  }

  return (
    <div className="chat">
      <div className="chatHeader">
        <h3>#{appSelectedChannel.name} -</h3>
        <h4> {appSelectedChannel.description}</h4>
      </div>
      <div className="chatList">
        {!!messages ? messages.map((msg) => (
          <Message userAvatar={msg.userAvatar} userAvatarColor={msg.userAvatarColor} userName={msg.userName} timeStamp={msg.timeStamp} messageBody={msg.messageBody} id={msg.id} update={update} channel={appSelectedChannel.id}/>
        )) : <div>No Messages</div>}  
      </div>

      <form onSubmit={sendMessage} className='chatBar'>
        <div className="typing">
          {typingMessage}
        </div>
        <div className="chatWrapper">
          <textarea
          placeholder="type a message..."
          value={messageBody}
          onChange={onTyping} />
          <input type="submit" className="submit-btn" value="send" />
        </div>
      </form>
    </div>
  )
}

export default Chats