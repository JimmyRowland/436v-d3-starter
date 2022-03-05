class Scatterplot {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _state) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 736,
      containerHeight: _config.containerHeight || 380,
      margin: _config.margin || {top: 25, right: 20, bottom: 30, left: 35},
      tooltipPadding: _config.tooltipPadding || 15
    }
    this.state = _state;
    this.initVis();
  }

  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;


    vis.xScale = d3.scaleLinear()
      .range([0, vis.width]);

    vis.yScale = d3.scaleLinear()
      .range([vis.height, 0])
      .domain([25, 95]);

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
      .ticks(5)
      .tickSize(-vis.height - 10)
      .tickPadding(10)
      .tickFormat(d3.format(','));

    vis.yAxis = d3.axisLeft(vis.yScale)
      .ticks(5)
      .tickSize(-vis.width - 10)
      .tickPadding(10);

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart
    // and position it according to the given margin config
    vis.chart = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`)
    vis.clickoutArea = vis.chart.append("rect")
      .attr('class', 'click-listening-area')
      .attr('width', vis.width)
      .attr('height', vis.height)
      .on('click', (event, d) => {
        clearLeaders()
      });

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${vis.height})`);

    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
      .attr('class', 'axis y-axis');

    // Append both axis titles
    vis.chart.append('text')
      .attr('class', 'axis-title')
      .attr('y', vis.height - 15)
      .attr('x', vis.width + 10)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('GDP per Capita (US$)');

    vis.svg.append('text')
      .attr('class', 'axis-title')
      .attr('x', 5)
      .attr('y', 0)
      .attr('dy', 20)
      .text('Age');
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;

    vis.dataWithKnownGdp = vis.state.filteredData.filter(({pcgdp}) => pcgdp)
    // Set the scale input domains
    vis.xScale.domain([0, d3.max(vis.dataWithKnownGdp, ({pcgdp}) => pcgdp)]);

    vis.renderVis();
  }

  /**
   * Bind data to visual elements.
   */
  renderVis() {
    let vis = this;

    // Add circles
    const circles = vis.chart.selectAll('.point')
      .data(vis.dataWithKnownGdp)
      .join('circle')
      .attr('class', d => `point${vis.state.selectedId.has(d.id) && isGenderIncluded(d.gender) ? ' selected' : ''}${isGenderIncluded(d.gender) ? ' clickable' : ''}`)
      .attr('r', 5)
      .attr('cy', d => vis.yScale(d.start_age))
      .attr('cx', d => vis.xScale(d.pcgdp))
      .attr('fill', '#333')

    // Tooltip event listeners
    circles
      .on('mouseover', (event, d) => {
        isGenderIncluded(d.gender) && d3.select('#tooltip')
          .style('display', 'block')
          .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')
          .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
          .html(getTooltipContent(d));
      })
      .on('mouseleave', () => {
        d3.select('#tooltip').style('display', 'none');
      })
      .on('click', (event, d) => {
        if (isGenderIncluded(d.gender)) {
          onLeaderClick(d.id)
        }
      })
    ;

    // Update the axes/gridlines
    // We use the second .call() to remove the axis and just show gridlines
    vis.xAxisG
      .call(vis.xAxis)
      .call(g => g.select('.domain').remove());

    vis.yAxisG
      .call(vis.yAxis)
      .call(g => g.select('.domain').remove())
  }
}
