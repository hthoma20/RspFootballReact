import 'styles/NavigationBar.css';

export function NavigationBar({user, logout, gameId, exitGame}) {

    return <div className="navigationBar" >
        <UserContent user={user} logout={logout} />
        <GameIdContent gameId={gameId} exitGame={exitGame} />
    </div>;

}

function UserContent({user, logout}) {
    if (user) {
        return <span className="userName" onClick={logout}>{user}</span>;
    }

    return <span className="loginTag">Log in</span>;
}

function GameIdContent({gameId, exitGame}) {
    return <span className="gameIdLabel" onClick={exitGame}>{gameId}</span>;
}
