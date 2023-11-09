import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './Components/ProtectedRoute';
import IdentityContext from './Context.js/identity';
import Identify from './Components/Identify';
import './index.css'
import Chat from './Components/Chat';
import Error from './Components/Error';

export const App = () => {
    const [usernameAlreadySelected, setUsernameAlreadySelected] = useState(false);

    const val = {
        usernameAlreadySelected,
        setUsernameAlreadySelected
    };

    return <IdentityContext.Provider
        value={val}
    >
        <Routes>
            <Route path='/' element={
                <ProtectedRoute>
                    <Chat />
                </ProtectedRoute>
            } />
            <Route path="identify" element={<Identify />} />
            <Route path="*" element={<Error />} />
        </Routes>
    </IdentityContext.Provider>
}