import React from "react";

const IdentityContext = React.createContext({ usernameAlreadySelected: false, setUsernameAlreadySelected: ()=>{} });

export default IdentityContext;