import { useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import AppContext from '../contexts/AppContext';
import LocalPanel from './panel/LocalPanel';
import RemotePanel from './panel/RemotePanel';
import UserSelect from './UserSelect';

import './App.css';

const rtcPeerConnection = new RTCPeerConnection({ iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }] });
const socket = io('http://localhost:3001');
const initialValue = { socket, rtcPeerConnection };

function App() {
  const [selectedUser, setSelectedUser] = useState();
  const [isCaller, setIsCaller] = useState(true);

  const value = useMemo(() => ({
    ...initialValue,
    selectedUser,
    isCaller,
    setIsCaller,
    setSelectedUser
  }), [isCaller, selectedUser]);
  
  return (
    <AppContext.Provider value={value}>
      <div className='app'>
        <LocalPanel />
        <UserSelect />
        <RemotePanel />
      </div>
    </AppContext.Provider>
  );
}

export default App;
