const videoElement = document.getElementById('input_video');
const landmarkVisibility = document.getElementById('landmarkVisibility');
const loading = document.getElementById("loading");

let landmarks;
let jab_stage;
let stance = "Orthodox"
let jab_counter = 0;
let straight_stage;
let straight_counter = 0;
let off_vs_def_text;

function calculate_angle(a, b, c) {
    let radians = Math.atan2(c[1] - b[1], c[0] - b[0]) - Math.atan2(a[1] - b[1], a[0] - b[0]);
    let angle = Math.abs(radians * 180.0 / Math.PI)

    if (angle > 180.0) {
        angle = 360 - angle;
    }
    return angle
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
    if (angle_left_elbow < 60) {
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
                }
            }
        }
    }

    // right punch logic 
    if (angle_right_elbow < 60) {
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
