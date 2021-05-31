# simple-hmac-auth-koa

Koa middleware for creating APIs that implement [simple-hmac-auth](https://github.com/jessety/simple-hmac-auth).

[![ci](https://github.com/jessety/simple-hmac-auth-koa/workflows/ci/badge.svg)](https://github.com/jessety/simple-hmac-auth-koa/actions)
[![coverage](https://codecov.io/gh/jessety/simple-hmac-auth-koa/branch/main/graph/badge.svg?token=HK2X2I5673)](https://codecov.io/gh/jessety/simple-hmac-auth-koa)
[![npm](https://img.shields.io/npm/v/simple-hmac-auth-koa.svg)](https://www.npmjs.com/package/simple-hmac-auth-koa)
[![license](https://img.shields.io/github/license/jessety/simple-hmac-auth-koa.svg)](https://github.com/jessety/simple-hmac-auth-koa/blob/master/LICENSE)

## Usage

Instantiating the middleware requires a function that can return a secret for a given API key.

If a request fails authentication, it will throw a `401` error.

The `simple-hmac-auth` authentication protocol requires the raw body of a request to validate it. `simple-hmac-auth-koa` leverages `koa-bodyparser` to parse body data. However, because the body parser only supports `json`, `form` and `text` input, this project is currently limited to those inputs as well.

```javascript
import Koa from 'koa';
import Router from 'koa-router';
import auth from 'simple-hmac-auth-koa';
```

```javascript
const app = new Koa();

// Enable authentication

app.use(auth({
  secretForKey: async apiKey => {
    // Return the correct secret for the given API key
    return 'SECRET';
  }
}));

// Route incoming requests

const router = new Router();

router.all('/', ctx => {
  ctx.body = 'Request successful.';
});

app.use(router.routes());
app.use(router.allowedMethods());

// Listen

app.listen(8000);
```

## License

MIT © Jesse Youngblood
