// Handle achievements

// Format in localstorage -> e.g. [id,id,...]
achievements = [
    {"id": 0,"name":"Beginner", "description":"Add 1 berry", "url":"res/achievements/radu.png"},
    {"id": 1,"name":"Novice", "description":"Add 25 berries", "url":"res/achievements/radu.png"},
    {"id": 2,"name":"Professional", "description":"Add 50 berries", "url":"res/achievements/radu.png"},
    {"id": 3,"name":"Veteran", "description":"Add 100 berries", "url":"res/achievements/radu.png"},
    {"id": 4,"name":"What are you doing here?", "description":"Visit Tuusniemi", "url":"res/achievements/radu.png"},
    {"id": 5,"name":"Joe's mouth", "description":"Visit Joensuu", "url":"res/achievements/radu.png"},
    {"id": 6,"name":"Pasanen", "description":"Visit Kuopio", "url":"res/achievements/radu.png"},
];

// Load unlocked achievements from the localStorage
function getAchievements() {
    let unlocked = window.localStorage.getItem("unlockedAchievements");
    // Create key: "unlockedAchievements" if it does not exist
    if(!unlocked) {
        window.localStorage.setItem("unlockedAchievements", JSON.stringify([]));
        unlocked = window.localStorage.getItem("unlockedAchievements");
    }
    unlocked = JSON.parse(unlocked);
    return unlocked;
}

// Unlock an achievement and save it 
function unlockAchievement(id) {
    if(g_achievementsEnabled) {
        let ach = getAchievements();
        ach.push(id);
        window.localStorage.setItem("unlockedAchievements", JSON.stringify(ach));
    }
}
// Not the best solution out there, make more modular
function checkLocationAchievements(position) {
    g_geocoder.geocode({"location":position}, function(results, status) {
        if(status === "OK") {
            let city = results[0].address_components[2].long_name;
            switch(city) {
                case "Tuusniemi":
                    unlockAchievement(4);
                    break;
                case "Joensuu":
                    unlockAchievement(5);
                    break;
                case "Kuopio":
                    unlockAchievement(6);
                    break;
            }
        }
    });
}

function checkBerryCountAchievements() {
    let berrycount_str = window.localStorage.getItem("totalBerryCount");
    if(berrycount_str != null) {
        let count = parseInt(berrycount_str);
        switch(count) {
            case 1:
                unlockAchievement(0);
                break;
            case 25:
                unlockAchievement(1);
                break;
            case 50:
                unlockAchievement(2);
                break;
            case 100:
                unlockAchievement(3);
                break;
        }
    }
}
// Add one to the total count (lifetime)
function incrementTotalBerryCount() {
    let berrycount_str = window.localStorage.getItem("totalBerryCount");
    if(berrycount_str == null) {
        window.localStorage.setItem("totalBerryCount", "1");
    } else {
        let count = parseInt(berrycount_str) + 1;
        window.localStorage.setItem("totalBerryCount", ''+count);
    }
}
// Remove one from the total count (lifetime)
function decrementTotalBerryCount() {
    let berrycount_str = window.localStorage.getItem("totalBerryCount");
    if(berrycount_str == null) {
        window.localStorage.setItem("totalBerryCount", "0");
    } else {
        let count = Math.max(parseInt(berrycount_str) - 1,0);
        window.localStorage.setItem("totalBerryCount", ''+count);
    }
}

function clearAchievements() {
    window.localStorage.setItem("unlockedAchievements", JSON.stringify([]));
    window.localStorage.setItem("totalBerryCount", "0");
}

