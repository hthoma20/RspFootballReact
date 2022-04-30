import { useState } from 'react';

import { Game } from './Game';
import { GamePicker } from './GamePicker';
import { Login } from './Login';


function App() {

    const [user, setUser] = useState(null);
    const [gameId, setGameId] = useState('test_default_id');

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
