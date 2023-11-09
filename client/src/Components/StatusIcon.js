import React from "react";

const StatusIcon = ({ connected }) => {
    return <span style={{
        backgroundColor:connected ? "green": "red",
    }}>
        O
    </span>
}

export default StatusIcon;