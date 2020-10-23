import React from "react";
import {Transcript} from "./FetchWords";
import Tokenizer, {progress} from "./Tokenizer";
import Karaoke from "./Karaoke";

interface LyricsProps {
	transcript: Transcript[];
	playTime: number;
}

interface State {
	progress: number;
	translations: Record<string, string>;
}

export default class Lyrics extends React.Component<LyricsProps, any> {

	state: State = {
		progress: 0,
		translations: {},
	};

	componentDidMount() {
		if (this.props.transcript.length) {
			this.tokenizeAndTranslate();
		}
	}

	componentDidUpdate(prevProps: LyricsProps) {
		// console.log('componentDidUpdate', this.props.transcript);
		if (!prevProps.transcript.length && this.props.transcript.length) {
			this.tokenizeAndTranslate();
		}
	}

	async tokenizeAndTranslate() {
		const t = new Tokenizer(this.props.transcript.map((el: Transcript) => el["_@ttribute"]));
		const words = t.getTerms();
		const results = await progress(t.translate(words), (progress: ProgressEvent) => {
			// console.log(progress.loaded, '/', progress.total);
			const percent = progress.loaded / progress.total * 100;
			this.setState({
				progress: percent,
			});
		});

		const translations: Record<string, string> = {};
		results.map((el: any, index: number) => {
			// console.log(el);
			if (!el) {
				return;
			}
			console.log(el);
			const word: string = words[index];
			translations[word] = el;
		});
		console.log(translations);

		this.setState({
			words: translations,
		});
	}

	render() {
		if (this.state.progress < 100) {
			return <progress max={100} value={this.state.progress} style={{
				width: '100%'
			}}/>;
		}
		return (
			<div style={{
				position: 'absolute',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
			}}>
				<Karaoke playTime={this.props.playTime}
								 translations={this.state.translations}
								 transcript={this.props.transcript}/>
				{/*<p className="lead">*/}
				{/*	Play Time: {this.props.playTime}*/}
				{/*</p>*/}
			</div>);
	}

}
