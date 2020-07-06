//
//  Simple HMAC Auth - Koa
//  /example/minimal.js
//  Created by Jesse T Youngblood on 5/31/19 at 15:37
//

'use strict';

const Koa = require('koa');
const Router = require('koa-router');

// const auth = require('simple-hmac-auth-koa');
const auth = require('../');

// Configuration

const port = 8000;

const secretForAPIKey = {
  API_KEY: 'SECRET',
  API_KEY_TWO: 'SECRET_TWO',
  API_KEY_THREE: 'SECRET_THREE'
};

// Create app and log requests

const app = new Koa();

// Enable authentication

app.use(auth({
  secretForKey: async apiKey => secretForAPIKey[apiKey]
}));

// Route incoming requests

const router = new Router();

router.all('/', ctx => ctx.body = 'Request successful.');

app.use(router.routes(), router.allowedMethods());

// Listen

app.listen(port);

console.log(`Listening on port ${port}`);
