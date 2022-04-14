import { postRequest } from './api';


export async function postAction(gameId, user, action) {
    return postRequest('/action', {
        user: user,
        gameId: gameId,
        action: action
    });
}


export async function joinGame(user, gameId) {
    return postRequest('/join', {
        user: user,
        gameId: gameId
    });
}
