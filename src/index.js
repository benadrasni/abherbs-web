import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router} from 'react-router-dom'
import createHistory from 'history/createBrowserHistory'
import App from './App';
import './index.css';
import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();

const history = createHistory();

ReactDOM.render(
    <Router history={history}>
        <App />
    </Router>,
    document.getElementById('root')
);
