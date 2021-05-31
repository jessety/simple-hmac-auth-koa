'use strict';

// const auth = require('simple-hmac-auth-koa');
const auth = require('../src');

// Include the core library, for the client implementation
const SimpleHMACAuth = require('simple-hmac-auth');

const Koa = require('koa');
const Router = require('koa-router');

describe('koa middleware', () => {

  test('throws when missing required options', () => {

    // Missing all options
    expect(() => auth()).toThrow();

    // Missing `secretForKey` function
    expect(() => auth({
      onAccepted: () => {},
      onRejected: () => {}
    })).toThrow();

    // Not missing anything
    expect(() => auth({
      secretForKey: () => {},
      onAccepted: () => {},
      onRejected: () => {}
    })).not.toThrow();
  });

  test('accepts valid requests', async () => {

    expect.assertions(2);

    const apiKey = 'TEST_API_KEY';
    const secret = 'TEST_SECRET';
    const port = 8000;

    const app = new Koa();

    const server = app.listen(port);

    app.use(auth({
      secretForKey: async apiKey => secret,
      onAccepted: ctx => {
        expect(ctx.request.body.boolean).toBe(true);
      }
    }));

    const router = new Router();
    router.all('/items/', ctx => {
      ctx.body = 'Request successful.';
      server.close();
    });
    app.use(router.routes(), router.allowedMethods());

    // Create a client and make a request

    const client = new SimpleHMACAuth.Client(apiKey, secret, {
      verbose: false,
      host: 'localhost',
      port: port,
      ssl: false
    });

    const options = {
      method: 'POST',
      path: '/items/',
      query: {
        string: 'string',
        boolean: true,
        number: 42,
        object: { populated: true },
        array: [1, 2, 3]
      },
      data: {
        string: 'string',
        boolean: true,
        number: 42,
        object: { populated: true },
        array: [1, 2, 3]
      }
    };

    const response = await client.request(options);

    expect(response).toBe('Request successful.');
  });

  test('rejects invalid requests', async () => {

    expect.assertions(2);

    const apiKey = 'TEST_API_KEY';
    const secret = 'TEST_SECRET';
    const port = 8001;

    const app = new Koa();

    const server = app.listen(port);

    app.use(auth({
      secretForKey: async apiKey => secret,
      onRejected: (ctx, next, error) => {
        ctx.status = 401;
        ctx.body = { error };
        server.close();
        expect(error.code).toBe('SIGNATURE_INVALID');
      }
    }));

    const router = new Router();
    router.all('/items/', ctx => {
      ctx.body = 'Request successful.';
      server.close();
    });
    app.use(router.routes(), router.allowedMethods());

    // Create a client and make a request

    const client = new SimpleHMACAuth.Client(apiKey, 'INCORRECT_SECRET', {
      verbose: false,
      host: 'localhost',
      port: port,
      ssl: false
    });

    const options = {
      method: 'POST',
      path: '/items/',
      query: {
        string: 'string',
        boolean: true,
        number: 42,
        object: { populated: true },
        array: [1, 2, 3]
      },
      data: {
        string: 'string',
        boolean: true,
        number: 42,
        object: { populated: true },
        array: [1, 2, 3]
      }
    };

    await expect(() => client.request(options)).rejects.toThrow();
  });
});
