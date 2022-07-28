import React, { useContext } from "react";
import UserAvatar from "../UserAvatar/userAvatar";
import { UserContext } from "../../App";
import { useState } from "react";

const Message = ({userAvatar, userAvatarColor, userName, userId, timeStamp, messageBody, id, channel, update}) => {
  const { authService, chatService } = useContext(UserContext);
  const [edit, setEdit] = useState('')
  const [editIsOpen, setEditIsOpen] = useState(false)


  const deleteMessage = (e) => {
    e.preventDefault();
    chatService.deleteMessage(e.target.id)
      .then((res) => {
        update();
        console.log(res)
      })
  }

  const editMessage = (e) => {
    e.preventDefault();
    setEditIsOpen(!editIsOpen);
  }

  const onChange = (e) => {
    e.preventDefault();
    setEdit(e.target.value)
  }

  const submit = () => {
    chatService.editMessage(id, edit, channel, userName, userAvatar, userAvatarColor)
      .then((res) => {
      update();
      console.log(res)
    })
    setEditIsOpen(false)

  }

  return(
    <div className="chatMessage">
      <div className="individualMessage" style={{display: 'flex', justifyContent:'space-between'}}>
        <UserAvatar avatar={{ avatarName: userAvatar, avatarColor: userAvatarColor}} size="md" />
        <div className="chatUser">
          <strong>{userName}</strong>
          <small>{timeStamp}</small>
          {userName === authService.name ? 
      <small className="editText" onClick={editMessage}>EDIT</small>
       :null}
          
          <div className="messageBody">{messageBody}</div>
          {editIsOpen ? <div className="editArea">
            <textarea onChange={onChange} name="" id="" cols="30" ></textarea>
            <button onClick={submit}>Submit</button>
          </div> 
          :null}
          
        </div>
      </div>
      {userName === authService.name ? 
      <div>
        <button id={id} onClick={deleteMessage} className="deleteMsg">X</button>
      </div>
       :null}
    </div>
  )
}

export default Message