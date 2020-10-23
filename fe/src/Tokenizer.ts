import * as _ from 'lodash';

const words5000 = require(__dirname + '/5000words');

const natural = require('natural');

export async function progress(iterable: Promise<any>[], onprogress: Function) {
	// consume iterable synchronously and convert to array of promises
	const promises = Array.from(iterable).map(Promise.resolve, Promise);
	let resolved = 0;

	// helper function for emitting progress events
	const progress = (increment: number) => Promise.resolve(
		onprogress(
			new ProgressEvent('progress', {
				total: promises.length,
				loaded: resolved += increment
			})
		)
	);

	// lift all progress events off the stack
	await Promise.resolve();
	// emit 0 progress event
	await progress(0);

	// emit a progress event each time a promise resolves
	return Promise.all(
		promises.map(
			promise => promise.finally(
				() => progress(1)
			)
		)
	);
}


export default class Tokenizer {

	constructor(protected sentences: string[]) {
	}

	getTerms() {
		const tokenizer = new natural.WordTokenizer();
		const splitSent = this.sentences.map(line => tokenizer.tokenize(line));
		const words = splitSent.flat();
		const uniq = _.uniq(words);
		// const stems = uniq.map((word: string) => natural.PorterStemmer.stem(word));
		// const uStems = _.uniq(stems)
		const special = uniq.filter((word: string) => !words5000.includes(word));
		const moreThanOneChar = special.filter((word: string) => word.length > 2);
		return moreThanOneChar;
	}

	translate(words: string[]) {
		const promises = words.map((word: string) => this.fetchOneWord);
		return promises;
	}

	async fetchOneWord(word: string) {
		const url = 'http://127.0.0.1:5000/pons?word=';
		const res = await fetch(url + encodeURIComponent(word));
		const json = await res.json();
		return json.trans;
	}

}
