const API_URL = 'https://7ldpifsbac.execute-api.us-west-2.amazonaws.com';

function getEndpoint(route) {
    if (route.startsWith('/')) {
        route = route.substring(1);
    }
    return `${API_URL}/${route}`;
}

export async function getRequest(route) {
    const response = await fetch(getEndpoint(route));
    return response.json();
}

export async function postRequest(route, body) {
    const response = await fetch(getEndpoint(route), {
        method: 'POST',
        body: JSON.stringify(body)
    });

    return response.json();
}
