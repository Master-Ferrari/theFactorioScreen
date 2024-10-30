// blueprints.ts
// import pako from 'pako';

// declare const pako: typeof import('pako');

// import { lol } from './gifDecoder.js';
// console.log(lol());
// import { myGif } from './gifDecoder.js';
import CanvasManager from "./gifDecoder.js";
const canvasManager = CanvasManager.getInstance();

import jsonToBlueprint from "./blueprintEncoder.js";

// Функция для получения массива пикселей одного кадра
// function getFrameBitmap(frame: any, width: number, height: number): number[][] {
//     // Создаем временный канвас для изменения размера кадра
//     let offCanvas = document.createElement('canvas');
//     offCanvas.width = width;
//     offCanvas.height = height;
//     let offCtx = offCanvas.getContext('2d') as CanvasRenderingContext2D;

//     // Рисуем кадр на канвасе с изменением размера
//     offCtx.drawImage(frame.image, 0, 0, width, height);

//     // Получаем данные изображения
//     let imageData = offCtx.getImageData(0, 0, width, height);
//     let data = imageData.data;

//     let pixels: number[][] = [];

//     // Преобразуем данные в массив пикселей
//     for (let i = 0; i < data.length; i += 4) {
//         let r = data[i];
//         let g = data[i + 1];
//         let b = data[i + 2];
//         pixels.push([r, g, b]);
//     }

//     return pixels;
// }

// Функция для получения данных всех кадров GIF
// function getGifBitmap(gif: any, width: number, height: number, frameCount: number): number[][][] {
//     let totalFrames = gif.frames.length;
//     let framesToProcess = Math.min(frameCount, totalFrames);
//     let framesData: number[][][] = [];

//     // Вычисляем шаг для равномерного выбора кадров
//     let step = totalFrames / framesToProcess;

//     // Обрабатываем каждый выбранный кадр и добавляем его данные в framesData
//     for (let i = 0; i < framesToProcess; i++) {
//         let frameIndex = Math.floor(i * step);
//         if (frameIndex >= totalFrames) {
//             frameIndex = totalFrames - 1;
//         }
//         let frame = gif.frames[frameIndex];
//         let frameData = getFrameBitmap(frame, width, height);
//         framesData.push(frameData);
//     }

//     return framesData;
// }

// type Bitmap = number[][];
// type FrameBitmap = { width: number, height: number, bimap: Bitmap };
// type GifBitmap = { width: number, height: number, framesCount: number, fps: number, frames: Bitmap[] };

// Функция для создания заголовка чертежа
function blueprintTitle(entities: any[]): any {
    return {
        blueprint: {
            icons: [
                {
                    signal: {
                        name: "small-lamp"
                    },
                    index: 1
                }
            ],
            entities: entities,
            item: "blueprint",
            version: 562949954076673
        }
    };
}

// Функция для создания простой лампы
function simpleLamp(index: number, x: number, y: number, r: number, g: number, b: number): any {
    return {
        entity_number: index,
        name: "small-lamp",
        position: {
            x: x,
            y: y
        },
        color: {
            r: r / 255,
            g: g / 255,
            b: b / 255,
            a: 1
        },
        always_on: true
    };
}

document.getElementById('makePhotoBlueprint')?.addEventListener('click', function () {
    const width = parseInt((document.getElementById('widthInput') as HTMLInputElement).value, 10);
    const height = parseInt((document.getElementById('heightInput') as HTMLInputElement).value, 10);
    const fps = parseInt((document.getElementById('frameRateInput') as HTMLInputElement).value, 10);
    const frameCount = parseInt((document.getElementById('frameCountInput') as HTMLInputElement).value, 10);
    const currentFrame = parseInt((document.getElementById('frameInput') as HTMLInputElement).value, 10);

    // Предполагается, что myGif определен в другом файле и доступен глобально
    // let frame = (window as any).myGif.frames[currentFrame];
    // let frameData = getFrameBitmap(frame, width, height);

    console.log("currentFrame", currentFrame);
    let frameData = canvasManager.getFrameBitmap(currentFrame);

    console.log("frameData.width", frameData.width);

    let lamps: any[] = [];
    for (let i = 0; i < frameData.bitmap.length; i++) {
        const x = (i % frameData.width) + 0.5;
        const y = Math.floor(i / frameData.width) + 0.5;
        const [r, g, b] = frameData.bitmap[i];
        lamps.push(simpleLamp(i + 1, x, y, r, g, b));
    }

    let outputData = blueprintTitle(lamps);

    const textOutput = document.getElementById('textOutput') as HTMLTextAreaElement;

    console.log("lamps", lamps);

    textOutput.value = jsonToBlueprint(JSON.stringify(outputData));
});

document.getElementById('makeVideoBlueprint')?.addEventListener('click', function () {
    const width = parseInt((document.getElementById('widthInput') as HTMLInputElement).value, 10);
    const height = parseInt((document.getElementById('heightInput') as HTMLInputElement).value, 10);
    const fps = parseInt((document.getElementById('frameRateInput') as HTMLInputElement).value, 10);
    const frameCount = parseInt((document.getElementById('frameCountInput') as HTMLInputElement).value, 10);

    // Предполагается, что myGif определен в другом файле и доступен глобально
    // let framesData = getGifBitmap((window as any).myGif, width, height, frameCount);
    let framesData = canvasManager.getGifBitmap();

    // let outputData = {
    //     width: framesData.width,
    //     height: framesData.height,
    //     framesCount: framesData.framesCount,
    //     fps: framesData.fps,
    //     frames: framesData.frames
    // };

    const textOutput = document.getElementById('textOutput') as HTMLTextAreaElement;
    textOutput.value = JSON.stringify(framesData);
});

document.getElementById('copyButton')?.addEventListener('click', function () {
    const textOutput = document.getElementById('textOutput') as HTMLTextAreaElement;
    textOutput.select();    // Выделяем текст
    document.execCommand('copy');    // Копируем текст
    textOutput.setSelectionRange(0, 0); // Убираем выделение
});
