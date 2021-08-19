import React from 'react';
import qs from 'query-string';
import Home from "./Home";
import TranslateFlower from "./TranslateFlower";

class LandingPage extends React.Component {
    constructor(props, context) {
        super(props, context);

        const parsed = qs.parse(props.location.search);
        let plantName = parsed["plant"];
        if (!plantName || props.plants.indexOf(plantName) === -1) {
            plantName = props.plants[Math.floor(Math.random() * (props.plants.length -1))];
        }

        this.state = {
            language: props.language,
            locStrings: props.locStrings,
            plants: props.plants,
            translate: window.location.href.endsWith("#translate_flower"),
            plantName: plantName
        };

    }

    componentWillReceiveProps(newProps) {
        this.state = {
            language: newProps.language,
            locStrings: newProps.locStrings,
            plants: newProps.plants,
            translate: this.state.translate,
            plantName: this.state.plantName
        };
    }

    render() {
        return this.state.translate ?
            <TranslateFlower
                plantName={this.state.plantName}
                plants={this.state.plants}
            /> :
            <Home
                language={this.state.language}
                locStrings={this.state.locStrings}
                plantName={this.state.plantName}
                plantsCount={this.state.plants.length}
            />;
    }
}

export default LandingPage;