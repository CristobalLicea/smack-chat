import React, { useState } from "react";
import './chatApp.css'
import { UserContext } from "../../App";
import { useContext, useEffect } from "react";
import UserAvatar from "../UserAvatar/userAvatar";
import Modal from "../modal/modal";
import { Link, Navigate, useHistory, useNavigate, useLocation } from 'react-router-dom'
import Channels from "../Channels/Channels";
import Chats from "../Chats/Chats";



const ChatApp = () => {
  const { authService, socketService } = useContext(UserContext)
  const [modal, setModal] = useState(false)
  let navigate = useNavigate();
  
  useEffect(() => {
    socketService.establishConnection()
    return() => socketService.closeConnection()
  }, []);

  const logoutUser = () => {
    authService.logoutUser()
    setModal(false)
    navigate('/login')
  }

  const deleteUser = () => {
    authService.deleteUser(authService.id)
  }
  
  return(
    <div id="chatApp">
      <nav>
        <h1>Smack Chat</h1>
        <div className="userAvatar" onClick={() => setModal(true)}>
          <UserAvatar size="sm" className="navAvatar" />
          <div>{authService.name}</div>
          </div>
        </nav>

        <div className="smackApp">
          <Channels />
          <Chats />
        </div>

        <Modal title="Profile" isOpen={modal} close={() => setModal(false)} >
          <div className="profile">
            <UserAvatar />
            <h4 onClick={() => console.log('1')}>Username: {authService.name}</h4>
            <h4>Email: {authService.email}</h4>
            <button onClick={logoutUser} className="submit-btn logout-btn">LogOut</button>
            <button onClick={deleteUser} className="submit-btn logout-btn">delete</button>
          </div>
        </Modal>


    </div>
  )
}

export default ChatApp
