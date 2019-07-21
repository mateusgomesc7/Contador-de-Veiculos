let video = document.getElementById('videoInput'); // Guarda local do vídeo
let cap = new cv.VideoCapture(video); // Captura o vídeo
let src = new cv.Mat(video.height, video.width, cv.CV_8UC4); // Cria matriz com mesmas dimensões do vídeo
let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1); // Cria matriz com mesmas dimensões do vídeo
let mostrarQuant = document.getElementById('mostrarQuant'); // Guarda local de contagem

const pos_linha = 275; // Posição da linha no eixo Y

let largura_min = 40; // Largura mínima do retângulo
let altura_min = 40; // Altura mínima do retângulo

let offset = 4; // Correção de erros

let carros = 0; // Contador de veículos

function pega_centro(x, y, w, h) {
    let x1 = Math.round(w / 2);
    let y1 = Math.round(h / 2);
    Cx = x + x1;
    Cy = y + y1;
    let valor = [Cx, Cy];
    return valor;
}

// Para subtração de fundo
let subtracao = new cv.BackgroundSubtractorMOG2(500, 16, false);

const FPS = 60;
function processVideo() {
    try {
        if (!streaming) {
            // clean and stop.
            src.delete(); dst.delete(); gray.delete(); blur.delete(); ksize.delete();
            img_sub.delete(); kernel.delete(); dilatada.delete(); anchor.delete();
            erodita.delete(); contours.delete(); hierarchy.delete(); hull.delete();
            pontoInicial.delete(); pontoFinal.delete(); cnt.delete(); subtracao.delete();
            return;
        }
        let begin = Date.now();
        // start processing.
        cap.read(src);

        let gray = new cv.Mat();
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        
        let blur = new cv.Mat();
        let ksize = new cv.Size(3, 3);
        cv.GaussianBlur(gray, blur, ksize, 0, 0, cv.BORDER_DEFAULT);
        
        // Método para obter a máscara de primeiro plano
        let img_sub = new cv.Mat();
        subtracao.apply(blur, img_sub);
        
        let dilatada = new cv.Mat();
        let kernel = cv.Mat.ones(5, 5, cv.CV_8U);
        let anchor = new cv.Point(-1, -1);
        cv.dilate(img_sub, dilatada, kernel, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
        
        let erodita = new cv.Mat();
        cv.erode(dilatada, erodita, kernel, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
        cv.erode(erodita, erodita, kernel, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
       
        // Encontra contornos
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        let hull = new cv.MatVector();
        cv.findContours(erodita, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
       
        // Desenha linha de chegada
        let pontoInicial = new cv.Point(25, pos_linha);
        let pontoFinal = new cv.Point(600, pos_linha);
        cv.line(src, pontoInicial, pontoFinal, [0, 255, 0, 255], 3);

        let cnt = 0;
        for (let i = 0; i < contours.size(); i++) {
            cnt = contours.get(i);
            // You can try more different parameters
            let rect = cv.boundingRect(cnt);
            let validar_retângulo = (rect.width >= largura_min) && (rect.height >= altura_min);
            if (validar_retângulo) {
                //Desenhar retângulo
                let contoursColor = new cv.Scalar(255, 255, 255);
                let rectangleColor = new cv.Scalar(255, 0, 0);
                //cv.drawContours(erodita, contours, i, contoursColor, 1, 8, hierarchy, 100);
                let point1 = new cv.Point(rect.x, rect.y);
                let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
                cv.rectangle(src, point1, point2, rectangleColor, 2, cv.LINE_AA, 0);

                //Desenhar circulo no centro
                let centro = pega_centro(rect.x, rect.y, rect.width, rect.height);
                let point3 = new cv.Point(centro[0], centro[1]);
                cv.circle(src, point3, 5, [255, 0, 0, 255], -1, cv.LINE_AA, 0);

                // Verifica se o carro está na linha
                if (centro[1] < (pos_linha + offset) && centro[1] > (pos_linha - offset)) {
                    carros = 1 + carros;
                    cv.line(src, pontoInicial, pontoFinal, [255, 50, 0, 255], 3);
                    mostrarQuant.innerHTML = carros;
                    // console.log(carros);
                }

            }
        }

        cv.imshow('canvasOutput', src);
        // schedule the next one.
        let delay = 1000 / FPS - (Date.now() - begin);
        setTimeout(processVideo, delay);
    } catch (err) {
        utils.printError(err);
    }
};

// schedule the first one.
setTimeout(processVideo, 0);

//************************************************************************
/*  let video = document.getElementById('videoInput');
let cap = new cv.VideoCapture(video);

// take first frame of the video
let frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
cap.read(frame);

// hardcode the initial location of window
let trackWindow = new cv.Rect(150, 60, 63, 125);

// set up the ROI for tracking
let roi = frame.roi(trackWindow);
let hsvRoi = new cv.Mat();
cv.cvtColor(roi, hsvRoi, cv.COLOR_RGBA2RGB);
cv.cvtColor(hsvRoi, hsvRoi, cv.COLOR_RGB2HSV);
let mask = new cv.Mat();
let lowScalar = new cv.Scalar(30, 30, 0);
let highScalar = new cv.Scalar(180, 180, 180);
let low = new cv.Mat(hsvRoi.rows, hsvRoi.cols, hsvRoi.type(), lowScalar);
let high = new cv.Mat(hsvRoi.rows, hsvRoi.cols, hsvRoi.type(), highScalar);
cv.inRange(hsvRoi, low, high, mask);
let roiHist = new cv.Mat();
let hsvRoiVec = new cv.MatVector();
hsvRoiVec.push_back(hsvRoi);
cv.calcHist(hsvRoiVec, [0], mask, roiHist, [180], [0, 180]);
cv.normalize(roiHist, roiHist, 0, 255, cv.NORM_MINMAX);

// delete useless mats.
roi.delete(); hsvRoi.delete(); mask.delete(); low.delete(); high.delete(); hsvRoiVec.delete();

// Setup the termination criteria, either 10 iteration or move by atleast 1 pt
let termCrit = new cv.TermCriteria(cv.TERM_CRITERIA_EPS | cv.TERM_CRITERIA_COUNT, 10, 1);

let hsv = new cv.Mat(video.height, video.width, cv.CV_8UC3);
let hsvVec = new cv.MatVector();
hsvVec.push_back(hsv);
let dst = new cv.Mat();
let trackBox = null;

const FPS = 30;
function processVideo() {
    try {
        if (!streaming) {
            // clean and stop.
            frame.delete(); dst.delete(); hsvVec.delete(); roiHist.delete(); hsv.delete();
            return;
        }
        let begin = Date.now();

        // start processing.
        cap.read(frame);
        cv.cvtColor(frame, hsv, cv.COLOR_RGBA2RGB);
        cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);
        cv.calcBackProject(hsvVec, [0], roiHist, dst, [0, 180], 1);

        // apply camshift to get the new location
        [trackBox, trackWindow] = cv.CamShift(dst, trackWindow, termCrit);

        // Draw it on image
        let pts = cv.rotatedRectPoints(trackBox);
        cv.line(frame, pts[0], pts[1], [255, 0, 0, 255], 3);
        cv.line(frame, pts[1], pts[2], [255, 0, 0, 255], 3);
        cv.line(frame, pts[2], pts[3], [255, 0, 0, 255], 3);
        cv.line(frame, pts[3], pts[0], [255, 0, 0, 255], 3);
        cv.imshow('canvasOutput', frame);

        // schedule the next one.
        let delay = 1000/FPS - (Date.now() - begin);
        setTimeout(processVideo, delay);
    } catch (err) {
        utils.printError(err);
    }
};

// schedule the first one.
setTimeout(processVideo, 0);*/