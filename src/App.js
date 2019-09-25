import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Nav,Navbar } from "react-bootstrap";
import "./App.css";
import Routes from "./Routes";

class App extends Component {
  render() {
    return (
      <div className="App container">
        <Navbar collapseOnSelect bg="light" expand="lg">
            <Navbar.Brand>
              <Link to="/">Home</Link>
            </Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse>
              <Nav className="justify-content-end">
                <Nav.Link href="/camera">camera</Nav.Link>
              </Nav>
            </Navbar.Collapse>
        </Navbar>
        <Routes />
      </div>
    );
  }
}

export default App;
