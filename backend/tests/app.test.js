const request = require('supertest');
const app = require('../app');

describe('POST /', () => {
    it('responds with 200', async () => {
        const prompt = { content: 'Hello World!' };
        const res = await request(app).post('/').send({ input: prompt });
        expect(res.status).toBe(200);
    });

    it('responds with 400 if no input is provided', async () => {
        const res = await request(app).post('/').send({});
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("No user input");
    });

    it('responds with 400 if input has no content', async () => {
        const res = await request(app).post('/').send({ input: {} });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("No content in user input");
    });
});