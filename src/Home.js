import React from 'react';
import {Card, CardMedia, CardTitle} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
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
            initialized: false,
            language: props.language,
            locStrings: props.locStrings,
            plantName: props.plantName,
            plantsCount: props.plantsCount,
            plant: {},
            plantTranslation: {}
        };

        this.goToDownload = this.goToDownload.bind(this);
    }

    componentDidMount() {
        this.loadTranslations(this.state.language, this.state.locStrings);
    }

    componentWillReceiveProps(newProps) {
        this.loadTranslations(newProps.language, newProps.locStrings);
    }

    loadTranslations(language, locStrings) {
        const that = this;
        let plant = {}, translation = {}, translationGT = {}, translationEn = {};

        fetch('https://abherbs-backend.firebaseio.com/plants_v2/' + that.state.plantName + '.json')
            .then(function(result) {
                return result.json();
            }).then(function(item) {
                plant = item;

            return fetch('https://abherbs-backend.firebaseio.com/translations/' + language + '/' + that.state.plantName + '.json')
        }).then(function(result) {
            return result.json();
        }).then(function(item) {
            translation = item;

            return fetch('https://abherbs-backend.firebaseio.com/translations/' + language + '-GT/' + that.state.plantName + '.json')
        }).then(function(result) {
            return result.json();
        }).then(function(item) {
            translationGT = item;

            return fetch('https://abherbs-backend.firebaseio.com/translations/en/' + that.state.plantName + '.json')
        }).then(function(result) {
            return result.json();
        }).then(function(item) {
            translationEn = item;

            that.setState({
                initialized: true,
                language: language,
                locStrings: locStrings,
                plant: plant,
                plantTranslation: {
                    label: that.getLabel(translation, plant),
                    names: translation ? translation.names : [],
                    description: that.getAttribute('description', translation, translationGT, translationEn),
                    inflorescence: that.getAttribute('inflorescence', translation, translationGT, translationEn),
                    flower: that.getAttribute('flower', translation, translationGT, translationEn),
                    fruit: that.getAttribute('fruit', translation, translationGT, translationEn),
                    leaf: that.getAttribute('leaf', translation, translationGT, translationEn),
                    stem: that.getAttribute('stem', translation, translationGT, translationEn),
                    habitat: that.getAttribute('habitat', translation, translationGT, translationEn),
                    toxicity: that.getAttribute('toxicity', translation, translationGT, translationEn),
                    herbalism: that.getAttribute('herbalism', translation, translationGT, translationEn),
                    trivia: that.getAttribute('trivia', translation, translationGT, translationEn)
                }
            });
        })
    }

    getLabel(translation, plant) {
        let attr = '';
        if (translation && translation.label) {
            attr = translation.label;
        }
        if (!attr) {
            attr = plant.name;
        }

        return attr;
    }

    getAttribute(attribute, translation, translationGT, translationEn) {
        let attr = '';
        if (translation && translation[attribute]) {
            attr = translation[attribute];
        }
        if (!attr && translationGT && translationGT[attribute]) {
            attr = translationGT[attribute];
        }
        if (!attr && translationEn && translationEn[attribute]) {
            attr = translationEn[attribute];
        }

        return attr;
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
                                    style={styles.button}
                                    onClick={this.goToDownload}
                                /></div>} />}
                        >
                            <img alt='' src='/images/herbsplus.png' />
                        </CardMedia>
                    </Card>
                </div>
                <div style={styles.container}>
                    {this.state && this.state.initialized &&
                        <Flower
                            language={this.state.language}
                            locStrings={this.state.locStrings}
                            plant={this.state.plant}
                            plantTranslation={this.state.plantTranslation}
                        />
                    }
                </div>
                <div style={styles.container}>
                    <VersionTable
                        language={this.state.language}
                        locStrings={this.state.locStrings}
                        plantsCount={this.state.plantsCount}
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