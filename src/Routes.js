import React from "react";
import { Route, Switch } from "react-router-dom";
import Home from "./containers/Home";
import CameraDemo from "./containers/CameraDemo";

export default () =>
  <Switch>
    <Route path="/" exact component={Home} />
    <Route path="/camera" exact component={CameraDemo} />
  </Switch>;