import React, { Component } from "react";
import GameRoom from './gameRoom.jsx';
import api from "./api.js";
import { Redirect } from "react-router";
import "./gameRooms.css";
import ErrorMessage from "./errorMessage.jsx";

class GameRooms extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rooms: [],
      time: Date.now(),
      // exit: false,
      inRoom: '',
      error: { content: "", shown: "" }
    };
  }


  handleAddRoom = () => {
    //add the updated rooms into database
    api
      .post("/room/", null)
      .then(res => {
        //enter created room
        console.log(res);
        this.enterRoom(res.data._id);
      })
      .catch(err => {
        if (err.response) {
          this.handleOnError(err.response.data);
        } else {
          this.handleOnError(err.message);
        }
      });
  };

  handlerGetRooms() {
    api
      .get('/rooms/', null)
      .then(res => {
        let rooms = res.data;
        this.setState({ rooms });
      })
      .catch(err => {
        console.log(err);
      });
  }

  // handlerDelete = room => {
  //   api
  //     .delete("/room/" + room._id + "/")
  //     .then(res => {
  //       let rooms = res.data;
  //       // this.setState({ rooms });
  //     })
  //     .catch(err => {
  //       console.log(err);
  //     });
  // };

  handlerClick = roomId => {
    console.log("room is clicked", roomId);
  };

  enterRoom = roomId => {
    api
      .post("/room/" + roomId + "/enter/")
      .then(res => {
        this.setState({ inRoom: res.data._id });
      })
      .catch(err => {
        if (err.response) {
          this.handleOnError(err.response.data);
        } else {
          this.handleOnError(err.message);
        }
      });
  };

  componentDidMount() {
    this.handlerGetRooms();
    this.interval = setInterval(() => this.handlerGetRooms(), 4000);
  }
  // clean up data before something is removed from DOM.
  componentWillUnmount() {
    clearInterval(this.interval);
  }

  handleSignOut = () => {
    //add the updated rooms into database
    api
      .get("/signout/")
      .then(res => {
        console.log(res);
        // this.setState({ exit: true });
      })
      .catch(err => {
        console.log(err);
      });
  };

  handleOnError = (err, shown) => {
    let error = { ...this.state.error };
    error.content = err;
    error.shown = "alert alert-primary";
    this.setState({ error });
  };

  render() {

    if (this.state.inRoom) return <Redirect to={"/api/rooms/" + this.state.inRoom} />;
    return (
      <div>
        <a href="/" className="btn btn-lg btn-danger" onClick={this.handleSignOut}>
          <span className="glyphicon glyphicon-chevron-left">
          </span> Sign Out
        </a>
        <ErrorMessage
          onChange={this.handleOnError}
          error={this.state.error}
        />
        <div className="d-flex flex-wrap">
          {this.state.rooms.map(room => (
            <GameRoom
              key={room._id}
              onRoomClick={this.handlerClick}
              onRoomDelete={this.handlerDelete}
              onEnter={this.enterRoom}
              room={room}
            >
            </GameRoom>
          ))}
        </div>
        <button
          onClick={this.handleAddRoom}
          className="btn btn-lg btn-danger"
        >
          Create Room
          </button>
      </div>
    );


  }
}

export default GameRooms;
