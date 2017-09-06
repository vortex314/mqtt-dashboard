prepGraph = function () {
    var data = [];
    var max = 5;
    var timestamp = new Date();
    for (var i = 0; i < 60; i++) {
        timestamp.setMilliseconds(0);
        timestamp.setSeconds(timestamp.getSeconds() - 1);
        data.push({ timestamp: new Date(timestamp.valueOf()), value: Math.max(100, (Math.random() * 1000) % max) });
    }
    data = data.reverse();
    // prepare jqxChart settings
    var settings = {
        title: "Live updates demo",
        description: " src/ESPF3A17C.ANCHOR/distance ",
        enableAnimations: false,
        animationDuration: 1000,
        enableAxisTextAnimation: true,
        showLegend: true,
        padding: { left: 5, top: 5, right: 5, bottom: 5 },
        titlePadding: { left: 0, top: 0, right: 0, bottom: 10 },
        source: data,
        xAxis:
        {
            dataField: 'timestamp',
            type: 'date',
            baseUnit: 'second',
            unitInterval: 5,
            formatFunction: function (value) {
                return $.jqx.dataFormat.formatdate(value, "hh:mm:ss", 'en-us');
            },
            gridLines: { step: 2 },
            valuesOnTicks: true,
            labels: { angle: -45, offset: { x: -17, y: 0 } }
        },
        colorScheme: 'scheme03',
        seriesGroups:
        [
            {
                type: 'line',
                columnsGapPercent: 50,
                alignEndPointsWithIntervals: true,
                valueAxis:
                {
                    minValue: 0,
                    maxValue: 5,
                    title: { text: 'Index Value' }
                },
                series: [
                    { dataField: 'value', displayText: 'value', opacity: 1, lineWidth: 2, symbolType: 'circle', fillColorSymbolSelected: 'white', symbolSize: 4 }
                ]
            }
        ]
    };
    // create the chart
    $('#chartContainer').jqxChart(settings);
    // get the chart's instance
    var chart = $('#chartContainer').jqxChart('getInstance');
    // color scheme drop down
    var colorsSchemesList = ["scheme01", "scheme02", "scheme03", "scheme04", "scheme05", "scheme06", "scheme07", "scheme08"];
    $("#dropDownColors").jqxDropDownList({ source: colorsSchemesList, selectedIndex: 2, width: '200', height: '25', dropDownHeight: 100 });
    $('#dropDownColors').on('change', function (event) {
        var value = event.args.item.value;
        chart.colorScheme = value;
        chart.update();
    });
    // series type drop down
    var seriesList = ["line", "area", "stepline", "steparea", "splinearea", "spline", "column", "scatter", "stackedcolumn", "stackedsplinearea", "stackedspline"];
    $("#dropDownSeries").jqxDropDownList({ source: seriesList, selectedIndex: 0, width: '200', height: '25', dropDownHeight: 100 });
    $('#dropDownSeries').on('select', function (event) {
        var args = event.args;
        if (args) {
            var value = args.item.value;
            var group = chart.seriesGroups[0];
            chart.seriesGroups[0].type = value;
            chart.update();
        }
    });
    // auto update timer
    eb.onLocal("mqtt/publish", function (obj) {
        if (obj.topic == "src/ESPF3A17C.ANCHOR/distance") {
            try {
                var value = JSON.parse(obj.message);
            } catch (error) {
                log(" JSON parsing failed on : " + obj.topic + ':' + obj.message)
                return;
            }
            if (data.length >= 60)
                data.splice(0, 1);
            var timestamp = new Date();
            timestamp.setSeconds(timestamp.getSeconds());
            timestamp.setMilliseconds(0);
            data.push({ timestamp: timestamp, "value": value });
            $('#chartContainer').jqxChart('update');
        }
    });
    /*    var ttimer = setInterval(function () {
            var max = 800;
            if (data.length >= 60)
                data.splice(0, 1);
            var timestamp = new Date();
            timestamp.setSeconds(timestamp.getSeconds());
            timestamp.setMilliseconds(0);
            data.push({ timestamp: timestamp, value: Math.max(100, (Math.random() * 1000) % max) });
            $('#chartContainer').jqxChart('update');
        }, 1000);*/
}