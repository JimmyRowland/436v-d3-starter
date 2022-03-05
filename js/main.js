/**
 * Load data from CSV file asynchronously and render charts
 */

let country = 'oecd'
let lexisChart;
let barchart;
let scatterPlot;
const state = {
  processedData: [],
  countryGroup: 'oecd',
  filteredData: [],
  gender: undefined,
  selectedId: new Set()
}

function updatePlots() {
  state.filteredData = getFilteredData()
  lexisChart.updateVis()
  barchart.updateVis()
  scatterPlot.updateVis()
}

function onCountryDropdownChange(event) {
  document.getElementById('country-selector').value = event.currentTarget.value;
  state.countryGroup = event.currentTarget.value;
  updatePlots()
}

function onGenderClick(gender) {
  if (state.gender === gender) state.gender = null;
  else state.gender = gender
  updatePlots()
}

function getFilteredData() {
  return state.processedData.filter(d => d[state.countryGroup]).sort((a, b) => state.selectedId.has(a.id) ? 1 : -1)
}

function getTooltipContent(d) {
  return `
              <div class="tooltip-title">${d.leader}</div>
              <div>${d.country},${d.start_year}-${d.end_year}</div>
              <ul>
                <li>Age at inarguration ${d.start_year - d.birthyear}</li>
                <li>Time in office ${d.duration} ${d.duration > 1 ? 'years' : 'year'}</li>
                ${d.pcgdp ? `<li>GDP per Capita: ${Math.round(d.pcgdp)}</li>` : ''}
              
              </ul>
            `
}

function isGenderIncluded(gender) {
  return !state.gender || gender === state.gender
}

function onLeaderClick(id) {
  if (state.selectedId.has(id)) {
    state.selectedId.delete(id)
  } else {
    state.selectedId.add(id)
  }
  getFilteredData();
  lexisChart.updateVis()
  scatterPlot.updateVis()
}

function clearLeaders() {
  state.selectedId.clear()
  lexisChart.updateVis()
  scatterPlot.updateVis()
}

d3.csv('data/leaderlist.csv').then(data => {

  // Convert columns to numerical values
  data.forEach(d => {
    Object.keys(d).forEach(attr => {
      if (attr == 'pcgdp') {
        d[attr] = (d[attr] == 'NA') ? null : +d[attr];
      } else if (attr != 'country' && attr != 'leader' && attr != 'gender' && attr != 'stateabb') {
        d[attr] = +d[attr];
      }
    });
  });

  data.sort((a, b) => a.label - b.label);
  state.processedData = data
  state.filteredData = getFilteredData()
  lexisChart = new LexisChart({parentElement: '#lexis-chart'}, state)
  lexisChart.updateVis()
  barchart = new Barchart({parentElement: '#bar-chart'}, state)
  barchart.updateVis()
  scatterPlot = new Scatterplot({parentElement: '#scatter-plot'}, state)
  scatterPlot.updateVis()

});


/*
 * Todo:
 * - initialize views
 * - filter data
 * - listen to events and update views
 */
