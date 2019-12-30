//
//  Simple HMAC Auth - Koa
//  /src/index.js
//  Created by Jesse T Youngblood on 5/31/19 at 1:36
//

'use strict';

const bodyParser = require('koa-bodyparser');
const compose = require('koa-compose');
const SimpleHMACAuth = require('simple-hmac-auth');

// Extend the SimpleHMACAuth class to add a function which returns Koa middleware
class SimpleHMACAuthKoa extends SimpleHMACAuth.Server {

  /**
   * Return middleware for use with Koa
   * @param   {object} options - Options
   * @returns {function}  - Middleware for Koa
   */
  middleware(options) {

    // Construct a middleware function that authenticates the request
    const authMiddleware = async (ctx, next) => {

      try {

        await this.authenticate(ctx.req, ctx.request.rawBody);

      } catch (error) {

        // If an onRejected function is implemeted, let it handle the error
        if (typeof this.onRejected === 'function') {

          return this.onRejected(ctx, next, error);
        }

        // Otherwise, throw the error
        ctx.throw(error.status || 401, error.message);

        return;
      }

      // If the onAccepted function is implemented, run it
      if (typeof this.onAccepted === 'function') {
        this.onAccepted(ctx, next);
      }

      await next();
    };

    // Compose koa-bodyparser and auth middleware so that the raw body is available to the latter
    return compose([bodyParser(options.bodyParser), authMiddleware]);
  }
}

/**
 * Return koa middleware that authenticates incoming requests
 *
 * @param {object} [options]
 * @returns {function} middleware function
 */
module.exports = function(options) {

  if (typeof options !== 'object') {
    options = {};
  }

  if (typeof options.bodyParser !== 'object') {
    options.bodyParser = {};
  }

  // The koa body parsed middleware needs to be told to parse text or xml input
  // https://github.com/koajs/bodyparser/issues/73
  // Enable all body types it supports
  if (!Array.isArray(options.bodyParser.enableTypes)) {
    options.bodyParser.enableTypes = ['json', 'form', 'text'];
  }

  if (typeof options.secretForKey !== 'function') {
    throw new Error(`Simple HMAC Auth middleware missing 'secretForKey' function parameter.`);
  }

  const server = new SimpleHMACAuthKoa(options);

  if (typeof options.onAccepted === 'function') {

    server.onAccepted = options.onAccepted;
  }

  if (typeof options.onRejected === 'function') {

    server.onRejected = options.onRejected;
  }

  return server.middleware(options);
};
