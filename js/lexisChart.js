const DEFAULT_COLOR = '#bbb'

class LexisChart {

  /**
   * Class constructor with initial configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _state) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 1000,
      containerHeight: 380,
      margin: {top: 15, right: 15, bottom: 30, left: 30},
      tooltipPadding: _config.tooltipPadding || 15
    }
    this.state = _state;
    this.initVis();
  }

  /**
   * Create scales, axes, and append static elements
   */
  initVis() {
    let vis = this;

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart
    // and position it according to the given margin config
    vis.chart = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // vis.chart = vis.chartArea.append('g');

    // Create default arrow head
    // Can be applied to SVG lines using: `marker-end`
    vis.chart.append('defs').append('marker')
      .attr('id', 'arrow-head')
      .attr('markerUnits', 'strokeWidth')
      .attr('refX', '2')
      .attr('refY', '2')
      .attr('markerWidth', '10')
      .attr('markerHeight', '10')
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,0 L2,2 L 0,4')
      .attr('stroke', DEFAULT_COLOR)
      .attr('fill', 'none');

    vis.chart.append('defs').append('marker')
      .attr('id', 'arrow-head-orange')
      .attr('markerUnits', 'strokeWidth')
      .attr('refX', '2')
      .attr('refY', '2')
      .attr('markerWidth', '10')
      .attr('markerHeight', '10')
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,0 L2,2 L 0,4')
      .attr('stroke', 'orange')
      .attr('fill', 'none');

    // Todo: initialize scales, axes, static elements, etc.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
    vis.xScale = d3.scaleLinear()
      .range([0, vis.width])
      .domain([1950, 2021])
    ;

    vis.yScale = d3.scaleLinear()
      .range([vis.height, 0])
      .domain([25, 95])

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
      .ticks(6)
      .tickSizeOuter(0)
      .tickFormat(d => d);


    vis.yAxis = d3.axisLeft(vis.yScale)
      .ticks(6)
      .tickSizeOuter(0)

    vis.xAxisG = vis.chart.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${vis.height})`);

    vis.yAxisG = vis.chart.append('g')
      .attr('class', 'axis y-axis')

    vis.yAxisG = vis.chart.append('g')
      .attr('class', 'axis y-axis');
    vis.svg.append('clipPath')
      .attr('id', 'chart-area')
      .append('rect')
      .attr('width', vis.width + 10)
      .attr('height', vis.height)

    vis.marks = vis.chart.append('g')
      .attr('class', 'line-mark')
      .attr('stroke', DEFAULT_COLOR)
      .attr('clip-path', 'url(#chart-area)')

    vis.svg.append('text')
      .attr('class', 'axis-title')
      .attr('x', 5)
      .attr('y', 0)
      .attr('dy', 20)
      .text('Age');


  }


  updateVis() {
    let vis = this;

    vis.data = vis.state.filteredData.filter(d => isGenderIncluded(d.gender));


    // Todo: prepare data

    vis.renderVis();
  }


  renderVis() {
    let vis = this;
    // Todo: Bind data to visual elements (enter-update-exit or join)
    vis.marks.selectAll('.chart-line')
      .data(vis.data)
      .join('path')
      .attr('class', d => `arrow chart-line${vis.state.selectedId.has(d.id) ? ' selected' : ''}${d.label || vis.state.selectedId.has(d.id) ? ' highlight' : ''}`)
      .attr('d', d => d3.line().x(({year}) => vis.xScale(year)).y(({age}) => vis.yScale(age))([{
        age: d.start_age,
        year: d.start_year
      }, {
        age: d.start_age === d.end_age ? d.end_age + 0.1 : d.end_age,
        year: d.start_year === d.end_year ? d.end_year + 0.1 : d.end_year
      }]))
      .attr('stroke-width', d => d.label || vis.state.selectedId.has(d.id) ? 5 : 1)
      .attr('marker-end', d => vis.state.selectedId.has(d.id) ? 'url(#arrow-head-orange)' : 'url(#arrow-head)')
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

    vis.marks.selectAll('.line-label')
      .data(vis.data.filter(d => d.label))
      .join('text')
      .attr('class', 'line-label')
      .attr('transform', d => `translate(${vis.xScale(d3.mean([d.start_year, d.end_year])) - 30}, ${vis.yScale(d3.mean([d.start_age, d.end_age]))}) rotate(-20)`)
      .text(d => d.leader)


    vis.xAxisG
      .call(vis.xAxis)
      .call(g => g.select('.domain').remove());

    vis.yAxisG
      .call(vis.yAxis)
      .call(g => g.select('.domain').remove())

  }
}
