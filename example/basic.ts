//
//  Simple HMAC Auth - Koa
//  /example/basic.js
//  Created by Jesse T Youngblood on 5/31/19 at 14:55
//

import Koa from 'koa';
import Router from 'koa-router';
// const logger = require('koa-logger');

// const auth = require('simple-hmac-auth-koa');
import auth from '../';

const port = 8000;

const secretsForAPIKeys: {[key:string]:string} = {
  API_KEY: 'SECRET',
  API_KEY_TWO: 'SECRET_TWO',
  API_KEY_THREE: 'SECRET_THREE'
};


const app = new Koa();

// Log incoming requests
// app.use(logger());

// Handle errors

app.use(async (ctx, next) => {

  try {

    await next();

  } catch (error) {

    ctx.status = error.status || 500;
    ctx.body = error.message;
    ctx.app.emit('error', error, ctx);
  }
});

// Enable simple-hmac-auth

app.use(auth({

  // This is required, and must either return the secret, throw, or return a promise that will resolve with it.
  secretForKey: (apiKey: string) => {

    console.log(`Looking for secret for API key: ${apiKey}`);

    return new Promise((resolve, reject) => {

      const secret = secretsForAPIKeys[apiKey];

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
  },

  // This is also optional, but MUST handle the error if implemented.
  // If not implemented, middlware will throw the error itself.
  onRejected: (ctx, next, error) => {
    console.log('Authentication rejected: ', error);
    ctx.throw(401, error.message);
  }
}));

// Route incoming requests

const router = new Router();

router.get('/', ctx => {
  ctx.body = 'GET successful.';
});

router.post('/', ctx => {
  ctx.body = 'POST successful.';
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(port);

console.log(`Now running on port ${port}`);
