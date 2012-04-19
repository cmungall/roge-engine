function PhenotypeOG(g) {
    OntologyGenerator.call(this, g);
    this.objectPropertyMap = 
        {hasPart : "has part",
         hasQuality : "has quality"};
}
PhenotypeOG.prototype = new OntologyGenerator(null);

PhenotypeOG.prototype.generateAxioms = function () {
    this.initObjectPropertyMap(this);

    this.g_abnormal_X_morphology();
}

// move to superclass?
PhenotypeOG.prototype.allAnatomicalEntity = function() {
    return this.allSubClassesOf('anatomical entity');
}
//PhenotypeOG.prototype.hasPart = function() { return this.makeObjectProperty("has part") }
//PhenotypeOG.prototype.hasQuality = function() { return this.makeObjectProperty("has quality") }

PhenotypeOG.prototype.g_abnormal_X_morphology = function() {
    var anats = this.allAnatomicalEntity();
    var m = this.lookup('morphology');
    for (var a in anats) {
        this.info("Anat: "+anats[a]);
        this.gen(['abnormal',anats[a],'morphology'],
                 this.someValuesFrom(this.hasPart(),
                                     this.pairwiseIntersectionOf(anats[a],
                                                                 this.someValuesFrom(this.hasQuality(),m))));
                                                                 
    }
}

/*
function g_abnormal_X_size() {
    var anats = l_anat();
    for (a in anats) {
        for (size in l_size()) {
            gen(['abnormal',anats,'morphology'],
                someValuesFrom(hasPart(),
                               pairwiseIntersectionOf(a,someValuesFrom(hasQuality(),m))));
        }
    }
}
*/


/*


function get_label_from_tokens(tokens) {
    for (i=0; i<tokens.length; i++) {
        var token = tokens[i];
        var labelPart = token;
        if (typeof token != "string")  {
            //
        }
    }
}


*/

function t() {
    x("ontologies/caro.owl ontologies/pato.owl --reasoner elk");
    pog = new PhenotypeOG(g());
    pog.generateOntology();
    pog.saveOntology("out/t.owl");
}
