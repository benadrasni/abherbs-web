import React, {Component} from 'react';
import {Card, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import {Table, TableBody, TableRow, TableRowColumn} from 'material-ui/Table';
import {GridList, GridTile} from 'material-ui/GridList';
import MapsLocalFlorist from 'material-ui/svg-icons/maps/local-florist';
import ImagePalette from 'material-ui/svg-icons/image/palette';
import createReactClass from 'create-react-class';

const styles = {
    col1: {
        maxWidth: '594px',
        marginLeft: '1px',
        marginRight: '5px',
        float: 'left'
    },

    col2: {
        maxWidth: '594px',
        marginLeft: '5px',
        marginRight: '1px',
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
        return <reactNode></reactNode>;
    }
});

export default class Flower extends Component {

    constructor(props) {
        super(props);

        this.state = {
            photoIndex: 0
        };

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(index) {
        this.setState({photoIndex: index});
    }

    render() {
        return (
            <div>
                <div style={styles.col1}>
                    <Card style={styles.flowerCard}>
                        <CardHeader
                            title="Flower for the moment"
                            subtitle="a random pick from our database"
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
                        <CardTitle title={this.props.plantTranslation && this.props.plantTranslation.label} subtitle={this.props.plantTranslation && this.props.plantTranslation.names && this.props.plantTranslation.names.join(', ')} />
                        <CardText>
                            <div>{this.props.plantTranslation && this.props.plantTranslation.description}</div>
                            <div><i>Flowers:&nbsp;</i>{this.props.plantTranslation && this.props.plantTranslation.flower}</div>
                            <div><i>Fruit:&nbsp;</i>{this.props.plantTranslation && this.props.plantTranslation.fruit}</div>
                            <div><i>Leaaves:&nbsp;</i>{this.props.plantTranslation && this.props.plantTranslation.leaf}</div>
                            <div><i>Stem:&nbsp;</i>{this.props.plantTranslation && this.props.plantTranslation.stem}</div>
                            <div><i>Habitat:&nbsp;</i>{this.props.plantTranslation && this.props.plantTranslation.habitat}</div>
                        </CardText>
                    </Card>
                </div>
                <div style={styles.col2}>
                    <Card style={styles.flowerCard}>
                        <CardHeader
                            title="Illustration"
                            subtitle="from ancient botany scrolls"
                            avatar={<ImagePalette />}
                        />
                        <CardMedia>
                            {this.props.plant.illustrationUrl &&
                                <img alt='' src={'http://storage.googleapis.com/abherbs-resources/photos/' + this.props.plant.illustrationUrl}/>
                            }
                        </CardMedia>
                    </Card>
                    <Card style={styles.flowerCard}>
                        <CardTitle title="Taxonomy" subtitle="APG IV" />
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