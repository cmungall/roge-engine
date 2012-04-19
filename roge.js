importPackage(java.io);
importPackage(Packages.org.semanticweb.owlapi.model);
importPackage(Packages.org.semanticweb.owlapi.io);
importPackage(Packages.owltools.cli);
importPackage(Packages.owltools.io);
importPackage(Packages.owltools.mooncat);
importPackage(Packages.owltools.graph);
importPackage(Packages.org.obolibrary.macro);
importPackage(Packages.com.google.gson);



function OntologyGenerator(g) {
    this.graph = g;
    this.newOntology = null;
    this.nextId = 0;
    this.saveFormat = new OWLFunctionalSyntaxOntologyFormat();
}
OntologyGenerator.prototype.getNextId = function() {
    this.nextId++;
    return this.nextId;
}
OntologyGenerator.prototype.initObjectPropertyMap = function(obj) {
    function mkFunc(label) {
        return function() { return obj.makeObjectProperty(label) };
    }
    var pmap = obj.objectPropertyMap;
    for (var p in pmap) {
        this.info(p+ " --> "+pmap[p]+" "+obj);
        obj[p] = mkFunc(pmap[p]);
    }
}
OntologyGenerator.prototype.info = function(msg) {
    print(msg);
}
OntologyGenerator.prototype.getReasoner = function() {
    return this.graph.getReasoner();
}
OntologyGenerator.prototype.allSubClassesOf = function(rootLabel) {
    var root = this.lookup(rootLabel);
    return this.getReasoner().getSubClasses(root, false).getFlattened().toArray();
}

OntologyGenerator.prototype.getDataFactory = function() {
    return this.graph.getDataFactory();
}
OntologyGenerator.prototype.getManager = function() {
    return this.graph.getManager();
}

OntologyGenerator.prototype.generateOntology = function() {
    this.newOntology = this.getManager().createOntology();
    var importList = this.graph.getAllOntologies().toArray();
    for (i in importList) {
        var ai = new AddImport(this.newOntology, this.getDataFactory().getOWLImportsDeclaration(importList[i].getOntologyID().getOntologyIRI()));
        this.getManager().applyChange(ai);
    }
    this.generateAxioms();
    // todo - classify - if asked
}

OntologyGenerator.prototype.saveOntology = function(path) {
    var file = new File(path);
    this.getManager().saveOntology(this.newOntology,
                                   this.saveFormat,
                                   IRI.create(file.getCanonicalFile()));
                                   
}

OntologyGenerator.prototype.addAxiom = function(ax) {
    this.info("AX:"+ax);
    this.getManager().addAxiom(this.newOntology, ax);
}


OntologyGenerator.prototype.lookup = function(label) {
    return this.graph.getOWLObjectByLabel(label);
}

OntologyGenerator.prototype.makeObjectProperty = function(label) {
    var p = this.graph.getOWLObjectByLabel(label);
    if (p == null) {
        var id = label.replace(/\s/g,"_");
        p = this.graph.getOWLObjectPropertyByIdentifier("OBO_REL:"+id);
    }
    return p;
}

OntologyGenerator.prototype.makeLabelFromTokenList = function(tokens) {
    //this.info("TOKS:"+tokens);
    function makeLabelFromTokenMaker(graph) {
        return function(token) {
            if (typeof token == "string") {
                return token;
            }
            //print("looking up "+token+" in "+graph);
            return graph.getLabel(token);
        }
    }
    return tokens.map(makeLabelFromTokenMaker(this.graph)).join(" ");
}

OntologyGenerator.prototype.someValuesFrom = function(p, filler) {
    return this.getDataFactory().getOWLObjectSomeValuesFrom(p, filler);
}

OntologyGenerator.prototype.intersectionOf = function(xs) {
    return this.getDataFactory().getOWLObjectIntersectionOf(xs);
}

OntologyGenerator.prototype.pairwiseIntersectionOf = function(a,b) {
    return this.getDataFactory().getOWLObjectIntersectionOf(a,b);
}

OntologyGenerator.prototype.gen = function(tokens, expression) {
    var label = this.makeLabelFromTokenList(tokens);
    this.info("LABEL:"+label);
    var newClassIRIStr = "http://x.org#FOO_" + this.getNextId();
    var newClassIRI = IRI.create(newClassIRIStr);
    var newClass = this.getDataFactory().getOWLClass(newClassIRI);
    var rdfsLabel = this.getDataFactory().getRDFSLabel();
    var labelLiteral = this.getDataFactory().getOWLLiteral(label);
    this.addAxiom(this.getDataFactory().getOWLAnnotationAssertionAxiom(rdfsLabel,
                                                                       newClassIRI,
                                                                       labelLiteral));
    this.addAxiom(this.getDataFactory().getOWLEquivalentClassesAxiom(newClass, expression));
}

