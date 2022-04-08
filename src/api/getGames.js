import { getRequest } from './api';


export async function getGames() {
    return getRequest('/games');
}

