import edu.holycross.shot.oldpersian.OPTokenization
import edu.holycross.shot.oldpersian.OPMorphology
import edu.holycross.shot.oldpersian.OPMorphAnalysis
import edu.holycross.shot.oldpersian.OPLexicon
import edu.holycross.shot.oldpersian.OPLexItem


request.setCharacterEncoding("UTF-8")
response.setCharacterEncoding("UTF-8")

OPMorphology morphology = new OPMorphology()
OPLexicon lexicon = new OPLexicon()


void documentFailure(ArrayList authList, String token) {
  System.err.println "\n\nFAILED: ${token}"
  authList.each { item ->
    System.err.println "${token} (${token.size()}) != ${item} (${item.size()})"
  }
}


Integer debug = 0

URL url = new URL(params.url)
URL vocabFile = new URL("https://raw.githubusercontent.com/neelsmith/op/master/collections/vocab.csv")
String txt = url.getText("UTF-8")

html.html {
    head {
        title("Check transliteration")
        link(type : "text/css", rel : "stylesheet", href : "@coreCss@", title : "CSS stylesheet")
    }
    
    body {
    
    	header {
            nav (role : "navigation") {
                mkp.yield "@projectlabel@: "
                a(href : '@homeUrl@', "Home")
            }
            h1("Check transliteration")
    	}
    	
    	article {
	  if ((txt != null) && (txt.size()  > 0) ) {
	    p ("Source transliteration:")
	    pre (txt)

	    def inputLines = []
	    txt.eachLine {
	      def cols = it.split(/=/)
	      def entry = [cols[0],cols[1]]
	      inputLines.add(entry)
	    }
	    OPTokenization tokenization = new OPTokenization(inputLines, true)

	    def validList = [];
	    def xscript = []
	    def formUrns  = []
	    Integer idx = 0;
	    vocabFile.getText("UTF-8").eachLine { l ->
	      idx++;
	      def cols = l.split(/,/)
	      if (cols.size() > 1) {
		formUrns.add(cols[0])
		validList.add(cols[1])
		if (cols.size() > 2) {
		  xscript.add(cols[2])
		  if (debug > 1) {
		    System.err.println "mapped ${validList[idx - 1]} to ${xscript[idx - 1]}"
		  }
		} else {
		  xscript.add("(need transcription)")
		  if (debug > 1 ) {
		    System.err.println "No mapping for${validList[idx - 1]}"
		  }
		}
	      }
	    }

	    
	    //ul {
	      String prevLine = ""
	      tokenization.tokens.each { t ->
		String ref = t.occurrence
		if (prevLine != ref) {
		  h3(ref)
		  prevLine = ref
		}
		boolean valid = false
		Integer matchIdx = 0
		String token = t.token.replaceAll(/ /,'')
		if (token ==~ /\d+/) {
		  valid = true
		  matchIdx = -1
		} else {
		  validList.eachWithIndex { v, i ->
		    if (v == token) {
		      valid = true
		      matchIdx = i
		      if (debug > 1) {
			System.err.println "Matched ${token} at ${i}"
			System.err.println "\tcf ${validList[matchIdx]} and ${xscript[matchIdx]}"
		      }
		    }
		  }
		}
		p {
		    strong(token)
		    mkp.yield(': ')
		    if (valid) {
		      span (style: "background-color:#afa;", "valid")
		      if (matchIdx >= 0) {
			//morphology.analyzeForm(urn);
			String formUrn = formUrns[matchIdx]
			mkp.yield (" (${xscript[matchIdx]})")

			
			OPMorphAnalysis morph = morphology.analyzeForm(formUrn)
			if (morph) {
			  OPLexItem lex = lexicon.lexicon[morph.lexicalEntityUrn]
			  mkp.yield  (" from ")
			  em("${lex.stem}")
			  mkp.yield(", ${lex.pos}, ")
			  em(lex.translation)
			  code (" ${morph.toString(lex.pos)}")
			}
		      }
		    } else {
		      span (style: "background-color:#FFb0b0;","not in vocabulary list")
		      if (debug  > 0) {
			documentFailure(validList, token)
		      }
		    }
		  }
	      }
	      //}
	  }
        footer("@htmlfooter@")
	}
    }
}
