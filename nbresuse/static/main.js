define([
    'jquery',
    'base/js/utils'
], function ($, utils) {
    function setupDOM() {
        $('#maintoolbar-container').append(
            $('<div>').attr('id', 'nbresuse-display')
                      .addClass('btn-group')
                      .addClass('pull-right')
            .append(
                $('<div>').text('Memory')
                            .attr('id', 'nbresuse-memory')
                            .attr('class', 'nbresuse-memory')
                            .append(
                                $('<span>').text(' ')
                                .attr('class', 'nbresuse-memory_bar')
                            )
            ).append(
                $('<div>').text('CPU')
                            .attr('id', 'nbresuse-cpu')
                            .attr('class', 'nbresuse-cpu')
                            .append(
                                $('<span>').text(' ')
                                .attr('class', 'nbresuse-cpu_bar')
                            )
            ).append(
                $('<div>').text('Disk')
                            .attr('id', 'nbresuse-disk')
                            .attr('class', 'nbresuse-disk')
                            .append(
                                $('<span>').text(' ')
                                .attr('class', 'nbresuse-disk_bar')
                            )
            )
        );
        // FIXME: Do something cleaner to get styles in here?
        // back-ticks for a multi-line string
        // colo(u)rs - green: #84e184; orange: #ff944d; red: #ff3333
        $('head').append(
            $('<style>').html(`
            #nbresuse-display { padding: 2px 8px; }
            .nbresuse-memory {
                display: inline-block;
                padding: 2px 1em;
                margin: 0 0.5em;
                border:1px solid #ccc;
                border-radius:2px;
                position:relative;
            }

            .nbresuse-cpu {
                display: inline-block;
                padding: 2px 1em;
                margin: 5px 0.5em;
                border:1px solid #ccc;
                border-radius:2px;
                position:relative;
            }

            .nbresuse-disk {
                display: inline-block;
                padding: 2px 1em;
                margin: 0 0.5em;
                border:1px solid #ccc;
                border-radius:2px;
                position:relative;
            }
            .nbresuse-memory_bar {
                    z-index: -1;
                    position:absolute;
                    background:#84e184; 
                    top:0; bottom:0;
                    left:0; 
                    width:30%;
                    opacity: 0.5;
                }
                .nbresuse-cpu_bar {
                    z-index: -1;
                    position:absolute;
                    background:#84e184; 
                    top:0; bottom:0;
                    left:0; 
                    width:30%;
                    opacity: 0.5;
                }
                .nbresuse-disk_bar {
                    z-index: -1;
                    position:absolute;
                    background:#84e184; 
                    top:0; bottom:0;
                    left:0; 
                    width:30%;
                    opacity: 0.5;
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

    function manage_metric(component, data) {

        let totalUsage = metric("total_" + component + "_usage", data);
        let maxUsage = metric("max_" + component + "_usage", data);
        let percentage = (parseFloat(totalUsage[2]) / parseFloat(maxUsage[2])) * 100;
        // green: #84e184; orange: #ff944d; red: #ff3333; emergency (maroon): '#800000'
        colour = percentage > 100 ? '#800000' :
            percentage > 90 ? '#ff3333' :
            percentage > 75 ? '#ff944d' : '#84e184';
        percentage = percentage > 100 ? 100 : percentage;  // cap at 100 percent
        percentage = percentage.toFixed(2) + '%';
        if (totalUsage && maxUsage) {
            if (component === 'cpu' ) {
                totalUsage = parseFloat(totalUsage[2]);
                maxUsage = parseFloat(maxUsage[2]) / 100;
            } else {
                totalUsage = humanFileSize(parseFloat(totalUsage[2]));
                maxUsage = humanFileSize(parseFloat(maxUsage[2]));
            }
            let title = totalUsage + "/" + maxUsage + " => " + percentage;
            $('#nbresuse-' + component).attr('title', title);
            $('#nbresuse-' + component).css('border-color', colour);
            $('.nbresuse-' + component + '_bar').css('width', percentage);
            $('.nbresuse-' + component + '_bar').css('background', colour);
        }

    }
    var displayMetrics = function() {
        if (document.hidden) {
            // Don't poll when nobody is looking
            return;
        }
        $.ajax({
            url: utils.get_body_data('baseUrl') + 'metrics',
            success: function(data) {
                manage_metric('memory', data);
                manage_metric('cpu', data);
                manage_metric('disk', data);
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
