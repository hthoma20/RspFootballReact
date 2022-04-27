import { getRequest, postRequest } from './api';


export async function getGames() {
    return (await getRequest('/games')).data;
}

export async function getGame(gameId) {
    // if we say we have the -1st version, we will always be elibile for
    // an immediate update
    return await pollGame(gameId, -1);
}

/**
 * Given a game, poll for its next version and return it,
 * return the same version after a certion amount of time
 */
export async function pollGame(gameId, version) {
    return (await postRequest('/poll', {gameId, version})).data;
}

