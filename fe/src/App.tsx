import React from 'react';
import FetchWords from "./FetchWords";

export default class App extends React.Component {

	refURL: React.Ref<HTMLInputElement>;

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

		// 3. This function creates an <iframe> (and YouTube player)
		//    after the API code downloads.
		let player: any;

		const onYouTubeIframeAPIReady = () => {
			// @ts-ignore
			player = new YT.Player('player', {
				height: '390',
				width: '640',
				videoId: this.youtubeID,
				events: {
					'onReady': onPlayerReady,
					'onStateChange': onPlayerStateChange
				}
			});
		}
		// @ts-ignore
		window['onYouTubeIframeAPIReady'] = onYouTubeIframeAPIReady;

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
				setTimeout(stopVideo, 6000);
				done = true;
			}
		}

		function stopVideo() {
			player.stopVideo();
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
					}}>
						<FetchWords youtubeID={this.youtubeID}/>
					</div>
				</main>
			</>
		);
	}

	enterNewURL() {

	}

}
