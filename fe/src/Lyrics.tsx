import React from "react";
import {Transcript} from "./FetchWords";
import Tokenizer, {progress} from "./Tokenizer";

interface LyricsProps {
	transcript: Transcript[];
	playTime: number;
}

interface State {
	progress: number;
	words: {
		source: string;
		translation: string;
	}[];
}

export default class Lyrics extends React.Component<LyricsProps, any> {

	state: State = {
		progress: 0,
		words: []
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
		this.setState({
			words: results,
		});
	}

	render() {
		let message = this.props.transcript.find((el: Transcript) => {
			let start = parseFloat(el.start.toString());
			let dur = parseFloat(el.dur.toString());
			return start < this.props.playTime
				&& (start + dur) > this.props.playTime;
		});
		if (this.state.progress < 100) {
			return <progress max={100} value={this.state.progress} style={{
				width: '100%'
			}}/>;
		}
		return (
			<div><p className="lead">
				{message ? message['_@ttribute'] : '...'}
			</p>
				<p className="lead">
					Play Time: {this.props.playTime}
				</p>
			</div>);
	}

}
