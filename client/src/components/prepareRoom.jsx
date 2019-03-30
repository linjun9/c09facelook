import React, { Component } from "react";
import GameBoard from "./gameBoard.jsx";
import { Redirect } from "react-router-dom";
import api from './api.js';
import WaitingRoom from "./waitingRoom.jsx";
import "./gameRoomsPage.css";
import Cookies from "js-cookie";

const URL = route => `wss://frozen-bastion-52634.herokuapp.com${route}`;
// const URL = route => `ws://localhost:3000${route}`;

class PrepareRoom extends Component {

  constructor(props) {
    super(props);
    this.state = {
      playerList: [], //{ playerId: req.session.user._id, point: 0, isReady: false }
      timer: { timeleft: 0 },
      emojiList: [],
      start: "",
      back: false,
      chatContent: [],
      winners: []
    };
  }

  render() {
    if (this.state.back) return <Redirect to='/api/dashboard/' />
    let start = this.state.start;
    let result = "";
    if (this.state.winners.length === 2) {
      result = "draw";
    } else if (this.state.winners.length === 1) {
      result = this.state.winners[0].playerId;
    } else {
      result = "";
    }
    if (start) {
      return (
        <div className="container sub-body">
          <div className="row">
            <div className="col mx-auto">
              <div className="card card-signin my-5">
                <div className="card-body">
                  <div>
                    <button onClick={this.leaveRoom} className="btn btn-danger btn-sm m-2">back</button>
                  </div>
                  <div>
                    <GameBoard ws={this.ws} scoreList={this.state.playerList} timer={this.state.timer} emojiList={this.state.emojiList}></GameBoard>;
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="container sub-body">
          <div className="row">
            <div className="col mx-auto">
              <div className="card card-signin my-5">
                <div className="card-body">
                  <div>
                    <button onClick={this.leaveRoom} className="btn btn-danger btn-sm m-2">back</button>
                  </div>
                  <WaitingRoom ws={this.ws}
                    result={result}
                    playerList={this.state.playerList}
                    url={URL(this.props.location.pathname)}
                    roomId={this.props.match.params.roomId}
                    chatContent={this.state.chatContent}
                  ></WaitingRoom>
                </div>
              </div>
            </div>
          </div>
        </div>
      );



    }
  }

  leaveRoom = () => {
    let roomId = this.props.match.params.roomId;
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "leave",
          from: Cookies.get("username")
        })
      );
    }

    api
      .post("/room/" + roomId + "/leave/")
      .then(res => {
        console.log("leave room ", roomId);
        this.setState({ back: true });
      })
      .catch(err => {
        console.log(err);
      });
  }

  componentDidMount() {
    this.ws.onopen = (event) => {
      console.log("connected to server");
    };
    this.ws.onerror = (event) => {
      console.log("connection error ");
    };
    this.ws.onmessage = (event) => {
      let message = JSON.parse(event.data);

      switch (message.type) {
        case 'roomState':
          this.handleOnRoomState(message);
          break;
        case 'chat':
          this.handleOnChat(message);
          break;
        case 'emojis':
          this.handleOnEmojis(message);
          break;
        default:
          this.handleOnError(message);
          break;
      }
      // console.log("message  from server" + JSON.parse(event.data));
    };
  }

  ws = new WebSocket(URL(this.props.location.pathname));

  handleOnChat = (message) => {
    let newChatContent = { chatContent: message.chatContent, from: message.from };

    this.setState(prevState => ({
      chatContent: [...prevState.chatContent, newChatContent]
    }));

  }
  handleOnEmojis = (message) => {
    let emojiList = message.emojiList;
    if (emojiList) {
      this.setState({ emojiList });
    }

  }
  handleOnRoomState = (message) => {
    let roomState = message.roomState;
    this.setCurrRoomState(roomState);
    if (roomState.gameState === "wait") {
      this.setState({ start: "" });
    } else if (roomState.gameState === "gamming") {
      this.setState({ start: "start" });
    } else if (roomState.gameState === "end") {
      this.setState({ start: "" });
    }
  }

  setCurrRoomState = (roomState) => {
    let timer = { timeleft: roomState.timeleft };
    this.setState({
      playerList: roomState.players,
      winners: roomState.winners,
      timer: timer
    });
  }

  handleOnError = (err) => {
    this.setState({ back: true });
  };
}

export default PrepareRoom;
