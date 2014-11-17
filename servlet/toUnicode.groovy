import edu.holycross.shot.oldpersian.OPTransliteration

request.setCharacterEncoding("UTF-8")
response.setCharacterEncoding("UTF-8")

String xlit = params.txt
String cun = params.cun

int getFollowingCP(int i, StringBuffer buff) {
  int nextIdx = buff.offsetByCodePoints(i,1)	

  if (nextIdx >= buff.size()) {
    return -1
  } else {
    int cp = buff.codePointAt(nextIdx)
    return(cp)
  }
}


println """
<html>
<body>
"""

if ((xlit != null) && (xlit.size()  > 0) ) {
  println "<p>Source transliteration:</p>"
  println "<pre>${xlit}</pre>"
  println "<p>As Unicode code points:</p>"

  println "<pre>"
  xlit.eachLine { l ->
    try {
      String cuneiform = OPTransliteration.xlitToU(l, false)
      StringBuffer sb = new StringBuffer (cuneiform)
      int max = sb.codePointCount(0, sb.length() - 1)

      int idx = 0
      Integer cpsFound = 0
      print "&#${sb.codePointAt(idx)};"
      while (cpsFound < max) {
	cpsFound++;
	int nextCP = getFollowingCP(idx,sb)
	if (nextCP > 0) {
	  print "&#${nextCP};"
	}
	idx = sb.offsetByCodePoints(idx,1)
      }
    } catch (Exception e) {
      println "Unable to convert ${l}: error  ${e}"
    }
  }
  println ""
  println "</pre>"
}

println "</body></html>"
/**
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
	  if ((xlit != null) && (xlit.size()  > 0) ) {
	    h2("Xlit to cuneiform")
	    p ("Source transliteration:")
	    pre (xlit)
	    p ("As Unicode code points:")
	    try {
	      String cuneiform = OPTransliteration.xlitToU(xlit, false)
	      StringBuffer sb = new StringBuffer (cuneiform)
	      int max = sb.codePointCount(0, sb.length() - 1)
	      p("Number of resulting code points:  ${max}, of which the first is ${sb.codePointAt(0)} or &#${sb.codePointAt(0)};")
	      pre (cuneiform)
	    } catch (Exception e) {
	      p("Unable to convert: error  ${e}")
	    }
	  }
	  if ((cun != null) && (cun.size()  > 0)) {
	    h2("Cuneiform to transliteration")
	    p ("Source:")
	    pre (cun)
	    p ("Transliterated:")
	    try {
	      xlit = OPTransliteration.uToXLit(cun, false);
	      pre (xlit)
	    } catch (Exception e) {
	      p("Unable to convert: error  ${e}")
	    }
	  }
	  
        }
        footer("@htmlfooter@")
    }
}
**/