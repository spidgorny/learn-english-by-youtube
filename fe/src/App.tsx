import React from 'react';
import FetchWords from "./FetchWords";

export default class App extends React.Component {

	refURL: React.Ref<HTMLInputElement>;
	state: {
		player: any;
	} = {
		player: undefined,
	};

	constructor(props: any) {
		super(props);
		this.refURL = React.createRef();
	}

	get youtubeID() {
		return 'M7lc1UVf-VE';
	}

	componentDidMount() {
		this.initPlayer();
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
		return (
			<>
				<header className="masthead">
					<div className="inner">
						<h3 className="masthead-brand">Cover</h3>
						<form style={{display: 'inline'}}>
							<input type="search" name="youtube_url" ref={this.refURL} onInput={this.enterNewURL.bind(this)}
										 className="form-control" style={{
								display: 'inline',
								width: '50%'
							}}/>
						</form>
						<nav className="nav nav-masthead justify-content-center">
							<a className="nav-link active" href=".">Home</a>
							<a className="nav-link" href="/contact">Contact</a>
						</nav>
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
						}}/>
					</div>
					<div className="" style={{
						flexBasis: '25%',
						overflow: 'hidden',
					}}>
						<FetchWords youtubeID={this.youtubeID} player={this.state.player}/>
					</div>
				</main>
			</>
		);
	}

	enterNewURL() {

	}

}
