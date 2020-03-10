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
                $('<strong>').text('Memory: ')
            ).append(
                $('<span>').attr('id', 'nbresuse-mem')
                           .attr('title', 'Actively used Memory (updates every 5s)')
            ).append(
                $('<strong>').text(' Disk: ')
            ).append(
                $('<span>').attr('id', 'nbresuse-disk')
                           .attr('title', 'Disk usage (updates every 5s)')
            )
        );
        // FIXME: Do something cleaner to get styles in here?
        $('head').append(
            $('<style>').html('.nbresuse-warn { background-color: #FFD2D2; color: #D8000C; }')
        );
        $('head').append(
            $('<style>').html('.nbresuse-info { background-color: #FFF3CD; color: #856404; }')
        );
        $('head').append(
            $('<style>').html('#nbresuse-display { padding: 2px 8px; }')
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

    var displayMetrics = function() {
        if (document.hidden) {
            // Don't poll when nobody is looking
            return;
        }
        $.ajax({
            url: utils.get_body_data('baseUrl') + 'metrics',
            success: function(data) {
                let totalMemoryUsage = metric("total_memory_usage", data);
                let maxMemoryUsage = metric("max_memory_usage", data);

                if (!totalMemoryUsage || !maxMemoryUsage)
                    return;
                totalMemoryUsage = humanFileSize(parseFloat(totalMemoryUsage[2]));
                maxMemoryUsage = humanFileSize(parseFloat(maxMemoryUsage[2]));

                var display = totalMemoryUsage + "/" + maxMemoryUsage;
                $('#nbresuse-mem').text(display);

                let totalDiskUsage = metric("total_disk_usage", data);
                let maxDiskUsage = metric("max_disk_usage", data);
                var percentage = parseFloat(totalDiskUsage[2]) / parseFloat(maxDiskUsage[2])

                console.log("Percentage", percentage)

                totalDiskUsage = humanFileSize(parseFloat(totalDiskUsage[2]));
                maxDiskUsage = humanFileSize(parseFloat(maxDiskUsage[2]));
                var display = totalDiskUsage + "/" + maxDiskUsage;

                if (percentage >= 0.9) {
                    $('#nbresuse-disk').classList.add('nbresuse-warn')
                    $('#nbresuse-disk').classList.remove('nbresuse-info')
                } else if (percentage >= 0.7) {
                    $('#nbresuse-disk').addClass('nbresuse-info')
                    $('#nbresuse-disk').classList.remove('nbresuse-warn')
                } else {
                    $('#nbresuse-disk').classList.remove('nbresuse-warn', 'nbresuse-info')
                }

                $('#nbresuse-disk').text(display);

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
