class Window {
    constructor(topic) {
        this.name = "W" + Math.round(Math.random() * 100000);
        this.windowSelector = "#" + this.name;
        this.width = 100;
        this.height = 100;
        this.position = "center";
        this.topic = topic;

    }

    setSize(w, h) {
        this.width = w;
        this.height = h;
    }

    render() {
        $("#windowContainer").append("<div id='" + this.name + "'><div id='" + this.name + "_header'>" + this.name + ": [" + this.topic + "]</div><div id='" + this.name + "_content'>content</div></div>");
        var ws = this.windowSelector;
        $(ws).jqxWindow({
            height: this.height,
            width: this.width,
            position: this.position,
            minHeight: "100px",
            maxHeight: screen.height,
            minWidth: "300px",
            maxWidth: screen.width,
            resizable: true,
            autoOpen: true,
            isModal: false
        });


        /*       $(ws).on('resized', function (event) {
                   this.width = event.args.width;
                   this.height = event.args.height;
               });*/
        $(ws).on('moved', function (event) {
            this.position = event.args.position;
        });
        $(ws + "_content").append("<div>TESTING !!!!</div>");
        return (ws + "_content");
    }

    height() {
        return $(this.windowSelector).jqxWindow('height');
    }
    width() {
        return $(this.windowSelector).jqxWindow('width');
    }
}

class GraphWindow extends Window {
    constructor(topic) {
        super(topic)
        this.topic = topic;
        this.min = +1E36;
        this.max = -1E36;
        this.data = [];
        this.settings = {

            title: "Live updates demo",
            description: "Topic " + this.topic,
            enableAnimations: false,
            animationDuration: 1000,
            enableAxisTextAnimation: true,
            showLegend: true,
            padding: { left: 5, top: 5, right: 5, bottom: 5 },
            titlePadding: { left: 0, top: 0, right: 0, bottom: 10 },
            source: this.data,
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
                        maxValue: 1,
                        title: { text: 'Index Value' }
                    },
                    series: [
                        { dataField: 'value', displayText: 'value', opacity: 1, lineWidth: 2, symbolType: 'circle', fillColorSymbolSelected: 'white', symbolSize: 4 }
                    ]
                }
            ]
        };
        this.settings.seriesGroups[0].valueAxis.minValue = 0;
        this.settings.seriesGroups[0].valueAxis.maxValue = 5;
    }

    subscribe() {
        myMqtt.subscribe(this.topic);
        eb.onLocal("mqtt/publish", (msg) => {
            if (msg.topic === this.topic) {
                this.update(JSON.parse(msg.message));
            }
        });
    }

    update(value) {
        var redraw = false;
        if (value < this.min) {
            this.min = 0.9 * value;
            this.settings.seriesGroups[0].valueAxis.minValue = this.min;
            redraw = true;
        }
        if (value > this.max) {
            redraw = true;
            this.max = 1.1 * value;
            this.settings.seriesGroups[0].valueAxis.maxValue = this.max;
        }
        if (this.data.length >= 60)
            this.data.splice(0, 1);
        var timestamp = new Date();
        timestamp.setSeconds(timestamp.getSeconds());
        timestamp.setMilliseconds(0);
        this.data.push({ timestamp: timestamp, value: value });
        if (redraw) {
            $(this.graphSelector).jqxChart(this.settings);
            $(this.graphSelector).jqxChart('refresh');
        }
        else {
            $(this.graphSelector).jqxChart('update');
        }
    }

    render() {
        super.setSize(600, 300);
        this.graphSelector = super.render(); // div selector on window content


        /*for (var i = 0; i < 60; i++) {
            this.update(Math.random() * 300000);
        }*/
        this.data = this.data.reverse();
        var set = this.settings;
        set.seriesGroups[0].valueAxis.minValue = 0;
        set.seriesGroups[0].valueAxis.maxValue = 5;
        $(this.selector).on('resized', function (event) {
            $(this.graphSelector).jqxChart(this.settings);
            $(this.graphSelector).jqxChart('refresh');
        });

        //        $(this.graphSelector).jqxChart(set);
        this.subscribe();
    }
}