import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import router from './router';

const app = new Koa();

app.use(bodyParser());

process.on('unhandledRejection', (err) => {
  console.error(err);
});

app
  .use(async (ctx, next) => {
    try {
      await next();
    } catch (e) {
      ctx.status = e.code || 500;
      ctx.type = 'application/json';
      ctx.body = e instanceof Error ? { error: e.message } : e;
    }
  })
  .use(router.routes())
  .use(router.allowedMethods());

const port = process.env.PORT || 3000;
app.listen(port, () => console.info(`Server started ${port}`));

export default app;
