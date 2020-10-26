import {Transcript} from "./FetchWords";
import React from "react";

const natural = require('natural');

interface TranscriptTranslated {
	start: number;
	dur: number;
	text: string;
	wordsWithTrans: string[];
}

interface KaraokeProps {
	playTime: number;
	translations: Record<string, string>;
	transcript: Transcript[];
}

interface State {
	messages: TranscriptTranslated[];
}

export default class Karaoke extends React.Component<KaraokeProps, State> {

	state: State = {
		messages: [],
	};

	scrollRef = React.createRef<HTMLDivElement>();

	get transLen() {
		return Object.keys(this.props.translations).length;
	}

	componentDidMount() {
		console.log('Karaoke.cdm', this.props.transcript.length, this.transLen);
		this.maybeTranslate();
	}

	componentDidUpdate(prevProps: Readonly<KaraokeProps>, prevState: Readonly<any>, snapshot?: any) {
		console.log('Karaoke.cdu', this.props.transcript.length, this.transLen);
		this.maybeTranslate();
		this.scrollToBottom();
	}

	maybeTranslate() {
		console.log('messages', this.state.messages.length);
		// already translated
		if (this.state.messages.length) {
			return;
		}
		if (this.props.transcript.length && this.transLen) {
			this.translateTranscript();
		}
	}

	translateTranscript() {
		console.log('translateTranscript');
		const olderMessages = this.props.transcript.map((el: Transcript) => {
			let start = parseFloat(el.start.toString());
			let dur = parseFloat(el.dur.toString());
			// return start < this.props.playTime
			// 	&& (start + dur) > this.props.playTime;
			const text = el["_@ttribute"];

			const tokenizer = new natural.WordTokenizer();
			const words1 = tokenizer.tokenize(text);
			const wordsWithTrans = words1.map((word: string) => {
				const trans = this.props.translations[word] as string;
				if (trans) {
					word += ' [' + trans + ']';
				}
				return word;
			});
			return {
				start, dur, text, wordsWithTrans,
			} as TranscriptTranslated;
		});

		this.setState({
			messages: olderMessages,
		});
	}

	scrollToBottom() {
		if (!this.scrollRef.current) {
			return;
		}
		this.scrollRef.current.scrollTop = this.scrollRef.current.scrollHeight;
	}

	render() {
		const olderMessages = this.state.messages
			.filter((line: TranscriptTranslated) => line.start < this.props.playTime);
		console.log('olderMessages', '<', this.props.playTime, olderMessages.length);
		const messages = olderMessages.map((line: TranscriptTranslated) =>
			<p key={line.start}>
				{line.text}
			</p>);
		return <div style={{
			position: 'relative',
			backgroundColor: 'yellow',
			height: '100%',
		}}>
			<div style={{
				position: 'absolute',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: 'orange',
			}}>
				<div ref={this.scrollRef} style={{
					height: '100%',
					overflowY: 'scroll',
					scrollBehavior: 'smooth',
					transition: 'all 0.5s',
					backgroundColor: 'pink',
				}}>
					{messages}
				</div>
			</div>
		</div>;
	}

}
