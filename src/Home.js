import React, {Component} from 'react';
import {Card, CardMedia, CardTitle} from 'material-ui/Card';
import VersionTable from "./VersionTable";
import Flower from "./Flower";
import plants from "./plants"

const styles = {
    container: {
        width: '1200px',
        height: 'auto',
        overflow: 'auto',
        margin: '0 auto'
    },
};

const plantTest = {
    "filterColor" : [ "green" ],
    "filterHabitat" : [ "woodlands or forests" ],
    "filterPetal" : [ "5" ],
    "floweringFrom" : 3,
    "floweringTo" : 5,
    "heightFrom" : 8,
    "heightTo" : 10,
    "illustrationUrl" : "Dipsacales/Adoxaceae/Adoxa_moschatellina/Adoxa_moschatellina.webp",
    "name" : "Adoxa moschatellina",
    "photoUrls" : [ "Dipsacales/Adoxaceae/Adoxa_moschatellina/am1.webp", "Dipsacales/Adoxaceae/Adoxa_moschatellina/am2.webp", "Dipsacales/Adoxaceae/Adoxa_moschatellina/am3.webp" ],
    "plantId" : 189898,
    "taxonomy" : {
        "00_Genus" : "Adoxa",
        "01_Familia" : "Adoxaceae",
        "02_Ordo" : "Dipsacales",
        "03_Cladus" : "Euasterids_II",
        "04_Cladus" : "Asterids",
        "05_Cladus" : "Core_eudicots",
        "06_Cladus" : "Eudicots",
        "07_Cladus" : "Angiosperms",
        "08_Regnum" : "Plantae",
        "09_Superregnum" : "Eukaryota"
    },
    "wikiName" : "Adoxa moschatellina",
    "wikilinks" : {
        "commons" : "https://commons.wikimedia.org/wiki/Adoxa_moschatellina",
        "species" : "https://species.wikimedia.org/wiki/Adoxa_moschatellina"
    }
}

const plantTranslation = {
    "description" : "Perennial herb, native to Europe, Asia, and North America.",
    "flower" : "Greenish yellow, 6-8 mm wide, fused, 4-5-lobed. Calyx with 2 or 3 lobes. 4 or 5 stamens, pinnatifid. Pistil of 4 or 5 fused carpels, style solitary, 5 stigmas.",
    "fruit" : "Berry-like, greenish, 5 mm long.",
    "habitat" : "Broad-leaved forests, hedgerows, stream and river banks.",
    "inflorescence" : "Consists of five flowers: one four-petalled flower facing upwards, and four five-petalled flowers facing horizontally.",
    "label" : "common moschatel",
    "leaf" : "Greyish green, base and stem with 2 opposite leaves. Basal leaf blades 2 times 3-lobed, large-toothed, stem leaf blade once lobed.",
    "names" : [ "moschatel", "five-faced bishop", "hollowroot", "muskroot", "townhall clock", "tuberous crowfoot" ],
    "sourceUrls" : [ "http://www.luontoportti.com/suomi/en/kukkakasvit/moschatel", "https://commons.wikimedia.org/wiki/Category:Adoxa_moschatellina#mediaviewer/File:Kwiat_001pl.jpg" ],
    "stem" : "Rootstock creeping, scaly. With runners.",
    "wikipedia" : "https://en.wikipedia.org/wiki/Adoxa_moschatellina"
}

class Home extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            plant: {}
        };
    }

    componentDidMount() {
        var i = Math.floor(Math.random() * (plants.length -1));
        var me = this;
        fetch('https://abherbs-backend.firebaseio.com/plants/' + plants[i] + '.json')
            .then(result => result.json())
            .then(item =>
                me.setState({plant: item}))
    }

    render() {
        return (
            <div>
                <div style={styles.container}>
                    <Card>
                        <CardMedia
                            overlay={<CardTitle title='Identify flower and learn about it' />}
                        >
                            <img alt='' src='/images/herbsplus.png' />
                        </CardMedia>
                    </Card>
                </div>
                <div style={styles.container}>
                    <Flower
                        plant={this.state.plant}
                        plantTranslation={plantTranslation}
                    />
                </div>
                <div style={styles.container}>
                    <VersionTable/>
                </div>
            </div>
        );
    }
}

export default Home;