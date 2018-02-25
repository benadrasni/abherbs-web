import React from 'react';
import qs from 'query-string';
import Home from "./Home";
import TranslateFlower from "./TranslateFlower";
import plants from "./plants";

class LandingPage extends React.Component {
    constructor(props, context) {
        super(props, context);

        const parsed = qs.parse(props.location.search);
        let plantName = parsed["plant"];
        if (!plantName || plants.indexOf(plantName) === -1) {
            plantName = plants[Math.floor(Math.random() * (plants.length -1))];
        }

        this.state = {
            translate: window.location.href.endsWith("#translate_flower"),
            plantName: plantName
        };

    }

    render() {
        return this.state.translate ? <TranslateFlower plantName={this.state.plantName} /> : <Home plantName={this.state.plantName} />;
    }
}

export default LandingPage;