# simple-hmac-auth-koa
Koa middleware for creating APIs that implement [simple-hmac-auth](https://github.com/jessety/simple-hmac-auth).

## Usage

Instansiating the middleware requires a function that can return a secret for a given API key.

If a request fails authentication, it will throw a `401` error.

The `simple-hmac-auth` authentication protocol requires the raw body of a request to validate it. `simple-hmac-auth-koa` leverages `koa-bodyparser` to parse body data. However, because the body parser only supports `json`, `form` and `text` input, this project is currently limited to those inputs as well.

```javascript
const Koa = require('koa');
const Router = require('koa-router');
const auth = require('simple-hmac-auth-koa');
```

```javascript
const app = new Koa();

// Enable authentication

app.use(auth({
  secretForKey: async apiKey => {
    return 'SECRET';
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
```

## License

MIT © Jesse Youngblood
