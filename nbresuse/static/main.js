define([
    'jquery',
    'base/js/utils'
], function ($, utils) {

    var metric_keys = {
        'memory': 'Memory',
        'cpu': 'CPU',
        'disk': 'Disk',
    };

    function setupDOM() {
        $('#maintoolbar-container').append(
            $('<div>').attr('id', 'nbresuse-display')
                      .addClass('btn-group')
                      .addClass('pull-right')
            .append(
                $('<div>').attr('id', 'nbresuse-memory')
            ).append(
                $('<div>').attr('id', 'nbresuse-cpu')
            ).append(
                $('<div>').attr('id', 'nbresuse-disk')
            )
        );
        // FIXME: Do something cleaner to get styles in here?
        // back-ticks for a multi-line string
        $('head').append(
            $('<style>').html(`
    #nbresuse-display { padding: 2px 8px; }

    .nbresue_common {
        display: hidden;
        padding: 2px 1em;
        margin: 0 0.5em;
        border-radius:2px;
        position:relative;
    }
    .nbresuse-memory {
        border:1px solid #ccc;
    }
    .nbresuse-cpu {
        border:1px solid #ccc;
    }
    .nbresuse-disk {
        border:1px solid #ccc;
    }
    .nbresuse-common_bar {
        z-index: -1;
        opacity: 0.5;
        position:absolute;
        top:0; bottom:0;
        left:0;
    }
    .nbresuse-memory_bar {
        background:#84e184;
        width:30%;
    }
    .nbresuse-cpu_bar {
        background:#84e184;
        width:30%;
    }
    .nbresuse-disk_bar {
        background:#84e184;
        width:30%;
    }
            `)
        );
    }

    function humanFileSize(size) {
        var i = Math.floor( Math.log(size) / Math.log(1024) );
        return ( size / Math.pow(1024, i) ).toFixed(1) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
    }


    function metric(metric_name, text, multiple=false) {
        var regex = new RegExp("^" + metric_name + "\{?([^ \}]*)\}? (.*)$", "gm");
        var matches = [];
        var match;

        do{
            match = regex.exec(text);
            if (match){
                matches.push(match)
            }
        }
        while (match);

        if (!multiple) {
            if (matches.length > 0)
                return matches[0];
            return null;
        }else
            return matches;
    }

    var displayMetric = function( component, data) {
        let totalUsage = metric("total_" + component + "_usage", data);
        let maxUsage = metric("max_" + component + "_usage", data);
        if (maxUsage[2] <= 0)
            return;

        // green: #84e184; orange: #ff944d; red: #ff3333; emergency (maroon): '#800000'
        let percentage = (parseFloat(totalUsage[2]) / parseFloat(maxUsage[2])) * 100;
        colour = percentage > 100 ? '#800000' :
            percentage > 90 ? '#ff3333' :
            percentage > 75 ? '#ff944d' : '#84e184';
        percentage = percentage > 100 ? 100 : percentage;  // cap at 100 percent
        percentage = percentage.toFixed(2) + '%';


        if (component == 'memory' || component == 'disk') {
            totalUsage = humanFileSize(parseFloat(totalUsage[2]));
            maxUsage = humanFileSize(parseFloat(maxUsage[2]));
        } else {
            totalUsage = parseFloat(totalUsage[2]);
            maxUsage = parseFloat(maxUsage[2]);
        };

        var display = totalUsage + "/" + maxUsage;

        $('#nbresuse-' + component)
            .text( metric_keys[component])
            .css('display', 'inline-block')
            .attr('class', 'nbresue_common nbresuse-' + component)
            .attr('title', display)
            .css('border-color', colour)
            .append(
                $('<span>').text(' ')
                .attr('class', 'nbresuse-common_bar nbresuse-' + component + '_bar')
            )
        $('.nbresuse-' + component + '_bar')
            .css('width', percentage)
            .css('background', colour);
    }

    var displayMetrics = function() {
        if (document.hidden) {
            // Don't poll when nobody is looking
            return;
        }
        $.ajax({
            crossDomain : true,
            dataType: "text",
            url: utils.get_body_data('baseUrl') + 'metrics',
            success: function(data) {
                displayMetric('memory', data)
                displayMetric('cpu', data)
                // displayMetric('disk', data)
            }
        });
    };

    var load_ipython_extension = function () {
        setupDOM();
        displayMetrics();
        // Update every five seconds, eh?
        setInterval(displayMetrics, 1000 * 5);

        document.addEventListener("visibilitychange", function() {
            // Update instantly when user activates notebook tab
            // FIXME: Turn off update timer completely when tab not in focus
            if (!document.hidden) {
                displayMetrics();
            }
        }, false);
    };

    return {
        load_ipython_extension: load_ipython_extension,
    };
});
