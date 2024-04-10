
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
        await faceapi.nets.tinyFaceDetector.loadFromDisk('./node_modules/face-api.js/models');
        await faceapi.nets.faceRecognitionNet.loadFromDisk('./node_modules/face-api.js/models');
        await faceapi.nets.faceLandmark68Net.loadFromDisk('./node_modules/face-api.js/models');

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
