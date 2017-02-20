this.Flight.SearchPage = (function searchPage(global, api) {
  'use strict';

  let element;
  let flightsSection;
  let data;
  let tabIndex = 2;

  function saveData(d) {
    data = d;
    return d;
  }

  function onTabClick(index) {
    return function () {
      tabIndex = index;
      console.log(tabIndex);
      render();
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    const { date, from, to } = this.elements;
    renderLoading();
    api.search(date.value, from.value, to.value).then(saveData).then(render);
  }

  function init(elem) {
    element = elem;
    flightsSection = element.querySelector('.flights');
    const form = element.querySelector('.searchForm');
    form.addEventListener('submit', onSubmit);
  }

  function renderLoading() {
    flightsSection.innerHTML = 'spinner';
  }

  function renderTabs(flightsData, activeIndex) {
    const tabs = document.querySelector('#tabs').content;

    Object.keys(flightsData).forEach((date, index) => {
      const tab = document.querySelector('#tab').content.cloneNode(true);
      const flights = flightsData[date];
      const tabButton = tab.querySelector('.tab-button');
      tabButton.textContent = date;
      tabButton.setAttribute('data-badge', flights.length);

      if (activeIndex === index) {
        const li = tab.querySelector('.tab-item');
        li.classList.add('active');
      }

      tabs.querySelector('ul').appendChild(document.importNode(tab, true));
    });

    return tabs;
  }

  function renderFlights(flights) {
    const table = document.querySelector('#flightTable').content;
    const tableRow = document.querySelector('#flightTableRow').content;
    const tds = tableRow.querySelectorAll('td');

    flights.forEach((flight) => {
      tds[0].textContent = flight.airline.name;
      tds[1].textContent = flight.flightNum;
      tds[2].textContent = `${flight.start.cityName}, ${flight.start.airportName}`;
      tds[3].textContent = flight.start.dateTime;
      tds[4].textContent = `${flight.finish.cityName}, ${flight.finish.airportName}`;
      tds[5].textContent = flight.finish.dateTime;
      tds[6].textContent = flight.price;

      table.querySelector('tbody').appendChild(document.importNode(tableRow, true));
    });

    return table;
  }

  function render() {
    const tabs = renderTabs(data, tabIndex);
    const table = renderFlights(Object.values(data)[tabIndex]);
    console.log('render', tabIndex);

    flightsSection.innerHTML = '';
    flightsSection.appendChild(document.importNode(tabs, true));
    flightsSection.appendChild(document.importNode(table, true));

    // FIXME: check what wrong with event listener
    Array.from(tabs.querySelectorAll('.tab-button')).forEach((tab, index) => {
      console.log(tab);
      tab.addEventListener('click', console.log.bind(console));
    });
  }

  return {
    init,
  };
}(this, this.Flight.API));
