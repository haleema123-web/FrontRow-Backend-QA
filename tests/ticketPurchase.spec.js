
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

// TC08 - Valid ticket purchase
test('TC08 - Purchase ticket with valid data', async () => {
    const token = await getAuthToken();

    const response = await fetch(`${BASE_URL}/tickets/purchase`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            eventId: 'evt_001',
            quantity: 1
        })
    });

    const data = await response.json();

    console.log('Purchase Status:', response.status);
    console.log('Purchase Response:', data);

    assert.equal(response.status, 200);
    assert.equal(data.status, 'active');
    assert.equal(data.quantity, 1);
});

// TC09 - Invalid event ID
test('TC09 - Purchase ticket with invalid event ID', async () => {
    const token = await getAuthToken();

    const response = await fetch(`${BASE_URL}/tickets/purchase`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            eventId: 'invalid_event',
            quantity: 1
        })
    });

    const data = await response.json();

    console.log('Invalid Event Status:', response.status);
    console.log('Invalid Event Response:', data);

    assert.equal(response.status, 404);
});

// TC10 - Purchase without authentication
test('TC10 - Purchase ticket without authentication', async () => {
    const response = await fetch(`${BASE_URL}/tickets/purchase`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            eventId: 'evt_001',
            quantity: 1
        })
    });

    const data = await response.json();

    console.log('Unauthenticated Status:', response.status);

    assert.equal(response.status, 401);
});

// TC11 - Purchase with zero quantity
test('TC11 - Purchase ticket with zero quantity', async () => {
    const token = await getAuthToken();

    const response = await fetch(`${BASE_URL}/tickets/purchase`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            eventId: 'evt_001',
            quantity: 0
        })
    });

    const data = await response.json();

    console.log('Zero Quantity Status:', response.status);
    console.log('Zero Quantity Response:', data);

    assert.notEqual(
        response.status,
        200,
        'Zero quantity should not be accepted'
    );
});

test('TC12 - Purchase ticket with negative quantity', async () => {
    const token = await getAuthToken();

    const response = await fetch(`${BASE_URL}/tickets/purchase`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            eventId: 'evt_001',
            quantity: -2
        })
    });

    const data = await response.json();

    console.log('Negative Quantity Status:', response.status);
    console.log('Negative Quantity Response:', data);

    assert.notEqual(
        response.status,
        200,
        'Negative quantity should not be accepted'
    );
});

test('TC13 - Purchase ticket without quantity', async () => {
    const token = await getAuthToken();

    const response = await fetch(`${BASE_URL}/tickets/purchase`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            eventId: 'evt_001'
        })
    });

    const data = await response.json();

    console.log('Missing Quantity Status:', response.status);
    console.log('Missing Quantity Response:', data);

    assert.notEqual(
        response.status,
        200,
        'Missing quantity should not be accepted'
    );
});

test('TC14 - Purchase ticket with text quantity', async () => {
    const token = await getAuthToken();

    const response = await fetch(`${BASE_URL}/tickets/purchase`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            eventId: 'evt_001',
            quantity: 'abc'
        })
    });

    const data = await response.json();

    console.log('Text Quantity Status:', response.status);
    console.log('Text Quantity Response:', data);

    assert.notEqual(
        response.status,
        200,
        'Text quantity should not be accepted'
    );
});

test('TC15 - Purchase ticket without event ID', async () => {
    const token = await getAuthToken();

    const response = await fetch(`${BASE_URL}/tickets/purchase`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            quantity: 1
        })
    });

    const data = await response.json();

    console.log('Missing Event ID Status:', response.status);
    console.log('Missing Event ID Response:', data);

    assert.equal(
        response.status,
        404,
        'Missing event ID should be rejected'
    );
});

