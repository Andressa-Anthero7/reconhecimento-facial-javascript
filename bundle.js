(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

const video = document.getElementById('video');
const captureButton = document.getElementById('captureButton');
const loginButton = document.getElementById('loginButton');

async function setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser não suporta acesso à câmera');
    }

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
}

async function extractFaceDescriptors(image) {
    try {
        console.log('Iniciando extração de descritores faciais...');
        // Carregar os modelos necessários da face-api.js
        await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js/models');

        // Detectar rostos na imagem
        const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();

        // Extrair os descritores faciais para cada rosto detectado
        const faceDescriptors = detections.map(detection => detection.descriptor);

        console.log('Extração de descritores faciais concluída com sucesso.');
        return faceDescriptors;
    } catch (error) {
        console.error('Erro ao extrair descritores faciais:', error);
        throw error;
    }
}

async function compareDescriptors(cameraDescriptors, referenceDescriptors) {
    try {
        console.log('Iniciando comparação de descritores faciais...');
        // Comparar os descritores faciais extraídos da câmera com os descritores de referência
        const faceMatcher = new faceapi.FaceMatcher(referenceDescriptors);
        const bestMatch = faceMatcher.findBestMatch(cameraDescriptors[0]);

        console.log('Comparação de descritores faciais concluída com sucesso.');
        return bestMatch;
    } catch (error) {
        console.error('Erro ao comparar descritores faciais:', error);
        throw error;
    }
}


captureButton.addEventListener('click', async () => {
    try {
        // Capturar um quadro do vídeo
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const capturedImage = await faceapi.createCanvasFromMedia(canvas);
        alert(capturedImage)

        // Extrair descritores faciais da imagem capturada
        const cameraDescriptors = await extractFaceDescriptors(capturedImage);

        // Carregar descritores faciais da imagem de referência (Andressa)
        const referenceDescriptors = await extractFaceDescriptors('andressa-2.jpg');

        // Comparar os descritores faciais
        const match = await compareDescriptors(cameraDescriptors, referenceDescriptors);

        // Exibir resultado do login
        if (match.label === 'andressa') {
            alert('Login bem-sucedido! Bem-vindo, Andressa.');
        } else {
            alert('Login falhou. Rosto não reconhecido.');
        }
    } catch (error) {
        alert('Erro ao extrair ou comparar descritores faciais:', error);
        alert('Erro ao realizar o login. Por favor, tente novamente.');
    }
});

setupCamera();

},{}]},{},[1]);
