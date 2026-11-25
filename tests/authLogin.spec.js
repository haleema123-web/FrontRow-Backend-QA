
const test = require('node:test');
const assert = require('node:assert/strict');

const BASE_URL = 'http://localhost:3000';

test('TC01 - Login with valid credentials', async () => {
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

    console.log('Valid Login Status:', response.status);
    console.log('Valid Login Response:', data);

    assert.equal(response.status, 200);
});

test('TC02 - Login with invalid credentials', async () => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: 'demo@frontrow.com',
            password: 'wrongpassword'
        })
    });

    const data = await response.json();

    console.log('Invalid Login Status:', response.status);
    console.log('Invalid Login Response:', data);

    assert.equal(response.status, 401);
});
