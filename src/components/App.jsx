import { useEffect, useState } from 'react';

import { Game } from './Game';
import { GamePicker } from './GamePicker';
import { Login } from './Login';
import { NavigationBar } from './NavigationBar';


function App() {

    const [user, setUser] = useState(null);
    const [gameId, setGameId] = useState("I <3 Daylin"); // useState('test_default_id');

    useEffect(() => {
        const savedUser = window.localStorage.getItem('user');
        if (savedUser) {
            setUser(savedUser);
        }
    });

    function clearUser() {
        window.localStorage.removeItem('user');
        setUser(null);
    }

    function updateUser(user) {
        window.localStorage.setItem('user', user);
        setUser(user);
    }

    return <div>
        <NavigationBar user={user} clearUser={clearUser} />
        <MainContent
            user={user}
            setUser={updateUser}
            gameId={gameId}
            setGameId={setGameId} />
    </div>;
}

function MainContent({user, setUser, gameId, setGameId}) {
    if (!user) {
        return <Login setUser={setUser} />;
    }

    if (!gameId) {
        return <GamePicker
            setGameId={setGameId}
            user={user} />;
    }

    return <Game
        user={user}
        gameId={gameId} />;
}

export default App;
