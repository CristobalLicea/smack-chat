import React, { useState, useContext, useEffect, } from "react";
import { UserContext } from "../../App";
import Modal from "../modal/modal";
import './Channels.css'

const Channels = () => {
  const INIT = { name: '', description: ''}
  const [newChannel, setNewChannel] = useState(INIT)
  const [modal, setModal] = useState(false)
  const [channels, setChannels] = useState([]) 
  const { authService, chatService, socketService, appSetChannel, appSelectedChannel } = useContext(UserContext)

  useEffect(() => {
    chatService.findAllChannels().then((res) => {
      setChannels(res);
      appSetChannel(res[0]);
    })
  }, [])

  useEffect(() => {
    socketService.getChannel((channelList) => {
      setChannels(channelList);
    })
  }, [])

  const selectChannel = (channel) => (e) => {
    appSetChannel(channel)
  }

  const onChange = ({ target: {name, value }}) => {
    setNewChannel({...newChannel, [name]: value})
  }

  const createChannel = (e) => {
    e.preventDefault();
    socketService.addChannel(newChannel.name, newChannel.description)
    setNewChannel(INIT)
    setModal(false)
  }

  return (
    <>
    <div className="channel">
      <div className="channelHeader">
        <h3 className="channelLabel">{authService.name}</h3>
      </div>
      <h3 className="channelLabel">Channels<span onClick={() => setModal(true)} className="add"> Add +</span></h3>
      <div className="channelList">
        {!!channels.length ? channels.map((channel) => (
          <div className="channelLabel" key={channel.id} onClick={selectChannel(channel)} >
            <div className={`inner ${(appSelectedChannel.id === channel.id) ? 'selected' : '' }`} >#{channel.name}</div>
          </div>
        )): <div>No Channels. Please add a Channel</div> }
        
      </div>
    </div>

    <Modal title="Create Channel" isOpen={modal} close={(setModal)}>
      <form className="form channelForm" onSubmit={createChannel}>
        <input onChange={onChange} type="text" className="form-control" name='name' placeholder="Enter Channel Name"/>
        <input onChange={onChange} type="text" className="form-control" name='description' placeholder="Enter Channel Description"/>
        <input type="submit" className="submit-btn" value="Create Channel" />
      </form>
    </Modal>
    </>
    
  )
}

export default Channels