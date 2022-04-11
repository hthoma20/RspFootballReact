import { postRequest } from './api';


export async function postAction(user, gameId, action) {
    return postRequest('/action', {
        user: user,
        gameId: gameId,
        action: action
    });
}

