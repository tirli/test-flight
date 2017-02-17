import Router from 'koa-router';
import request from 'request-promise-native';

const router = new Router();

const url = 'http://node.locomote.com/code-task';

router
  .get('/airlines', async (ctx) => {
    ctx.body = await request({ uri: `${url}/airlines`, json: true });
  })
  .get('/airports', async (ctx) => {
    const { city } = ctx.query;
    if (!city) ctx.throw(400, 'Missing query param. city is required!');

    ctx.body = await request({ uri: `${url}/airports?q=${city}`, json: true });
  })
  .get('/search', async (ctx) => {
    try {
      const { date, from_city, to_city } = ctx.query;

      if (!date || !from_city || !to_city) {
        ctx.throw(400, 'Missing query params. date, from_city, to_city are required!');
      }

      const airlines = await request({ uri: `${url}/airlines`, json: true });
      const from = await request({ uri: `${url}/airports?q=${from_city}`, json: true });
      const to = await request({ uri: `${url}/airports?q=${to_city}`, json: true });

      const promises = [];

      airlines.forEach((al) => {
        from.forEach((fr) => {
          to.forEach((t) => {
            const req = `${url}/flight_search/${al.code}?date=${date}&from=${fr.airportCode}&to=${t.airportCode}`;
            promises.push(request({ uri: req, json: true }));
          });
        });
      });

      ctx.body = await Promise.all(promises);
    } catch (e) {
      ctx.throw(e);
    }
  })
  ;

export default router;
