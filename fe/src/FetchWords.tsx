import React from "react";
import Tokenizer from "./Tokenizer";

const parser = require('xml2json-light');

interface Transcript {
	start: number | string;
	dur: number | string;
	'_@ttribute': string;
}

export default class FetchWords extends React.Component<any, any> {

	timer: any;

	state: {
		error: undefined | string;
		playTime: number;
		transcript: Transcript[];
		words: {
			source: string;
			translation: string;
		}[],
	} = {
		error: undefined,
		playTime: 0,
		transcript: [],
		words: [],
	};

	componentDidMount() {
		this.timer = setInterval(this.updatePlayTime.bind(this), 100);
		this.fetchCC();
	}

	componentWillUnmount() {
		clearInterval(this.timer);
	}

	updatePlayTime() {
		if (!this.props.player) {
			return;
		}
		if (!('getCurrentTime' in this.props.player)) {
			return;
		}
		this.setState({
			playTime: this.props.player.getCurrentTime(),
		});
	}

	async fetchCC() {
		const ccURL = 'https://video.google.com/timedtext?lang=en&v=' + encodeURIComponent(this.props.youtubeID);
		const res = await fetch(ccURL);
		if (res.status !== 200) {
			return this.setState({
				error: res.statusText,
			});
		}
		const xml = await res.text();
		// console.log(xml);
		const json = parser.xml2json(xml);
		this.setState({
			transcript: json.transcript.text,
		});
		this.tokenize(json.transcript.text);
	}

	async tokenize(text: Transcript[]) {
		const t = new Tokenizer(text.map(line => line['_@ttribute']));
		const terms = await t.getTerms();
		this.setState({
			words: terms,
		});
	}

	render() {
		let message = this.state.transcript.find((el: Transcript) => {
			let start = parseFloat(el.start.toString());
			let dur = parseFloat(el.dur.toString());
			return start < this.state.playTime
				&& (start + dur) > this.state.playTime;
		});
		return (
			<div><p className="lead">
				{message ? message['_@ttribute'] : '...'}
			</p>
				<p className="lead">
					YouTube ID: {this.props.youtubeID}
				</p>
				<p className="lead">
					Play Time: {this.state.playTime}
				</p>
			</div>);
	}

}
