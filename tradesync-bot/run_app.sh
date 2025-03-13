#!/bin/bash
# Full path to the Python 3.11 virtual environment's gunicorn
/Users/amin.haidar/tradesync-bot/venv/bin/gunicorn --worker-class gevent -w 1 wsgi:application
