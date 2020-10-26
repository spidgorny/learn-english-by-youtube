import React from "react";
import Tokenizer from "./Tokenizer";
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
		const xml = await res.text();
		// console.log(xml);
		const json = parser.xml2json(xml);
		const sentences = json.transcript.text.map((line: Transcript) => {
			line['_@ttribute'] = line['_@ttribute'].replaceAll('\\n', ' ')
				.replaceAll('&amp;', '&')
				.replaceAll('&gt;', '>')
				.replaceAll('&lt;', '<');
			line['_@ttribute'] = _.unescape(line['_@ttribute']);
			return line;
		});
		this.setState({
			transcript: sentences,
		});
		this.tokenizeText(json.transcript.text);
	}

	async tokenizeText(text: Transcript[]) {
		const t = new Tokenizer(text.map(line => line['_@ttribute']));
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

		return <div>
			{/*<p className="lead">*/}
			{/*	YouTube ID: {this.props.youtubeID}*/}
			{/*</p>*/}
			<Lyrics transcript={this.state.transcript} playTime={this.state.playTime}/>
		</div>;
	}

}
