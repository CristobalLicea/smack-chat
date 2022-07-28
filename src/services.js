import axios from 'axios';
import io from 'socket.io-client';

const headers = { 'Content-Type': 'application/json' }

class User {
  constructor() {
    this.id = '';
    this.name = '';
    this.email = '';
    this.avatarName = '';
    this.avatarColor = '';
    this.isLoggedIn = false;
  }

  setUserEmail(email) { this.email = email; }

  setIsLoggedIn(loggedIn) { this.isLoggedIn = loggedIn }

  setUserData(userData) {
    const {
      _id, name, email, avatarColor, avatarName
    } = userData;
    this.id = _id;
    this.name = name;
    this.email = email;
    this.avatarName = avatarName;
    this.avatarColor = avatarColor;
  } 
}

export class AuthService extends User {
  constructor() {
    super();
    this.authToken = '';
    this.bearerHeader = {};
  }

  logoutUser() {
    this.id = '';
    this.name = '';
    this.email = '';
    this.avatarName = '';
    this.avatarColor = '';
    this.isLoggedIn = false;
    this.authToken = '';
    this.bearerHeader = {};
  }

  setAuthToken(token) { this.authToken = token }
  setBearerHeader(token) {
    this.bearerHeader = {
      'Content-Type': 'application/json',
      'Authorization': `bearer ${token}`
    }
  }
  getBearerHeader = () => this.bearerHeader;

  async registerUser(email, password) {
    const body = { "email": email, "password": password}
    try {
      await axios.post('http://localhost:3005/v1/account/register', body);  
    } catch (error) {
      throw error
    }
  }

  async createUser(name, email, avatarName, avatarColor) {
    const headers = this.getBearerHeader();
    const body = { 
      "email": email,
      "name": name,
      "avatarName": avatarName,
      "avatarColor": avatarColor
    }
    try {
      const res =  await axios.post('http://localhost:3005/v1/user/add', body, {headers});  
      this.setUserData(res.data)
    } catch (error) {
      throw error
    }
  }

  async logInUser(email, password) {
    const body = { "email": email, "password": password }
    try {
      const res =  await axios.post('http://localhost:3005/v1/account/login', body, {headers});  
      console.log(res)
      this.setAuthToken(res.data.token);
      this.setBearerHeader(res.data.token);
      this.setUserEmail(res.data.user);
      this.setIsLoggedIn(true);
      await this.findUserByEmail();

    } catch (error) {
      console.log(error);
      throw error;    
    }
  }

  async findUserByEmail () {
    const headers = this.getBearerHeader();
    try {
      const res = await axios.get('http://localhost:3005/v1/user/byEmail/' + this.email, { headers })
      this.setUserData(res.data)
    } catch (error) {
      console.log(error)
    }
  }

  deleteUser(id) {
    const headers = this.getBearerHeader();
    try {
      axios.delete(`http://localhost:3005/v1/user/${id}`, { headers });
      this.logoutUser();
    } catch (error) {
      console.log(error)
    }
  }
}

export class ChatService {
  constructor(authHeader) {
    this.getAuthHeader = authHeader;
    this.channels = [];
    this.selectedChannel = {};
    this.messages = [];
  }

  addChannel = (channel) => this.channels.push(channel)
  addMessage = (chat) => this.messages.push(chat)
  setSelectedChannel = (channel) => this.selectedChannel = channel
  getSelectedChannel = () => this.selectedChannel
  getAllChannels = () => this.channels

  async findAllChannels() {
    const headers = this.getAuthHeader();
    try {
      let response = await axios.get('http://localhost:3005/v1/channel', { headers });
      response = response.data.map((channel) => ({
        name: channel.name,
        description: channel.description,
        id: channel._id,
      }))
      this.channels = [...response];
      return response;
    } catch (error) {
      console.error(error)
      console.log('was unable to retrieve channels')
      throw error
    }
  }

  async getChannelMessages(channelId) {
    const headers = this.getAuthHeader();
    try {
      let res = await axios.get('http://localhost:3005/v1/message/ByChannel/' + channelId, { headers });
      res = res.data.map((msg) => ({
        messageBody: msg.messageBody,
        channelId: msg.channelId,
        id: msg._id,
        userName: msg.userName,
        userAvatar: msg.userAvatar,
        userAvatarColor: msg.userAvatarColor,
        timeStamp: msg.timeStamp
      }))
      this.messages = res
      return res
    } catch (error) {
      console.error(error)
      this.messages = [];
      throw error
    }
  }

  async editMessage(id, messageBody, channel, userName, userAvatar, userAvatarColor) {
    const headers = this.getAuthHeader();
    const body = { 
      "messageBody": messageBody,
      "channelId": channel,
      "userName": userName,
      "userAvatar": userAvatar,
      "userAvatarColor": userAvatarColor}
    await axios.put(`http://localhost:3005/v1/message/${id}`, body, { headers });
    return 'Message Changed!'
  }

  async deleteMessage(msgId) {
    const headers = this.getAuthHeader();
     await axios.delete(`http://localhost:3005/v1/message/${msgId}`, { headers });
     return 'Message Deleted.'
  }
}

export class SocketService {
  socket = io('http://localhost:3005/');
  constructor(chatService) {
    this.chatService = chatService;
  }

  establishConnection() {
    console.log('connect')
    io('http://localhost:3005/').connect()
  }

  closeConnection() {
    console.log('disconnect')
    this.socket.disconnect()
  }

  addChannel(name, description) {
    this.socket.emit('newChannel', name, description);
  }

  getChannel(cb) {
    this.socket.on('channelCreated', (name, description, id) => { 
      const channel = { name, description, id}
      this.chatService.addChannel(channel);
      const channelList = this.chatService.getAllChannels();
      cb(channelList)
    })
  }

  addMessage(messageBody, channelId, user) {
    const { userName, userId, userAvatar, userAvatarColor} = user;
    if(!!messageBody && !!channelId && !!user) {
      this.socket.emit('newMessage', messageBody, userId, channelId, userName, userAvatar, userAvatarColor) 
    }
  }

  getChatMessage(cb) {
    this.socket.on('messageCreated', ( messageBody, userId, channelId, userName, userAvatar, userAvatarColor, id, timeStamp) => {
      const channel = this.chatService.getSelectedChannel();
      if(channelId === channel.id) {
        const chat = {messageBody, userId, channelId, userName, userAvatar, userAvatarColor, id, timeStamp }
        this.chatService.addMessage(chat);
        cb();
      }
    })
  }

  startTyping(userName, channelId) {
    this.socket.emit('startType', userName, channelId)
  }

  stopTyping(userName) {
    this.socket.emit('stopType', userName)
  }

  getUserTyping(cb) {
    this.socket.on('userTypingUpdate', (typingUsers) => {
      cb(typingUsers)
    })
  }
}



  
