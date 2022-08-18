import { useCallback, useContext, useEffect, useRef } from 'react';
import AppContext from '../../contexts/AppContext';

import './chat.css';

export const Chat = ({ isLocal }) => {
    const { rtcDataChannel } = useContext(AppContext);
    const localMessageInputRef = useRef();
    const remoteMessageInputRef = useRef();

    const submitHandler = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!localMessageInputRef.current) return;

        const message = localMessageInputRef.current.value;
        rtcDataChannel.send(message);

        localMessageInputRef.current.value = '';
    }, [rtcDataChannel]);

    useEffect(() => {
        const messageHandler = (message) => {
            if (!remoteMessageInputRef.current) return;

            remoteMessageInputRef.current.value = `${message.data}\n\n${remoteMessageInputRef.current.value}`;
        };

        rtcDataChannel.addEventListener('message', messageHandler);

        return () => {
            rtcDataChannel.removeEventListener('message', messageHandler);
        }
    }, [rtcDataChannel]);

    return (
        <form className="chat-form" onSubmit={submitHandler}>
            <fieldset>
                <legend>Chat</legend>
                <div className="chat-input-container">
                    {isLocal ? (
                    <>
                        <input type="text" ref={localMessageInputRef} placeholder="Type a message" />
                        <button type="submit">Send</button>
                    </>
                    ) : (
                        <textarea ref={remoteMessageInputRef} disabled></textarea>
                    )}
                </div>
            </fieldset>
        </form>
    );
}
