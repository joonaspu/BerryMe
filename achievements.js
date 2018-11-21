// Handle achievements
// Format in localstorage -> e.g. [0,0,1,0,1]
achievements = [
    {"name":"It's a beginning", "description":"Add one berry", "url":"res/achievements/radu.png"},
    {"name":"Test2", "description":"Test description2", "url":"res/achievements/radu.png"},
    {"name":"Test3", "description":"Test description2 asdasd", "url":"res/achievements/radu.png"},
    {"name":"Test4", "description":"Test description2 asdasdasdasda", "url":"res/achievements/radu.png"},
    {"name":"Test5", "description":"Test description2 ddddddddddddddddd", "url":"res/achievements/radu.png"},
    {"name":"Test6", "description":"Test description2 asd", "url":"res/achievements/radu.png"},
    {"name":"Test7", "description":"Test description2 ääöäöäö", "url":"res/achievements/radu.png"},
];

function initAchievements() {

}

function getAchievements() {
    let unlocked = window.localStorage.getItem("unlockedAchievements");
    if(!unlocked) {
        //window.localStorage.setItem(unlockedAchievements,)
    }
    unlocked = JSON.parse(unlocked);

    return unlocked;
}