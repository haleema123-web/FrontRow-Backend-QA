
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

// TC20 - Transfer own ticket to another registered user
test('TC20 - Transfer ticket with valid recipient', async () => {

    const token = await getAuthToken();

    const response = await fetch(
        `${BASE_URL}/tickets/tkt_001/transfer`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                recipientEmail: 'victim@frontrow.com'
            })
        }
    );

    const data = await response.json();

    console.log('Transfer Status:', response.status);
    console.log('Transfer Response:', data);

    assert.equal(response.status, 200);
    assert.equal(data.userId, 'usr_other');
});
// TC21 - Transfer ticket to unregistered recipient
test('TC21 - Transfer ticket with invalid recipient', async () => {

    const token = await getAuthToken();

    const response = await fetch(
        `${BASE_URL}/tickets/tkt_001/transfer`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                recipientEmail: 'unknown123@gmail.com'
            })
        }
    );

    const data = await response.json();

    console.log('Transfer Status:', response.status);
    console.log('Transfer Response:', data);

    assert.equal(response.status, 404);
    assert.equal(data.code, 'recipient_not_found');
});
// TC22 - Transfer ticket without authentication
test('TC22 - Transfer ticket without auth token', async () => {

    const response = await fetch(
        `${BASE_URL}/tickets/tkt_001/transfer`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                recipientEmail: 'qa@frontrow.com'
            })
        }
    );

    const data = await response.json();

    console.log('Transfer Status:', response.status);
    console.log('Transfer Response:', data);

    assert.equal(response.status, 401);
});
// TC23 - Transfer another user's ticket
test('TC23 - Prevent transfer of another user ticket', async () => {

    const token = await getAuthToken();

    const response = await fetch(
        `${BASE_URL}/tickets/tkt_999/transfer`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                recipientEmail: 'qa@frontrow.com'
            })
        }
    );

    const data = await response.json();

    console.log('Transfer Status:', response.status);
    console.log('Transfer Response:', data);

    assert.equal(response.status, 403);
});
// TC24 - Transfer already transferred ticket
test('TC24 - Transfer already transferred ticket', async () => {

    const token = await getAuthToken();

    const response = await fetch(
        `${BASE_URL}/tickets/tkt_001/transfer`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                recipientEmail: 'qa@frontrow.com'
            })
        }
    );

    const data = await response.json();

    console.log('Transfer Status:', response.status);
    console.log('Transfer Response:', data);

    assert.equal(response.status, 409);
});