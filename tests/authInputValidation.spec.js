
const test = require('node:test');
const assert = require('node:assert/strict');

const BASE_URL = 'http://localhost:3000';

async function login(email, password) {
    return fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
}

// TC33 - Empty email
test('TC33 - Login with empty email', async (t) => {
    const response = await login('', 'password123');
    const data = await response.json();

    console.log('TC33 Status:', response.status);
    console.log('TC33 Response:', data);
    await t.diagnostic('Screenshot: auth-input-TC33.png');

    assert.equal(response.status, 400);
});

// TC34 - Empty password
test('TC34 - Login with empty password', async (t) => {
    const response = await login('demo@frontrow.com', '');
    const data = await response.json();

    console.log('TC34 Status:', response.status);
    console.log('TC34 Response:', data);
    await t.diagnostic('Screenshot: auth-input-TC34.png');

    assert.equal(response.status, 400);
});

// TC35 - Invalid email format
test('TC35 - Login with invalid email format', async (t) => {
    const response = await login('invalid-email', 'password123');
    const data = await response.json();

    console.log('TC35 Status:', response.status);
    console.log('TC35 Response:', data);
    await t.diagnostic('Screenshot: auth-input-TC35.png');

    assert.equal(response.status, 400);
});

// TC36 - Extremely long email
test('TC36 - Login with extremely long email', async (t) => {
    const longEmail = 'a'.repeat(10000) + '@test.com';

    const response = await login(longEmail, 'password123');
    const data = await response.json();

    console.log('TC36 Status:', response.status);
    console.log('TC36 Response:', data);
    await t.diagnostic('Screenshot: auth-input-TC36.png');

    assert.ok(
        response.status === 400 || response.status === 422,
        'Extremely long email should be rejected'
    );
});

// TC37 - SQL Injection in email
test('TC37 - SQL Injection attempt in email', async (t) => {
    const response = await login("' OR '1'='1' -- ", 'wrongpassword');
    const data = await response.json();

    console.log('TC37 Status:', response.status);
    console.log('TC37 Response:', data);
    await t.diagnostic('Screenshot: auth-input-TC37.png');

    assert.equal(response.status, 401);
});

// TC38 - SQL Injection in password
test('TC38 - SQL Injection attempt in password', async (t) => {
    const response = await login(
        'demo@frontrow.com',
        "' OR '1'='1' -- "
    );

    const data = await response.json();

    console.log('TC38 Status:', response.status);
    console.log('TC38 Response:', data);
    await t.diagnostic('Screenshot: auth-input-TC38.png');

    assert.equal(response.status, 401);
});
