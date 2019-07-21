let utils = new Utils('errorMessage');

utils.loadCode('codeSnippet', 'codeEditor');

let cameraLigada = true;
let streaming = false;
let videoInput = document.getElementById('videoInput');
let startAndStop = document.querySelector('aside .startAndStop');
let carregar = document.getElementById('carregar');
let canvasOutput = document.getElementById('canvasOutput');
let canvasContext = canvasOutput.getContext('2d');

function cameraAndVideo(letra) {
    if (letra == 'c') {
        cameraLigada = false;
    } else if (letra == 'v') {
        cameraLigada = true;
    }
}

startAndStop.addEventListener('click', () => {
    if (!streaming) {
        abrirVideo();
        utils.clearError();
        if (!cameraLigada) {
            utils.startCamera('vga', onVideoStarted, 'videoInput');
        } else {
            videoInput.play().then(() => {
                v_onVideoStarted();
            });
        }
    } else {
        fecharVideo();
        if (!cameraLigada) {
            utils.stopCamera();
            onVideoStopped();
        } else {
            videoInput.pause();
            videoInput.currentTime = 0;
            v_onVideoStopped();
        }
    }
});

startAndStop.addEventListener('click', () => {
    if (!streaming) {
        utils.clearError();
    } else {
    }
});

carregar.addEventListener('click', () => {
    abrirVideo();
    utils.clearError();
    if (!cameraLigada) {
        utils.startCamera('vga', onVideoStarted, 'videoInput');
    } else {
        videoInput.play().then(() => {
            v_onVideoStarted();
        });
    }
});

function onVideoStarted() {
    streaming = true;
    startAndStop.innerText = 'Parar';
    startAndStop.style.backgroundColor = "#e43c39";
    videoInput.width = videoInput.videoWidth;
    videoInput.height = videoInput.videoHeight;
    utils.executeCode('codeEditor');
}

function onVideoStopped() {
    streaming = false;
    canvasContext.clearRect(0, 0, canvasOutput.width, canvasOutput.height);
    startAndStop.innerText = 'Começar';
    startAndStop.style.backgroundColor = "#4CAF50";
}

function v_onVideoStarted() {
    streaming = true;
    startAndStop.innerText = 'Parar';
    startAndStop.style.backgroundColor = "#e43c39";
    videoInput.height = videoInput.width * (videoInput.videoHeight / videoInput.videoWidth);
    utils.executeCode('codeEditor');
}

function v_onVideoStopped() {
    streaming = false;
    canvasContext.clearRect(0, 0, canvasOutput.width, canvasOutput.height);
    startAndStop.innerText = 'Começar';
    startAndStop.style.backgroundColor = "#4CAF50";
}

if (!cameraLigada) {
    utils.loadOpenCv(() => {
        startAndStop.removeAttribute('disabled');
    });
} else {
    utils.loadOpenCv(() => {
        videoInput.addEventListener('canplay', () => {
            startAndStop.removeAttribute('disabled');
        });
        videoInput.src = 'video.mp4';
    });
}