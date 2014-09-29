

# Some SPARQL queries for OP app #


Info about an inscr:


    SELECT ?s ?site ?patron  WHERE {
     ?s <http://www.homermultitext.org/cite/rdf/belongsTo>   <urn:cite:oldpersian:inscr>  .
     ?s <http://www.homermultitext.org/hmt/citedata/inscr_Site> ?site .
     ?s <http://www.homermultitext.org/hmt/citedata/inscr_Patron> ?patron.
     }


Collect illustrated inscriptions:

    SELECT ?insc count(?img) WHERE {
    ?insc <http://www.homermultitext.org/cite/rdf/belongsTo> <urn:cite:oldpersian:inscr> .
    ?insc <http://www.homermultitext.org/cite/rdf/illustratedBy>  ?img .
    }
    GROUP BY ?insc
    ORDER BY desc(?count)

Collect inscriptions by site:

Collect inscriptions by patron:


Collect illustrated inscriptions by site: