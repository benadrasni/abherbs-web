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
    }

};

class TranslationFlower extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            language1: "sk",
            language2: "en",
            plantName: props.plantName
        };
    }

    componentDidMount() {
        this.loadTranslation(this.state.language1);
        this.loadTranslationSource(this.state.language2);
    }

    loadTranslation(value) {
        const that = this;
        fetch('https://abherbs-backend.firebaseio.com/translations/' + value + '/' + this.state.plantName + '.json')
            .then(result => result.json())
            .then(item =>
                that.setState({
                    language1: value,
                    language2: that.state.language2,
                    plantName: that.state.plantName,
                    plantTranslation: item,
                    plantTranslationSource: that.state.plantTranslationSource
                }));
    }

    loadTranslationSource(value) {
        const that = this;
        fetch('https://abherbs-backend.firebaseio.com/translations/' + value + '/' + this.state.plantName + '.json')
            .then(result => result.json())
            .then(item =>
                that.setState({
                    language1: that.state.language1,
                    language2: value,
                    plantName: that.state.plantName,
                    plantTranslation: that.state.plantTranslation,
                    plantTranslationSource: item
                }))
    }

    handleLanguage1Change = (event, index, value) => {
        this.loadTranslation(value);
    };

    handleLanguage2Change = (event, index, value) => {
        this.loadTranslationSource(value);
    };

    handleUpdateInput = (searchText) => {
        this.setState({
            plantName: searchText
        });
    };

    render() {
        return (
            <div id='translation_flower'>
                <div style={styles.header}>
                    Translation flower's data
                </div>
                <Card style={styles.card}>
                    <CardText>
                        The application can only be as good as data it is presenting. Currently most of non-English and non-Slovak texts are translated with Google's help.
                        Some translations are quite accurate, others are understandable or maybe even funny but everybody will agree that more native version won't hurt.
                        Even already translated texts could be improved. Here is your chance to do it. Thanks.
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
                            subtitle="by its Latin name"
                            avatar={<LocalFlorist />}
                        />
                        <CardText>
                            <AutoComplete
                                hintText="Type Latin name, case insensitive"
                                searchText={this.state.plantName}
                                onUpdateInput={this.handleUpdateInput}
                                dataSource={plants}
                                filter={AutoComplete.fuzzyFilter}
                                openOnFocus={true}
                            />
                        </CardText>
                    </Card>
                    <Card style={styles.card}>
                        <CardHeader
                            title="Step 4: Translation / Improvement"
                            subtitle="The flower's data is divided into 9 sections: Description, Inflorescence, Flower, Fruit, Leaf, Stem, Habitat, Toxicity, Trivia"
                            avatar={<Translate />}
                        />
                    </Card>
                </div>
                {this.state && this.state.plantTranslation && this.state.plantTranslationSource &&
                    <FlowerSection
                        type="Description"
                        language2={this.state.language2}
                        plantTranslation={this.state.plantTranslation.description}
                        plantTranslationSource={this.state.plantTranslationSource.description}
                    />
                }
                {this.state && this.state.plantTranslation && this.state.plantTranslationSource &&
                    < FlowerSection
                        type="Inflorescence"
                        language2={this.state.language2}
                        plantTranslation={this.state.plantTranslation.inflorescence}
                        plantTranslationSource={this.state.plantTranslationSource.inflorescence}
                    />
                }
                {this.state && this.state.plantTranslation && this.state.plantTranslationSource &&
                    <FlowerSection
                        type="Flower"
                        language2={this.state.language2}
                        plantTranslation={this.state.plantTranslation.flower}
                        plantTranslationSource={this.state.plantTranslationSource.flower}
                    />
                }
                {this.state && this.state.plantTranslation && this.state.plantTranslationSource &&
                    <FlowerSection
                        type="Fruit"
                        language2={this.state.language2}
                        plantTranslation={this.state.plantTranslation.fruit}
                        plantTranslationSource={this.state.plantTranslationSource.fruit}
                    />
                }
                {this.state && this.state.plantTranslation && this.state.plantTranslationSource &&
                    <FlowerSection
                        type="Leaf"
                        language2={this.state.language2}
                        plantTranslation={this.state.plantTranslation.leaf}
                        plantTranslationSource={this.state.plantTranslationSource.leaf}
                    />
                }
                {this.state && this.state.plantTranslation && this.state.plantTranslationSource &&
                    <FlowerSection
                        type="Stem"
                        language2={this.state.language2}
                        plantTranslation={this.state.plantTranslation.stem}
                        plantTranslationSource={this.state.plantTranslationSource.stem}
                    />
                }
                {this.state && this.state.plantTranslation && this.state.plantTranslationSource &&
                    <FlowerSection
                        type="Habitat"
                        language2={this.state.language2}
                        plantTranslation={this.state.plantTranslation.habitat}
                        plantTranslationSource={this.state.plantTranslationSource.habitat}
                    />
                }
                {this.state && this.state.plantTranslation && this.state.plantTranslationSource &&
                    <FlowerSection
                        type="Toxicity"
                        language2={this.state.language2}
                        plantTranslation={this.state.plantTranslation.toxicity}
                        plantTranslationSource={this.state.plantTranslationSource.toxicity}
                    />
                }
                {this.state && this.state.plantTranslation && this.state.plantTranslationSource &&
                    <FlowerSection
                        type="Trivia"
                        language2={this.state.language2}
                        plantTranslation={this.state.plantTranslation.trivia}
                        plantTranslationSource={this.state.plantTranslationSource.trivia}
                    />
                }

            </div>
        );
    }
}

export default TranslationFlower;