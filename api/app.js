import Koa from 'koa';
import send from 'koa-send';
import serve from 'koa-static';
import bodyParser from 'koa-bodyparser';
import router from './router';

const app = new Koa();
const STATIC_FOLDER = `${__dirname}/../src`;
const NODE_MODULES = `${__dirname}/../node_modules`;

app.use(bodyParser());

app.use(serve(STATIC_FOLDER));
app.use(serve(NODE_MODULES));

process.on('unhandledRejection', (err) => {
  console.error(err);
});

app
  .use(async (ctx, next) => {
    try {
      await next();
    } catch (e) {
      console.error(e);
      ctx.status = e.code || 500;
      ctx.type = 'application/json';
      ctx.body = e instanceof Error ? { error: e.message } : e;
    }
  })
  .use(router.routes())
  .use(router.allowedMethods());

app.use(async (ctx) => {
  await send(ctx, '/index.html', { root: STATIC_FOLDER });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.info(`Server started ${port}`));

export default app;
