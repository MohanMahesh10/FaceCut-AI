const OPENCV_JS_URL = 'https://docs.opencv.org/4.x/opencv.js';
const CASCADE_FILE_NAME = 'haarcascade_frontalface_default.xml';
const CASCADE_REMOTE_PATH =
	'https://raw.githubusercontent.com/opencv/opencv/4.x/data/haarcascades/haarcascade_frontalface_default.xml';

type CV = typeof globalThis extends { cv: infer T } ? NonNullable<T> : any;

let cvReady: Promise<CV> | null = null;
let cascadeReady: Promise<void> | null = null;

function ensureBrowser(): void {
	if (typeof globalThis.window === 'undefined' || typeof globalThis.document === 'undefined') {
		throw new TypeError('Face analysis is only available in the browser.');
	}
}

function loadOpenCv(): Promise<CV> {
	ensureBrowser();
	if (cvReady) {
		return cvReady;
	}

	cvReady = new Promise<CV>((resolve, reject) => {
		const runtime = globalThis as typeof globalThis & { cv?: CV };
		if (runtime.cv?.Mat) {
			resolve(runtime.cv);
			return;
		}

		const cleanup = (message: string) => {
			cvReady = null;
			reject(new Error(message));
		};

		const script = globalThis.document!.createElement('script');
		script.src = OPENCV_JS_URL;
		script.async = true;
		script.defer = true;
		script.onerror = () => cleanup('Failed to load OpenCV runtime. Please refresh and try again.');

		const cvNamespace = runtime.cv ?? {};
		cvNamespace.onRuntimeInitialized = () => {
			if (runtime.cv?.Mat) {
				resolve(runtime.cv);
			} else {
				cleanup('OpenCV initialisation failed.');
			}
		};
		runtime.cv = cvNamespace;

		globalThis.document!.body.appendChild(script);
	});

	return cvReady;
}

async function ensureCascade(cv: CV): Promise<void> {
	if (cascadeReady) {
		return cascadeReady;
	}

	cascadeReady = fetch(CASCADE_REMOTE_PATH, { cache: 'force-cache' })
		.then(async (response) => {
			if (!response.ok) {
				throw new Error('Unable to download face detection model.');
			}
			const cascadeData = new Uint8Array(await response.arrayBuffer());
			cv.FS_createDataFile('/', CASCADE_FILE_NAME, cascadeData, true, false, false);
		})
		.catch((error) => {
			cascadeReady = null;
			throw error;
		});

	return cascadeReady;
}

async function createImageElement(blob: Blob): Promise<HTMLImageElement> {
	const objectUrl = URL.createObjectURL(blob);
	try {
		const img = new Image();
		img.src = objectUrl;
		img.crossOrigin = 'anonymous';
		await new Promise<void>((resolve, reject) => {
			img.onload = () => resolve();
			img.onerror = () => reject(new Error('Unable to read the image. Try a different file.'));
		});
		return img;
	} finally {
		URL.revokeObjectURL(objectUrl);
	}
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

function measureFace(cv: CV, img: HTMLImageElement): { faceShape: string } {
	const src = cv.imread(img);
	const gray = new cv.Mat();
	const faces = new cv.RectVector();
	const msize = new cv.Size(0, 0);

	try {
		cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
		const classifier = new cv.CascadeClassifier();
		classifier.load(CASCADE_FILE_NAME);
		classifier.detectMultiScale(gray, faces, 1.1, 5, 0, msize, new cv.Size());

		if (!faces.size()) {
			throw new Error('No face detected. Please try a clearer, front-facing photo.');
		}

		let chosen = faces.get(0);
		for (let i = 1; i < faces.size(); i += 1) {
			const candidate = faces.get(i);
			if (candidate.width * candidate.height > chosen.width * chosen.height) {
				chosen = candidate;
			}
		}

		const faceLength = chosen.height;
		const cheekboneWidth = chosen.width * 0.9;
		const jawlineWidth = chosen.width * 0.85;
		const foreheadWidth = chosen.width * 0.8;

		const faceShape = classifyFaceShape({ faceLength, cheekboneWidth, jawlineWidth, foreheadWidth });
		return { faceShape };
	} finally {
		src.delete();
		gray.delete();
		faces.delete();
		msize.delete();
	}
}

export async function analyzeFaceShape(blob: Blob): Promise<{ faceShape: string }> {
	if (!blob) {
		throw new Error('Please provide an image to analyse.');
	}

	const cv = await loadOpenCv();
	await ensureCascade(cv);
	const imgElement = await createImageElement(blob);

	return measureFace(cv, imgElement);
}

export async function warmupFaceAnalyzer(): Promise<void> {
	const cv = await loadOpenCv();
	await ensureCascade(cv);
}
