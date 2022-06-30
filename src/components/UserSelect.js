import { useContext, useState, useEffect, useCallback, useRef } from "react";
import AppContext from "../contexts/AppContext";
import { SOCKET_EVENTS } from '../constants';

import './user-select.css';

const UserSelect = () => {
    const { socket, setSelectedUser } = useContext(AppContext);
    const [users, setUsers] = useState(new Set());
    const selectedUserRef = useRef();

    const onChangeHandler = useCallback(({target: { value }}) => {
        selectedUserRef.current = value;
        setSelectedUser(selectedUserRef.current);
    }, [setSelectedUser]);

    const userConnectedHandler = useCallback((id) => {
        setUsers(prevUsers => new Set([...prevUsers, id]));
    }, []);

    const onlineUsersHandler = useCallback((onlineUsers) => {
        setUsers(prevUsers => new Set([...prevUsers, ...onlineUsers]));
    }, []);

    const userDisconnectedHandler = useCallback((id) => {
        setUsers(prevUsers => new Set([...prevUsers].filter(uid => uid !== id)));
        
        if (selectedUserRef.current === id) {
            selectedUserRef.current = '';
            onChangeHandler({ target: { value: selectedUserRef.current } });
        }
    }, [onChangeHandler]);

    useEffect(() => {
        socket.on(SOCKET_EVENTS.USER_CONNECTED, userConnectedHandler);
        socket.on(SOCKET_EVENTS.USER_DISCONNECTED, userDisconnectedHandler);
        socket.on(SOCKET_EVENTS.ONLINE_USERS, onlineUsersHandler);
        socket.emit(SOCKET_EVENTS.ONLINE_USERS);

        return () => {
            socket.off(SOCKET_EVENTS.USER_CONNECTED, userConnectedHandler);
            socket.off(SOCKET_EVENTS.USER_DISCONNECTED, userDisconnectedHandler);
            socket.off(SOCKET_EVENTS.ONLINE_USERS, onlineUsersHandler);
        };
    }, [socket, onlineUsersHandler, userConnectedHandler, userDisconnectedHandler]);

    return (
        <div className="user-select">
            <select onChange={onChangeHandler}>
                <option value="">Select USER</option>
                {[...users].map(id => (<option key={id} value={id}>{id}</option>))}
            </select>
        </div>
    );
};

export default UserSelect;
