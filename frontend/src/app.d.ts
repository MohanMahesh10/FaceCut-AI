// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module '@mediapipe/tasks-vision' {
	export interface NormalizedLandmark {
		x: number;
		y: number;
		z: number;
	}

	export interface FaceLandmarkerResult {
		faceLandmarks?: NormalizedLandmark[][];
	}

	export interface FaceLandmarkerOptions {
		baseOptions: {
			modelAssetPath: string;
		};
		runningMode: 'IMAGE' | 'VIDEO';
		numFaces?: number;
	}

	export class FilesetResolver {
		static forVisionTasks(basePath: string): Promise<FilesetResolver>;
	}

	export class FaceLandmarker {
		static createFromOptions(resolver: FilesetResolver, options: FaceLandmarkerOptions): Promise<FaceLandmarker>;
		detect(image: ImageBitmap | HTMLCanvasElement | HTMLImageElement | ImageData): FaceLandmarkerResult;
		close(): void;
	}
}

export {};
