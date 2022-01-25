/**
 * Load data from CSV file asynchronously and visualize it
 */
d3.csv('data/experiment_data.csv')
  .then(data => {
    // Initialize chart
    const scatterplot = new Scatterplot({ parentElement: '#vis', categoryKey: "trial", quantityKey: "accuracy"}, data);

    // Show chart
    scatterplot.renderVis();


  })
  .catch(error => console.error(error));
