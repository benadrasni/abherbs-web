import React from 'react';
import {Card, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import {Table, TableBody, TableRow, TableRowColumn} from 'material-ui/Table';
import {GridList, GridTile} from 'material-ui/GridList';
import MapsLocalFlorist from 'material-ui-icons/LocalFlorist';
import ImagePalette from 'material-ui-icons/Palette';
import createReactClass from 'create-react-class';

const styles = {
    col1: {
        maxWidth: '596px',
        marginLeft: '2px',
        marginRight: '2px',
        float: 'left'
    },

    col2: {
        maxWidth: '596px',
        marginLeft: '2px',
        marginRight: '2px',
        float: 'left'
    },

    flowerCard: {
        marginTop: '10px',
        marginBottom: '10px'
    },

    taxonomyRow: {
        height: '22px'
    },

    gridList: {
        display: 'flex'
    }
};

var Family = createReactClass({
    render: function() {
        var prop;
        for(prop in this.props.taxonomy) {
            if (prop.endsWith('Familia')) {
                return <reactNode> <span>{this.props.taxonomy[prop]}</span> </reactNode>;
            }
        }
        return <reactNode/>;
    }
});

class Flower extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            language: props.language,
            locStrings: props.locStrings,
            photoIndex: 0,
            plant: props.plant,
            plantTranslation: props.plantTranslation
        };

        this.handleClick = this.handleClick.bind(this);
    }

    componentWillReceiveProps(newProps) {
        this.state = {
            language: newProps.language,
            locStrings: newProps.locStrings,
            photoIndex: this.state.photoIndex,
            plant: newProps.plant,
            plantTranslation: newProps.plantTranslation
        };
    }

    handleClick(index) {
        this.setState({
            language: this.state.language,
            locStrings: this.state.locStrings,
            photoIndex: index
        });
    }

    render() {
        return (
            <div>
                <div style={styles.col1}>
                    <Card style={styles.flowerCard}>
                        <CardHeader
                            title={this.state.locStrings.flower_now}
                            subtitle={this.state.locStrings.flower_now_description}
                            avatar={<MapsLocalFlorist />}
                        />
                        <CardMedia
                            overlay={<CardTitle title={this.props.plant.name} subtitle={<Family taxonomy={this.props.plant.APGIV} />} />}
                        >
                            {this.props.plant.photoUrls &&
                                <img alt='' src={'http://storage.googleapis.com/abherbs-resources/photos/' + this.props.plant.photoUrls[this.state.photoIndex]}/>
                            }
                        </CardMedia>
                    </Card>
                    <Card style={styles.flowerCard}>
                        <CardText>
                            <GridList cols={2} style={styles.gridList}>
                                {this.props.plant.photoUrls && this.props.plant.photoUrls.map((tile, index) => (
                                    <GridTile key={index}>
                                        <img alt='' onClick={() => this.handleClick(index)} src={'http://storage.googleapis.com/abherbs-resources/photos/' + tile} />
                                    </GridTile>
                                ))}
                            </GridList>
                        </CardText>
                    </Card>
                    <Card style={styles.flowerCard}>
                        <CardTitle title={this.state.plantTranslation && this.state.plantTranslation.label} subtitle={this.state.plantTranslation && this.state.plantTranslation.names && this.state.plantTranslation.names.join(', ')} />
                        <CardText>
                            <div>{this.state.plantTranslation && this.state.plantTranslation.description}</div>
                            <div><img alt={this.state.locStrings.translate_inflorescence} src='images/ic_inflorescence_grey_24dp.png' />&nbsp;{this.state.plantTranslation && this.state.plantTranslation.inflorescence}</div>
                            <div><img alt={this.state.locStrings.translate_flower} src='images/ic_flower_grey_24dp.png' />&nbsp;{this.state.plantTranslation && this.state.plantTranslation.flower}</div>
                            <div><img alt={this.state.locStrings.translate_fruit} src='images/ic_fruit_grey_24dp.png' />&nbsp;{this.state.plantTranslation && this.state.plantTranslation.fruit}</div>
                            <div><img alt={this.state.locStrings.translate_leaf} src='images/ic_leaf_grey_24dp.png' />&nbsp;{this.state.plantTranslation && this.state.plantTranslation.leaf}</div>
                            <div><img alt={this.state.locStrings.translate_stem} src='images/ic_stem_grey_24dp.png' />&nbsp;{this.state.plantTranslation && this.state.plantTranslation.stem}</div>
                            <div><img alt={this.state.locStrings.translate_habitat} src='images/ic_home_grey_24dp.png' />&nbsp;{this.state.plantTranslation && this.state.plantTranslation.habitat}</div>
                            <div><img alt={this.state.locStrings.translate_toxicity} src='images/ic_toxicity_grey_24dp.png' />&nbsp;{this.state.plantTranslation && this.state.plantTranslation.toxicity}</div>
                            <div><img alt={this.state.locStrings.translate_habitat} src='images/ic_local_pharmacy_grey_24dp.png' />&nbsp;{this.state.plantTranslation && this.state.plantTranslation.herbalism}</div>
                            <div><img alt={this.state.locStrings.translate_habitat} src='images/ic_question_mark_grey_24dp.png' />&nbsp;{this.state.plantTranslation && this.state.plantTranslation.trivia}</div>
                        </CardText>
                    </Card>
                </div>
                <div style={styles.col2}>
                    <Card style={styles.flowerCard}>
                        <CardHeader
                            title={this.state.locStrings.illustration}
                            subtitle={this.state.locStrings.illustration_description}
                            avatar={<ImagePalette />}
                        />
                        <CardMedia>
                            {this.props.plant.illustrationUrl &&
                                <img alt='' src={'http://storage.googleapis.com/abherbs-resources/photos/' + this.props.plant.illustrationUrl}/>
                            }
                        </CardMedia>
                    </Card>
                    <Card style={styles.flowerCard}>
                        <CardTitle title={this.state.locStrings.taxonomy} subtitle={this.state.locStrings.taxonomy_description} />
                        <CardText>
                            <Table selectable={false}>
                                <TableBody displayRowCheckbox={false}>
                                    {this.props.plant.taxonomy && Object.entries(this.props.plant.APGIV).map( (prop, index) => (
                                        <TableRow style={styles.taxonomyRow} displayBorder={false} key={index}>
                                            <TableRowColumn style={styles.taxonomyRow}>{prop[0].substring(prop[0].indexOf('_')+1)}</TableRowColumn>
                                            <TableRowColumn style={styles.taxonomyRow}>{prop[1]}</TableRowColumn>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardText>
                    </Card>
                </div>
            </div>
        );
    }
}

export default Flower;