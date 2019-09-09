//
//  Simple HMAC Auth - Koa
//  /example/index.js
//  Created by Jesse T Youngblood on 5/31/19 at 14:55
//

'use strict';

const Koa = require('koa');
const logger = require('koa-logger');
const Router = require('koa-router');

// const auth = require('simple-hmac-auth-koa');
const auth = require('../src/index.js');

const settings = {
  port: 8000,
  secretsForAPIKeys: {
    API_KEY: 'SECRET',
    API_KEY_TWO: 'SECRET_TWO',
    API_KEY_THREE: 'SECRET_THREE'
  }
};

const app = new Koa();

// Log incoming requests
app.use(logger());

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
  secretForKey: apiKey => {

    console.log(apiKey);

    return new Promise((resolve, reject) => {

      if (settings.secretsForAPIKeys[apiKey] === undefined) {
        reject();
        return;
      }

      resolve(settings.secretsForAPIKeys[apiKey]);
    });
  },

  // This is optional
  onAccepted: ctx => {
    console.log('Authentication accepted.');
  },

  // This is also optional
  onRejected: ctx => {
    console.log('Authentication rejected.');
  }
}));

// Route incoming requests

const router = new Router();

router.get('*', ctx => {
  ctx.body = 'GET successful.';
});

router.post('*', ctx => {
  ctx.body = 'POST successful.';
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(settings.port);

console.log(`Now running on port ${settings.port}`);
