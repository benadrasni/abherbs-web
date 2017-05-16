import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route} from 'react-router'
import createHistory from 'history/createBrowserHistory'
import Main from './Main';
import Home from './Home';
import VersionTable from './VersionTable';
import './index.css';
import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();

const history = createHistory();

ReactDOM.render(
    <Router history={history}>
        <Main>
            <Route exact path="/" component={Home}/>
            <Route path="/flowers" component={VersionTable}/>
        </Main>
    </Router>,
    document.getElementById('root')
);
