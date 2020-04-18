from typing import NamedTuple
from pathlib import Path

import psutil

class MemoryMetrics(NamedTuple):
    current_memory: int
    max_memory: int


class CPUMetrics(NamedTuple):
    cpu_max: float
    cpu_usage: float


class DiskMetrics(NamedTuple):
    disk_usage: float
    disk_max: float

def memory_metrics() -> MemoryMetrics:
    cur_process = psutil.Process()
    all_processes = [cur_process] + cur_process.children(recursive=True)

    rss = sum([p.memory_info().rss for p in all_processes])
    virtual_memory = psutil.virtual_memory()
    return MemoryMetrics(
        rss,
        virtual_memory.total
    )


def cpu_metrics() -> CPUMetrics:
    cur_process = psutil.Process()
    all_processes = [cur_process] + cur_process.children(recursive=True)

    cpu_count = psutil.cpu_count()

    def get_cpu_percent(p):
        try:
            percentage = p.cpu_percent(interval=0.05)
            print(f"percentage:{percentage}; type:{type(percentage)}")
            return percentage
        # Avoid littering logs with stack traces complaining
        # about dead processes having no CPU usage
        except BaseException:
            print(f"BaseException")
            return 0
    cpu_percent = sum([get_cpu_percent(p) for p in all_processes])
    cpu_percent = cpu_percent or 0.01 
    return CPUMetrics(
        cpu_count * 100.0,
        cpu_percent
    )

def disk_metrics() -> DiskMetrics:
    root_directory = Path('.')
    disk_usage = sum(f.stat().st_size for f in root_directory.glob('**/*') if f.is_file() )
    obj_Disk = psutil.disk_usage('/')
    disk_max = obj_Disk.total
    return DiskMetrics(
        disk_usage,
        disk_max
    )
