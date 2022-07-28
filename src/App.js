import './App.css';
import React, { useState, createContext, useContext,  } from 'react';
import {
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import ChatApp from './components/ChatApp/chat-app';
import UserLogin from './components/UserLogin/user-login';
import UserCreate from './components/UserCreate/user-create';
import { AuthService, ChatService, SocketService } from './services'

const authService = new AuthService();
const chatService = new ChatService(authService.getBearerHeader)
const socketService = new SocketService(chatService)

export const UserContext = createContext();

const AuthProvider = ({ children }) => {
  const context = {
    authService,
    chatService,
    socketService,
    appSelectedChannel: {},
    appSetChannel: (ch) => {
      setAuthContext({ ...authContext, appSelectedChannel: ch });
      chatService.setSelectedChannel(ch);
    }
  }

  const [authContext, setAuthContext] = useState(context)
  return (
    <UserContext.Provider value={authContext}>
      { children }
    </UserContext.Provider>
  )
}

const PrivateRoute = ({ children }) => {
  const context = useContext(UserContext)

  if (!context.authService.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (

    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout/>}>
        <Route index element={<UserLogin />} />
          <Route path="/register" element={<UserCreate />} />
          <Route 
          path="/chat"
          element={
            <PrivateRoute>
              <ChatApp />
            </PrivateRoute>
          }
        />
        </Route>
      </Routes>
    </AuthProvider>
    
  );
}

function Layout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}

export default App;
