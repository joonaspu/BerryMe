BerryMe
===
Project work for LAMAD-course

## Installation
The website can be run locally just by opening `index.html`, but geolocation and some other features work better if the page is hosted on a HTTPS server.
"Nearby users" feature uses a server hosted on Heroku by default, but it can be run locally from the `server` directory (remember to change `g_LOCATION_SHARE_URL` variable in `script.js`).
**NOTE:** The "Optimal route" feature uses the Mopsi TSP API, which only works if the page is hosted on `cs.uef.fi` and uses HTTPS.

## Features
* Show user location on map
* Add and rate berries on map
* Multiple berry location databases
* Import and export berry database as a text file
* Achievements
* Show nearby users' locations in real time
* Calculate route to a selected berry location
* Calculate optimal route for visiting all berry locations
* Show current weather and forecast

## Todo

* Marjat (kuvat ja niiden tiedot)
    