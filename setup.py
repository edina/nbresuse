import pathlib
from glob import glob

import setuptools

# The directory containing this file
HERE = pathlib.Path(__file__).parent

# The text of the README file
README = (HERE / "README.md").read_text()

setuptools.setup(
    name="dnbresuse",
    version="0.4.0",
    url="https://github.com/edina/nbresuse",
    author="Yuvi Panda, Ian Stuart, Bert Robberechts",
    description="Simple Jupyter extension to show what resources your docker notebook-container is using",
    long_description=README,
    long_description_content_type="text/markdown",
    license="BSD",
    classifiers=[
        "License :: OSI Approved :: BSD License",
        "Programming Language :: Python :: 3",
    ],
    packages=setuptools.find_packages(),
    install_requires=["notebook>=6.0.0", "prometheus_client", "psutil>=5.6.0"],
    extras_require={
        "dev": ["autopep8", "pytest", "flake8", "pytest-cov>=2.6.1", "mock"],
    },
    data_files=[
        ("share/jupyter/nbextensions/nbresuse", glob("nbresuse/static/*")),
        (
            "etc/jupyter/jupyter_notebook_config.d",
            ["nbresuse/etc/serverextension.json"],
        ),
        ("etc/jupyter/nbconfig/notebook.d", ["nbresuse/etc/nbextension.json"]),
    ],
    zip_safe=False,
    include_package_data=True,
)
