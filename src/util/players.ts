import { Game, Player, UserId } from "model/gameModel";


export function getPlayer(game: Game, user: UserId): Player {
    return game.players.home == user ? 'home' : 'away';
}

export function getOpponent(player: Player): Player {
    return player == 'home' ? 'away' : 'home';
}