this.Flight.SearchPage = (function searchPage(global, api, format) {
  let element;
  let flightsSection;
  let data;
  let tabIndex = 2;

  function saveData(d) {
    data = d;
    return d;
  }

  function onTabClick(index) {
    return function handleEvent() {
      tabIndex = index;
      render();
    };
  }

  function onSubmit(e) {
    e.preventDefault();
    const { date, from, to } = this.elements;
    renderLoading();
    api.search(date.value, from.value, to.value).then(saveData).then((response) => {
      if (response.error) return renderError(response.error);
      return render(response);
    });
  }

  function init(elem) {
    element = elem;
    flightsSection = element.querySelector('.flights');
    const form = element.querySelector('.searchForm');
    form.addEventListener('submit', onSubmit);
  }

  function renderLoading() {
    const spinner = document.createElement('section');
    spinner.classList.add('spinner');
    flightsSection.innerHTML = '';
    flightsSection.appendChild(spinner);
  }

  function renderTabs(flightsData, activeIndex) {
    const tabs = document.querySelector('#tabs').content.cloneNode(true);

    Object.keys(flightsData).forEach((date, index) => {
      const tab = document.querySelector('#tab').content.cloneNode(true);
      const flights = flightsData[date];
      const tabButton = tab.querySelector('.tab-button');
      tabButton.textContent = format(date, 'D MMM YYYY');
      tabButton.setAttribute('data-badge', flights.length);

      if (activeIndex === index) {
        const li = tab.querySelector('.tab-item');
        li.classList.add('active');
      }

      tabs.querySelector('ul').appendChild(document.importNode(tab, true));
    });

    return tabs;
  }

  function createError(message) {
    const error = document.createElement('section');
    error.classList.add('no-data');
    error.innerText = message;
    return error;
  }

  function renderFlights(flights) {
    if (!flights.length) {
      return createError('No flights for this direction');
    }

    const table = document.querySelector('#flightTable').content.cloneNode(true);
    const tableRow = document.querySelector('#flightTableRow').content.cloneNode(true);
    const tds = tableRow.querySelectorAll('td');

    const sortedFlights = flights.sort((a, b) => a.price - b.price);

    sortedFlights.forEach((flight) => {
      tds[0].textContent = flight.airline.name;
      tds[1].textContent = flight.flightNum;
      tds[2].textContent = `${flight.start.cityName}, ${flight.start.airportName}`;
      tds[3].textContent = format(flight.start.dateTime, 'DD MMM YY HH:mm');
      tds[4].textContent = `${flight.finish.cityName}, ${flight.finish.airportName}`;
      tds[5].textContent = format(flight.finish.dateTime, 'DD MMM YY HH:mm');
      tds[6].textContent = flight.price;

      table.querySelector('tbody').appendChild(document.importNode(tableRow, true));
    });

    return table;
  }

  function renderError(error) {
    flightsSection.innerHTML = '';
    flightsSection.appendChild(createError(error));
  }

  function render() {
    const tabs = renderTabs(data, tabIndex);
    const table = renderFlights(Object.values(data)[tabIndex]);

    flightsSection.innerHTML = '';
    flightsSection.appendChild(document.importNode(tabs, true));
    flightsSection.appendChild(document.importNode(table, true));

    Array.from(flightsSection.querySelectorAll('.tab-button')).forEach((tab, index) => {
      tab.addEventListener('click', onTabClick(index));
    });
  }

  return {
    init,
  };
}(this, this.Flight.API, this.dateFns.format));
