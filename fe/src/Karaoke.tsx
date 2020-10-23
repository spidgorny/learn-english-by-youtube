import {Transcript} from "./FetchWords";
import React from "react";

const natural = require('natural');

interface KaraokeProps {
	playTime: number;
	translations: Record<string, string>;
	transcript: Transcript[];
}

export default class Karaoke extends React.Component<KaraokeProps, any> {

	state: {
		olderMessages: string[];
	} = {
		olderMessages: [],
	};

	scrollRef = React.createRef<HTMLDivElement>();

	componentDidUpdate(prevProps: Readonly<KaraokeProps>, prevState: Readonly<any>, snapshot?: any) {
		const messageIndex = this.props.transcript.findIndex((el: Transcript) => {
			let start = parseFloat(el.start.toString());
			let dur = parseFloat(el.dur.toString());
			return start < this.props.playTime
				&& (start + dur) > this.props.playTime;
		});
		// not found
		if (messageIndex === -1) {
			return;
		}

		// already processed
		if (this.state.olderMessages[messageIndex]) {
			return;
		}

		const message = this.props.transcript[messageIndex];
		const text: string = message['_@ttribute'];
		const tokenizer = new natural.WordTokenizer();
		const words1 = tokenizer.tokenize(text.replaceAll(/\n/g, ' '));
		const wordsWithTrans = words1.map((word: string) => {
			const trans = this.props.translations[word] as string;
			if (trans) {
				word += ' [' + trans + ']';
			}
			return word;
		});
		this.setState((state: any) => {
			const olderMessages = state.olderMessages.concat([wordsWithTrans.join(' ')]);
			return {
				olderMessages,
			};
		});

		if (!this.scrollRef.current) {
			return;
		}
		this.scrollRef.current.scrollTop = this.scrollRef.current.scrollHeight;
	}

	render() {
		return this.showHistory();
	}

	showHistory() {
		const messages = this.state.olderMessages.map((line: string) =>
			<p key={line}>
				{line}
			</p>);
		return <div ref={this.scrollRef} className="d-flex flex-column" style={{
			overflowY: 'scroll',
			scrollBehavior: 'smooth',
		}}>{messages}</div>;
	}

}
