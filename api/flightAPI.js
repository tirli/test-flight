import isomorphicFetch from 'isomorphic-fetch';
import flattenDeep from 'lodash/flattenDeep';
import addDays from 'date-fns/add_days';
import subDays from 'date-fns/sub_days';
import format from 'date-fns/format';
import { stringify } from 'query-string';

const fetch = (...args) => isomorphicFetch(...args)
  .then((r) => {
    if (!r.ok) throw { code: r.status, error: 'API error' };
    return r.json();
  });

const flightAPIUrl = 'http://node.locomote.com/code-task';

export function getAirlines() {
  return fetch(`${flightAPIUrl}/airlines`);
}

export function getAirports(city) {
  return fetch(`${flightAPIUrl}/airports?q=${city}`);
}

function getFlightsForDay(airlines, from, to, date) {
  const flights = [];

  airlines.forEach((al) => {
    from.forEach((fr) => {
      to.forEach((t) => {
        const query = stringify({
          date,
          from: fr.airportCode,
          to: t.airportCode,
        });
        const url = `${flightAPIUrl}/flight_search/${al.code}?${query}`;
        flights.push(fetch(url));
      });
    });
  });

  return Promise.all(flights);
}

export async function getFlights(cityFrom, cityTo, date) {
  const [airlines, from, to] = await Promise.all([
    getAirlines(),
    getAirports(cityFrom),
    getAirports(cityTo),
  ]);

  // FIXME for past dates
  const dates = [subDays(date, 2), subDays(date, 1), date, addDays(date, 1), addDays(date, 2)];
  const flightsPromises = [];

  dates.forEach((d) => {
    const formattedDate = format(d, 'YYYY-MM-DD');
    flightsPromises.push(getFlightsForDay(airlines, from, to, formattedDate));
  });

  const flights = await Promise.all(flightsPromises);
  const result = {};
  dates.forEach((d, index) => {
    result[format(d, 'YYYY-MM-DD')] = flattenDeep(flights[index]);
  });

  return Promise.resolve(result);
}
