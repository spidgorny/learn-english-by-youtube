import {Transcript} from "./FetchWords";
import React from "react";

const natural = require('natural');

interface TranscriptTranslated {
	start?: number;
	dur?: number;
	text: string;
	wordsWithTrans?: string[];
}

interface KaraokeProps {
	playTime: number;
	translations: Record<string, string>;
	transcript: Transcript[];
	debug?: boolean;
}

interface State {
	messages: TranscriptTranslated[];
}

export default class Karaoke extends React.Component<KaraokeProps, State> {

	state: State = {
		messages: [],
	};

	scrollRef = React.createRef<HTMLDivElement>();
	timer: any;

	constructor(props: KaraokeProps) {
		super(props);
		if (this.props.debug) {
			this.state.messages = [{text: 'The guide will start with a very simple label component that will have a prop called text and display it inside a span, then extend this component to highlight the text when the prop is changed by the parent component. The implementation of the text highlighting will set the component state to a background color, set a timeout of one second, and set the state back to the original background color.'},
				{text: 'The code for the starting component looks like this:'},
				{text: 'In version 16.8, React hooks were introduced. Hooks allow a component to be built as a function without the need for classes.'},
				{text: 'This component will need a state variable to track the background color and a ref to store the current timer instance. Although refs are primarily used to access the DOM the useRef hook can also be used to store a mutable variable that will not trigger an update of the component when changed. It will also need a function to set the state to a color, wait for a second, and then set it back to the default value. The markup returned by the component will be the same as the original label with the addition of setting the style. The code to do all of this is here:'}];
		}
	}

	get transLen() {
		return Object.keys(this.props.translations).length;
	}

	componentDidMount() {
		console.log('Karaoke.cdm', this.props.transcript.length, this.transLen);
		this.maybeTranslate();

		if (this.props.debug) {
			this.timer = setInterval(() => {
				this.setState({
					messages: [...this.state.messages,
						{text: Math.random().toString()}
					],
				});
			}, 1000);
		}
	}

	componentWillUnmount() {
		if (this.timer) {
			clearInterval(this.timer);
		}
	}

	componentDidUpdate(prevProps: Readonly<KaraokeProps>, prevState: Readonly<any>, snapshot?: any) {
		console.log('Karaoke.cdu', this.props.transcript.length, this.transLen);
		this.maybeTranslate();
	}

	maybeTranslate() {
		// console.log('messages', this.state.messages.length);
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
		setTimeout(() => this.scrollToBottom(), 0);
		// const olderMessages = this.state.messages
		// 	.filter((line: TranscriptTranslated) => line.start < this.props.playTime);
		// console.log('olderMessages', '<', this.props.playTime, olderMessages.length);
		const olderMessages = this.state.messages;
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
					transition: 'all 1s',
					backgroundColor: 'pink',
				}} onClick={this.scrollToBottom.bind(this)}>
					{messages}
				</div>
			</div>
		</div>;
	}

}
