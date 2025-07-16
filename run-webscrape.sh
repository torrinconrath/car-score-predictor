#!/bin/sh

# Starting the web scrape
echo "Running Web Scrapers..."
cd scripts || { echo "Failed to cd into scripts"; exit 1; }
python car_eating.py
if [ $? -ne 0 ]; then
    echo "car_eating.py failed, aborting."
    exit 1
fi
cd ..
echo "Finished web scraping."

echo "Scrape done!"