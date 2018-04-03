import React from 'react';
import {Route} from 'react-router';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router} from 'react-router-dom'
import Main from './Main';
import './index.css';
import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();

ReactDOM.render(
    <Router>
        <Route path="/" render={({ match, location })=><Main match={match} location={location}/>} />
    </Router>,
    document.getElementById('root')
);
