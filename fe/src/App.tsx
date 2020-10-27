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
		this.timer = setInterval(this.updatePlayTime.bind(this), 100);
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
		clearInterval(this.timer);
	}

	initPlayer() {
		const tag = document.createElement('script');

		tag.src = "https://www.youtube.com/iframe_api";
		const firstScriptTag = document.getElementsByTagName('script')[0] as HTMLScriptElement;
		firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

		const onYouTubeIframeAPIReady = () => {
			// @ts-ignore
			const player = new YT.Player('player', {
				videoId: this.youtubeID,
				events: {
					'onReady': onPlayerReady,
					'onStateChange': onPlayerStateChange
				}
			});
			this.setState({
				player,
			});
		}
		// @ts-ignore
		window['onYouTubeIframeAPIReady'] = onYouTubeIframeAPIReady.bind(this);

		// 4. The API will call this function when the video player is ready.
		function onPlayerReady(event: any) {
			event.target.playVideo();
		}

		// 5. The API calls this function when the player's state changes.
		//    The function indicates that when playing a video (state=1),
		//    the player should play for six seconds and then stop.
		let done = false;

		function onPlayerStateChange(event: any) {
			// @ts-ignore
			let playing = YT.PlayerState.PLAYING;
			if (event.data === playing && !done) {
				setTimeout(stopVideo, 60000);
				done = true;
			}
		}

		const stopVideo = () => {
			this.state.player.stopVideo();
		}
	}

	render() {
		return <>
			<header className="masthead">
				<div className="row">
					<h3 className="col masthead-brand">Cover</h3>
					<form style={{display: 'inline'}} className="col-6">
						<input type="search" name="youtube_url"
									 ref={this.refURL}
									 onInput={this.enterNewURL.bind(this)}
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
			<main role="main" className="d-flex flex-row justify-content-between" style={{
				gap: '1em',
			}}>
				<div className="" style={{
					flexBasis: '75%',
				}}>
					<div className="" id="player" style={{
						width: '100%',
						height: 'calc(100vw * 9 / 16)',
						aspectRatio: '16/9',
						backgroundColor: 'black',
					}}>
						<input type="range" min={0} max={6000} onChange={this.dragPlayTime.bind(this)} value={this.state.playTime}
									 style={{
										 width: '100%',
									 }}/>
					</div>
				</div>
				<div className="" style={{
					flexBasis: '25%',
					overflow: 'hidden',
					backgroundColor: 'silver',
				}}>
					<FetchWords youtubeID={this.youtubeID}
											playTime={this.state.playTime}/>
				</div>
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
		let input = e.target as HTMLInputElement;
		console.log(input.value)
		this.setState({
			youtubeURL: input.value,
		})
	}

}
