import React from 'react';
import {Card, CardMedia, CardTitle} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import Android from 'material-ui-icons/Android';
import Mail from 'material-ui-icons/Mail';
import VersionTable from "./VersionTable";
import Flower from "./Flower";

const styles = {
    container: {
        maxWidth: '1200px',
        height: 'auto',
        overflow: 'auto',
        margin: '0 auto'
    },

    button: {
        margin: 12
    },

    bottom: {
        width: '100%',
        height: '100px',
        backgroundColor: 'black',
        textAlign: 'center'
    }

};

class Home extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            language: props.language,
            locStrings: props.locStrings,
            plantName: props.plantName,
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
                    language: this.state.language,
                    locStrings: this.state.locStrings,
                    plant: item,
                    plantTranslation: this.state.plantTranslation
                }));
        fetch('https://abherbs-backend.firebaseio.com/translations/en/' + this.state.plantName + '.json')
            .then(result => result.json())
            .then(item =>
                this.setState({
                    language: this.state.language,
                    locStrings: this.state.locStrings,
                    plant: this.state.plant,
                    plantTranslation: item
                }))
    }

    componentWillReceiveProps(newProps) {
        this.state = {
            language: newProps.language,
            locStrings: newProps.locStrings,
            plant: this.state.plant,
            plantTranslation: this.state.plantTranslation
        };
    }

    goToDownload() {
        window.location = '#download';
    }

    mailTo() {
        window.location = 'mailto:support@whatsthatflower.com';
    }

    render() {
        return (
            <div id='home'>
                <div style={styles.container}>
                    <Card>
                        <CardMedia
                            overlay={<CardTitle title={<div>{this.state.locStrings.app_short_description}
                                <RaisedButton
                                    label={this.state.locStrings.app_name}
                                    labelPosition="before"
                                    primary={true}
                                    icon={<Android />}
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
                        language={this.state.language}
                        locStrings={this.state.locStrings}
                        plant={this.state.plant}
                        plantTranslation={this.state.plantTranslation}
                    />
                </div>
                <div style={styles.container}>
                    <VersionTable
                        language={this.state.language}
                        locStrings={this.state.locStrings}
                    />
                </div>
                <div style={styles.bottom}>
                    <RaisedButton
                        primary={true}
                        icon={<Mail />}
                        style={styles.button}
                        onClick={this.mailTo}
                    />
                </div>
            </div>
        );
    }
}

export default Home;