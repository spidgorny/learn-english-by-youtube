import React from "react";

export default class FetchWords extends React.Component<any, any> {

	render() {
		return (
			<div><p className="lead">Cover is a one-page template for building simple and beautiful home pages. Download,
				edit
				the text, and add your own fullscreen background photo to make it your own.</p>
				<p className="lead">
					YouTube ID: {this.props.youtubeID}
				</p></div>);
	}

}
