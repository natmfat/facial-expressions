// initialize video
const videoWrapper = $(".videoWrapper");
const video = $(".video");
resizeElement(video, videoWrapper.offsetWidth, videoWrapper.offsetHeight);

requestVideo();

const emotionMap = ["Angry", "Disgust", "Fear", "Happy", "Sad", "Surprise", "Neutral"];
const emotionUpdates = createEmotions();

async function requestVideo() {
    if (!navigator.mediaDevices.getUserMedia) {
        return;
    }

    // set up webcam
    const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = videoStream;
}

// initialize canvas
const imageSize = 48;
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
resizeElement(canvas, imageSize, imageSize);

videoWrapper.appendChild(canvas);

async function fetchEmotions() {
    const width = video.videoWidth;
    const height = video.videoHeight;

    const scaledImageSize = 64;
    const newVideoWidth = (width / height) * scaledImageSize;
    ctx.drawImage(video, 0, 0, width, height, (imageSize - newVideoWidth) / 2, (imageSize - scaledImageSize) / 2, newVideoWidth, scaledImageSize);



    const pixels = [];
    const imageData = ctx.getImageData(0, 0, imageSize, imageSize);
    for (let y = 0; y < imageSize; y++) {
        for (let x = 0; x < imageSize; x++) {
            const i = (imageSize * y * 4) + x * 4;
            pixels.push(
                Math.floor((imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3)
            );
        }
    }

    // actually get prediction
    const result = await fetch("/api/predict/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            img: pixels.join(' ')
        })
    }).then(res => res.json());

    if (result.success) {
        const preds = result.predictions;

        let maxIdx = 0;
        let max = preds[0];
        for (let i = 0; i < preds.length; i++) {
            if (preds[i] > max) {
                max = preds[i];
                maxIdx = i;
            }
        }

        for (let i = 0; i < preds.length; i++) {
            const progressBar = emotionUpdates[i];
            progressBar.style.width = `${preds[i] * 100}%`;
            if (i === maxIdx) {
                progressBar.style.backgroundColor = "var(--highlight)";
            } else {
                progressBar.style.backgroundColor = "var(--fade)";
            }
        }
    }
}

function resizeElement(element, width, height) {
    element.width = width;
    element.height = height;
    element.style.width = width + "px";
    element.style.height = height + "px";
}

function createEmotions() {
    const emotionWrapper = $(".emotionWrapper");
    const emotionUpdates = [];

    for (const emotionText of emotionMap) {
        const emotion = h("div", { className: "emotion" },
            emotionText,
            h("div", { className: "emotionProgress" },
                h("div", { className: "emotionProgressBar" })
            )
        );

        emotionWrapper.appendChild(emotion);
        emotionUpdates.push($(emotion, ".emotionProgressBar"));
    }

    return emotionUpdates;
}

let pending = false;
const button = $("button");

button.addEventListener("click", async () => {
    if (pending) {
        return;
    }

    pending = true;
    button.disabled = true;
    await fetchEmotions();
    pending = false;
    button.disabled = false;
});