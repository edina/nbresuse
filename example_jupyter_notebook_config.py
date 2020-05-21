c = get_config()  # noqa: F821

c.FileContentsManager.delete_to_trash = False

# switch off CPU reporting
c.NotebookApp.ResourceUseDisplay.track_cpu_percent = False

# set a memory limit: 200MB
c.NotebookApp.ResourceUseDisplay.mem_limit = 246579200

# set a disk limit: 500MB
c.NotebookApp.ResourceUseDisplay.disk_limit = 536870912
