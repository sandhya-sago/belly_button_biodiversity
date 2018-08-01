function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
    // Use d3 to select the panel with id of `#sample-metadata`

    // Use `.html("") to clear any existing metadata

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.


    var metadata = d3.select("#sample-metadata");
    metadata.html("");
    metadata.append("table");
    d3.json("/metadata/"+sample).then((person)=>{
      console.log(person);
      Object.entries(person).forEach(([key, value]) => {
        metadata.append("tr").append("td").text(key + " : " + value);
      });
      // BONUS: Build the Gauge Chart
      build_guage(person["WFREQ"]);
    });
}

function build_pie(sample_data){
  var data = [{
    values : sample_data["sample_values"].slice(0,10),
    labels : sample_data["otu_ids"].slice(0,10),
    hovertext : sample_data["otu_labels"].slice(0,10),
    type : "pie",
  }];
  var layout = {  
    height: 400,
    width: 500
  };
  try {
    Plotly.newPlot("pie",data,layout);
    console.log("Plotly plotted something")
  } catch (err) {console.log("Plotly failed with : " + err);
  }
}

function build_bubble(sample_data){
  // TODO: Set marker color according to otu_labels
  var all_colors = ["rgb(255, 87, 51)","rgb(250, 128, 114)","rgb(255, 195, 0)",
  "rgb(255, 182, 193)","rgb(205, 92, 92)","rgb(218, 247, 166)","rgb(255, 228, 196)",
  "rgb(176, 224, 230)","rgb(224, 255, 255)","rgb(102, 205, 170)","rgb(173, 255, 47)","rgb(238, 130, 238)"];
  var data = [{
    x : sample_data["otu_ids"],
    y : sample_data["sample_values"],
    hovertext : sample_data["otu_labels"],
    type : "scatter",
    mode : "markers",
    marker:{
      size: sample_data['sample_values'],
      color: sample_data['otu_ids'].map(datum => +datum),
      colorscale: 'Earth',
      showscale: true,
    },
  }];
  var layout = {  
    height: 400,
  };
  try {
    Plotly.newPlot("bubble",data, layout);
    console.log("Plotly plotted bubble chart")
  } catch (err) {console.log("Plotly failed with : " + err);
  }
}

function build_guage(level){
  console.log("Guage level : " + level)
  // Trig to calc meter point
  var radius = .5;
  var radians = (9-level) * Math.PI / 9;
  var x = radius * Math.cos(radians);
  var y = radius * Math.sin(radians);
  console.log(level, radians, x, y)

  // Path: may have to change to create a better triangle
  var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
      pathX = String(x),
      space = ' ',
      pathY = String(y),
      pathEnd = ' Z';
  var path = mainPath.concat(pathX,space,pathY,pathEnd);

  var data = [{ type: 'scatter',
    x: [0], y:[0],
      marker: {size: 28, color:'850000'},
      showlegend: false,
      name: 'Wash Frequency',
      text: level,
      hoverinfo: 'text+name'},
    { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9,50],
    rotation: 90,
    text: ["8-9","7-8","6-7","5-6","4-5","3-4","2-3","1-2","0-1"],
    textinfo: 'text',
    textposition:'inside',
    marker: {colors:['rgba(0,64,0,0.5)','rgba(0,88,0,0.5)', 'rgba(0,112,0,0.5)',
                          'rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
                          'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
                          'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
                          'rgba(255, 255, 255, 0)']},
    labels: ["8-9","7-8","6-7","5-6","4-5","3-4","2-3","1-2","0-1"],
    hoverinfo: 'label',
    hole: .5,
    type: 'pie',
    showlegend: false
  }];

  var layout = {
    shapes:[{
        type: 'path',
        path: path,
        fillcolor: '850000',
        line: {
          color: '850000'
        }
      }],
    title: "<b>Belly Button Washing Frequency</b><br>Scrubs per Week",
    height: 400,
    width: 500,
    xaxis: {zeroline:false, showticklabels:false,
              showgrid: false, range: [-1, 1]},
    yaxis: {zeroline:false, showticklabels:false,
              showgrid: false, range: [-1, 1]}
  };

  Plotly.newPlot('gauge', data, layout);
}

function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots

    // @TODO: Build a Bubble Chart using the sample data

    // @TODO: Build a Pie Chart
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
  console.log("Calling d3.json with: " + "/samples/"+sample);
  d3.json("/samples/"+sample).then((sample_data)=>{
    console.log(sample_data["WFREQ"]);
    build_pie(sample_data);
    build_bubble(sample_data);
  });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    console.log("Called buildChars with "+ firstSample)
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
