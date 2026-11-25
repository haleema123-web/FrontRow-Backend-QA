
const test = require('node:test');
const assert = require('node:assert/strict');

const BASE_URL = 'http://localhost:3000';

test('TC03 - Get all events', async () => {
    const response = await fetch(`${BASE_URL}/events`);
    const data = await response.json();

    console.log('Events API Status:', response.status);
    console.log('Total Events:', data.total);

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(data.items), 'Events should be an array');
    assert.ok(data.items.length > 0, 'Events list should not be empty');
    assert.equal(data.total, data.items.length);
});

test('TC04 - Verify event details', async () => {
    const response = await fetch(`${BASE_URL}/events`);
    const data = await response.json();

    const event = data.items.find(item => item.id === 'evt_001');

    assert.ok(event, 'Expected event evt_001 should exist');
    assert.ok(event.title, 'Event title should not be empty');

    console.log('Verified Event:', event.title);
});
