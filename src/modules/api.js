this.Flight.API = (function API(global, fetch) {
  function search(date, from, to) {
    return fetch(`/search?date=${date}&from_city=${from}&to_city=${to}`).then(r => r.json());
  }

  return {
    search,
  };
}(this, this.fetch));
