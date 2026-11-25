
const test = require('node:test');
const assert = require('node:assert/strict');

const BASE_URL = 'http://localhost:3000';

async function getAuthToken() {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: 'demo@frontrow.com',
            password: 'password123'
        })
    });

    const data = await response.json();
    assert.equal(response.status, 200);

    return data.token;
}

// TC16 - Cancel an active ticket
test('TC16 - Cancel active ticket', async () => {
    const token = await getAuthToken();

    const response = await fetch(`${BASE_URL}/tickets/tkt_001/cancel`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();

    console.log('Cancellation Status:', response.status);
    console.log('Cancellation Response:', data);

    assert.equal(response.status, 200);
});

// TC17 - Cancel an already cancelled ticket
test('TC17 - Cancel already cancelled ticket', async () => {
    const token = await getAuthToken();

    const response = await fetch(`${BASE_URL}/tickets/tkt_001/cancel`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();

    console.log('Second Cancellation Status:', response.status);
    console.log('Second Cancellation Response:', data);

    assert.notEqual(
        response.status,
        200,
        'Already cancelled ticket should not be cancelled again'
    );
});

test('TC18 - Cancel ticket without authentication', async () => {

    const response = await fetch(`${BASE_URL}/tickets/tkt_001/cancel`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();

    console.log('Unauthenticated Cancellation Status:', response.status);
    console.log('Response:', data);

    assert.equal(response.status, 401);
});

 // TC19 - Cancel another user's ticket
test('TC19 - User should not cancel another users ticket', async () => {

    const token = await getAuthToken();

    const response = await fetch(`${BASE_URL}/tickets/tkt_999/cancel`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();

    console.log('Unauthorized Cancellation Status:', response.status);
    console.log('Unauthorized Cancellation Response:', data);

    assert.notEqual(
        response.status,
        200,
        'User should not cancel another users ticket'
    );
});

