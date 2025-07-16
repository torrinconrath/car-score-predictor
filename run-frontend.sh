#!/bin/sh

# Exporting the config
echo "Started exporting the config."
python env/export_config.py
if [ $? -ne 0 ]; then
  echo "export_config.py failed, aborting."
  exit 1
fi
echo "Finished exporting the config."

# Starting the applciation
echo "Starting the mobile/web application."
cd CarScorePredictor || { echo "Failed to cd into CarScorePredictor"; exit 1; }
npx expo start
if [ $? -ne 0 ]; then
  echo "mobile/web app failed, aborting."
  exit 1
fi
cd ..
echo "Finished loading the mobile/web application."

echo "Setup done!"
