
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

    assert.equal(response.status, 200, 'Login should succeed');

    return data.token;
}

test('TC05 - Get all tickets with authentication', async () => {
    const token = await getAuthToken();

    const response = await fetch(`${BASE_URL}/tickets`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();

    console.log('Tickets API Status:', response.status);
    console.log('Tickets Response:', data);

    assert.equal(response.status, 200);
});

test('TC06 - Verify tickets response structure', async () => {
    const token = await getAuthToken();

    const response = await fetch(`${BASE_URL}/tickets`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(data), 'Tickets response should be an array');
    assert.ok(data.length > 0, 'Tickets list should not be empty');

    console.log('Total Tickets:', data.length);
});

test('TC07 - Verify ticket ID and status', async () => {
    const token = await getAuthToken();

    const response = await fetch(`${BASE_URL}/tickets`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();

    const ticket = data.find(item => item.id === 'tkt_001');

    assert.ok(ticket, 'Ticket tkt_001 should exist');
    assert.equal(ticket.status, 'active');
    assert.ok(ticket.eventId, 'Event ID should exist');
    assert.ok(ticket.quantity > 0, 'Ticket quantity should be greater than zero');

    console.log('Ticket ID:', ticket.id);
    console.log('Ticket Status:', ticket.status);
});

