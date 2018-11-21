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
        window.localStorage.setItem(unlockedAchievements, JSON.stringify([]));
    }
    unlocked = JSON.parse(unlocked);
    return unlocked;
}

// Unlock an achievement and save it 
function unlockAchievement(id) {
    let ach = getAchievements();
    ach.push(id);
    window.localStorage.setItem(unlockedAchievements, JSON.stringify(ach));
}