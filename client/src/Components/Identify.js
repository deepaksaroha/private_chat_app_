import React, { useEffect, useLayoutEffect } from "react";
import { useContext, useState } from "react";
import IdentityContext from "../Context.js/identity";
import '../styles/Identify.css'
import { useNavigate } from "react-router-dom";
import socket from '../socket';

const Identify = () => {
    const navigate = useNavigate();
    const { usernameAlreadySelected, setUsernameAlreadySelected } = useContext(IdentityContext);
    const [userName, setUserName] = useState("");
    const [isValid, setIsValid] = useState(false);

    const onUsernameSelection = (e) => {
        e.preventDefault();
        setUsernameAlreadySelected(true);
        socket.auth = { userName };
        socket.connect();
        navigate('/');
    }
    
    useLayoutEffect(() => {
        const sessionId = localStorage.getItem('sessionId');

        if(sessionId){
            setUsernameAlreadySelected(true);
            socket.auth = { sessionId };
            socket.connect();
            navigate('/');
        }
    }, []);

    useEffect(() => {
        socket.on("session", ({ sessionId, userId }) => {
            socket.auth = { sessionId };
            localStorage.setItem("sessionId", sessionId);
            socket.userId = userId;
        });
    }, []);

    return <div className="select-username">
        <form onSubmit={onUsernameSelection}>
            <input
                type="text"
                value={userName}
                onChange={(e) => {
                    setUserName(e.target.value)
                    setIsValid(userName.length > 2)
                }}
                placeholder="Your username..."
            />
            <button type="submit" disabled={!isValid}>Send</button>
        </form>
    </div>
}
export default Identify;