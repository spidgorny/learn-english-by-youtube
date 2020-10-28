import React, {ChangeEvent, FormEvent} from 'react';
import FetchWords from "./FetchWords";

interface AppProps {
	debug?: boolean;
}

interface State {
	player: any;
	youtubeURL: string;
	playTime: number;
}

export default class App extends React.Component<AppProps> {

	refURL: React.Ref<HTMLInputElement>;
	state: State = {
		player: undefined,
		youtubeURL: 'https://youtu.be/watch?v=M7lc1UVf-VE',
		playTime: 0,
	};
	timer: any;

	constructor(props: any) {
		super(props);
		this.refURL = React.createRef();
	}

	get youtubeID(): string {
		return new URL(this.state.youtubeURL).searchParams.get('v') ?? '';
	}

	componentDidMount() {
		if (!this.props.debug) {
			this.initPlayer();
		}
	}

	updatePlayTime() {
		if (!this.state.player) {
			return;
		}
		if (!('getCurrentTime' in this.state.player)) {
			return;
		}
		this.setState({
			playTime: this.state.player.getCurrentTime(),
		});
	}

	componentWillUnmount() {
		this.unwatch();
	}

	watch() {
		this.timer = setInterval(this.updatePlayTime.bind(this), 100);
	}

	unwatch() {
		clearInterval(this.timer);
	}

	initPlayer() {
		const tag = document.createElement('script');

		tag.src = "https://www.youtube.com/iframe_api";
		const firstScriptTag = document.getElementsByTagName('script')[0] as HTMLScriptElement;
		firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

		const onYouTubeIframeAPIReady = () => {
			this.startPlaying();
		}
		// @ts-ignore
		window['onYouTubeIframeAPIReady'] = onYouTubeIframeAPIReady.bind(this);
	}

	startPlaying() {
		// console.log('startPlaying', this.youtubeID);
		// @ts-ignore;
		const player = new YT.Player('player', {
			videoId: this.youtubeID,
			events: {
				'onReady': this.onPlayerReady.bind(this),
				'onStateChange': this.onPlayerStateChange.bind(this),
			}
		});
		this.setState({
			player,
		});
	}

	onPlayerReady(event: any) {
		event.target.playVideo();
	}

	onPlayerStateChange(event: any) {
		// @ts-ignore
		const PLAYING = YT.PlayerState.PLAYING;
		console.log(event);
		if (event.data === PLAYING) {
			this.watch();
		} else {
			this.unwatch();
		}
	}

	stopVideo() {
		this.state.player.stopVideo();
	}

	render() {
		return <>
			<header className="masthead">
				<div className="row">
					<h3 className="col masthead-brand">Cover</h3>
					<form style={{display: 'inline'}} className="col-6"
								onSubmit={this.enterNewURL.bind(this)}>
						<input type="search" name="youtube_url"
									 ref={this.refURL}
									 placeholder="paste youtube URL here"
									 className="form-control" style={{
							width: '100%'
						}}/>
					</form>
					<div className="col">
						<nav className="nav nav-masthead justify-content-center ">
							<a className="nav-link active" href=".">Home</a>
							<a className="nav-link" href="/contact">Contact</a>
						</nav>
					</div>
				</div>
			</header>
			<main role="main">
				<FetchWords youtubeID={this.youtubeID}
										playTime={this.state.playTime}
										key={this.youtubeID}>

					<div className="" id="player" style={{
						width: '100%',
						height: 'calc(100vw * 9 / 16)',
						aspectRatio: '16/9',
						backgroundColor: 'black',
					}}
							 key={'staticPlayerKey'}
					>
						{this.props.debug &&
			<input type="range" min={0} max={600}
				   onChange={this.dragPlayTime.bind(this)}
				   value={this.state.playTime}
				   style={{
										 width: '100%',
									 }}/>
						}
					</div>

				</FetchWords>
			</main>
		</>;
	}

	dragPlayTime(e: ChangeEvent) {
		if (!e.target) {
			return;
		}
		let input = e.target as HTMLInputElement;
		this.setState({
			playTime: input.value,
		});
	}

	enterNewURL(e: FormEvent) {
		e.preventDefault();
		if (!e.target) {
			return;
		}
		this.state.player.stopVideo();
		let form = e.target as HTMLFormElement;
		let input = form.elements[0] as HTMLInputElement;
		// console.log(input.value);
		this.setState({
			youtubeURL: input.value,
		}, () => {
			// this.state.player.loadVideoById(this.youtubeID);
			// this.state.player.startPlaying();
			this.startPlaying();
		});
	}

}
