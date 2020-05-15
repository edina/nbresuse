# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from jupyter_core.paths import jupyter_data_dir
import subprocess
import os

c = get_config()

# https://github.com/jupyter/notebook/issues/3130
c.FileContentsManager.delete_to_trash = False

c.NotebookApp.ResourceUseDisplay.track_cpu_percent=True
c.NotebookApp.ResourceUseDisplay.track_disk_percent = True

# 200MB
c.NotebookApp.ResourceUseDisplay.mem_limit = 246579200
c.NotebookApp.ResourceUseDisplay.mem_warning_threshold = 0.5

c.NotebookApp.ResourceUseDisplay.cpu_limit = 1.5
c.NotebookApp.ResourceUseDisplay.cpu_warning_threshold=0.5

# 500MB
c.NotebookApp.ResourceUseDisplay.disk_limit=536870912