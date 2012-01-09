/*!
 * XML/XUL, HTML DOM Compatability Layer v1.1
 *
 * Date: Thu Nov 17 06:10:14 MST 2011
 */
(function() {
	// setter for innerHTML
	function _setInnerHTML (str) {
		var r = this.ownerDocument.createRange();
		r.selectNodeContents(this);
		r.deleteContents();
		var df = r.createContextualFragment(str);
		this.appendChild(df);

		return str;
	}

	// setter for outerHTML
	function _setOuterHTML (str) {
		var r = this.ownerDocument.createRange();
		r.setStartBefore(this);
		var df = r.createContextualFragment(str);
		this.parentNode.replaceChild(df, this);
		return str;
	}

	// getter for innerHTML
	function _getInnerHTML(node) {
		if (!node) {
			node = this;
		}

		var str = "";

		for (var i=0; i<node.childNodes.length; i++) {
			str += _getOuterHTML(node.childNodes.item(i));
		}

		return str;
	}

	// getter for outerHTML
	function _getOuterHTML(node) {
		if (!node) {
			node = this;
		}

		var str = "";

		switch (node.nodeType) {
			case 1: // ELEMENT_NODE
				str += "<" + node.nodeName;
				for (var i=0; i < node.attributes.length; i++) {
					str += " "
					str += node.attributes.item(i).nodeName;
	
					if (node.attributes.item(i).nodeValue != null) {
						str += "=\"";
						str += node.attributes.item(i).nodeValue;
						str += "\"";
					}
				}
	
				if (node.childNodes.length) {
					str += ">";
					str += _getInnerHTML(node);
					str += "</" + node.nodeName + ">"
				} else {
					str += "/>";
				}
	
				break;
	
			case 3:	//TEXT_NODE
				str += node.nodeValue;
				break;
				
			case 4: // CDATA_SECTION_NODE
				str += "<![CDATA[" + node.nodeValue + "]]>";
				break;
						
			case 5: // ENTITY_REFERENCE_NODE
				str += "&" + node.nodeName + ";"
				break;
	
			case 8: // COMMENT_NODE
				str += "<!--" + node.nodeValue + "-->"
				break;
			default: // IGNORE DOM EXTENSIONS
				break;
		}

		return str;
	}

	// modify object to add getter and setter for innerHTML
	Element.prototype.__defineSetter__('innerHTML', _setInnerHTML);
	Element.prototype.__defineSetter__('outerHTML', _setOuterHTML);
	Element.prototype.__defineGetter__('innerHTML', _getInnerHTML);
	Element.prototype.__defineGetter__('outerHTML', _getOuterHTML);

	// modify XULElement to make display and hidden tied together
	if (typeof window.XULElement != undefined) {
		var __hideXUL = XULElement.prototype.__lookupSetter__('hidden');
		var __styleDisplay = CSSStyleDeclaration.prototype.__lookupSetter__('display');

		// modify hidden to also change style.display property
		XULElement.prototype.__defineSetter__('hidden', function(is){
			__styleDisplay.call(this.style, !!is? 'none' : '');
			__hideXUL.call(this,!!is);
		});

		// modify style.display to also change hidden property
		CSSStyleDeclaration.prototype.__defineSetter__('display', function(mode){
			__hideXUL.call(this.__parent__, mode == 'none');
			__styleDisplay.call(this, mode);
		});
	}

	// make sure document.body is populated in XUL
	if (typeof document.body === "undefined") {
		document.body = document.documentElement;
	}
})();
