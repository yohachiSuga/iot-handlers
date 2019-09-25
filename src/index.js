import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import Amplify, {Storage, Auth, PubSub } from "aws-amplify";
import { AWSIoTProvider } from "@aws-amplify/pubsub/lib/Providers";
import config from "./config";
import { BrowserRouter as Router } from "react-router-dom";

Amplify.configure({
    Storage:{
        region:config.s3.REGION,
        bucket:config.s3.BUCKET,
        identityPoolId:config.s3.IDENTITY_POOL_ID
    },
    Auth:{
        identityPoolId:config.cognito.IDENTITY_POOL_ID,
        region:config.cognito.REGION,
        userPoolId:config.cognito.USER_POOL_ID,
        userPoolWebClientId:config.cognito.APP_CLIENT_ID
    }
})

Amplify.addPluggable(new AWSIoTProvider({
    aws_pubsub_region:config.iot.REGION,
    aws_pubsub_endpoint:config.iot.ENDPOINT
}))

ReactDOM.render(
    <Router>
        <App />
    </Router>
, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
