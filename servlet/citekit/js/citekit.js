
function bootstrap(){
	// Get the root url of this script
	var scripts = document.getElementsByTagName('script');
	var lastScript = scripts[scripts.length - 1];
	var jsURL = ""
	for (x = 0; x < scripts.length; x++){
			if (scripts[x].src.indexOf("citekit") > 0){
					jsURL = scripts[x].src;
			}
	}
	//var jsURL = (lastScript.src);
	var rootURL = jsURL.substring(0,jsURL.indexOf('/js'));
	var url = rootURL + "/js/markdown.js";
	  $.getScript(url, function(data, textStatus, jqxhr) {
					// Get the root url of this script
					var jsURL = ($(this)[0].url);
					var rootURL = jsURL.substring(0,jsURL.indexOf('/js'));
					var url = rootURL + "/js/sarissa/sarissa.js";
					$.getScript(url, function(data, textStatus, jqxhr) {
						//load css first, then print <link> to header, and execute callback
							// Get the root url of this script
							var jsURL = ($(this)[0].url);
							var rootURL = jsURL.substring(0,jsURL.indexOf('/js'));
                            //console.log ("Getting CSS: " + rootURL);
							var newCssURL = rootURL + "/css/citekit-utils.css";;
                            //console.log("From: " + newCssURL);
								$('<style type="text/css">\n@import url(' + newCssURL + ');').appendTo("head");
								citekit_init();
								// Below is the old block that loaded CSS by a costly and janky Ajax call, utterly unnecessarily;
								// the two lines above seem to work just as well.
								
/*
						$.ajax({
							url: newCssURL,
							dataType: 'text/css',
							success: function(data){                  
								$('<style type="text/css">\n' + data + '</style>').appendTo("head");
								//Begin actual processing of CITE/CTS links in document
								citekit_init();
							},
								 error: function(XMLHttpRequest, textStatus, errorThrown) { 
											 alert("Status: " + textStatus); 
							 }    
						});
*/

					});
	  });
}

function citekit_init(){
	//citekit_init_console(); // inject a <div> for showing citekit messages
	citekit_loadMoreCSS();
	var getData = citekit_data(); // grab and sort out service IDs and URLs
	if (getData){
			citekit_assignIds(); // assign an ID to each CITE/CTS object in HTML
			
			// Easy things first: take care of all links by adding service URLs
			// where needed
			citekit_fixLinks();  
			

			//Now fix CITE objects in <img> elements
			citekit_fixImgs();
			
			//Now fix CTS and CITE objects in Blockquote elements
			citekit_fixBlockquotes();

			//Now do some CSS adjustment to div.citekit-compare, so the children have room
			citekit_compare();
	}	
}

function citekit_compare(){
    $("div.citekit-compare").each(function(index){
	var howManyKids = $(this).children("blockquote").length;
	var newWidth = Math.round(100 / howManyKids);
	//newWidth = Math.round( newWidth - (newWidth / 10));
	$(this).children().each(function(index){
	    $(this).css("max-width", (newWidth - 5) + "%");
	});
    });
}

function citekit_loadMoreCSS(){
	// Get the root url of this script
	var scripts = document.getElementsByTagName('script');
	var lastScript = scripts[scripts.length - 1];
	var jsURL = ""
	for (x = 0; x < scripts.length; x++){
			if (scripts[x].src.indexOf("citekit") > 0){
					jsURL = scripts[x].src;
			}
	}
	//var jsURL = (lastScript.src);
	var rootURL = jsURL.substring(0,jsURL.indexOf('/js'));
	var cssURL = rootURL + "/css/cite-elements.css";
	$('head').append('<link rel="stylesheet" href="' + cssURL + '" type="text/css" />');
	cssURL = rootURL + "/css/citekit-utils.css";
	$('head').append('<link rel="stylesheet" href="' + cssURL + '" type="text/css" />');
}

function citekit_fixImgs(){
	//citekit_log( "Fixing imgs now..." );		
	jqString = "img." + citekit_var_classNames["citeimg"];
	$( jqString ).each(function(index){
			//citekit_log( $(this).attr("src"));
			var urnString = $(this).attr("src");
			var classString = $(this).attr("class");
			var idString = $(this).attr("id");
			var altString = $(this).attr("alt");
			$(this).replaceWith("<blockquote class='" + classString + "' cite='" + urnString + "' id='" + idString + "' alt='" + altString + "'>" + urnString + "</blockquote>");
	});
	
}

function citekit_fixBlockquotes(){
	//citekit_log( "Fixing blockquotes..." );		


	for (whichClass in citekit_var_classNames){
			var thisURLString = "";
			var className = citekit_var_classNames[whichClass];
			var jqString = "blockquote." + className;
			var xsltParams = {};	

			$( jqString ).each(function(index){

				
			$(this).addClass("citekit-waiting");

					// prepare params for xslt, if any
				if ( $(this).hasClass( citekit_var_classNames["cite"])){ 
						xsltParams = getCollectionParams( $(this).attr("id") );
				}

				if ( $(this).hasClass( citekit_var_classNames["citeimg"])){ 
						//console.log("Getting params for id: " + $(this).attr("id"));
						xsltParams = getImageParams( $(this).attr("id") );
				}
				thisURLString = citekit_getUrlString( $(this).attr("id") );
				if (thisURLString.substring(0,7) == "http://"){
						pathToXSLT = citekit_getXSLTString( $(this).attr("id") );
						citekit_loadXMLDoc( thisURLString, pathToXSLT, $(this).attr("id"), xsltParams);
				} else {
						$(this).append(" (service not found for this URN)");
						$(this).removeClass("citekit-waiting");
				}

			});
	}
}

function getImageParams( elementId ){
	var thisService = "";
	var thisPath = "";
	var thisICT = "";
	var returnValue = {};
		//If a service is specified, grab that URL-string
		 for (whichService in citekit_var_services){
				if ( $("#" + elementId).hasClass(whichService) ){
					thisService = whichService;
				}
		}
		//Otherwise, grab the default URL-string
		if ( thisService == ""){ 
				thisService = citekit_var_default_img;
		}
		//Strip off "image" from image-service URL"
		thisPath = citekit_var_services[thisService].substr(0, citekit_var_services[thisService].indexOf('/image'));
		thisICT = thisPath + "/" + citekit_var_qs_ICT;
		returnValue["image-w"] = citekit_image_w[thisService];
	console.log( elementId + " :: service=" + thisService + " :: citekit_image_w=" + citekit_image_w[thisService]);
		//console.log ("Returning width = " + returnValue["image-w"]);
		returnValue["ict"] = thisICT;
		return returnValue;
}

function getCollectionParams( elementId ){
	var thisService = "";
	var thisImgSvc = "";
	var thisCollSvc = "";
	var thisCtsSvc = "";
	var returnValue = {};

	// Get service ID


		//If a service is specified, grab that URL-string
		 for (whichService in citekit_var_services){
				if ( $("#" + elementId).hasClass(whichService) ){
					thisService = whichService;
				}
		}
		//Otherwise, grab the default URL-string
		if ( thisService == ""){ 
				thisService = citekit_var_default_coll;
		}

		//Get any assigned image service
		for (whichImgService in citekit_var_services){
			if ( $("#" + whichImgService).hasClass( citekit_var_classNames["citeimg"])){
				if ( $("#" + thisService).hasClass(whichImgService)  ){
					thisImgSvc = whichImgService;
				}
			}
		}

		//Get any assigned text service
		for (whichCtsService in citekit_var_services){
			if ( $("#" + whichCtsService).hasClass( citekit_var_classNames["cts"])){
				if ( $("#" + thisService).hasClass(whichCtsService)  ){
					thisCtsSvc = whichCtsService;
				}
			}
		}

		//Get any assigned collection service
		for (whichCollService in citekit_var_services){
			if ( $("#" + whichCollService).hasClass( citekit_var_classNames["cite"])){
				if ( $("#" + thisService).hasClass(whichCollService)  ){
					thisCollSvc = whichCollService;
				}
			}

		}
		if (thisImgSvc == ""){ thisImgSvc = citekit_var_default_img; }
		if (thisCtsSvc == ""){ thisCtsSvc = citekit_var_default_cts; }
		if (thisCollSvc == ""){ thisCollSvc = citekit_var_default_coll; }
	    returnValue["image-w"] = citekit_image_w[thisImgSvc];	
        returnValue["imageService"] = citekit_var_services[thisImgSvc];
		returnValue["collectionService"] = citekit_var_services[thisCollSvc];
		returnValue["ctsService"] = citekit_var_services[thisCtsSvc];
		return returnValue;

}

function citekit_loadXMLDoc(url, xsl, elemId, xsltParams){
	var ctsResponse;
			var xmlhttp = new XMLHttpRequest();  
			xmlhttp.timeout = 120000;
			xmlhttp.open("GET", url, true);
			xmlhttp.onreadystatechange = function() {  
				if(xmlhttp.readyState == 4) {
				  if (xmlhttp.status == 200){
						  ctsResponse = xmlhttp.responseXML; 
						  citekit_loadXSLT(ctsResponse, xsl, elemId, xsltParams);
				  } else {
						 citekit_blockquoteError(elemId, url); 
				  }
				}
			}; 	
			xmlhttp.send(null);  
}

function citekit_timeouthandler( elemId, url){
		var message = "";
		message += "<span class='citekit-error'>Timeout while loading ";
		message += $("#" + elemId).attr("cite") + " from URL <code>";
		message += url + "</code>.</span>";
	document.getElementById(elemId).innerHTML = message;
	$("#" + elemId).removeClass("citekit-waiting");
}

function citekit_blockquoteError(elemId, url){
		var message = "";
		message += "<span class='citekit-error'>Error loading ";
		message += $("#" + elemId).attr("cite") + " from URL <code>";
		message += url + "</code>.</span>";
	document.getElementById(elemId).innerHTML = message;
	$("#" + elemId).removeClass("citekit-waiting");
}

function citekit_loadXSLT(ctsResponse, xsl, elemId, xsltParams){
	var myURL = xsl;
	
	var xslhttp = new XMLHttpRequest();  
	xslhttp.open("GET", xsl, true);
	xslhttp.send('');  
	
	xslhttp.onreadystatechange = function() {  
		if(xslhttp.readyState == 4) {
		  xsltData = xslhttp.responseXML;   		
		  citekit_processXML(ctsResponse, xsltData, elemId, xsltParams);
  		}	
	}; 
}

function citekit_processXML(ctsResponse, xsltData, elemId, xsltParams){
		var processor = null;
		var tempData = null;
		var tempHTML = "";

		var temp_gbi = xsltParams["imageService"] + citekit_var_qs_GetBinaryImage;
		var temp_gip = xsltParams["imageService"] + citekit_var_qs_GetImagePlus;
		var temp_gpp = xsltParams["ctsService"] + citekit_var_qs_GetPassagePlus;
		var temp_gop = xsltParams["collectionService"] + citekit_var_qs_GetObjectPlus;
		var temp_ict = xsltParams["ict"];
	

		processor = new XSLTProcessor();

	if ( (xsltParams["imageService"] != undefined) && (xsltParams["imageService"] != "" )) {
		processor.setParameter(null,'ImageServiceGIP',temp_gip);
	}
	if ( (xsltParams["imageService"] != undefined) && (xsltParams["imageService"] != "" )) {
		processor.setParameter(null,'ImageServiceThumb',temp_gbi);
	}
	if ( (xsltParams["image-w"] != undefined) && (xsltParams["image-w"] != "" )) {
		//console.log("Setting image-w param " + xsltParams["image-w"] );
		processor.setParameter(null,'image-w',xsltParams["image-w"]);
	}
	if ( (xsltParams["ctsService"] != undefined) && (xsltParams["ctsService"] != "" )) {
		processor.setParameter(null,'TextServiceGPP',temp_gpp);
	}
	if ( (xsltParams["collectionService"] != undefined) && (xsltParams["collectionService"] != "" )) {
		processor.setParameter(null,'CollectionServiceGOP',temp_gop);
	}
	if ( (xsltParams["ict"] != undefined) && (xsltParams["ict"] != "" )) {
			processor.setParameter(null,'ict-url',temp_ict);
	}

		processor.importStylesheet(xsltData);
		tempData = processor.transformToDocument(ctsResponse);
		tempHTML = new XMLSerializer().serializeToString(tempData);	
		citekit_putTextOntoPage(tempHTML, elemId);
}


function citekit_putTextOntoPage(htmlText, elemId){
	document.getElementById(elemId).innerHTML = htmlText;
	$("#" + elemId).removeClass("citekit-waiting");
	// Catch any Markdown fields
	citekit_processMarkdown(elemId);
	$("#" + elemId).addClass("citekit-complete");
}

function citekit_getXSLTString( elementId ){
		var thisType = "";
		var thisString = "";
		// identify the type of link
	    for ( whichClass in citekit_var_classNames ){
				if ( $("#" + elementId).hasClass(citekit_var_classNames[whichClass])) {
					thisType = whichClass;
				}
		}
		switch (thisType){
				case "cts":
						thisString = citekit_var_pathTextXslt;
						break;
				case "citeimg":
						thisString = citekit_var_pathImgXslt;
						break;
				case "cite":
						thisString = citekit_var_pathCollXslt;
						break;
		}
		return thisString;
}

	
function citekit_fixLinks(){
	//citekit_log( "Fixing links..." );
	for (whichClass in citekit_var_classNames){
			var className = citekit_var_classNames[whichClass];
			var jqString = "a." + className;
			$( jqString ).each(function(index){
					if ( $(this).attr("href").substring(0,7) != "http://" ){
							var thisURLString = citekit_getUrlString( $(this).attr("id") );
							if (thisURLString.substring(0,7) != "http://"){
								$(this).append(" (service not found for this URN)");
							} else {
									$(this).attr("href", thisURLString);
							}
					}
			});
	}
}

// Given an element id, read its class-names and find the correct URL-string
// to prefix a URN.
function citekit_getUrlString( elementId ){
		var thisURN = "";
		var thisType = "";
		var thisService = "";
		var thisString = "";

		// identify the type of link
	    for ( whichClass in citekit_var_classNames ){
				if ( $("#" + elementId).hasClass(citekit_var_classNames[whichClass])) {
					thisType = whichClass;
				}
		}

		// Get the plain URN from the attribute
		if ( $("#" + elementId).attr("src")) {
				thisURN = $("#" + elementId).attr("src");
		} else if ( $("#" + elementId).attr("cite")) {
				thisURN = $("#" + elementId).attr("cite");
		} else if ( $("#" + elementId).attr("href")) {
				thisURN = $("#" + elementId).attr("href");
		}

		//If a service is specified, grab that URL-string
		for (whichService in citekit_var_services){
				if ( $("#" + elementId).hasClass(whichService) ){
					switch (thisType) {
							case "cts":
									thisString = citekit_var_services[whichService] + citekit_var_qs_GetPassagePlus;
									break;
							case "citeimg":
									thisString = citekit_var_services[whichService] + citekit_var_qs_GetImagePlus;
									break;
							case "cite":
									thisString = citekit_var_services[whichService] + citekit_var_qs_GetObjectPlus;
									break;
						}
				}
		}

		//Otherwise, grab the default URL-string
		if ( thisString == ""){ 
				switch (thisType) {
						case "cts":
								thisString = citekit_var_services[citekit_var_default_cts] + citekit_var_qs_GetPassagePlus;
								break;
						case "citeimg":
								thisString = citekit_var_services[citekit_var_default_img] + citekit_var_qs_GetImagePlus;
								break;
						case "cite":
								thisString = citekit_var_services[citekit_var_default_coll] + citekit_var_qs_GetObjectPlus;
								break;
				}
		}

		//Assemble and return
		return thisString + thisURN;
}



function citekit_loadObjects(){
	//citekit_log("Loading objects...");
	for ( whichClass in citekit_var_classNames){
		var className = citekit_var_classNames[whichClass];
		$("." + className).each(function(index){
				var thisLink = "";
				var thisURN = "";
				var thisURL = "";
				
				// images
				if ( $(this).attr("src") ){
						//if ( $(this).attr("src").substring(0,7) == "http://" ){
								//thisLink = $(this).attr("src");
						//} else {
								thisURN = $(this).attr("src");
						//}
				}
				
				// texts, images, objects
				if ( $(this).attr("cite") ){
						//if ( $(this).attr("cite").substring(0,7) == "http://" ){
								//thisLink = $(this).attr("cite");
						//} else {
								thisURN = $(this).attr("cite");
						//}
				}

				// links
				if ( $(this).attr("href") ){
						//if ( $(this).attr("href").substring(0,7) == "http://" ){
								//thisLink = $(this).attr("href");
						//} else {
								thisURN = $(this).attr("href");
						//}
				}
		});
	}
}

function citekit_assignIds(){
	//citekit_log("assigning IDs now");	
	for ( whichClass in citekit_var_classNames){
		var className = citekit_var_classNames[whichClass];
		$('blockquote.' + className).each(function(index){
			$(this).attr("id",className + index + "blockquote");
		});
		$('img.' + className).each(function(index){
			$(this).attr("id",className + index + "img");
		});
		$('a.' + className).each(function(index){
			$(this).attr("id",className + index + "link");
		});
	}
}


function citekit_init_console(){
	var container_html = "<p class='citekit_show_hide_toggle'><a href='#' class='citekit_show_hide'>CITEKit Console Show/Hide</a></p><div class='citekit_console'><div id='citekit_console_head'></div><p class='citekit_console_data'>Data</p><p class='citekit_console_text'><strong>Messages</strong> </p> <a href='#' class='citekit_show_hide'>hide</a></div>";
	$(container_html).prependTo("body");
	$(".citekit_console").hide();
	$(".citekit_show_hide").show();
	$(".citekit_show_hide").click(function(){
		$(".citekit_console").slideToggle();
	});
	
	// inject console header, with menu and boilerplate
	var scripts = document.getElementsByTagName('script');
	var lastScript = scripts[scripts.length - 1];
	var jsURL = ""
	for (x = 0; x < scripts.length; x++){
			if (scripts[x].src.indexOf("citekit") > 0){
					jsURL = scripts[x].src;
			}
	}
	//var jsURL = (lastScript.src);
	var rootURL = jsURL.substring(0,jsURL.indexOf('/js'));
	var menuUrl = rootURL + "/helpmenu.html";
	var stringData = $.ajax({
                    url: menuUrl,
                    async: false
                     }).responseText;	
	$("#citekit_console_head").html(stringData);
	//citekit_log("Console initiated.");
}

function citekit_data(){
	var dataOk = true;
	
	// Read sources, defaults, etc. from sourcefile
	if ( $('#citekit-sources').length > 0 ){
		//citekit_log("Getting services...");
		//citekit_log("Getting CTS Services...");
		$('#citekit-sources > .citekit-source').each(function(){
				if ($(this).hasClass(citekit_var_classNames["cts"])){
					var this_id = $(this).attr("id");
					citekit_var_services[this_id] = $(this).text();
					//Check for default
						if ( $(this).hasClass("citekit-default") ){
							citekit_var_default_cts = $(this).attr("id");
						}
				}
		});
		//citekit_log("Getting Image Services...");
		$('#citekit-sources > .citekit-source').each(function(){
				if ($(this).hasClass(citekit_var_classNames["citeimg"])){
					var this_id = $(this).attr("id");
					citekit_var_services[this_id] = $(this).text();
					//Check for default
						if ( $(this).hasClass("citekit-default") ){
							citekit_var_default_img = $(this).attr("id");
						}

					//Check for defined image-with
					if ( ($(this).attr("data-image-w") != undefined ) && ( $(this).attr("data-image-w") != "") ){
						citekit_image_w[this_id] = 	$(this).attr("data-image-w");
						//console.log( "Service " + this_id + " has image-width: " + citekit_image_w[this_id]);
					} else {
						citekit_image_w[this_id] = citekit_default_image_w;
						//console.log( "{else} Service " + this_id + " has image-width: " + citekit_image_w[this_id]);
					}
				}
		});
		//citekit_log("Getting Collection Services...");
		$('#citekit-sources > .citekit-source').each(function(){
				if ($(this).hasClass(citekit_var_classNames["cite"])){
					var this_id = $(this).attr("id");
					citekit_var_services[this_id] = $(this).text();
					//Check for default
						if ( $(this).hasClass("citekit-default") ){
							citekit_var_default_coll = $(this).attr("id");
						}
					//Assign default image service
				    var thisInLoop = this;
						$('#citekit-sources > .citekit-source').each(function(){
								var testIndex = $(thisInLoop).attr("class").indexOf( $(this).attr("id") );
								if( testIndex > 0 ) { 
									if ( $(this).hasClass(citekit_var_classNames["cts"]) ){
										citekit_coll_cts[this_id] = $(this).text();		
									}
									if ( $(this).hasClass(citekit_var_classNames["citeimg"]) ){
										citekit_coll_img[this_id] = $(this).text();		
									}
									if ( $(this).hasClass(citekit_var_classNames["cite"]) ){
										citekit_coll_coll[this_id] = $(this).text();		
									}
								}	
						});
					    if( citekit_coll_cts[this_id] == undefined ){
										citekit_coll_cts[this_id] = citekit_var_services[citekit_var_default_cts];		
						}
					    if( citekit_coll_img[this_id] == undefined ){
										citekit_coll_img[this_id] = citekit_var_services[citekit_var_default_img];		
						}
					    if( citekit_coll_coll[this_id] == undefined ){
										citekit_coll_coll[this_id] = citekit_var_services[citekit_var_default_coll];		
						}

				//	if ( $(this).children("ul").children(".citekit-img-source").length > 0 ){
				//			citekit_coll_img[this_id] = $(this).children("ul").children(".citekit-img-source").text();
					//} else {
							//citekit_coll_img[this_id] = citekit_var_default_img;
					//}
					//Assign default collection service
					//if ( $(this).children("ul").children(".citekit-coll-source").length > 0 ){
							//citekit_coll_coll[this_id] = $(this).children("ul").children(".citekit-coll-source").text();
					//} else {
							//citekit_coll_coll[this_id] = citekit_var_default_coll;
					//}
					//Assign default text service
					//if ( $(this).children("ul").children(".citekit-cts-source").length > 0 ){
							//citekit_coll_cts[this_id] = $(this).children("ul").children(".citekit-cts-source").text();
					//} else {
							//citekit_coll_cts[this_id] = citekit_var_default_cts;
					//}
				}
		});


	} else {
		//citekit_log("<span style='color:red;'>No services configured in source file!</span>");
		dataOk = false;
	}
	//Data checking
	if ( citekit_var_default_cts == "") {
			//citekit_log("<span style='color:red;'>No default CTS Service assigned!</span");
//			dataOk = false;
	}
	if ( citekit_var_default_img == "") {
			//citekit_log("<span style='color:red;'>No default Image Service assigned!</span");
//			dataOk = false;
	}
	if ( citekit_var_default_coll == "") {
			//citekit_log("<span style='color:red;'>No default Collection Service assigned!</span");
//			dataOk = false;
	}

	// Log current data to console
	var message = "<strong>Services</strong><br/>";
	for (i in citekit_var_services){
		message = message + i + " : " + citekit_var_services[i] ;
		message = message + "<br/>";
	}

	for (i in citekit_coll_img){
			message = message + "Collection-service " + i + " uses Image-service " + citekit_coll_img[i] + "<br/>";
	}
	for (i in citekit_coll_coll){
			message = message + "Collection-service " + i + " links to Collection-service " + citekit_coll_coll[i] + "<br/>";
	}

	message = message + "<strong>Default CTS Service: " + citekit_var_default_cts + "</strong><br/>";
	message = message + "<strong>Default Image Service: " + citekit_var_default_img + "</strong><br/>";
	message = message + "<strong>Default Collection Service: " + citekit_var_default_coll + "</strong><br/>";

	$(".citekit_console_data").html(message);
	//citekit_log("Data loaded: " + dataOk);
	return dataOk;
}

function citekit_log(message){
	var log_message = $(".citekit_console_text").html() + " :: " + message;
	$(".citekit_console_text").html(log_message);
}

function citekit_processMarkdown(elemId){
	$(".md").each( function(i) {
		var mdText = $(this).html().trim();
		$(this).html(markdown.toHTML(mdText));
		//Remove class, so this doesn't get double-processed
		$(this).removeClass("md");

	});
}


