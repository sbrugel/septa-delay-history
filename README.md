# SEPTA Delay History

A full-stack app that shows delay statistics over single days or 7/30/180 day intervals for SEPTA rail services. That includes average delays on a certain day/interval, median delay, and maximum/minimum delays and their times.

This is my first delve into a full-stack project. It uses Mongo, Express, React+JavaScript, and TypeScript. Currently it is not deployed anywhere, but I have listed instructions below to self-host the application.

## Features

- A script that, at 15-minute intervals, scrapes the SEPTA API and adds delay information for each train into a database. (`root/tracker/index.ts`)
- A React frontend, which connects to an Express-built backend, that allows the user to enter in SEPTA regional rail train numbers, returning delay statistics for it over various intervals.
- Display of average, median, maximum, and minimum delays (and for the latter two, their times/dates).
- Display of punctuality, aka the percentage of the time the train is 5 or less minutes late.
- Intervals of past 24 hours / 7 days / 30 days / 180 days.
- Ability to retrieve the information above for a train from a specific date (rather than a range of dates).

![img](https://i.imgur.com/knhO30K.jpeg)

## Folders

This section contains information on how the project is divided. There are three folders for its different parts, each of which have a `.bat` file to begin running them.

### tracker

**Created in:** TypeScript

This folder contains the script used to automatically scrape delay data from the SEPTA API every 15 minutes (by default). This is designed to be run on a dedicated server 24/7, but if you are self hosting the project and may not want to do this, you can change the interval of the CronJob to something shorter (like every 2 minutes).

Each SEPTA regional rail service has its own database entry. That contains the service number, and an array of objects housing delay data (the amount in minutes, and the date and time of the delay, as well as a datestring (used for not much else other than comparisons)). Currently the script is designed so only the 3000 most recent delays will be held at a time for each service (should last a long while!).

### server

**Created in:** JavaScript (with Express)

All this does is connect to the database, effectively serving as the backend of the React app, and giving it an endpoint to access the database. There are two endpoints (`http://localhost:5000/train/`; grabs all trains) and (`http://localhost:5000/train/:s`; grabs the train with service `s`)

### client

**Created in:** Javascript (with React)

This is the application itself. There is a textbox where the user can input a train number (3 or 4 digits), as well as specify an interval to view data from. The options are:

- 24 hours
- 7 days
- 30 days
- 180 days
- Choose Date _(brings up a calendar to choose a date)_

On submit, the app fetches specific train data from the `server`, returning average/median/maximum/minimum delays for that service in the specified interval.

## Setup Instructions

All three folders have a batch file that will automatically start each of them. However, there are other things you must do to ensure they work correctly.

For the project to work in its entirety please ensure you have the following:

- An installation of Node.js on your machine. [Download it here](https://nodejs.org/en/download/).
- A Mongo database (free tier will do). Instructions are listed in the `Setting up the tracker section`.

### Setting up the tracker

1. Open up a terminal of your choosing.
2. Navigate to the `tracker` folder within the project.
3. Run `npm i`; this will install all required dependencies to run this part of the program.

Assuming you already have a MongoDB organization set up, you will now need to create a project to hold the delay data.

1. On your org page, click `New Project`.
2. Follow the instructions to set up the project. (Includes naming and setting access)
3. Create a new Cluster once you are done with that. You only require the Free tier, Shared cluster for this to work.
4. Once you reach the Authentication setup page, choose to auth via `User and Password`. Create a username and password; **make sure you have this info saved somewhere, you will need it for your connection string.**
5. For the `Where would you like to connect from?` section, keep this set to `My local environment`. On the below IP addresses list, just add `0.0.0.0`.
6. You'll now need a connection string. Once on the main page of the project (pictured below), click `Connect`.

   ![img](https://i.imgur.com/4yadsew.png)

7. Select `Connect your application`; you will then see a connection string just below step 2. Copy this somewhere where you can shortly find it again; **make sure you add in your password!**

That's the database part done. Now to setup the config:

1. Copy the `config-template.ts` file in `/src`, and rename the clone to just `config.ts`.
2. Set the `CONNECTION` field to the aforementioned connection string. I highly recommend you keep all other fields unchanged.

To run the script, you can just double click on `start.bat`. Keep this open and the database will be updated every 15 minutes.

### Setting up the server

1. Open up a terminal of your choosing.
2. Navigate to the `tracker` folder within the project.
3. Run `npm i`; this will install all required dependencies to run this part of the program.
4. Copy the `config-template.env` file, rename the clone to `config.env`. Replace the `ATLAS_URI` field with the aforementioned connection string. I highly recommend you keep the `PORT` field unchanged.

To run the script, you can just double click on `start.bat`. Keep this open and you will have a running backend.

### Setting up the client

1. Open up a terminal of your choosing.
2. Navigate to the `tracker` folder within the project.
3. Run `npm i`; this will install all required dependencies to run this part of the program. (This may take a while.)

You can just run `start.bat` from here and the page will be accessible locally (normally at `http://localhost:3000`).

That's all. Enjoy!

## Credits

- Background photo by me, available on [Flickr](https://www.flickr.com/photos/183445295@N08/49550366117/in/datetaken/)
