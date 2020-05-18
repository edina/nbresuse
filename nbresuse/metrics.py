try:
    import psutil
except ImportError:
    psutil = None
from pathlib import Path

from notebook.notebookapp import NotebookApp


class PSUtilMetricsLoader:
    def __init__(self, nbapp: NotebookApp):
        self.config = nbapp.web_app.settings["nbresuse_display_config"]
        self.nbapp = nbapp

    def get_process_metric_value(self, process, name, kwargs, attribute=None):
        try:
            # psutil.Process methods will either return...
            metric_value = getattr(process, name)(**kwargs)
            if attribute is not None:  # ... a named tuple
                return getattr(metric_value, attribute)
            else:  # ... or a number
                return metric_value
        # Avoid littering logs with stack traces
        # complaining about dead processes
        except BaseException:
            return 0

    def process_metric(self, name, kwargs={}, attribute=None):
        if psutil is None:
            self.metricsloader.nbapp.log.info(f"psutil is none")
            return None
        else:
            current_process = psutil.Process()
            all_processes = [current_process] + current_process.children(recursive=True)

            process_metric_value = lambda process: self.get_process_metric_value(
                process, name, kwargs, attribute
            )

            return sum([process_metric_value(process) for process in all_processes])

    def system_metric(self, name, kwargs={}, attribute=None):
        if psutil is None:
            return None
        else:
            # psutil functions will either return...
            metric_value = getattr(psutil, name)(**kwargs)
            if attribute is not None:  # ... a named tuple
                return getattr(metric_value, attribute)
            else:  # ... or a number
                return metric_value

    def get_metric_values(self, metrics, metric_type):
        metric_types = {"process": self.process_metric, "system": self.system_metric}
        metric_value = metric_types[metric_type]  # Switch statement

        metric_values = {}
        for metric in metrics:
            name = metric["name"]
            if metric.get("attribute", False):
                name += "_" + metric.get("attribute")
            metric_values.update({name: metric_value(**metric)})
        return metric_values

    def metrics(self, process_metrics, system_metrics):
        self.metricsloader.nbapp.log.info(f"metrics.py metrics being called")

        metric_values = self.get_metric_values(process_metrics, "process")
        metric_values.update(self.get_metric_values(system_metrics, "system"))

        if any(value is None for value in metric_values.values()):
            self.metricsloader.nbapp.log.info("metrics.py metrics returning none")
            return None
        self.metricsloader.nbapp.log.info(f"metrics.py metrics returning {metric_values}")
        return metric_values

    def memory_metrics(self):
        return self.metrics(
            self.config.process_memory_metrics, self.config.system_memory_metrics
        )

    def cpu_metrics(self):
        return self.metrics(
            self.config.process_cpu_metrics, self.config.system_cpu_metrics
        )

    def disk_metrics(self):
        root_directory = Path('.')
        disk_usage = sum(f.stat().st_size for f in root_directory.glob('**/*') if f.is_file() )
        disk_psutils = psutil.disk_usage('/home').total
        return {'disk_usage': disk_usage, 'disk_total': disk_psutils}
