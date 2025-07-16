#!/bin/sh

echo "Running all scripts... "

start powershell -Command  "./run-backend.sh"
start powershell -Command  "./run-frontend.sh"
 
echo "Checking for web scraping argument."
if [ "$1" = "-rs" ]; then  # run scrape

    # Wait until backend is live
    echo "Waiting 30s before scraping ..."
    sleep 30
    echo "Starting the scrape"
    start powershell -Command "./run-webscrape.sh"
else
  echo "Skipping web scraping."
fi 

echo "All scripts launched in different terminals!"