from notebook.notebookapp import NotebookApp
from prometheus_client import Gauge
from tornado import gen

from nbresuse.metrics import CPUMetrics, MemoryMetrics, DiskMetrics, cpu_metrics, memory_metrics, disk_metrics

try:
    # Traitlets >= 4.3.3
    from traitlets import Callable
except ImportError:
    from .utils import Callable

TOTAL_MEMORY_USAGE = Gauge(
    'total_memory_usage',
    'counter for total memory usage',
    []
)

MAX_MEMORY_USAGE = Gauge(
    'max_memory_usage',
    'counter for max memory usage',
    []
)

TOTAL_CPU_USAGE = Gauge(
    'total_cpu_usage',
    'counter for total cpu usage',
    []
)

MAX_CPU_USAGE = Gauge(
    'max_cpu_usage',
    'counter for max cpu usage',
    []
)

TOTAL_DISK_USAGE = Gauge(
    'total_disk_usage',
    'counter for total disk usage',
    []
)

MAX_DISK_USAGE = Gauge(
    'max_disk_usage',
    'counter for max disk usage',
    []
)

class PrometheusHandler(Callable):
    def __init__(self, nbapp: NotebookApp):
        super().__init__()
        self.config = nbapp.web_app.settings['nbresuse_display_config']
        self.session_manager = nbapp.session_manager

    @gen.coroutine
    def __call__(self, *args, **kwargs):
        metrics = self.apply_memory_limits(memory_metrics())
        TOTAL_MEMORY_USAGE.set(metrics.current_memory)
        MAX_MEMORY_USAGE.set(metrics.max_memory)
        if self.config.track_cpu_percent:
            metrics = self.apply_cpu_limits(cpu_metrics())
            TOTAL_CPU_USAGE.set(metrics.cpu_usage)
            MAX_CPU_USAGE.set(metrics.cpu_max)
        if self.config.track_disk_usage:
            metrics = self.apply_disk_limits(disk_metrics())
            TOTAL_DISK_USAGE.set(metrics.disk_usage)
            MAX_DISK_USAGE.set(metrics.disk_max)


    def apply_memory_limits(self, metrics: MemoryMetrics) -> MemoryMetrics:
        if callable(self.config.mem_limit):
            metrics.max_memory = self.config.mem_limit(rss=metrics.max_memory)
        elif self.config.mem_limit > 0:  # mem_limit is an Int
            metrics.max_memory = self.config.mem_limit
        return metrics

    def apply_cpu_limits(self, metrics: CPUMetrics) -> CPUMetrics:
        if self.config.cpu_limit > 0:
            metrics.cpu_max = self.config.cpu_limit
        return metrics

    def apply_disk_limits(self, metrics: DiskMetrics) -> DiskMetrics:
        if self.config.disk_limit > 0:
            metrics = DiskMetrics(
                metrics.disk_usage,
                self.config.disk_limit * 1024 * 1024
            )
        return metrics
