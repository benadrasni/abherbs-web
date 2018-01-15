import React from 'react';
import {Card, CardMedia, CardTitle} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import ActionAndroid from 'material-ui-icons/Android';
import VersionTable from "./VersionTable";
import Flower from "./Flower";
import TranslationFlower from "./TranslationFlower";
import plants from "./plants";

const styles = {
    container: {
        maxWidth: '1200px',
        height: 'auto',
        overflow: 'auto',
        margin: '0 auto'
    },

    button: {
        margin: 12
    }
};

class Home extends React.Component {
    constructor(props, context) {
        super(props, context);

        var i = Math.floor(Math.random() * (plants.length -1));

        this.state = {
            plantName: plants[i],
            plant: {},
            plantTranslation: {}
        };

        this.goToDownload = this.goToDownload.bind(this);
    }

    componentDidMount() {

        fetch('https://abherbs-backend.firebaseio.com/plants/' + this.state.plantName + '.json')
            .then(result => result.json())
            .then(item =>
                this.setState({
                    plant: item,
                    plantTranslation: this.state.plantTranslation
                }));
        fetch('https://abherbs-backend.firebaseio.com/translations/en/' + this.state.plantName + '.json')
            .then(result => result.json())
            .then(item =>
                this.setState({
                    plant: this.state.plant,
                    plantTranslation: item
                }))
    }

    goToDownload() {
        window.location = '/#download';
    }

    render() {
        return (
            <div id='home'>
                <div style={styles.container}>
                    <Card>
                        <CardMedia
                            overlay={<CardTitle title={<div>Identify flowers with mobile phone
                                <RaisedButton
                                    label="What's that flower?"
                                    labelPosition="before"
                                    primary={true}
                                    icon={<ActionAndroid />}
                                    style={styles.button}
                                    onClick={this.goToDownload}
                                /></div>} />}
                        >
                            <img alt='' src='/images/herbsplus.png' />
                        </CardMedia>
                    </Card>
                </div>
                <div style={styles.container}>
                    <Flower
                        plant={this.state.plant}
                        plantTranslation={this.state.plantTranslation}
                    />
                </div>
                <div style={styles.container}>
                    <VersionTable/>
                </div>
                <div style={styles.container}>
                    <TranslationFlower
                        plantName={this.state.plantName}
                    />
                </div>
            </div>
        );
    }
}

export default Home;