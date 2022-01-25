class Scatterplot {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      circleRadius: 8,
      quantityKey: '',
      categoryKey: '',
      width: 500,
      rowHeight: 50,
      color: 'red',
      opacity: 0.15,
      categoryLabelWidth: 0,
      categoryLabelPadding: 8,
      quantityMin: undefined,
      quantityMax: undefined,
      categoryLabelPaddingLeft: 8,
      categoryLabelPaddingRight: 8,
      meanPaddingLeft: 8,
      paddingTop: 50,
      numberOfIntervals: 5,
      ..._config
    }
    this.data = _data;
    this.initVis();
  }

  /**
   * We initialize scales
   */
  initVis() {
    let vis = this;
    vis.labelOffSetY = vis.config.circleRadius / 2 + 1;
    const means = d3.rollup(
      vis.data,
      (data) => d3.mean(data, (d) => Number(d[vis.config.quantityKey])),
      (d) => d[vis.config.categoryKey]
    );
    const roundedMeans = Array.from(means.entries()).reduce((roundedMeans, [category, mean]) => {
      roundedMeans[category] = Math.round(mean * 100) / 100;
      return roundedMeans;
    }, {});

    function getLabelMaxWidth(labels = [], prefix = '') {
      const maxLabelLength = Math.max(...labels.map((label) => label.length));
      const CHAR_WIDTH = 4;
      return (
        (prefix.length + maxLabelLength + 1) * CHAR_WIDTH +
        vis.config.categoryLabelPaddingLeft +
        vis.config.categoryLabelPaddingRight
      );
    }

    const leftMargin = vis.config.categoryLabelWidth || getLabelMaxWidth(Array.from(means.keys()), vis.config.categoryKey);
    const rightMargin = getLabelMaxWidth(Object.values(roundedMeans).map((mean) => mean.toString()));
    const height = means.size * vis.config.rowHeight + vis.config.paddingTop;
    vis.config.height = height;
    const xExtent = d3.extent(vis.data, (d) => Number(d[vis.config.quantityKey]));
    const xMin = vis.config.quantityMin === undefined ? Math.floor(xExtent[0]) : vis.config.quantityMin;
    const xMax = vis.config.quantityMax === undefined ? Math.ceil(xExtent[1]) : vis.config.quantityMax;
    vis.xScale = d3.scaleLinear()
      .domain([xMin, xMax])
      .range([
        leftMargin + vis.config.categoryLabelPaddingLeft + vis.config.categoryLabelPaddingRight + vis.config.circleRadius,
        vis.config.width - vis.config.circleRadius - vis.config.meanPaddingLeft - rightMargin
      ]);
    vis.yScale = d3.scaleBand()
      .domain(Object.keys(roundedMeans).sort().reverse())
      .range([height + vis.config.circleRadius, vis.config.circleRadius + vis.config.paddingTop]);

    vis.categoryIndexRoundedMeanMap = Object.keys(roundedMeans).reduce(
      (categoryIndexMap, category, index) => {
        categoryIndexMap[category] = {index, mean: roundedMeans[category], y: vis.yScale(category)};
        return categoryIndexMap;
      },
      {});

    const correctedNumberOfIntervals = vis.config.numberOfIntervals > 1 ? vis.config.numberOfIntervals : 1;

    vis.verticalLines = vis.xScale.ticks(correctedNumberOfIntervals + 1).map((tick) => {
      return {x: vis.xScale(tick), label: tick.toFixed(1)};
    });

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
      .attr('width', vis.config.width)
      .attr('height', height);

  }

  /**
   * Bind data to visual elements.
   */
  renderVis() {
    let vis = this;
    // Add circles
    const circles = vis.svg.selectAll('.point')
      .data(vis.data, d => d)
      .join('circle')
      .attr('class', 'point')
      .attr('r', vis.config.circleRadius)
      .attr('cy', d => vis.categoryIndexRoundedMeanMap[d[vis.config.categoryKey]].y)
      .attr('cx', d =>
        vis.xScale(d[vis.config.quantityKey])
      )
      .attr('fill', d => vis.config.color)
      .attr('opacity', vis.config.opacity);

    // Add labels
    const categoryLabels = vis.svg.selectAll('.label')
      .data(Object.entries(vis.categoryIndexRoundedMeanMap), d => d)
      .join('text')
      .attr('y', ([category, {mean, index, y}])=> y + vis.labelOffSetY)
      .attr('x', ([category, {mean, index, y}])=> vis.config.categoryLabelPaddingLeft)
      .attr('text-anchor', 'start')
      .attr('style', 'font-size: 12px; text-transform: capitalize')
      .text(([category, {mean, index, y}])=>`${vis.config.categoryKey} ${category}`)

    const meanLabels = vis.svg.selectAll('.label')
      .data(Object.entries(vis.categoryIndexRoundedMeanMap), d => d)
      .join('text')
      .attr('y', ([category, {mean, index, y}])=> y + vis.labelOffSetY)
      .attr('x', vis.config.width)
      .attr('text-anchor', 'end')
      .attr('style', 'font-size: 12px')
      .text(([category, {mean, index, y}])=> mean)

    const ticks = vis.svg.selectAll('.tick')
      .data(vis.verticalLines, d => d)
      .join('line')
      .attr('x1', d => d.x)
      .attr('x2', d => d.x)
      .attr('y1', vis.config.paddingTop - vis.config.circleRadius)
      .attr('y2',  vis.config.height - vis.config.rowHeight + 3 * vis.config.circleRadius)
      .attr('stroke', 'black')
      .attr('opacity', 0.2);

    const tickLabels = vis.svg.selectAll('.tick-label')
      .data(vis.verticalLines, d => d)
      .join('text')
      .attr('y', vis.config.height)
      .attr('x', d => d.x)
      .attr('text-anchor', 'middle')
      .attr('style', 'font-size: 12px')
      .text(d => d.label)

    const quantityLabel = vis.svg.append('text')
      .attr('y', vis.config.rowHeight/2)
      .attr('x', vis.config.width)
      .attr('text-anchor', 'end')
      .attr('style', 'font-weight: bold')
      .text(`${vis.config.quantityKey[0].toUpperCase()}${vis.config.quantityKey.slice(1, vis.config.quantityKey.length)} (mean)`)
  }


}
