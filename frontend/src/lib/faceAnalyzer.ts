import { FaceLandmarker, FilesetResolver, type FaceLandmarkerResult } from '@mediapipe/tasks-vision';

const VISION_TASKS_WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm';
const FACE_LANDMARKER_MODEL =
	'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

type Landmarker = FaceLandmarker;

let landmarkerReady: Promise<Landmarker> | null = null;

function ensureBrowser(): void {
	if (typeof window === 'undefined') {
		throw new TypeError('Face analysis is only available in the browser.');
	}
}

async function createFaceLandmarker(): Promise<Landmarker> {
	ensureBrowser();
	if (landmarkerReady) {
		return landmarkerReady;
	}

	landmarkerReady = (async () => {
		const resolver = await FilesetResolver.forVisionTasks(VISION_TASKS_WASM_URL);
		return FaceLandmarker.createFromOptions(resolver, {
			baseOptions: {
				modelAssetPath: FACE_LANDMARKER_MODEL
			},
			runningMode: 'IMAGE',
			numFaces: 1
		});
	})();

	return landmarkerReady;
}

async function blobToImageBitmap(blob: Blob): Promise<ImageBitmap> {
	ensureBrowser();
	const image = await new Promise<HTMLImageElement>((resolve, reject) => {
		const url = URL.createObjectURL(blob);
		const img = new Image();
		img.onload = () => {
			URL.revokeObjectURL(url);
			resolve(img);
		};
		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error('Unable to read the image. Try a different file.'));
		};
		img.src = url;
		img.crossOrigin = 'anonymous';
	});

	const maxDimension = 720;
	const scale = Math.min(maxDimension / Math.max(image.width, image.height), 1);
	const targetWidth = Math.round(image.width * scale);
	const targetHeight = Math.round(image.height * scale);

	if (scale === 1) {
		return createImageBitmap(image);
	}

	const canvas = document.createElement('canvas');
	canvas.width = targetWidth;
	canvas.height = targetHeight;
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Unable to prepare image for analysis.');
	}
	ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
	return createImageBitmap(canvas);
}

function distance(
	landmarks: NonNullable<FaceLandmarkerResult['faceLandmarks']>[number],
	indexA: number,
	indexB: number,
	width: number,
	height: number
): number {
	const a = landmarks[indexA];
	const b = landmarks[indexB];
	const dx = (a.x - b.x) * width;
	const dy = (a.y - b.y) * height;
	return Math.sqrt(dx * dx + dy * dy);
}

function classifyFaceShape(dimensions: {
	faceLength: number;
	cheekboneWidth: number;
	jawlineWidth: number;
	foreheadWidth: number;
}): string {
	const { faceLength, cheekboneWidth, jawlineWidth, foreheadWidth } = dimensions;
	const aspectRatio = cheekboneWidth > 0 ? faceLength / cheekboneWidth : 0;

	if (aspectRatio > 1.22 && foreheadWidth >= jawlineWidth) {
		return 'Oval';
	}
	if (aspectRatio < 1.12 && cheekboneWidth >= jawlineWidth && cheekboneWidth >= foreheadWidth) {
		return 'Round';
	}
	if (aspectRatio >= 1.1 && aspectRatio <= 1.22 && Math.abs(jawlineWidth - cheekboneWidth) < cheekboneWidth * 0.18) {
		return 'Square';
	}
	if (foreheadWidth > cheekboneWidth && cheekboneWidth > jawlineWidth) {
		return 'Heart';
	}
	if (cheekboneWidth > foreheadWidth && cheekboneWidth > jawlineWidth && jawlineWidth > foreheadWidth * 0.8) {
		return 'Diamond';
	}
	if (aspectRatio >= 1.08 && aspectRatio <= 1.25) {
		return 'Square';
	}

	return 'Other Shape';
}

function analyseLandmarks(
	result: FaceLandmarkerResult,
	frame: { width: number; height: number }
): { faceShape: string } {
	if (!result.faceLandmarks?.length) {
		throw new Error('No face detected. Please try a clearer, front-facing photo.');
	}

	const landmarks = result.faceLandmarks[0];

	const faceLength = distance(landmarks, 10, 152, frame.width, frame.height);
	const cheekboneWidth = distance(landmarks, 234, 454, frame.width, frame.height);
	const jawlineWidth = distance(landmarks, 58, 288, frame.width, frame.height);
	const foreheadWidth = distance(landmarks, 71, 301, frame.width, frame.height);

	const faceShape = classifyFaceShape({ faceLength, cheekboneWidth, jawlineWidth, foreheadWidth });
	return { faceShape };
}

export async function analyzeFaceShape(blob: Blob): Promise<{ faceShape: string }> {
	if (!blob) {
		throw new Error('Please provide an image to analyse.');
	}

	const landmarker = await createFaceLandmarker();
	const bitmap = await blobToImageBitmap(blob);

	try {
		const result = landmarker.detect(bitmap);
		return analyseLandmarks(result, { width: bitmap.width, height: bitmap.height });
	} finally {
		bitmap.close?.();
	}
}

export async function warmupFaceAnalyzer(): Promise<void> {
	await createFaceLandmarker();
}
