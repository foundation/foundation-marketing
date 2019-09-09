var openRate = document.getElementById("openRateChart");
var clickThrough = document.getElementById("clickThroughChart");
if(openRate && clickThrough) {
  Chart.defaults.global.showTooltips = false;

  var openRateOptions = {
    type: 'bar',
    data: {
      labels: ["ZURB", "Industry Average"],
      datasets: [{
        data: [30, 21.8],
        backgroundColor: [
        'rgba(255, 174, 0, 1)',
        'rgba(163, 163, 163, 0.1)'
        ],
        borderColor: [
        'rgba(255, 174, 0, 1)',
        'rgba(163, 163, 163, 0.4)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero:true,
            // Return an empty string to draw the tick line but hide the tick label
            // Return `null` or `undefined` to hide the tick line entirely
            userCallback: function(value, index, values) {
                // Convert the number to a string and splite the string every 3 charaters from the end
                value = value.toString();
                value = value.split(/(?=(?:...)*$)/);

                // Convert the array to a string and format the output
                value = value.join('.');
                return value + '%';
            }
          }
        }]
      },
      legend: {
        display: false
      },
      tooltips: {
        enabled: false
      }
    }
  };


  var clickThroughOptions = {
    type: 'bar',

    data: {
      labels: ["ZURB", "Industry Average"],
      datasets: [{
        data: [25.8, 3.3],
        backgroundColor: [
        'rgba(255, 174, 0, 1)',
        'rgba(163, 163, 163, 0.1)'
        ],
        borderColor: [
        'rgba(255, 174, 0, 1)',
        'rgba(163, 163, 163, 0.4)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero:true,
            // Return an empty string to draw the tick line but hide the tick label
            // Return `null` or `undefined` to hide the tick line entirely
            userCallback: function(value, index, values) {
                // Convert the number to a string and splite the string every 3 charaters from the end
                value = value.toString();
                value = value.split(/(?=(?:...)*$)/);

                // Convert the array to a string and format the output
                value = value.join('.');
                return value + '%';
            }
          }
        }]
      },
      legend: {
        display: false
      },
      tooltips: {
        enabled: false
      }
    }
  };


  var emailOpenRate = new Chart(openRate, openRateOptions);
  var emailClickThrough = new Chart(clickThrough, clickThroughOptions);
}
