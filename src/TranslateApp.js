import React from 'react';
import {Card, CardHeader, CardText} from 'material-ui/Card';
import SelectField from 'material-ui/SelectField';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
import MenuItem from 'material-ui/MenuItem';
import Language from 'material-ui-icons/Language';
import languages from "./languages";
import TranslateSection from "./TranslateSection";

const styles = {
    appTranslation: {
        maxWidth: '1200px',
        height: 'auto',
        overflow: 'auto',
        margin: '0 auto'
    },

    header: {
        marginTop: '50px',
        fontSize: '36px',
        fontWeight: '700',
        color: '#9E9E9E',
        lineHeight: '40px',
        letterSpacing: '-1.3px',
        textAlign: 'left',
        paddingLeft: '24px'
    },

    col: {
        maxWidth: '1196px',
        paddingLeft: '2px',
        paddingRight: '2px',
        float: 'left',
        width: '100%'
    },

    col1: {
        maxWidth: '596px',
        marginLeft: '2px',
        marginRight: '2px',
        float: 'left',
        width: '100%'
    },

    col2: {
        maxWidth: '596px',
        marginLeft: '2px',
        marginRight: '2px',
        float: 'left',
        width: '100%'
    },

    cardWizard: {
        marginTop: '10px',
        marginBottom: '10px',
        height: '170px'
    },

    card: {
        marginTop: '10px',
        marginBottom: '10px'
    },

    cardHeader: {
        fontSize: '20px'
    },

    center: {
        textAlign: 'center'
    },

    thanks: {
        textAlign: 'center',
        fontSize: '20px',
        fontWeight: '300'
    },

    chip: {
        margin: 4,
    },

    wrapper: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center'
    }
};

class TranslationApp extends React.Component {

    constructor(props) {
        super(props);

        let userLanguage = (navigator.languages && navigator.languages[0]) || navigator.language;
        if (userLanguage) {
            let dividerPos = userLanguage.indexOf("-");
            if (dividerPos > 0) {
                userLanguage = userLanguage.substring(0, dividerPos)
            }
            if (Object.keys(languages).indexOf(userLanguage) === -1) {
                userLanguage = 'en';
            }
        } else {
            userLanguage = 'en';
        }

        this.state = {
            initialized: false,
            language1: userLanguage,
            language2: "en",
            appName: "appbase"
        };
    }

    componentDidMount() {
        this.loadTranslations(this.state.appName);
    }

    loadTranslations(appName) {
        const that = this;
        let appTranslationNew = {};

        fetch('https://abherbs-backend.firebaseio.com/translations_app_new/' + appName + '.json')
            .then(function(result) {
                return result.json();
            }).then(function(item) {
                appTranslationNew = item;

                return fetch('https://abherbs-backend.firebaseio.com/translations_app/' + appName + '.json')
            }).then(function(result) {
                return result.json();
            }).then(function(item) {
                that.setState({
                    initialized: true,
                    language1: that.state.language1,
                    language2: that.state.language2,
                    appName: appName,
                    appTranslationNew: appTranslationNew,
                    appTranslation: item
                });
            })
    }

    handleLanguage1Change = (event, index, value) => {
        this.setState({
            language1: value,
            language2: this.state.language2,
            appName: this.state.appName,
            appTranslationNew: this.state.appTranslationNew,
            appTranslation: this.state.appTranslation
        });
    };

    handleLanguage2Change = (event, index, value) => {
        this.setState({
            language1: this.state.language1,
            language2: value,
            appName: this.state.appName,
            appTranslationNew: this.state.appTranslationNew,
            appTranslation: this.state.appTranslation
        });
    };

    handleClick = (event) => {
        // save new translation
        const that = this;

        let body = {};
        body[this.state.type] = this.state.value;
        fetch('https://abherbs-backend.firebaseio.com/translations_app_new/' + this.state.appName + '/' + this.state.language1 + '.json', {
            method: 'PATCH',
            body: JSON.stringify(body)
        }).then(function(result) {
            return result.json();
        }).then(function(item) {
            that.setState({
                language1: that.state.language1,
                language2: that.state.language2,
                appName: that.state.appName,
                appTranslationNew: that.state.appTranslationNew,
                appTranslation: that.state.appTranslation
            });
        })
    };

    handleAppClick = (id, event) => {
        this.loadTranslations(id);
    };

    render() {
        return (
            <div id='translate_app' style={styles.appTranslation}>
                <div style={styles.header}>
                    Translate app's labels
                </div>
                <div style={styles.col}>
                    <Card style={styles.cardWizard}>
                        <CardText>
                            <p style={styles.center}>
                                On this page you can improve translations of application's labels and texts. Click on a chip to choose an application.
                            </p>
                            <p style={styles.thanks}>
                                Thanks.
                            </p>
                            <div style={styles.center}>
                                <div style={styles.wrapper}>
                                    <Chip
                                        onClick={(e) => this.handleAppClick('appbase', e)}
                                        style={styles.chip}
                                    >
                                        <Avatar src="images/cerastium_96.png" />
                                        Common
                                    </Chip>

                                    <Chip
                                        onClick={(e) => this.handleAppClick('app', e)}
                                        style={styles.chip}
                                        id='app'
                                    >
                                        <Avatar src="images/bellis_96.png" />
                                        What's that flower?
                                    </Chip>

                                    <Chip
                                        onClick={(e) => this.handleAppClick('appplus', e)}
                                        style={styles.chip}
                                        id='appplus'
                                    >
                                        <Avatar src="images/taraxacum_96.png" />
                                        What's that flower? +
                                    </Chip>

                                    <Chip
                                        onClick={(e) => this.handleAppClick('webpage', e)}
                                        style={styles.chip}
                                        id='webpage'
                                    >
                                        <Avatar src="images/paeonia_96.png" />
                                        whatsthatflower.com
                                    </Chip>
                                </div>
                            </div>
                        </CardText>
                    </Card>
                </div>
                <div style={styles.col1}>
                    <Card style={styles.cardWizard}>
                        <CardHeader
                            title="Step 1: Choose your language"
                            subtitle="the one you want to improve (e.g. your native)"
                            avatar={<Language />}
                        />
                        <CardText>
                            <SelectField
                                value={this.state.language1}
                                onChange={this.handleLanguage1Change}
                                maxHeight={200}
                            >
                                {Object.keys(languages).map((code) => (
                                    <MenuItem key={code} value={code} primaryText={languages[code]} />
                                ))}
                            </SelectField>
                        </CardText>
                    </Card>
                </div>
                <div style={styles.col2}>
                    <Card style={styles.cardWizard}>
                        <CardHeader
                            title="Step 2: Choose source language"
                            subtitle="the one you understand the most (English recommended)"
                            avatar={<Language />}
                        />
                        <CardText>
                            <SelectField
                                value={this.state.language2}
                                onChange={this.handleLanguage2Change}
                                maxHeight={200}
                            >
                                {Object.keys(languages).map((code) => (
                                    <MenuItem key={code} value={code} primaryText={languages[code]} />
                                ))}
                            </SelectField>
                        </CardText>
                    </Card>
                </div>
                {this.state && this.state.initialized &&
                    <div>
                        {Object.keys(this.state.appTranslation).map((key, index) => (
                            <TranslateSection key={index}
                                keyString={key}
                                language1={this.state.language1}
                                language2={this.state.language2}
                                appName={this.state.appName}
                                value={this.state.appTranslation[key][this.state.language1]}
                                valueSource={this.state.appTranslation[key][this.state.language2]}
                            />
                        ))}
                    </div>
                }

            </div>
        );
    }
}

export default TranslationApp;