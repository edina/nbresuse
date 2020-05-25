# Contributing

Contributions to NBResuse are highly welcome! As a [Jupyter](https://jupyter.org) project,
you can follow the [Jupyter contributor guide](https://jupyter.readthedocs.io/en/latest/contributor/content-contributor.html).

Make sure to also follow [Project Jupyter's Code of Conduct](https://github.com/jupyter/governance/blob/master/conduct/code_of_conduct.md)
for a friendly and welcoming collaborative environment.

## Development set up

We recommend using [pipenv](https://docs.pipenv.org/) to make development easier.

### Getting the repo

1. Clone the git repository:

   ```bash
   git clone https://github.com/edina/nbresuse
   ```

2. Create a reference docker image:
   
   ```bash
   docker build -t test .
   ```

3. Start a Jupyter Notebook instance, open a new notebook and check out the usage guages
   in the top right!

   ```bash
   docker run -p 8888:8888 test
   ```

### Testing variations

4. If you want to test and of the functionality that affects the display, you can do so
   by setting environment variables or setting up a `jupyter_notebook_config.py` file
   (see the supplied `example_jupyter_notebook_config.py`).

   ```bash
   MEM_LIMIT=$(expr 128 \* 1024 \* 1024) jupyter notebook
   ```

### Developing and improving the code

Before you add/change code, you need to consider testing: It's a good idea to write tests to exercise any new features,
or that trigger any bugs that you have fixed to catch regressions.

5. In your Virtual Environment, you'll need to add a bunch of pytho libraries:

   ```bash
   pip install -r requirements-dev.txt
   ```

6. `pytest` is used to run the test suite. You can run the tests with:

   ```bash
   python -m pytest -vvv nbresuse
   ```

   in the repo directory.


7. DNBResuse has adopted automatic code formatting so you shouldn't
need to worry too much about your code style.

   As long as your code is valid, the pre-commit hook should take care of 
   how it should look. Here is how to set up pre-commit hooks for automatic
   code formatting, etc.

   ```bash
   pre-commit install
   ```

   You should run the pre-commit hook manually before commiting to save your blushes.

   You need to `git add <foos>` before running the commit.

   ```bash
   pre-commit run
   ```

   which will check the code for formatting & conformity.

   The `pre-commit` will modify code as appropriate, so you'll need to re-`add` files
   if you want to re-run

   If you have already committed files before setting up the pre-commit
hook with `pre-commit install`, you can fix everything up using
`pre-commit run --all-files`.  You need to make the fixing commit
yourself after that.

   If you get failures, try

   ```bash
   pre-commit run --show-diff-on-failure
   ```

   to see what the errors are.

8. The DNBResuse repo checks every commit for linting & the the code will actually install [in a docker image].
