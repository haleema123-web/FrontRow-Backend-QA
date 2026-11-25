
const test = require('node:test');
const assert = require('node:assert/strict');

const BASE_URL = 'http://localhost:3000';

// TC26 - Invalid token
test('TC26 - Access tickets with invalid token', async (t) => {
    const response = await fetch(`${BASE_URL}/tickets`, {
        headers: {
            Authorization: 'Bearer invalid_token'
        }
    });

    const data = await response.json();

    console.log('TC26 Status:', response.status);
    console.log('TC26 Response:', data);

    await t.diagnostic('TC26 screenshot: auth-security-TC26.png');

    assert.equal(response.status, 401);
});

// TC27 - Random token
test('TC27 - Access tickets with random token', async (t) => {
    const response = await fetch(`${BASE_URL}/tickets`, {
        headers: {
            Authorization: 'Bearer abc123random'
        }
    });

    const data = await response.json();

    console.log('TC27 Status:', response.status);
    console.log('TC27 Response:', data);

    await t.diagnostic('TC27 screenshot: auth-security-TC27.png');

    assert.equal(response.status, 401);
});

// TC28 - Modified user ID in token
test('TC28 - Access tickets with modified user ID token', async (t) => {
    const response = await fetch(`${BASE_URL}/tickets`, {
        headers: {
            Authorization: 'Bearer mock_usr_other_1'
        }
    });

    const data = await response.json();

    console.log('TC28 Status:', response.status);
    console.log('TC28 Response:', data);

    await t.diagnostic('TC28 screenshot: auth-security-TC28.png');

    assert.equal(response.status, 401);
});

// TC29 - Empty Bearer token
test('TC29 - Access tickets with empty bearer token', async (t) => {
    const response = await fetch(`${BASE_URL}/tickets`, {
        headers: {
            Authorization: 'Bearer '
        }
    });

    const data = await response.json();

    console.log('TC29 Status:', response.status);
    console.log('TC29 Response:', data);

    await t.diagnostic('TC29 screenshot: auth-security-TC29.png');

    assert.equal(response.status, 401);
});

// TC30 - Malformed Authorization header
test('TC30 - Access tickets with malformed authorization header', async (t) => {
    const response = await fetch(`${BASE_URL}/tickets`, {
        headers: {
            Authorization: 'InvalidHeader'
        }
    });

    const data = await response.json();

    console.log('TC30 Status:', response.status);
    console.log('TC30 Response:', data);

    await t.diagnostic('TC30 screenshot: auth-security-TC30.png');

    assert.equal(response.status, 401);
});

// TC31 - Access another user's tickets using a forged token
test('TC31 - Access another user tickets using forged token', async (t) => {
    const response = await fetch(`${BASE_URL}/tickets`, {
        headers: {
            Authorization: 'Bearer mock_usr_other_1'
        }
    });

    const data = await response.json();

    console.log('TC31 Status:', response.status);
    console.log('TC31 Response:', data);

    await t.diagnostic('TC31 screenshot: auth-security-TC31.png');

    assert.equal(response.status, 401);
});
