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

## Exporter
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

## Composer 
Instead of modeling a huge monolithic model, GraphQL schemas can be specified in multiple small ones (aka., sub graphs).
Then, specific elements from different sub models can be stiched together to form the composed model with the structure needed.
To learn more about it, please refer to the [official documentation of the GraphQL Schema Definition Language](https://graphql.org/learn/federation/).
> TODO: This is part of the feature roadmap.