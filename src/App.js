import React from 'react';
import {Route} from 'react-router'
import Main from './Main';
import LandingPage from './LandingPage';
import TranslateFlower from './TranslateFlower';

class App extends React.Component {
    render() {
        return (
            <div>
                <Main>
                    <Route exact path="/" component={LandingPage} />
                    <Route exact path="/translate_flower" component={TranslateFlower}/>
                </Main>
            </div>
        );
    }
}

export default App;