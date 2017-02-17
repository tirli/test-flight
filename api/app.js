import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import router from './router';

const app = new Koa();

app.use(bodyParser());

process.on('unhandledRejection', (err) => {
  console.error(err);
});

app
  .use(router.routes())
  .use(router.allowedMethods());

const port = process.env.port || 3000;
app.listen(port, () => console.info(`Server started ${port}`));

export default app;
