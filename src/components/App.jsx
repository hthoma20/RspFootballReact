import { useState } from 'react';

import { Game } from './Game';
import { GamePicker } from './GamePicker';
import { Login } from './Login';


function App() {

    const [user, setUser] = useState("harry"); // useState(null);
    const [gameId, setGameId] = useState('game7');

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
