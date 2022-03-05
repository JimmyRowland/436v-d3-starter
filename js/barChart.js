class Barchart {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _state) {
    // Configuration object with defaults
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 250,
      containerHeight: _config.containerHeight || 380,
      margin: _config.margin || {top: 10, right: 10, bottom: 25, left: 40},
      reverseOrder: _config.reverseOrder || false,
      tooltipPadding: _config.tooltipPadding || 15
    }
    this.state = _state;

    this.initVis();
  }

  /**
   * Initialize scales/axes and append static elements, such as axis titles
   */
  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Initialize scales and axes
    // Important: we flip array elements in the y output range to position the rectangles correctly
    vis.yScale = d3.scaleLinear()
      .range([vis.height, 0])

    vis.xScale = d3.scaleBand()
      .range([12, vis.width - 12])
      .domain(['Male', 'Female'])
      .paddingInner(0.2);

    vis.xAxis = d3.axisBottom(vis.xScale)
      .tickSizeOuter(0);

    vis.yAxis = d3.axisLeft(vis.yScale)
      .tickSize(-vis.width)
      .tickPadding(10)
      .ticks(5)
      .tickSizeOuter(0)

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    // SVG Group containing the actual chart; D3 margin convention
    vis.chart = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${vis.height})`);

    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
      .attr('class', 'axis y-axis');
  }

  /**
   * Prepare data and scales before we render it
   */
  updateVis() {
    let vis = this;


    vis.genderFrequency = ['Male', 'Female'].map(gender => ({
      gender,
      frequency: d3.sum(vis.state.filteredData, d => d.gender === gender)
    }))
    // console.log(vis.state.processedData.length)
    // console.log(vis.state.filteredData.length)
    // console.log(vis.genderFrequency)

    // Set the scale input domains
    vis.yScale.domain([0, d3.max(vis.genderFrequency, d => d.frequency)]);

    vis.renderVis();
  }

  /**
   * Bind data to visual elements
   */
  renderVis() {
    let vis = this;

    // Add rectangles
    let bars = vis.chart.selectAll('.bar')
      .data(vis.genderFrequency)
      .join('rect');

    bars
      .style('opacity', 1)
      .attr('class', d => `bar${d.gender === vis.state.gender ? ' bar-selected' : ''}`)
      .attr('x', ({gender}) => vis.xScale(gender))
      .attr('width', vis.xScale.bandwidth())
      .attr('height', ({frequency}) => vis.height - vis.yScale(frequency))
      .attr('y', ({frequency}) => vis.yScale(frequency))

    // Tooltip event listeners
    bars
      .on('mouseover', (event, d) => {

      })

      .on('mouseleave', () => {
      })
      .on('click', (event, d) => {
        onGenderClick(d.gender)
      })
    ;

    // Update axes
    vis.xAxisG
      .call(vis.xAxis);

    vis.yAxisG.call(vis.yAxis);
  }
}
