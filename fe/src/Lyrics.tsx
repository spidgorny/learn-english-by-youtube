import React from "react";
import {Transcript} from "./FetchWords";
import MyTokenizer, {progress} from "./MyTokenizer";
import Karaoke from "./Karaoke";
import * as _ from 'lodash';

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

	get transLen() {
		return Object.keys(this.state.translations).length;
	}

	async tokenizeAndTranslate() {
		const t = new MyTokenizer(this.props.transcript.map((el: Transcript) => el["_@ttribute"]));
		const words = t.getTerms();
		const results = await progress(t.translate(words), (progress: ProgressEvent) => {
			// console.log(progress.loaded, '/', progress.total);
			const percent = progress.loaded / progress.total * 100;
			this.setState({
				progress: percent,
			});
		});

		const translations: Record<string, string> = {};
		results.forEach((el: any, index: number) => {
			// console.log(el);
			if (!el) {
				return;
			}
			// console.log(el);
			const word: string = words[index];
			translations[word] = el;
		});
		// console.log('setState', 'translations', translations);

		_.sortBy(translations);
		this.setState({
			translations,
		});
	}

	render() {
		// console.log('Lyrics progress', this.state.progress);
		let karaoke = <></>;
		if (this.state.progress < 100) {
			karaoke = <div style={{padding: '0.5em'}}>
				<p>Loading translations for {Object.keys(this.state.translations).length} words...</p>
				<progress max={100} value={this.state.progress} style={{
					width: '100%'
				}}/>
			</div>;
		} else {
			karaoke = <Karaoke playTime={this.props.playTime}
												 translations={this.state.translations}
												 transcript={this.props.transcript}
												 debug={false}/>
		}
		// console.log('Lyrics.render', Object.keys(this.state.translations).length);
		return <>
			<div className="d-flex flex-row justify-content-between" style={{
				gap: '1em',
			}}>
				<div className="" style={{
					flexBasis: '75%',
				}}>
					{this.props.children}
				</div>
				<div className="" style={{
					flexBasis: '25%',
					overflow: 'hidden',
					backgroundColor: 'gray',
				}}>
					{karaoke}
				</div>
			</div>
			<div>
				sentences: {this.props.transcript.length}
			</div>
			<div>
				Words [{this.transLen}]:
			</div>
			{Object.keys(this.state.translations).map((source: string) => {
				const trans = this.state.translations[source];
				return <div key={source}>{source} =&gt;&nbsp;
					<span dangerouslySetInnerHTML={{__html: trans}}/>
				</div>
			})}
		</>;
	}

}
