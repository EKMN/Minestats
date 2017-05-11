/* ===== script imports ===== */
import Chart from 'chart.js';
import swal from 'sweetalert2'; 

/* ==== app settings ==== */
window.appas = this;
document.onkeydown = function(e) {
    e = e || window.event;
    console.log(e);
    switch(e.which || e.keyCode) {
        case 118:
            swal({
                title: 'Start polling?',
                text: "Do you want to start polling \n the API for hashrate changes?",
                type: 'question',
                showCancelButton: true,
                reverseButtons: true,
                confirmButtonText: 'Yup',
                cancelButtonText: 'Nope'
            }).then(function () {
            swal(
                'Initiated!',
                'The script is now polling the API \n every 10 minutes to check for changes.',
                'success'
            ).then(function(){
                    alert("Promise fired!");
                    UpdateChart(0.5);
                })
            })
            break;
    }
        
}

/* ===== app logic =====  */
var now = new Date;
var mineData = GetCurrentMinerate();

const TIME = {
    THEN: localStorage.getItem("firstTime") ? localStorage.getItem("firstTime") : localStorage.setItem("firstTime", now.toString().slice(0, -32)),
    NOW: (function() {
        localStorage.setItem("nowTime", now.toString().slice(0, -32));
        return localStorage.getItem("nowTime");
    })()
};
const STORAGE = {
    GET: function() {
        var out = localStorage.getItem("dataArray") ? localStorage.getItem("dataArray") : localStorage.setItem("dataArray", "[]");
        return out;
    },
    SET: function(data) {
        localStorage.setItem("dataArray", data);
    },
    LENGTH: (function() {
        if (localStorage.getItem("dataArray")) {
            var item = JSON.parse(localStorage.getItem("dataArray")).length;
            return item;
        }
    })()
};
// (function (){ var arr = []; for (var i = 0; i < STORAGE.LENGTH; i++){ arr[i] = ""; } arr[0] = TIME.THEN; arr[(arr.length-1)] = TIME.NOW; return arr; })(),
var ctx = document.getElementById("chart");
var data = {
    labels: (function() {
        var arr = [];
        for (var i = 0; i < STORAGE.LENGTH; i++) {
            arr[i] = localStorage.getItem("dateData") ? JSON.parse(localStorage.getItem("dateData"))[i] : i;
        }
        return arr;
    })(),
    datasets: [{
        label: "Minerate in MH/s",
        fill: true,
        lineTension: 0.2,
        backgroundColor: "rgba(75,192,192,0.4)",
        borderColor: "rgba(75,192,192,1)",
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: "rgba(75,192,192,1)",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(75,192,192,1)",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: mineData ? mineData : [2],
    }]
};
var chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        responsive: true,
        maintainAspectRatio: false,
        showLines: true,
        spanGaps: true,
    }

});

// updates chart with random information
function UpdateChart(minutes) {

    var time = minutes ? (minutes * 1000 * 60) : (1000 * 60);

    // for (i = 0; i < chart.data.datasets[0].data.length; i++) {
    //     (function(i) {
    //         chart.data.datasets[0].data[i] = Math.floor(Math.random() * 25);
    //     })(i);
    // }

    GetCurrentMinerate();

    setTimeout(function() {
        UpdateChart();
    }, time);
}

function GetCurrentMinerate(APIURL) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", APIURL ? APIURL : "http://ethpool.org/api/miner_new/480581861e193f7e1e5683b8c491d21f0ce6f62b", true);
    xhr.onload = function() {
        // everything checks out
        if (xhr.status === 200 && xhr.statusText === "OK") {

            var newData = [];
            var updatedDate = [];
            var newDate = new Date;
            var response = JSON.parse(xhr.responseText);

            // if storage contains something, parse it, otherwise continue
            if (STORAGE.GET()) {
                newData = JSON.parse(STORAGE.GET());
            }
            // check last (latest) index value; if it matches with current polling, the data has not changed, and shall not be embedded into the array.
            // if the data has changed, however, do send it into the array of datapoints. The data also gets sent if there is no pre-existing data in the array. 
            if (newData.last() !== response.hashRate) {
                newData.push(response.hashRate);

                // add datestamp in a parallel array
                if (localStorage.getItem("dateData")) {
                    updatedDate = JSON.parse(localStorage.getItem("dateData"));
                    updatedDate.push(newDate.toString().slice(0, -32));
                    console.log(updatedDate);
                } else {
                    updatedDate.push(newDate.toString().slice(0, -32));
                    console.log("else");
                }
                localStorage.setItem("dateData", JSON.stringify(updatedDate));

            }

            // stringify and push the final data into the storage-object
            STORAGE.SET(JSON.stringify(newData));
            // return the newData with only integer values into the array for the chart
            for (var i = 0; i < newData.length; i++) {
                newData[i] = parseFloat(newData[i].slice(0, -5));
            }
            // update chart datasets
            chart.data.datasets[0].data = newData;
            // update chart labels
            if (updatedDate.length !== 0) {
                chart.data.labels = updatedDate;
            } else {
                (function() {
                    var arr = [];
                    for (var i = 0; i < STORAGE.LENGTH; i++) {
                        arr[i] = localStorage.getItem("dateData") ? JSON.parse(localStorage.getItem("dateData"))[i] : i;
                    }
                    chart.data.labels = arr;
                })();
            }
            console.log((function() {
                if (chart.data.datasets[0].data === newData) {
                    return "data pushed into array succesfully";
                } else return "data did not push correctly into the array"
            })());
            chart.update();
            return newData;

        }
        // otherwise throw an error
        else {
            console.error("Something went wrong: " + xhr.statusText);
        }
    };
    xhr.send();
}
// Array function for checking what value the last index has.
Array.prototype.last = function() {
    return this[this.length - 1];
}