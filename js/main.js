// Initialize helper function to convert date strings to date objects
const parseTime = d3.timeParse("%Y-%m-%d");

//Load data from CSV file asynchronously and render chart
d3.csv('data/disaster_costs.csv').then(data => {
  let maxYear = 0;
  let minYear = 9999;
  data.forEach(d => {
    d.cost = +d.cost;
    d.year = +d.year;
    d.date = parseTime(d.mid);
    d.dayOfYear = Number(d3.timeFormat('%j')(d.date));
    // Optional: other data preprocessing steps
    if(d.year > maxYear){
      maxYear = d.year;
    }else if(d.year < minYear){
      minYear = d.year
    }
  });

  const timeline = new Timeline({
    parentElement: '#vis',
    maxYear,
    minYear
    // Optional: other configurations
  }, data);
  timeline.renderLegend()
});
