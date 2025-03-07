# Tools

```mermaid
graph LR
  subgraph Conceptual layer - S2DM
    SubModel1
    SubModel2
    SubModelN
    Tool_Composer
    ComposedModel
    Tool_Exporter
  end
  subgraph Physical layer
    SchemaApp1
    SchemaApp2
    SchemaApp3
  end
  SubModel1 --> Tool_Composer
  SubModel2 --> Tool_Composer
  SubModelN --> Tool_Composer
  Tool_Composer --> ComposedModel --> Tool_Exporter
  Tool_Exporter --> SchemaApp1
  Tool_Exporter --> SchemaApp2
  Tool_Exporter --> SchemaApp3
```

## Model validator
> TODO: Mechanisms to assess the integrity of the model. Examples: unique names, proper use of directives, completeness of types used within the model, correct construction of unique identifiers, etc.

###

## Exporters
A model done with the GraphQL SDL represents an specification.
The actual implementation of it is out of the scope.
However, to facilitate the implementation, the exporter tool parses the specified model and creates the artifact that is needed by the system in the physical layer.

```mermaid
graph LR
  subgraph Conceptual layer - S2DM
    Model
    Tool_Exporter
  end
  subgraph Physical layer
    vspec
    SHACL
    ...
  end
  Model --> Tool_Exporter
  Tool_Exporter --> vspec
  Tool_Exporter --> SHACL
  Tool_Exporter --> ...
```
The tools can currently export a given model into:
* vspec - `tools/to_vspec.py`
* SHACL - `tools/to_shacl.py`

### SHACL exporter
This exporter translates the given GraphQL schema to [SHACL](https://www.w3.org/TR/shacl/).

The [Shapes Constraint Language (SHACL)](https://www.w3.org/TR/shacl/) is a framework used to validate data in [Resource Description Framework (RDF)](https://www.w3.org/RDF/) format. 
In other words, if you work with the RDF graph data model and triple stores (i.e., RDF-based graph databases), SHACL is used to validate a certain RDF data graph.
Think of it as a set of rules or criteria that your data needs to meet. If you're working with data that follows certain structures or patterns, SHACL helps make sure everything is in the right place and follows the right format. It's like having a checklist to ensure your data is accurate and consistent, making it easier to work with and understand. This is especially useful in fields like data management and semantic web technologies, where data integrity is crucial.

The core of RDF is a triple consisting of:
```mermaid
graph LR
  subject -- predicate --> object
```

So, the SHACL specifies constraits to those elements.
More specifically:
* The `subject` can be constrained by a `nodeShape`.
* The `predicate` can be constrained by a `propertyShape`

#### Supported field cases



```mermaid
graph LR
  Cabin -- has --> Door.ROW1.DRIVERSIDE
  Cabin -- has --> Door.ROW1.PASSENGERSIDE
  Cabin -- has --> Door.ROW2.DRIVERSIDE
  Cabin -- has --> Door.ROW2.PASSENGERSIDE
```

```mermaid
graph LR
  Cabin -- doors --> BlankNode
  BlankNode -- has --> Door.ROW1.DRIVERSIDE
  BlankNode -- has --> Door.ROW1.PASSENGERSIDE
  BlankNode -- has --> Door.ROW2.DRIVERSIDE
  BlankNode -- has --> Door.ROW2.PASSENGERSIDE
```


If the 

An object type in GraphQL, such as:
```gql
type Address {
  streetName: String! @cardinality(max: 1)
  ...
}
```
Results in the following SHACL:
```ttl
@prefix model: <http://example.ns/model#> .
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix shapes: <http://example.ns/shapes#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

shapes:Address a sh:NodeShape ;
    sh:name "Address" ;
    sh:property
        [ sh:datatype xsd:string ;
        sh:maxCount 1 ;
        sh:minCount 1 ;
        sh:name "streetName" ;
        sh:path model:Address.streetName ],
        ...
    sh:targetClass model:Address .
```
In the previous example, the namespaces and their prefixes (i.e., `shapes` and `model`) can be arbitrarily assigned as arguments in the command.
* The `shapes` namespace should be the one that is used for validation purposes.
* The `model` namespace should be the future-proof location where the concept of interest is specified (aka., the ground truth).

The command might look like this:
```shell
s2dm shacl -s schema.graphql -o output.ttl -sn http://myShapesNamespece.eg/ -sfpref shapes -mn -sn http://myModelNamespece.eg/ -snpref model
```

Please, refer to the CLI help for further reference.
```bash
s2dm shacl --help
```

### JSON schema exporter

## Composer
Instead of modeling a huge monolithic model, GraphQL schemas can be specified in multiple small ones (aka., sub graphs).
Then, specific elements from different sub models can be stiched together to form the composed model with the structure needed.
To learn more about it, please refer to the [official documentation of the GraphQL Schema Definition Language](https://graphql.org/learn/federation/).
> TODO: This is part of the feature roadmap.
