import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route} from 'react-router'
import createHistory from 'history/createBrowserHistory'
import Main from './Main';
import LandingPage from './LandingPage';
import TranslateFlower from './TranslateFlower';
import './index.css';
import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();

const history = createHistory();

ReactDOM.render(
    <Router history={history}>
        <Main>
            <Route exact path="/" component={LandingPage} />
            <Route exact path="/translate_flower" component={TranslateFlower}/>
        </Main>
    </Router>,
    document.getElementById('root')
);
