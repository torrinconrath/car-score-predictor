#!/bin/sh

# Starting the server
echo "Starting the backend server."
cd car_score_api || { echo "Failed to cd into car_score_api"; exit 1; }
python server.py
if [ $? -ne 0 ]; then
  echo "server.py failed, aborting."
  exit 1
fi
cd ..
echo "Finished loading the backend server."

echo "Setup done!"
