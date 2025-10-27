export interface HaircutOption {
	name: string;
	image: string;
	description: string;
}

const catalog: Record<string, HaircutOption[]> = {
	Oval: [
		{
			name: 'Classic Bob',
			image: 'https://dummyimage.com/300x300/5a4fcf/ffffff&text=Classic+Bob',
			description: 'A timeless and versatile cut.'
		},
		{
			name: 'Pixie Cut',
			image: 'https://dummyimage.com/300x300/5a4fcf/ffffff&text=Pixie+Cut',
			description: 'Short and stylish.'
		}
	],
	Round: [
		{
			name: 'Long Layers',
			image: 'https://dummyimage.com/300x300/5a4fcf/ffffff&text=Long+Layers',
			description: 'Adds definition and length.'
		},
		{
			name: 'Side-Swept Bangs',
			image: 'https://dummyimage.com/300x300/5a4fcf/ffffff&text=Side+Swept+Bang',
			description: 'Helps to slim the face.'
		}
	],
	Square: [
		{
			name: 'Angular Bob',
			image: 'https://dummyimage.com/300x300/5a4fcf/ffffff&text=Angular+Bob',
			description: 'Softens the jawline.'
		},
		{
			name: 'Layered Cut',
			image: 'https://dummyimage.com/300x300/5a4fcf/ffffff&text=Layered+Cut',
			description: 'Adds softness around the face.'
		}
	],
	Heart: [
		{
			name: 'Chin-Length Bob',
			image: 'https://dummyimage.com/300x300/5a4fcf/ffffff&text=Chin+Length+Bob',
			description: 'Balances a wider forehead.'
		}
	],
	Diamond: [
		{
			name: 'Textured Lob',
			image: 'https://dummyimage.com/300x300/5a4fcf/ffffff&text=Textured+Lob',
			description: 'Softens angular features.'
		}
	],
	'Other Shape': [
		{
			name: 'Consult Stylist',
			image: 'https://dummyimage.com/300x300/5a4fcf/ffffff&text=Consult+Stylist',
			description: 'Try a personalized consultation.'
		}
	]
};

export function findHaircutsForShape(faceShape: string): HaircutOption[] {
	const normalized = faceShape?.trim() ?? '';
	return catalog[normalized] ?? catalog['Other Shape'];
}

export function supportedFaceShapes(): string[] {
	return Object.keys(catalog);
}
