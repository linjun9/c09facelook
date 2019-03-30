import React, { Component } from 'react';

class Result extends Component {

    render() {
        if (this.props.result === "draw") {
            return (
                <div>
                    <img src="/media/draw.png" alt="draw" />
                </div>);
        } else if (this.props.result === this.props.myUserName) {
            return (<div>
                <img src="/media/win.png" alt="win" />
            </div>);
        } else {
            return (<div>
                <img src="/media/lose.png" alt="lose" />
            </div>);
        }
    }


}
export default Result;