class Timeline {

  /**
   * Class constructor with initial configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      disasterCategories: _config.disasterCategories,
      containerWidth: 800,
      containerHeight: 900,
      tooltipPadding: 15,
      margin: {top: 120, right: 20, bottom: 20, left: 45},
      legendWidth: 170,
      legendHeight: 8,
      legendRadius: 5,
      maxYear: _config.maxYear,
      minYear: _config.minYear
    }
    this.data = _data;
    this.selectedCategories = [];
    this.initVis();
  }

  /**
   * We initialize the arc generator, scales, axes, and append static elements
   */
  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Todo: Initialize scales and axes
    vis.xAxisScale = d3.scaleTime().domain([new Date("2000-01-01 00:00:00"), new Date("2000-12-31 00:00:00")])
      .range([0, vis.width]);
    vis.xScale = d3.scaleLinear().domain([0, 366]).range([0, vis.width]);
    vis.yScale = d3.scaleBand()
      .domain(this.data.map(d => d.year).sort().reverse())
      .range([0, this.height])
      // .paddingInner(0.15);
    vis.radiusScale = d3.scaleSqrt().domain(d3.extent(vis.data, d=> d.cost) ).range([4, 140])

    vis.yAxis = d3.axisLeft(vis.yScale)
      .tickSize(-vis.width).tickSizeOuter(0);

    vis.xAxis = d3.axisTop(vis.xAxisScale).tickFormat(d => d3.timeFormat("%B")(d)).tickSizeOuter(0);

    // Initialize arc generator that we use to create the SVG path for the half circles.
    vis.arcGenerator = d3.arc()
        .outerRadius(d => vis.radiusScale(d))
        .innerRadius(0)
        .startAngle(-Math.PI / 2)
        .endAngle(Math.PI / 2);

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement).append('svg')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart
    // and position it according to the given margin config
    vis.chartArea = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Todo: Append axis groups
    vis.yAxisG = vis.chartArea.append('g')
      .attr('class', 'axis y-axis');
    vis.xAxisG = vis.chartArea.append('g')
      .attr('class', 'axis x-axis');

    // Initialize clipping mask that covers the whole chart
    vis.chartArea.append('defs')
      .append('clipPath')
        .attr('id', 'chart-mask')
      .append('rect')
        .attr('width', vis.width)
        .attr('y', -vis.config.margin.top)
        .attr('height', vis.config.containerHeight);

    // Apply clipping mask to 'vis.chart' to clip semicircles at the very beginning and end of a year
    vis.chart = vis.chartArea.append('g')
        .attr('clip-path', 'url(#chart-mask)');

    // Optional: other static elements
    // ...

    vis.updateVis();
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;
    const data = d3.groups(vis.data, d=> d.year);
    for(const [_, disasters] of data){
      let maxCost = 0;
      let maxCostIndex = -1;
      for(const index in disasters){
        const disaster = disasters[index];
        if(disaster.cost > maxCost){
          maxCostIndex = index;
          maxCost = disaster.cost;
        }
      }
      if(maxCostIndex>-1){
        disasters[maxCostIndex].isMostCostly = true;
      }
    }

    vis.yearG = vis.chartArea.selectAll('.year').data(data, d=>d[0]).join('g').attr('class', 'year')
       .attr('transform', d=>`translate(0,${vis.yScale(d[0])+10})`)

    vis.dayG = vis.yearG.selectAll('.disaster').data(d=> d[1], d=> d.date)
      .join('g')
      .attr('class', 'disaster')
      .attr('transform', d=>`translate(${vis.xScale(d.dayOfYear)}, 0)`)

    vis.circles = vis.dayG.selectAll('.semi').data(d=> [d], d=> d.date)
      .join('path')
      .attr('class', d=>`semi ${d.category}`)
      .attr('d', d => vis.arcGenerator(d.cost))
      .attr('fill-opacity', 0.6)
      .attr('stroke', '#333')
      .attr('stroke-width', 0.3)

    vis.circles = vis.dayG.selectAll('.legend-label').data(d=> {
      console.log(d.isMostCostly)
      return d.isMostCostly ? [d] : []
    }, d=> d.date)
      .join('text')
      .attr('class', 'legend-label')
      .attr('text-anchor', 'middle')
      .text(d => d.name);




    // Todo

    vis.renderVis();
  }

  /**
   * Bind data to visual elements (enter-update-exit) and update axes
   */
  renderVis() {
    let vis = this;
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);
    // vis.yearG.call()
    // Todo
  }

  renderLegend() {
    let vis = this;

    // Todo: Display the disaster category legend that also serves as an interactive filter.
    // You can add the legend also to `index.html` instead and have your event listener in `main.js`.

    const winterStorm = vis.svg.append('g').attr('transform', 'translate(20, 10)')
    winterStorm.append('circle').attr('class', 'winter-storm-freeze')
      .attr('r', 8)
      .attr('cx', 5)
      .attr('cy', 5);
    winterStorm.append('text').attr('class', 'label')
      .text('Winter storm');
    const drought = vis.svg.append('g').attr('transform', 'translate(20, 30)')
    drought.append('circle').attr('class', 'drought-wildfire')
      .attr('r', 8)
      .attr('cx', 5)
      .attr('cy', 5);
    drought.append('text').attr('class', 'label')
      .text('drought');
    const flooding = vis.svg.append('g').attr('transform', 'translate(20, 50)')
    flooding.append('circle').attr('class', 'flooding')
      .attr('r', 8)
      .attr('cx', 5)
      .attr('cy', 5);
    flooding.append('text').attr('class', 'label')
      .text('flooding');
    const cyclones = vis.svg.append('g').attr('transform', 'translate(180, 30)')
    cyclones.append('circle').attr('class', 'tropical-cyclone')
      .attr('r', 8)
      .attr('cx', 5)
      .attr('cy', 5);
    cyclones.append('text').attr('class', 'label')
      .text('cyclones');
    const severeStorm = vis.svg.append('g').attr('transform', 'translate(180, 50)')
    severeStorm.append('circle').attr('class', 'severe-storm')
      .attr('r', 8)
      .attr('cx', 5)
      .attr('cy', 5);
    severeStorm.append('text').attr('class', 'label')
      .text('severeStorm');



  }
}
