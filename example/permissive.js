//
//  Simple HMAC Auth - Koa
//  /example/permissive.js
//  Allow requests through even if they don't correctly authenticate, but update ctx with that fact either way
//  Created by Jesse T Youngblood on 12/30/19 at 17:40
//

'use strict';

const Koa = require('koa');
const Router = require('koa-router');
// const logger = require('koa-logger');

// const auth = require('simple-hmac-auth-koa');
const auth = require('../');

const settings = {
  port: 8000,
  secretForAPIKey: {
    API_KEY: 'SECRET',
    API_KEY_TWO: 'SECRET_TWO',
    API_KEY_THREE: 'SECRET_THREE'
  }
};

const app = new Koa();

// Log incoming requests
// app.use(logger());

// Enable simple-hmac-auth

app.use(auth({

  // This is required, and must either return the secret, throw, or return a promise that will resolve with it.
  secretForKey: apiKey => {

    console.log(`Looking for secret for API key: ${apiKey}`);

    return new Promise((resolve, reject) => {

      const secret = settings.secretForAPIKey[apiKey];

      if (secret === undefined) {
        reject();
        return;
      }

      console.log(`Found secret "${secret}" for api key ${apiKey}`);

      resolve(secret);
    });
  },

  // This is optional
  onAccepted: ctx => {
    console.log('Authentication accepted.');
    ctx.authenticated = true;
  },

  // This is also optional, but MUST handle the error if implemented.
  // If not implemented, middlware will throw the error itself.
  onRejected: async (ctx, next, error) => {

    console.log(`Authentication rejected: "${error.message}" Allowing..`);

    ctx.authenticated = false;
    await next();
  }
}));

// Route incoming requests

const router = new Router();

router.all('/', ctx => {
  ctx.body = `Request successful. Authenticated: ${ctx.authenticated}`;
});

app.use(router.routes(), router.allowedMethods());

app.listen(settings.port);

console.log(`Now running on port ${settings.port}`);
