import { useState } from 'react';

import { Game } from './Game';
import { GamePicker } from './GamePicker';
import { Login } from './Login';


function App() {

    const [user, setUser] = useState(null);
    const [game, setGame] = useState(null);

    if (!user) {
        return <Login setUser={setUser} />;
    }

    if (!game) {
        return <GamePicker
            setGame={setGame}
            user={user} />;
    }

    return <Game
        game={game}
        setGame={setGame} />;
}

export default App;
