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
    this.g_abnormal_X_quantities();
}

// move to superclass?
PhenotypeOG.prototype.allAnatomicalEntity = function() {
    return this.allSubClassesOf('anatomical entity');
}

// MAIN GRAMMAR

// abnormal {A} morphology
PhenotypeOG.prototype.g_abnormal_X_morphology = function() {
    var anats = this.allAnatomicalEntity();
    var m = this.lookup('morphology');
    for (var a in anats) {
        this.info("Anat: "+anats[a]);
        this.gen(['abnormal',anats[a],'morphology'],
                 this.x_EQ(anats[a], m));
    }
}

// {increased,decreased} A {size,wight,...}
PhenotypeOG.prototype.g_abnormal_X_quantities = function() {
    var anats = this.allAnatomicalEntity();
    var quants = ["size", "weight"];
    var changes = ["increased", "decreased"];
    for (var ai in anats) {
        var a = anats[ai];
        for (var qi in quants) {
            var q = quants[qi];
            for (ci in changes) {
                var change = changes[ci];
                var qclass = this.lookup(change+" "+q);
                this.gen([change,a,q],
                         this.x_EQ(a, qclass));
            }
        }
    }
}

PhenotypeOG.prototype.x_EQ = function(e,q) {
    return this.someValuesFrom(this.hasPart(),
                               this.pairwiseIntersectionOf(e,
                                                           this.someValuesFrom(this.hasQuality(),
                                                                               q)));
}


function t() {
    x("ontologies/caro.owl ontologies/pato.owl --reasoner elk");
    pog = new PhenotypeOG(g());
    pog.generateOntology();
    pog.saveOntology("out/t.owl");
}
