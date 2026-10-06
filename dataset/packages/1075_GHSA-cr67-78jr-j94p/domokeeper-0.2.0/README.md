# Domokeeper server

domokeeper server: a pluggable domotic control server for Raspberry Pi 2/3

## Installation

ssh into your raspberry pi ([How to config ssh without UTP cable?](http://jperelli.com.ar/post/2017/02/08/how-to-configure-raspbian-raspberry-pi-wifi/)) and run

    sudo apt install npm
    sudo npm install -g domokeeper
    ln -s /usr/bin/nodejs /usr/bin/node  # debian buggy naming

## Run

    domokeeper

Get help on man page

    man domokeeper

## Raspbian img with domokeeper preinstalled

This is work in progress, it is not yet done.

# Contributors

 - Julian Perelli

# License

GNU AGPL v3
