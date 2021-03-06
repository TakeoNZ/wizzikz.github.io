//some defaults
var def = {
	notif_inner: "<div style=\"opacity: 1;top:0px;z-index:12;transition:all 0.3s linear;-webkit-transition:all 0.3s linear;-moz-transition:all 0.3s linear;-ms-transition:all 0.3s linear;-o-transition:all 0.3s linear;\"class=\"notification cmt-load\"><div class=\"left\"><i class=\"icon icon-about-white\"></i></div><div class=\"right\"><span style=\"top: 25px;\">__TEXT__</span></div></div>",
	settings_item_inner: '<div class="header"><span>Themescript</span></div><div class="left"><div class="item ts-toggle selected"><i class="icon icon-check-blue"></i><span>Turn on / off themescript</span></div></div><div class="right"></div>',
	toast_closed: false,
	plugin: {
		load: "Themescript activated!"
	},
	customCSSs: {
		"chilloutmixer": "https://themescript.github.io/master/master.css",
		"a-test-room-2": "https://themescript.github.io/personal/wizzikz/master.css"
	},
	browser: {
		hasLocalStorage: (typeof(Storage) !== "undefined")
	}
};
//xhr function
function createXHR()
{
	if (typeof XMLHttpRequest!= "undefined") {
		return new XMLHttpRequest();
	} else if (typeof ActiveXObject!="undefined") {
		if (typeof arguments.callee.activeXString!= "string") {
			var versions = ["MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.3.0",
							"MSXML2.XMLHttp"];
							
			for (var i = 0, len = versions.length; i < len; i++) {
				try {
					var xhr = new ActiveXObject(versions[i]);
					arguments.callee.activeXString = versions[i];
					return xhr;
				} catch (ex){
					//skip
				}
			}
		}
		
		return new ActiveXObject(arguments.callee.activeXString);
	} else {
		throw new Error("No XHR, no theme.");
	}
}

function xhr_get(url, func, bool) {
	var xhr = createXHR();
	xhr.onreadystatechange = function()
	{
		if(xhr.readyState == 4) {
			if((xhr.status >= 200 && xhr.status < 300)
					|| xhr.status == 304) {
				var allText = xhr.responseText;
				func(allText);
			} else {
				throw new Error("The XHR failed :(  [status:"+xhr.status+"]");
			}
		}
	}
	xhr.open("get", url, bool);
	xhr.send(null);
}

//selecting the elements (also, $ works for all elements, but this one just for the first one)
function sel(str) {
	return document.querySelector(str);
}
//creating the elements
function createEl(str) {
	return document.createElement(str);
}

//getting the settings
	sel("#toast-notifications").innerHTML 
		+= def.notif_inner.replace("__TEXT__",def.plugin.load);
	setTimeout(function(){
		if(!def.toast_closed) hideToast();
	},4000);
	$(".notification.cmt-load").click(function(){
		hideToast();
	});

function hideToast()
{
	var el = sel(".notification.cmt-load");
	el.style.opacity = "0";
	setTimeout(function(){
		el.parentElement.removeChild(el);
		def.toast_closed = true;
	},500);
}

(function() {
    var proxied = window.XMLHttpRequest.prototype.send;
    window.XMLHttpRequest.prototype.send = function() {
        var pointer = this;
        var intervalId = window.setInterval(function(){
                if(pointer.readyState != 4){
                        return;
                }
                if( IsJsonString(pointer.responseText) ) {
			var parsed = $.parseJSON( pointer.responseText );
			if(parsed.hasOwnProperty("data")) {
				if(parsed.data.length>0) {
					if(parsed.data[0].hasOwnProperty("meta")) {
						if(parsed.data[0].meta.hasOwnProperty("slug")) {
							loadCSSs(false, true);
						}
					}
				}
			}
		}
		clearInterval(intervalId);
	}, 1);
	return proxied.apply(this, [].slice.call(arguments));
    };
})();

function IsJsonString(str) {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}

//load the badges.css and master.css
loadCSSs(true, true);
function loadCSSs(loadBadges, loadMaster) {
	var loadThem = false;
	if(def.browser.hasLocalStorage) {
		if(localStorage.hasOwnProperty("ts-toggle")) {
			if(localStorage.getItem("ts-toggle") == "true") {
				loadThem = true;
			}
		}
	} else {
		loadThem = true;
	}
	if(loadThem) {
		if(loadBadges) {
			if(sel("#cm_css_badges")) sel("#cm_css_badges").remove();
			xhr_get("https://themescript.github.io/badges/badges.css", function(allText){
				sel("head").innerHTML += "<style id='cm_css_badges'>"+allText+"</style>";
			}, true);
		}
		if(loadMaster) {
			if(typeof def.customCSSs[location.href.split("/")[location.href.split("/").length-1]] != "undefined") {
				if(sel("#cm_css_main")) sel("#cm_css_main").remove();
				xhr_get(def.customCSSs[location.href.split("/")[location.href.split("/").length-1]], function(allText){
					sel("head").innerHTML += "<style id='cm_css_main'>"+allText+"</style>";
				}, true);
			}
		}
	}
}


// adding a new item in settings
if(def.browser.hasLocalStorage) {
	if(!localStorage.hasOwnProperty("ts-toggle")) localStorage.setItem("ts-toggle","true");
	var settings_panel = sel("#user-settings .container");
	settings_panel.innerHTML += def.settings_item_inner;
	var ts_toggle = sel(".ts-toggle");
	ts_toggle.addEventListener("click", function() {
		if(ts_toggle.classList.has("selected")) {
			ts_toggle.classList.remove("selected");
			localStorage.setItem("ts-toggle", "false");
		} else {
			ts_toggle.classList.add("selected");
			localStorage.setItem("ts-toggle", "true");
		}
	});
}
