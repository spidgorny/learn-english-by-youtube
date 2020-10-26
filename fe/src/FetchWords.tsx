import React from "react";
import MyTokenizer from "./MyTokenizer";
import Lyrics from "./Lyrics";
import * as _ from 'lodash';

const parser = require('xml2json-light');

export interface Transcript {
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
	} = {
		error: undefined,
		playTime: 20,
		transcript: [],
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
		let xml = await res.text();
		// \n will be eaten by xml2json, need to fix in advance
		xml = xml.replaceAll(/\n/g, ' ');
		// console.log(xml);
		const json = parser.xml2json(xml);
		const sentences = json.transcript.text.map((line: Transcript) => {
			let text = line['_@ttribute'];
			text = text.replaceAll(/\n/g, ' ')
				.replaceAll('&amp;', '&')
				.replaceAll('&gt;', '>')
				.replaceAll('&lt;', '<');
			text = _.unescape(text);
			if (text.startsWith('Welcome')) {
				console.log(line['_@ttribute'], '=>', text);
			}
			line['_@ttribute'] = text;
			return line;
		});
		this.setState({
			transcript: sentences,
		});
		this.tokenizeText(json.transcript.text);
	}

	async tokenizeText(text: Transcript[]) {
		const t = new MyTokenizer(text.map(line => line['_@ttribute']));
		const terms = await t.getTerms();
		this.setState({
			words: terms,
		});
	}

	render() {
		if (this.state.error) {
			return <div className="alert alert-danger">
				{this.state.error}
			</div>;
		}

		return <Lyrics transcript={this.state.transcript} playTime={this.state.playTime}/>;
	}

}
