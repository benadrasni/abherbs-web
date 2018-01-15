import React from 'react';
import {Card, CardHeader, CardText} from 'material-ui/Card';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import AutoComplete from 'material-ui/AutoComplete';
import Language from 'material-ui-icons/Language';
import LocalFlorist from 'material-ui-icons/LocalFlorist';
import Translate from 'material-ui-icons/Translate';
import languages from "./languages";
import plants from "./plants";
import FlowerSection from "./FlowerSection";

const styles = {
    flowerTranslation: {
        marginTop: '100px',
        float: 'none'
    },

    header: {
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
        marginLeft: '2px',
        marginRight: '2px',
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

    card: {
        marginTop: '10px',
        marginBottom: '10px'
    },

    sectionHeader: {
        fontSize: '18px',
        fontWeight: '200',
        textAlign: 'left',
        paddingLeft: '10px'
    },

    full: {
        width: '100%'
    },

    thanks: {
        textAlign: 'center',
        fontSize: '20px',
        fontWeight: '300'
    }

};

class TranslationFlower extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            initialized: false,
            language1: "sk",
            language2: "en",
            plantName: props.plantName,
            searchText: props.plantName
        };
    }

    componentDidMount() {
        this.loadTranslations(this.state.plantName, this.state.language1, this.state.language2);
    }

    loadTranslations(plantName, language1, language2) {
        const that = this;
        let translationNew = {}, translation = {}, translationGT = {};

        fetch('https://abherbs-backend.firebaseio.com/translations_new/' + language1 + '/' + plantName + '.json')
            .then(function(result) {
                return result.json();
            }).then(function(item) {
                translationNew = item;

                return fetch('https://abherbs-backend.firebaseio.com/translations/' + language1 + '/' + plantName + '.json')
            }).then(function(result) {
                return result.json();
            }).then(function(item) {
                translation = item;

                return fetch('https://abherbs-backend.firebaseio.com/translations/' + language1 + '-GT/' + plantName + '.json')
            }).then(function(result) {
                return result.json();
            }).then(function(item) {
                translationGT = item;

                return fetch('https://abherbs-backend.firebaseio.com/translations/' + language2 + '/' + plantName + '.json')
            }).then(function(result) {
                return result.json();
            }).then(function(item) {
                that.setState({
                    initialized: true,
                    language1: language1,
                    language2: language2,
                    searchText: plantName,
                    plantName: plantName,
                    plantTranslationNew: translationNew,
                    plantTranslation: translation,
                    plantTranslationGT: translationGT,
                    plantTranslationSource: item
                });
            })
    }

    loadTranslation(plantName, language1) {
        const that = this;
        let translationNew = {}, translation = {};

        fetch('https://abherbs-backend.firebaseio.com/translations_new/' + language1 + '/' + plantName + '.json')
            .then(function(result) {
                return result.json();
            }).then(function(item) {
                translationNew = item;

                return fetch('https://abherbs-backend.firebaseio.com/translations/' + language1 + '/' + plantName + '.json')
            }).then(function(result) {
                return result.json();
            }).then(function(item) {
                translation = item;

                return fetch('https://abherbs-backend.firebaseio.com/translations/' + language1 + '-GT/' + plantName + '.json')
            }).then(function(result) {
                return result.json();
            }).then(function(item) {
                that.setState({
                    initialized: true,
                    language1: language1,
                    language2: that.state.language2,
                    searchText: plantName,
                    plantName: plantName,
                    plantTranslationNew: translationNew,
                    plantTranslation: translation,
                    plantTranslationGT: item,
                    plantTranslationSource: that.state.plantTranslationSource
                });
            })
    }

    loadTranslationSource(plantName, language2) {
        const that = this;
        fetch('https://abherbs-backend.firebaseio.com/translations/' + language2 + '/' + plantName + '.json')
            .then(function(result) {
                return result.json();
            }).then(function(item) {
                that.setState({
                    initialized: true,
                    language1: that.state.language1,
                    language2: language2,
                    searchText: plantName,
                    plantName: plantName,
                    plantTranslationNew: that.state.plantTranslationNew,
                    plantTranslation: that.state.plantTranslation,
                    plantTranslationGT: that.state.plantTranslationGT,
                    plantTranslationSource: item
                });
            })
    }

    handleLanguage1Change = (event, index, value) => {
        this.loadTranslation(this.state.plantName, value);
    };

    handleLanguage2Change = (event, index, value) => {
        this.loadTranslationSource(this.state.plantName, value);
    };

    handleUpdateInput = (searchText, dataSource, params) => {
        if (params.source === 'click') {
            this.loadTranslations(searchText, this.state.language1, this.state.language2);
        } else {
            this.setState({
                searchText: searchText
            });
        }
    };

    handleNewRequest = () => {
        this.setState({
            searchText: ''
        });
    };

    render() {
        return (
            <div id='translation_flower' style={styles.flowerTranslation}>
                <div style={styles.header}>
                    Translate flower's data
                </div>
                <Card style={styles.card}>
                    <CardText>
                        <p>
                        The application can only be as good as data it is presenting. Currently most of non-English and non-Slovak texts are translated with Google's help.
                        Some translations are quite accurate, others are understandable or maybe even funny but everybody will agree that more native version won't hurt.
                        Even already translated texts could be improved. Here is your chance to do it.
                        </p>
                        <p style={styles.thanks}>
                        Thanks.
                        </p>
                    </CardText>
                </Card>
                <div style={styles.col1}>
                    <Card style={styles.card}>
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
                    <Card style={styles.card}>
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
                <div style={styles.col}>
                    <Card style={styles.card}>
                        <CardHeader
                            title="Step 3: Choose flower"
                            subtitle="by typing its Latin name (only 5 matching names are shown)"
                            avatar={<LocalFlorist />}
                        />
                        <CardText>
                            <AutoComplete
                                hintText="Type Latin name, case insensitive"
                                searchText={this.state.searchText}
                                onUpdateInput={this.handleUpdateInput}
                                onFocus={this.handleNewRequest}
                                dataSource={plants}
                                filter={AutoComplete.caseInsensitiveFilter}
                                openOnFocus={true}
                                maxSearchResults={5}
                            />
                        </CardText>
                    </Card>
                    <Card style={styles.card}>
                        <CardHeader
                            title="Step 4: Translate / Improve"
                            subtitle="The flower's data is divided into 9 sections: description, inflorescence, flower, fruit, leaf, stem, habitat, toxicity, trivia. Translate icon next to section's name indicates translation via Google Translate."
                            avatar={<Translate />}
                        />
                    </Card>
                </div>
                {this.state && this.state.initialized &&
                    <FlowerSection
                        type="description"
                        language1={this.state.language1}
                        language2={this.state.language2}
                        plantName={this.state.plantName}
                        plantTranslationNew={this.state.plantTranslationNew && this.state.plantTranslationNew.description}
                        plantTranslation={this.state.plantTranslation && this.state.plantTranslation.description}
                        plantTranslationGT={this.state.plantTranslationGT && this.state.plantTranslationGT.description}
                        plantTranslationSource={this.state.plantTranslationSource && this.state.plantTranslationSource.description}
                    />
                }
                {this.state && this.state.initialized &&
                    < FlowerSection
                        type="inflorescence"
                        language1={this.state.language1}
                        language2={this.state.language2}
                        plantName={this.state.plantName}
                        plantTranslationNew={this.state.plantTranslationNew && this.state.plantTranslationNew.inflorescence}
                        plantTranslation={this.state.plantTranslation && this.state.plantTranslation.inflorescence}
                        plantTranslationGT={this.state.plantTranslationGT && this.state.plantTranslationGT.inflorescence}
                        plantTranslationSource={this.state.plantTranslationSource && this.state.plantTranslationSource.inflorescence}
                    />
                }
                {this.state && this.state.initialized &&
                    <FlowerSection
                        type="flower"
                        language1={this.state.language1}
                        language2={this.state.language2}
                        plantName={this.state.plantName}
                        plantTranslationNew={this.state.plantTranslationNew && this.state.plantTranslationNew.flower}
                        plantTranslation={this.state.plantTranslation && this.state.plantTranslation.flower}
                        plantTranslationGT={this.state.plantTranslationGT && this.state.plantTranslationGT.flower}
                        plantTranslationSource={this.state.plantTranslationSource && this.state.plantTranslationSource.flower}
                    />
                }
                {this.state && this.state.initialized &&
                    <FlowerSection
                        type="fruit"
                        language1={this.state.language1}
                        language2={this.state.language2}
                        plantName={this.state.plantName}
                        plantTranslationNew={this.state.plantTranslationNew && this.state.plantTranslationNew.fruit}
                        plantTranslation={this.state.plantTranslation && this.state.plantTranslation.fruit}
                        plantTranslationGT={this.state.plantTranslationGT && this.state.plantTranslationGT.fruit}
                        plantTranslationSource={this.state.plantTranslationSource && this.state.plantTranslationSource.fruit}
                    />
                }
                {this.state && this.state.initialized &&
                    <FlowerSection
                        type="leaf"
                        language1={this.state.language1}
                        language2={this.state.language2}
                        plantName={this.state.plantName}
                        plantTranslationNew={this.state.plantTranslationNew && this.state.plantTranslationNew.leaf}
                        plantTranslation={this.state.plantTranslation && this.state.plantTranslation.leaf}
                        plantTranslationGT={this.state.plantTranslationGT && this.state.plantTranslationGT.leaf}
                        plantTranslationSource={this.state.plantTranslationSource && this.state.plantTranslationSource.leaf}
                    />
                }
                {this.state && this.state.initialized &&
                    <FlowerSection
                        type="stem"
                        language1={this.state.language1}
                        language2={this.state.language2}
                        plantName={this.state.plantName}
                        plantTranslationNew={this.state.plantTranslationNew && this.state.plantTranslationNew.stem}
                        plantTranslation={this.state.plantTranslation && this.state.plantTranslation.stem}
                        plantTranslationGT={this.state.plantTranslationGT && this.state.plantTranslationGT.stem}
                        plantTranslationSource={this.state.plantTranslationSource && this.state.plantTranslationSource.stem}
                    />
                }
                {this.state && this.state.initialized &&
                    <FlowerSection
                        type="habitat"
                        language1={this.state.language1}
                        language2={this.state.language2}
                        plantName={this.state.plantName}
                        plantTranslationNew={this.state.plantTranslationNew && this.state.plantTranslationNew.habitat}
                        plantTranslation={this.state.plantTranslation && this.state.plantTranslation.habitat}
                        plantTranslationGT={this.state.plantTranslationGT && this.state.plantTranslationGT.habitat}
                        plantTranslationSource={this.state.plantTranslationSource && this.state.plantTranslationSource.habitat}
                    />
                }
                {this.state && this.state.initialized &&
                    <FlowerSection
                        type="toxicity"
                        language1={this.state.language1}
                        language2={this.state.language2}
                        plantName={this.state.plantName}
                        plantTranslationNew={this.state.plantTranslation && this.state.plantTranslationNew && this.state.plantTranslationNew.toxicity}
                        plantTranslation={this.state.plantTranslation && this.state.plantTranslation.toxicity}
                        plantTranslationGT={this.state.plantTranslationGT && this.state.plantTranslationGT.toxicity}
                        plantTranslationSource={this.state.plantTranslationSource && this.state.plantTranslationSource.toxicity}
                    />
                }
                {this.state && this.state.initialized &&
                    <FlowerSection
                        type="trivia"
                        language1={this.state.language1}
                        language2={this.state.language2}
                        plantName={this.state.plantName}
                        plantTranslationNew={this.state.plantTranslationNew && this.state.plantTranslationNew.trivia}
                        plantTranslation={this.state.plantTranslation && this.state.plantTranslation.trivia}
                        plantTranslationGT={this.state.plantTranslationGT && this.state.plantTranslationGT.trivia}
                        plantTranslationSource={this.state.plantTranslationSource && this.state.plantTranslationSource.trivia}
                    />
                }

            </div>
        );
    }
}

export default TranslationFlower;