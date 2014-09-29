

# Some SPARQL queries for OP app #


Collect illustrated inscriptions:

    SELECT ?insc count(?img) WHERE {
    ?insc <http://www.homermultitext.org/cite/rdf/belongsTo> <urn:cite:oldpersian:inscr> .
    ?insc <http://www.homermultitext.org/cite/rdf/illustratedBy>  ?img .
    }
    GROUP BY ?insc
    ORDER BY desc(?count)

Collect inscriptions by site:

Collect illustrated inscriptions by site: