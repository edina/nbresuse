FROM jupyter/r-notebook:latest

USER root
WORKDIR /srv
# RUN git clone --depth 1 https://github.com/edina/nbresuse
COPY . nbresuse
RUN pip install /srv/nbresuse/ 

USER $NB_USER
WORKDIR $HOME
