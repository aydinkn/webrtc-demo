import { useContext, useEffect, useRef, useState } from 'react';
import { RTC_PEER_CONNECTION_EVENTS } from '../../constants';
import AppContext from '../../contexts/AppContext';

import './media.css';

const Media = ({isLocal}) => {
    const { rtcPeerConnection } = useContext(AppContext);
    const [localStream, setLocalStream] = useState();
    const videoRef = useRef();

    useEffect(() => {
        if (localStream) return;

        if (isLocal) {
            navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 360 }, audio: true }).then(stream => {
                setLocalStream(stream);
                stream.getTracks().forEach(track => rtcPeerConnection.addTrack(track, stream));
            });
        }
    }, [isLocal, rtcPeerConnection, localStream]);

    useEffect(() => {
        if (videoRef.current && localStream) {
            videoRef.current.srcObject = localStream;
            videoRef.current.play();
        }
    }, [localStream]);

    useEffect(() => {
        if (!isLocal) {
            rtcPeerConnection.addEventListener(RTC_PEER_CONNECTION_EVENTS.TRACK, event => {
                videoRef.current.srcObject = event.streams[0];
                videoRef.current.play();
            });
        }
    }, [isLocal, rtcPeerConnection]);

    return (
        <div className="video">
            <video ref={videoRef}></video>
        </div>
    );
};

export default Media;
