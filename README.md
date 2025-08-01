# Car Score Predictor Mobile/Web Application

This is a repository for my most recent mobile application that utilizes a full stack application with React Native, Neural Networks, text-driven input, and web scraping.

THE NEXT UPDATE TO THE REPO WILL INCLUDE MY CODEBASE FOR THE DEPLOYMENT AND APP CREATION, [HERE IS THE CURRENT VERSION AS OF AUGUST 1](https://drive.google.com/file/d/12Z6DHYQ7OjFu_Fex0gxq947GUKhT2dpA/view?usp=drive_link)


## Setup

- Firstly, set up a MySQL database

- Then go into the env folder and edit the temp_config.py file to contain your database config, ip, and port, then rename it to config.py. You can also run export_config.py to send the config to the frontend now.

- Next, go into the model folder, run cars.ipynb to generate the model.

- Lastly, go into the CarScorePredictor and run "npm install expo" to install the needed packages.

## How To Run

- I provided shell scripts that run all the necessary components (frontend, backend, web scrapers). To you them you can run ./run-all.sh or ./run-all.sh -rs to also web scrape. You can also use the individual shell scripts if you only need to run one component.

- I found shell scripts to be terrible for debugging or sometimes would cause issues so here is the manually way too. 

- 1: Make sure your database is running
- 2: Enter into car_score_api and run server.py to start your backend server
- 3: Enter into env and run export_config.py to send your config to the frontend (if needed)
- 4: Enter into CarScorePredictor and run npx expo start to run the frontned
- 5: Enter into scripts and run car_eating.py (if needed)

## Predict Tab

 - The Predict Tab holds a text input LLM to output a inputted car's value.
 - For the best performance include at least the year, model, mileage, and price to get an accurate score. 
 - The model handles Year, Model, Mileage, Price, Condition, Dealer, Monthly Payment, Accident History, Number of Owners, and Personal/Commericial Use directly.        

## Database Tab
- The Database Tab holds a record of cars gathered by a webscraper to display.
- Used cars with perfect history means they have a clean history, one owner, and no accidents.
- This can give a sense of deals out their and potentially good deals.
- You can filter by price and mileage limits, makes and models, and US states.
- Lastly, the cars are automatically sorted by their projected value as the purpose of this app is to find and identify deals.

If you have any questions or concerns email me: torrinconrath@gmail.com
