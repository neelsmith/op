import edu.holycross.shot.oldpersian.OPTokenization

request.setCharacterEncoding("UTF-8")
response.setCharacterEncoding("UTF-8")


URL url = new URL(params.url)
URL csvFile = new URL("https://raw.githubusercontent.com/neelsmith/op/master/collections/vocab.csv")
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
	    Integer idx = 0;
	    csvFile.getText("UTF-8").eachLine { l ->
	      idx++;
	      def cols = l.split(/,/);
	      if (cols.size() > 1) {
		validList.add(cols[1]);
	      }
	    }

	    
	    ul {
	      tokenization.tokens.each { t ->
		boolean valid = false
		if (t.token ==~ /\d+/) {
		  valid = true
		} else if (validList.contains(t.token)) {
		  valid = true
		}

		  li {
		    mkp.yield('"')
		    strong(t.token)
		    mkp.yield('": ')
		    if (valid) {
		      span (style: "background-color:#afa;", "valid")
		    } else {
		      span (style: "background-color:#FFb0b0;","not in vocabulary list")
		    }
		  }
	      }
	    }
	  }
        footer("@htmlfooter@")
	}
    }
}
