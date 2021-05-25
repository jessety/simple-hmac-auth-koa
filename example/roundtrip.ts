//
//  Simple HMAC Auth - Koa
//  /example/roundtrip.js
//  Created by Jesse T Youngblood on 12/19/19 at 14:44
//

import Koa from 'koa';
import Router from 'koa-router';
// const logger = require('koa-logger');

// const auth = require('simple-hmac-auth-koa');
import auth from '../';

import { Client } from 'simple-hmac-auth';

const settings = {
  port: 8000,
  apiKey: 'API_KEY',
  secret: 'SECRET'
};

const app = new Koa();

// Log incoming requests
// app.use(logger());

// Handle errors
app.use(async (ctx, next) => {

  try {

    await next();

  } catch (err) {

    ctx.status = err.status || 500;
    ctx.body = err.message;
    ctx.app.emit('error', err, ctx);
  }
});

// Enable simple-hmac-auth
app.use(auth({

  // This is required
  secretForKey: async (apiKey: string) => {
    return settings.secret;
  },

  // This is optional
  onAccepted: ctx => {
    console.log('Authentication accepted.');
  }

  // This is also optional, but MUST handle the error if implemented.
  // onRejected: (ctx, next, error) => {
  //   ctx.throw(401, `Authentication error! Error message: ${error.message}`);
  // }
}));

// Route incoming requests

const router = new Router();

router.post('/items/', ctx => ctx.body = 'POST successful.');

app.use(router.routes());
app.use(router.allowedMethods());

const server = app.listen(settings.port, () => {

  console.log(`Now running on port ${settings.port}`);

  // Create a client and make a request

  const client = new Client(settings.apiKey, settings.secret, {
    verbose: true,
    host: 'localhost',
    port: settings.port,
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

  console.log(`Client sending request..`);

  client.request(options).then(response => {

    console.error(`Client received response from server:`, response);

    server.close();

  }).catch(error => {

    console.error(`Client received error from server:`, error);

    server.close();
  });
});
