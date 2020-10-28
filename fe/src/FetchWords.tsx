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

interface Props {
	youtubeID: string;
	playTime: number;
}

interface State {
	error: undefined | string;
	transcript: Transcript[];
}

export default class FetchWords extends React.Component<Props, any> {

	state: State = {
		error: undefined,
		transcript: [],
	};

	componentDidMount() {
		this.fetchCC();
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
		const messages = json.transcript.text.filter((el: Transcript) => '_@ttribute' in el);
		const sentences = messages.map((line: Transcript) => {
			let text = line['_@ttribute'];
			text = text.replaceAll(/\n/g, ' ')
				.replaceAll('&amp;', '&')
				.replaceAll('&gt;', '>')
				.replaceAll('&lt;', '<');
			text = _.unescape(text);
			// if (text.startsWith('Welcome')) {
			// 	console.log(line['_@ttribute'], '=>', text);
			// }
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
		let error = <></>;
		if (this.state.error) {
			error = <div className="alert alert-danger">
				{this.state.error}
			</div>;
		}

		return <Lyrics transcript={this.state.transcript}
									 playTime={this.props.playTime}>
			{error}
			{this.props.children}
		</Lyrics>;
	}

}
