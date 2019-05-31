# simple-hmac-auth-koa
Koa middleware for creating APIs that implement [simple-hmac-auth](https://github.com/jessety/simple-hmac-auth).

## Usage

A function that can return a secret for a given API key is the only required parameter. If a request fails authentication, it will throw a `401` error.

```javascript
const Koa = require('koa');
const Router = require('koa-router');
const auth = require('simple-hmac-auth-koa');
```

```javascript
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

```
