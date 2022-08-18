import { useCallback, useContext, useEffect, useState } from 'react';
import AppContext from '../../contexts/AppContext';
import Media from './Media';
import SessionDescription from './SessionDescription';
import IceCandidate from './IceCandidate';
import { SOCKET_EVENTS, MESSAGE_DATA_TYPES } from '../../constants';
import { Chat } from './Chat';

const RemotePanel = () => {
    const { rtcPeerConnection, socket, setIsCaller } = useContext(AppContext);
    const [sessionDescription, setSessionDescription] = useState();
    const [iceCandidates, setIceCandidates] = useState([]);

    const messageHandler = useCallback(async (message) => {
        // eslint-disable-next-line default-case
        switch (message.type) {
            case MESSAGE_DATA_TYPES.OFFER:
            case MESSAGE_DATA_TYPES.ANSWER:
                await rtcPeerConnection.setRemoteDescription(message.data);
                setSessionDescription(message.data);
                setIsCaller(message.type !== MESSAGE_DATA_TYPES.OFFER);
                break;
        
            case MESSAGE_DATA_TYPES.ICE_CANDIDATE:
                await rtcPeerConnection.addIceCandidate(message.data);
                setIceCandidates(candidates => [...candidates, message.data]);
                break;
        }
    }, [rtcPeerConnection, setIsCaller]);

    useEffect(() => {
        socket.on(SOCKET_EVENTS.MESSAGE, messageHandler);

        return () => socket.off(SOCKET_EVENTS.MESSAGE, messageHandler);
    }, [messageHandler, socket]);

    return (
        <div className="panel remote">
            <Media />
            <Chat />
            <SessionDescription sdp={sessionDescription?.sdp} />
            <IceCandidate iceCandidates={iceCandidates} />
        </div>
    );
};

export default RemotePanel;
