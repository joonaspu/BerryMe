"use strict";

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