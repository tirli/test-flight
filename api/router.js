import Router from 'koa-router';
import parse from 'date-fns/parse';
import isValid from 'date-fns/is_valid';

import { getAirlines, getAirports, getFlights } from './flightAPI';

const router = new Router();

router
  .get('/airlines', async (ctx) => {
    ctx.body = await getAirlines();
  })
  .get('/airports', async (ctx) => {
    const { city } = ctx.query;
    if (!city) throw { code: 422, error: 'Missing query param. city is required!' };

    ctx.body = await getAirports(city);
  })
  .get('/search', async (ctx) => {
    const { date, from_city, to_city } = ctx.query;

    if (!date || !from_city || !to_city) { // eslint-disable-line camelcase
      throw { code: 422, error: 'Missing query params. date, from_city, to_city are required!' };
    }

    const parsedDate = parse(date);
    if (!isValid(parsedDate)) throw { code: 400, error: 'Invalid date' };

    ctx.body = await getFlights(from_city, to_city, parsedDate);
  })
;

export default router;
