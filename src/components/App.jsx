import { useEffect, useState } from 'react';
import { useLocalStorage } from 'util/localStorage';

import { Game } from './Game';
import { GamePicker } from './GamePicker';
import { Login } from './Login';
import { NavigationBar } from './NavigationBar';


function App() {

    const [user, setUser, clearUser] = useLocalStorage('user');
    const [gameId, setGameId, clearGameId] = useLocalStorage('gameId');

    function logout() {
        clearGameId();
        clearUser();
    }

    return <div>
        <NavigationBar
            user={user} logout={logout}
            gameId={gameId} exitGame={clearGameId} />
        <MainContent
            user={user}
            setUser={setUser}
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
