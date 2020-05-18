from typing import Optional

from notebook.notebookapp import NotebookApp
from prometheus_client import Gauge

from nbresuse.metrics import PSUtilMetricsLoader

try:
    # Traitlets >= 4.3.3
    from traitlets import Callable
except ImportError:
    from .utils import Callable


class PrometheusHandler(Callable):
    def __init__(self, metricsloader: PSUtilMetricsLoader):
        super().__init__()
        self.metricsloader = metricsloader
        self.config = metricsloader.config
        print(f"PrometheusHandler init.config: {self.config}")
        self.session_manager = metricsloader.nbapp.session_manager

        gauge_names = ["total_memory", "max_memory", "total_cpu", "max_cpu", "total_disk", "max_disk"]
        for name in gauge_names:
            phrase = name + "_usage"
            gauge = Gauge(phrase, "counter for " + phrase.replace("_", " "), [])
            setattr(self, phrase.upper(), gauge)

    async def __call__(self, *args, **kwargs):
        print(f"Get metrics")
        memory_metric_values = self.metricsloader.memory_metrics()
        if memory_metric_values is not None:
            print(f"memory metrics {memory_metric_values}")
            self.TOTAL_MEMORY_USAGE.set(memory_metric_values["memory_info_rss"])
            self.MAX_MEMORY_USAGE.set(self.apply_memory_limit(memory_metric_values))
        if self.config.track_cpu_percent == True:
            cpu_metric_values = self.metricsloader.cpu_metrics()
            print(f"cpu metrics {cpu_metric_values}")
            if cpu_metric_values is not None:
                self.TOTAL_CPU_USAGE.set(cpu_metric_values["cpu_percent"])
                self.MAX_CPU_USAGE.set(self.apply_cpu_limit(cpu_metric_values))
        if self.config.track_disk_percent == True:
            disk_metric_values = self.metricsloader.disk_metrics()
            print(f"disk metrics {disk_metric_values}")
            if disk_metric_values is not None:
                self.TOTAL_DISK_USAGE.set(disk_metric_values["disk_usage"])
                self.MAX_DISK_USAGE.set(self.apply_disk_limit(disk_metric_values))

    def apply_memory_limit(self, memory_metric_values) -> Optional[int]:
        if memory_metric_values is None:
            return None
        else:
            if callable(self.config.mem_limit):
                return self.config.mem_limit(
                    rss=memory_metric_values["memory_info_rss"]
                )
            elif self.config.mem_limit > 0:  # mem_limit is an Int
                return self.config.mem_limit
            else:
                return memory_metric_values["virtual_memory_total"]

    def apply_cpu_limit(self, cpu_metric_values) -> Optional[float]:
        if cpu_metric_values is None:
            return None
        else:
            if callable(self.config.cpu_limit):
                return self.config.cpu_limit(
                    cpu_percent=cpu_metric_values["cpu_percent"]
                )
            elif self.config.cpu_limit > 0.0:  # cpu_limit is a Float
                return self.config.cpu_limit
            else:
                return 100.0 * cpu_metric_values["cpu_count"]

    def apply_disk_limit(self, disk_metric_values) -> Optional[float]:
        if disk_metric_values is None:
            return None
        else:
            if callable(self.config.disk_limit):
                return self.config.disk_limit(
                    disk_usage=disk_metric_values["disk_usage"]
                )
            elif self.config.disk_limit > 0:  # disk_limit is an Int
                return self.config.disk_limit
            else:
                return disk_metric_values["disk_total"]