//
//  Simple HMAC Auth - Koa
//  /example/minimal.js
//  Created by Jesse T Youngblood on 5/31/19 at 15:37
//

'use strict';

const Koa = require('koa');
const Router = require('koa-router');
// const auth = require('simple-hmac-auth-koa');
const auth = require('../index.js');

const app = new Koa();

// Handle errors

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = err.message;
  }
});

// Enable authentication

app.use(auth({
  secretForKey: apiKey => {
    return new Promise((resolve, reject) => {
      resolve('SECRET');
    });
  }
}));

// Route incoming requests

const router = new Router();

router.all('*', ctx => {
  ctx.body = 'Request successful.';
});

app.use(router.routes());
app.use(router.allowedMethods());

// Listen

app.listen(8000);
