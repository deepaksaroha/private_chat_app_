import React from "react";
import { Navigate, useLocation } from "react-router-dom"
import IdentityContext from "../Context.js/identity";
import { useContext } from "react";

const ProtectedRoute = ({ children }) => {
    let location = useLocation();
    const { usernameAlreadySelected } = useContext(IdentityContext);
    
    if(!usernameAlreadySelected){
        return <Navigate to="identify" state={{ from: location }} replace />
    }
    return children;
}

export default ProtectedRoute;