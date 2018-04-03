import React from 'react';
import qs from 'query-string';
import {Card, CardHeader, CardText} from 'material-ui/Card';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';
import MenuItem from 'material-ui/MenuItem';
import AutoComplete from 'material-ui/AutoComplete';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Language from 'material-ui-icons/Language';
import LocalFlorist from 'material-ui-icons/LocalFlorist';
import Translate from 'material-ui-icons/Translate';
import Check from 'material-ui-icons/Check';
import languages from "./languages";
import plants from "./plants";
import FlowerSection from "./FlowerSection";

const styles = {
    flowerTranslation: {
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
        height: 'auto'
    },

    card: {
        marginTop: '10px',
        marginBottom: '10px'
    },

    cardHeader: {
        fontSize: '20px'
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

    lessThanHalf: {
        width: '40%'
    },

    right: {
        float: 'right'
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

        let plantName = props.plantName;
        if (!plantName || plants.indexOf(plantName) === -1) {
            const parsed = qs.parse(props.location.search);
            plantName = parsed["plant"];
            if (!plantName || plants.indexOf(plantName) === -1) {
                plantName = null;
            }
        }

        this.state = {
            initialized: false,
            language: props.language,
            locStrings: props.locStrings,
            language1: props.language,
            language2: "en",
            plantName: plantName,
            plantLabel: '',
            plantNames: '',
            searchText: plantName
        };
    }

    componentDidMount() {
        this.loadTranslations(this.state.plantName, this.state.language1, this.state.language2);
    }

    componentWillReceiveProps(newProps) {
        this.state = {
            language: newProps.language,
            locStrings: newProps.locStrings,
            initialized: this.state.initialized,
            language1: this.state.language1,
            language2: this.state.language2,
            searchText: this.state.searchText,
            plantName: this.state.plantName,
            plantLabel: this.state.plantLabel,
            labelOriginal: this.state.labelOriginal,
            isLabelChanged: this.state.isLabelChanged,
            plantNames: this.state.plantNames,
            namesOriginal: this.state.namesOriginal,
            isNamesChanged: this.state.isNamesChanged,
            plantTranslationNew: this.state.plantTranslationNew,
            plantTranslation: this.state.plantTranslation,
            plantTranslationGT: this.state.plantTranslationGT,
            plantTranslationSource: this.state.plantTranslationSource
        };
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
                let label = that.getLabel(translationNew, translation);
                let names = that.getNames(translationNew, translation);
                that.setState({
                    language: that.state.language,
                    locStrings: that.state.locStrings,
                    initialized: true,
                    language1: language1,
                    language2: language2,
                    searchText: plantName,
                    plantName: plantName,
                    plantLabel: label,
                    labelOriginal: label,
                    isLabelChanged: false,
                    plantNames: names,
                    namesOriginal: names,
                    isNamesChanged: false,
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
                let label = that.getLabel(translationNew, translation);
                let names = that.getNames(translationNew, translation);
                that.setState({
                    language: that.state.language,
                    locStrings: that.state.locStrings,
                    initialized: true,
                    language1: language1,
                    language2: that.state.language2,
                    searchText: plantName,
                    plantName: plantName,
                    plantLabel: label,
                    labelOriginal: label,
                    isLabelChanged: false,
                    plantNames: names,
                    namesOriginal: names,
                    isNamesChanged: false,
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
                    language: that.state.language,
                    locStrings: that.state.locStrings,
                    initialized: true,
                    language1: that.state.language1,
                    language2: language2,
                    searchText: plantName,
                    plantName: plantName,
                    plantLabel: that.state.plantLabel,
                    labelOriginal: that.state.labelOriginal,
                    isLabelChanged: that.state.isLabelChanged,
                    plantNames: that.state.plantNames,
                    namesOriginal: that.state.namesOriginal,
                    isNamesChanged: that.state.isNamesChanged,
                    plantTranslationNew: that.state.plantTranslationNew,
                    plantTranslation: that.state.plantTranslation,
                    plantTranslationGT: that.state.plantTranslationGT,
                    plantTranslationSource: item
                });
            })
    }

    getLabel(translationNew, translation) {
        let label = '';
        if (translationNew && translationNew.label) {
            label = translationNew.label;
        }
        if (!label && translation && translation.label) {
            label = translation.label;
        }

        return label;
    }

    getNames(translationNew, translation) {
        let namesArray = [];
        if (translationNew && translationNew.names) {
            namesArray= translationNew.names;
        }
        if ((!namesArray || namesArray.length === 0) && translation && translation.names) {
            namesArray = translation.names;
        }

        let names = '';
        if (namesArray) {
            names = namesArray.join(', ');
        }

        return names;
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

    handleLabelChange = (event) => {
        let isLabelChanged = this.state.labelOriginal !== event.target.value;
        this.setState({
            plantLabel: event.target.value,
            isLabelChanged: isLabelChanged
        });
    };

    handleNamesChange = (event) => {
        let isNamesChanged = this.state.namesOriginal !== event.target.value;
        this.setState({
            plantNames: event.target.value,
            isNamesChanged: isNamesChanged
        });
    };

    handleClick = (event) => {
        // save new translation
        const that = this;

        let body = {};
        body["label"] = this.state.plantLabel;
        if (this.state.plantNames) {
            body["names"] = this.state.plantNames.split(',').map(Function.prototype.call, String.prototype.trim);
        }
        fetch('https://abherbs-backend.firebaseio.com/translations_new/' + this.state.language1 + '/' + this.state.plantName + '.json', {
            method: 'PATCH',
            body: JSON.stringify(body)
        }).then(function(result) {
            return result.json();
        }).then(function(item) {
            that.setState({
                language: that.state.language,
                locStrings: that.state.locStrings,
                type: that.state.type,
                language1: that.state.language1,
                language2: that.state.language2,
                plantName: that.state.plantName,
                plantLabel: that.state.plantLabel,
                labelOriginal: that.state.plantLabel,
                isLabelChanged: false,
                plantNames: that.state.plantNames,
                namesOriginal: that.state.plantNames,
                isNamesChanged: false,
                plantTranslationNew: that.state.plantTranslationNew,
                plantTranslation: that.state.plantTranslation,
                plantTranslationGT: that.state.plantTranslationGT,
                plantTranslationSource: that.state.plantTranslationSource
            });
        })
    };

    render() {
        return (
            <div id='translate_flower' style={styles.flowerTranslation}>
                <div style={styles.header}>
                    {this.state.locStrings.translate_flower_title}
                </div>
                <div style={styles.col}>
                    <Card style={styles.cardWizard}>
                        <CardText>
                            <p>
                                {this.state.locStrings.translate_flower_description}
                            </p>
                            <p style={styles.thanks}>
                                {this.state.locStrings.thanks}
                            </p>
                        </CardText>
                    </Card>
                </div>
                <div style={styles.col1}>
                    <Card style={styles.cardWizard}>
                        <CardHeader
                            title={this.state.locStrings.step_1}
                            subtitle={this.state.locStrings.step_1_description}
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
                    <Card style={styles.cardWizard}>
                        <CardHeader
                            title={this.state.locStrings.step_3}
                            subtitle={this.state.locStrings.step_3_description}
                            avatar={<LocalFlorist />}
                        />
                        <CardText>
                            <AutoComplete
                                hintText={this.state.locStrings.step_3_text}
                                searchText={this.state.searchText}
                                onUpdateInput={this.handleUpdateInput}
                                onFocus={this.handleNewRequest}
                                dataSource={plants}
                                filter={AutoComplete.caseInsensitiveFilter}
                                openOnFocus={true}
                                maxSearchResults={5}
                                fullWidth={true}
                            />
                        </CardText>
                    </Card>
                </div>
                <div style={styles.col2}>
                    <Card style={styles.cardWizard}>
                        <CardHeader
                            title={this.state.locStrings.step_2}
                            subtitle={this.state.locStrings.step_2_description}
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
                    <Card style={styles.cardWizard}>
                        <CardHeader
                            title={this.state.locStrings.step_4}
                            subtitle={this.state.locStrings.step_4_description}
                            avatar={<Translate />}
                        />
                        <CardText>
                            {this.state.locStrings.step_4_text}
                        </CardText>
                    </Card>
                </div>
                <div style={styles.col}>
                    <Card style={styles.card}>
                        <CardHeader
                            title={this.state.locStrings.translate_names}
                            titleStyle={styles.cardHeader}
                            subtitle={this.state.locStrings.translate_names_description}
                        >
                            <FloatingActionButton disabled={!this.state.plantLabel || (!this.state.isLabelChanged && !this.state.isNamesChanged)} secondary={true} style={styles.right} onClick={this.handleClick}>
                                <Check />
                            </FloatingActionButton>
                        </CardHeader>
                        <CardText>
                            <TextField
                                id={this.state.primary_name}
                                value={this.state.plantLabel}
                                onChange={this.handleLabelChange}
                                style={styles.lessThanHalf}
                                floatingLabelText={this.state.locStrings.name_primary}
                            />
                            <TextField
                                id={this.state.alt_names}
                                value={this.state.plantNames}
                                onChange={this.handleNamesChange}
                                style={styles.full}
                                floatingLabelText={this.state.locStrings.name_alternate}
                                multiLine={true}
                                rows={2}
                                rowsMax={2}
                            />
                        </CardText>
                    </Card>
                </div>
                {this.state && this.state.initialized &&
                    <FlowerSection
                        type="description"
                        description={this.state.locStrings.translate_description}
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
                        description={this.state.locStrings.translate_inflorescence}
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
                        description={this.state.locStrings.translate_flower}
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
                        description={this.state.locStrings.translate_fruit}
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
                        description={this.state.locStrings.translate_leaf}
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
                        description={this.state.locStrings.translate_stem}
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
                        description={this.state.locStrings.translate_habitat}
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
                        description={this.state.locStrings.translate_toxicity}
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
                        type="herbalism"
                        description={this.state.locStrings.translate_herbalism}
                        language1={this.state.language1}
                        language2={this.state.language2}
                        plantName={this.state.plantName}
                        plantTranslationNew={this.state.plantTranslation && this.state.plantTranslationNew && this.state.plantTranslationNew.herbalism}
                        plantTranslation={this.state.plantTranslation && this.state.plantTranslation.herbalism}
                        plantTranslationGT={this.state.plantTranslationGT && this.state.plantTranslationGT.herbalism}
                        plantTranslationSource={this.state.plantTranslationSource && this.state.plantTranslationSource.herbalism}
                    />
                }
                {this.state && this.state.initialized &&
                    <FlowerSection
                        type="trivia"
                        description={this.state.locStrings.translate_trivia}
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