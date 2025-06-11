import assert from 'assert';

const handler = (await import('../api/payments/capture.ts')).default;

const req = { method: 'POST', body: {} };
let statusCode = 0;
let jsonData;
const res = {
  status(code) { statusCode = code; return this; },
  json(data) { jsonData = data; return this; }
};

await handler(req, res);
assert.strictEqual(statusCode, 400);
assert.deepStrictEqual(jsonData, { error: 'Missing orderId or userId' });

