import { useEffect, useRef, useState } from "react";

export function NavigationBar({user, clearUser}) {

    return <div className="navigationBar" >
        <UserContent user={user} clearUser={clearUser} />
    </div>;

}

function UserContent({user, clearUser}) {
    if (user) {
        return <span className="userName" onClick={clearUser}>{user}</span>;
    }

    return <span className="loginTag">Log in</span>;
}