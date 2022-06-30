import { useCallback, useContext, useEffect, useRef, useState } from "react";
import AppContext from "../../contexts/AppContext";
import IceCandidate from "./IceCandidate";
import Media from "./Media";
import SessionDescription from "./SessionDescription";
import { SOCKET_EVENTS, MESSAGE_DATA_TYPES, RTC_PEER_CONNECTION_EVENTS } from '../../constants';

const LocalPanel = () => {
    const { rtcPeerConnection, socket, selectedUser, isCaller } = useContext(AppContext);
    const [sessionDescription, setSessionDescription] = useState();
    const [iceCandidates, setIceCandidates] = useState([]);
    const selectedUserRef = useRef(selectedUser);

    const onClickHandler = useCallback(async () => {
        const localSessionDescription = isCaller ?
            await rtcPeerConnection.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
            : await rtcPeerConnection.createAnswer();

        rtcPeerConnection.setLocalDescription(localSessionDescription);
        setSessionDescription(localSessionDescription);

        socket.emit(SOCKET_EVENTS.MESSAGE, selectedUser, {
            type: isCaller ? MESSAGE_DATA_TYPES.OFFER : MESSAGE_DATA_TYPES.ANSWER,
            data: localSessionDescription
        });
    }, [isCaller, rtcPeerConnection, selectedUser, socket]);

    const iceCandidateHandler = useCallback((event) => {
        if (event.candidate) {
            setIceCandidates(candidates => [...candidates, event.candidate]);
            socket.emit(SOCKET_EVENTS.MESSAGE, selectedUserRef.current, {
                type: MESSAGE_DATA_TYPES.ICE_CANDIDATE,
                data: event.candidate
            });
        }
    }, [socket]);

    useEffect(() => {
        rtcPeerConnection.addEventListener(RTC_PEER_CONNECTION_EVENTS.ICE_CANDIDATE, iceCandidateHandler);

        return () => rtcPeerConnection.removeEventListener(RTC_PEER_CONNECTION_EVENTS.ICE_CANDIDATE, iceCandidateHandler);
    }, [iceCandidateHandler, rtcPeerConnection]);

    useEffect(() => {
        selectedUserRef.current = selectedUser;
    }, [selectedUser]);

    return (
        <div className="panel local">
            <Media isLocal />
            <button onClick={onClickHandler}>Create {isCaller ? 'Offer' : 'Answer'}</button>
            <SessionDescription isLocal sdp={sessionDescription?.sdp} />
            <IceCandidate isLocal iceCandidates={iceCandidates} />
        </div>
    );
};

export default LocalPanel;
