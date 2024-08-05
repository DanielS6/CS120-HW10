# syntax=docker/dockerfile:1
FROM php:8.3.9-apache

# Just using a PHP image since I'm familiar with it, everything will still be
# done with node

# Add missing packages
RUN apt-get update
RUN apt-get install -y --no-install-recommends nano
RUN apt-get install -y --no-install-recommends curl

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# Still need to run `nvm install 22` manually