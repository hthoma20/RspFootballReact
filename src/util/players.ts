import { Game, Player } from "model/rspModel";


export function getPlayer(game: Game, user: string): Player {
    return game.players.home == user ? 'home' : 'away';
}

export function getOpponent(player: Player): Player {
    return player == 'home' ? 'away' : 'home';
}