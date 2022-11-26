const videoElement = document.getElementById('input_video');
const landmarkVisibility = document.getElementById('landmarkVisibility');
const loading = document.getElementById("loading");
const info = document.getElementById("info");
const playGameButton = document.getElementById("playGame");
const gameInfo = document.getElementById("gameInfo");
const displayCombo = document.getElementById("combo");
const displayNumCorrect = document.getElementById("numCorrect");
const displayNumIncorrect = document.getElementById("numIncorrect");
const comboInfo = document.getElementById("comboInfo");

let landmarks;
let jab_stage;
let stance = "Orthodox"
let jab_counter = 0;
let straight_stage;
let straight_counter = 0;
let off_vs_def_text;

let gameOn = false
let globalStartTime;
let startTime;
let endTime;
let timeForCombo;
let frameCounter = 0
let randomFrameNumber = randomInteger(30, 60);

let combo = ''
let combos = {
    1: "1",
    2: "2",
    3: "1,2"
}

let jab_counter_for_game = 0;
let straight_counter_for_game = 0;


let numberOfCorrect = 0
let numberOfIncorrect = 0


playGameButton.addEventListener('click', () => {
    frameCounter = 0;
    if (gameOn) {
        gameOn = false
        playGameButton.innerHTML = "Play Game?"
        gameInfo.style.visibility = "hidden"
        comboInfo.style.visibility = "hidden"
        endGame();
        videoElement.style.marginTop = "-12em";
    }
    else {
        gameOn = true
        playGameButton.innerHTML = "End Game?"
        gameInfo.style.visibility = "visible"
        comboInfo.style.visibility = "visible"
        videoElement.style.marginTop = "0";
    }
})



function calculate_angle(a, b, c) {
    let radians = Math.atan2(c[1] - b[1], c[0] - b[0]) - Math.atan2(a[1] - b[1], a[0] - b[0]);
    let angle = Math.abs(radians * 180.0 / Math.PI)

    if (angle > 180.0) {
        angle = 360 - angle;
    }
    return angle
}

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function onResults(results) {
    if (!results.poseLandmarks) {
        console.log("this hit")
        return;
    }

    let r_wrist = [(results.poseLandmarks[16].x), (results.poseLandmarks[16].y)];
    let l_wrist = [(results.poseLandmarks[15].x), (results.poseLandmarks[15].y)];
    let r_elbow = [(results.poseLandmarks[14].x), (results.poseLandmarks[14].y)];
    let l_elbow = [(results.poseLandmarks[13].x), (results.poseLandmarks[13].y)];
    let r_shoulder = [(results.poseLandmarks[12].x), (results.poseLandmarks[12].y)];
    let l_shoulder = [(results.poseLandmarks[11].x), (results.poseLandmarks[11].y)];
    let r_hip = [(results.poseLandmarks[24].x), (results.poseLandmarks[24].y)];
    let l_hip = [(results.poseLandmarks[23].x), (results.poseLandmarks[23].y)];
    let r_pinky = [(results.poseLandmarks[18].x), (results.poseLandmarks[18].y)];
    let l_pinky = [(results.poseLandmarks[17].x), (results.poseLandmarks[17].y)];
    let nose = [(results.poseLandmarks[0].x), (results.poseLandmarks[0].y)];
    let l_mouth = [(results.poseLandmarks[9].x), (results.poseLandmarks[9].y)];
    let r_mouth = [(results.poseLandmarks[10].x), (results.poseLandmarks[10].y)];

    neededVisibilityPoints = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18]

    function checkIfVisible(points) {
        for (let point of points) {
            if (results.poseLandmarks[point].visibility > .4) {
            }
            else {
                landmarkVisibility.innerHTML = "Please step back a bit and into frame!"
                landmarkVisibility.style.backgroundColor = "Black"
                landmarkVisibility.style.color = "red"
                return false
            }
        }
        landmarkVisibility.innerHTML = ""
        return true
    }

    checkIfVisible(neededVisibilityPoints)

    // get angles
    angle_left_elbow = calculate_angle(l_shoulder, l_elbow, l_wrist)
    angle_right_elbow = calculate_angle(r_shoulder, r_elbow, r_wrist)
    angle_rhip_rshoulder_rwrist = calculate_angle(r_hip, r_shoulder, r_wrist)
    angle_lhip_lshoulder_lwrist = calculate_angle(l_hip, l_shoulder, l_wrist)


    // left punch logic 
    if (angle_left_elbow < 70) {
        if (l_pinky[1] < l_shoulder[1]) {
            jab_stage = "Defense"
        }
    }
    if (angle_left_elbow > 110 && jab_stage === "Defense") {
        if (angle_lhip_lshoulder_lwrist > 70) {
            if (angle_right_elbow < 40) {
                if (stance == "Orthodox") {
                    jab_stage = "Offense"
                    jab_counter += 1
                    jab_counter_for_game += 1
                }
            }
        }
    }

    // right punch logic 
    if (angle_right_elbow < 70) {
        if (r_pinky[1] < r_shoulder[1]) {
            straight_stage = "Defense"
        }
    }
    if (angle_right_elbow > 110 && straight_stage === "Defense") {
        if (angle_rhip_rshoulder_rwrist > 60) {
            if (angle_left_elbow < 40) {
                if (stance == "Orthodox") {
                    straight_stage = "Offense"
                    straight_counter += 1
                    straight_counter_for_game += 1
                }
            }
        }
    }

    document.getElementById("jabNum").innerText = jab_counter;
    document.getElementById("straightNum").innerText = straight_counter;



    if (angle_left_elbow < 50 && angle_right_elbow < 50) {
        if (l_pinky[1] < l_mouth[1] && r_pinky[1] < r_mouth[1]) {
            off_vs_def_text = "Defense"
            document.getElementById("input_video").style.border = "rgba(25, 101, 255, 0.987) solid 30px"
        }
    }
    else if (angle_right_elbow > 110 || angle_left_elbow > 110) {
        if (angle_rhip_rshoulder_rwrist > 70 || angle_lhip_lshoulder_lwrist > 70) {
            off_vs_def_text = "Offense"
            document.getElementById("input_video").style.border = "red solid 30px"
        }
    }
    else if (l_pinky[1] > l_mouth[1] || r_pinky[1] > r_mouth[1]) {
        document.getElementById("input_video").style.border = "none"
    }
    else {
        document.getElementById("input_video").style.border = "none"
    }



    loading.innerHTML = ''
    videoElement.style.visibility = "visible"
    info.style.visibility = "visible"

    if (gameOn) {
        timingGame()
    }
    frameCounter += 1

}

const pose = new Pose({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
    }
});
pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: true,
    smoothSegmentation: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});
pose.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await pose.send({ image: videoElement });
    },
    width: 1280,
    height: 720
});
camera.start();



function timingGame(difficulty = 2) {
    if (frameCounter > randomFrameNumber) {
        // provide a combo
        if (combo === '') {
            combo = combos[randomInteger(1, 3)]
            displayCombo.innerHTML = combo
            playSound(combo)
        }
        // set start timer for the combo
        if (combo && !startTime) {
            startTime = new Date().getTime() / 1000
        }
    }
    if (comboToLogic(combo) === true) {
        endTime = new Date().getTime() / 1000;
        timeForCombo = Number(endTime - startTime).toFixed(2)
        if (timeForCombo < difficulty) {
            playSound("correct")
            numberOfCorrect += 1
            displayNumCorrect.innerHTML = numberOfCorrect
        }
        if (timeForCombo > difficulty) {
            playSound("correct")
            numberOfIncorrect += 1
            displayNumIncorrect.innerHTML = numberOfIncorrect


        }
        endGame();
    }
}

function comboToLogic(argument) {
    switch (argument) {
        case "1":
            if (jab_counter_for_game === 1 && !endTime) {
                return true
            }
        case "2":
            if (straight_counter_for_game === 1 && !endTime) {
                return true
            }
        case "1,2":
            if (jab_counter_for_game === 1 && straight_counter_for_game === 1 && !endTime) {
                return true
            }
            if (jab_counter_for_game >= 2) {
                jab_counter_for_game = 0
            }
            if (straight_counter_for_game >= 2) {
                straight_counter_for_game = 0
            }
        default:
            return false;
    }
}

function playSound(combo) {
    let audio
    switch (combo) {
        case "1":
            audio = new Audio("jab.mp3");
            audio.play();
            break;
        case "2":
            audio = new Audio("cross.mp3");
            audio.play();
            break;
        case "1,2":
            audio = new Audio("12.mp3");
            audio.play();
            break;
        case "correct":
            audio = new Audio("correct.mp3");
            audio.play();
            break;
        case "incorrect":
            audio = new Audio("incorrect.mp3");
            audio.play();
            break;
        default:
            console.log("no audio")
    }
}

function endGame() {
    frameCounter = 0
    combo = ''
    displayCombo.innerHTML = combo
    startTime = undefined
    endTime = undefined
    jab_counter_for_game = 0
    straight_counter_for_game = 0
    randomFrameNumber = randomInteger(30, 60);
}