"use strict";

// Class for the location
class Location {
    constructor(lat, lng, berry, rating, date) {
        this.latitude = lat;
        this.longitude = lng;
        this.berry = berry;
        this.rating = rating;
        this.date = date;
    }

}

window.Location = Location;