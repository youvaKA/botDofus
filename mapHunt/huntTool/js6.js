console.log('Coucou toi !');
var urlBase = dns + 'huntTool/';

var direction = null;
var waitingForResponse = false;
var nextMapId = null;
var currentHints = null;
var conflictResolved = false;
var world = 0;
var currentSelectedHint = null;

document.getElementById('hintName').addEventListener('change', function(){
	hintSelected(document.getElementById('hintName').value);
});

function changeCoordinates(id, to) {
	var duration = 1000; //millisecondes

	var input = document.getElementById(id);
	if (!/\-?[0-9]{1,3}/.test(input.value)) return false;
	var difference = to - input.value;
	var start = input.value;
	var steps = Math.abs(difference);

	input.className = 'changingNumber';

	for (i = 1; i <= steps; i++) {
		setTimeout(function(){
			(difference > 0) ? input.value++ : input.value--;
			if (input.value == (start * 1 + difference)) {
				input.className = '';
				conflictResolved = true; //si la modification x et y a été automatique, la chasse continue sur le même monde. Si le changement a été fait à la main (texte tapé ou boutons + et -), la resolution du conflits des maps est annulée et devra être de nouveau résolue
			}
		}, (Math.pow((i * (1 / steps)), 3) * duration));
	}
}

function one(button) {
	if (button.innerHTML == '-') {
		var input = button.nextSibling;
		input.value--;
	} else {
		var input = button.previousSibling;
		input.value++;
	}
	conflictResolved = false;
	nextMapId = null;
	cancelDirection(false);
	if (!currentHints) {
		removeErrorLeadingMessages();
	}
}

function setDirection(node) {
	var x = document.getElementById('x').value;
	var y = document.getElementById('y').value;

	if (x == 0 && y == 0 && !currentHints) {
		// si les positions sont à 0, on joue l'animation d'erreur en rajoutant une classe. Cette classe est retirée après 0.5s (durée de l'animation)
		// et on va pas plus loin
		document.getElementById('startingPosition').className = 'error';
		setTimeout(function(){
			document.getElementById('startingPosition').className = '';
		}, 500);
		return false;
	}

	if (node.id == direction) return false;

	if (coordonnatesAreConflictual(x, y, node)) return false;

	if (mapsAreOverlaid(x, y, node)) return false;

	if (direction != null) document.getElementById(direction).className = '';

	removeErrorLeadingMessages();
	currentSelectedHint = null;

	document.getElementById(node.id).className = 'selected';
	direction = node.id;

	// on va lancer une pré-recherche en fonction de la position initiale et de la direction, pour avoir un nombre réduit d'indices à choisir dans la liste
	var resultNode = document.getElementById('result');

	// on verifie d'abord qu'on est pas déjà en train d'attendre une réponse du serveur (l'utilisateur a changé très rapidement de direction)
	var newRequest = false;
	if (newRequestTimeout) clearTimeout(newRequestTimeout);
	var newRequestTimeout = null;

	if (waitingForResponse == true) {
		resultNode.className = 'hidden';
		var newRequestTimeout = setTimeout(function(){
			resultNode.className = 'waiting';
		}, 200); //on doit attendre que l'animation d'arrêt soit finie avant de relancer l'animation d'apparition
		newRequest = true;
	}

	if (!newRequest) resultNode.className = 'waiting';
	waitingForResponse = true;

	// indiquer le premier chargement dans le select
	updateSelect(text['8'], true);

	//TEMPORAIRE, SIMULATION DE L ATTENTE D UNE REQUETE AJAX
	/*setTimeout(function(){
		if (newRequestTimeout) clearTimeout(newRequestTimeout);
		resultNode.className = 'hidden';
		waitingForResponse = false;
	}, 1000);*/

	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			var data = JSON.parse(xmlhttp.responseText);
			console.log(data);
			if (data.error) {
				var DIVerror = document.getElementById('error');
				DIVerror.lastChild.lastChild.lastChild.innerHTML = (/^[0-9]+$/.test(data.error)) ? text[data.error] : data.error;
				DIVerror.className = 'display';
				return false;
			}

			if (data.from.x == x && data.from.y == y && data.from.di == direction) {
				if (newRequestTimeout) clearTimeout(newRequestTimeout);
				resultNode.className = 'hidden';
				waitingForResponse = false;
				(data.hints.length == 0) ? updateSelect(text['9'], true) : updateSelect(data, false);
			}
		}
	};
	var url = urlBase+'getData.php?x='+x+'&y='+y+'&direction='+direction+'&world='+world+'&language='+language;
	if (nextMapId) {
		url = urlBase+'getData.php?mapId='+nextMapId+'&direction='+direction+'&world='+world+'&language='+language;
	}
	console.log(url);
	xmlhttp.open("GET", url, true);
	xmlhttp.send();

}

function cancelDirection(withUpdateSelect) {
	// on annule la direction quand la position change, pour lancer la pré-recherche une seule fois au moment du choix de la direction
	if (direction != null) {
		document.getElementById(direction).className = '';
		direction = null;
		if (withUpdateSelect) updateSelect(text['6'], true);
	}
}

// data -> array (valeur indiquée: emplacement dans l'array) ou chaine (valeur indiquée : null)
function updateSelect(data, disabled) {
	var selectNode = document.getElementById('hintName');
	
	while (selectNode.firstChild) { selectNode.removeChild(selectNode.firstChild); } //vide le select

	selectNode.disabled = disabled;

	if (typeof data == 'string') {
		appendOptionToSelect(selectNode, data, null);
		currentHints = null;
	} else {
		appendOptionToSelect(selectNode, text['10'], null);
		data.hints.forEach(function(hint, i){
			appendOptionToSelect(selectNode, text[hint.n], i);
		});
		currentHints = data;
	}

	if (!waitingForResponse) {
		var forgotDiv = document.createElement('div');
			forgotDiv.id = 'forgottenHint';
		var forgotSpan = document.createElement('span');
			forgotSpan.textContent = i18n(977);
			forgotSpan.onclick = function(){ createErrorReport(); };
			forgotDiv.appendChild(forgotSpan);
		document.getElementById('hint').appendChild(forgotDiv);
	}
}

function appendOptionToSelect(selectNode, name, value) {
	var optionNode = document.createElement('option');
		optionNode.value = value;
		optionNode.text = name;
	selectNode.appendChild(optionNode);
}

function removeErrorLeadingMessages() {
	//retire "indice mal placé ?" ou "indice oublié ?"
	if (document.getElementById('forgottenHint')) {
		document.getElementById('hint').removeChild(document.getElementById('hint').lastChild);
	}
	if (document.getElementById('misplacedHint')) {
		document.getElementById('result').removeChild(document.getElementById('result').lastChild);
	}
}

function hintSelected(id) {
	if (currentHints != null && currentHints.hints[id]) {

		removeErrorLeadingMessages();

		document.getElementById('firstLine').className = currentHints.from.di;
		document.getElementById('resultDistance').innerHTML = currentHints.hints[id].d;
		var secondLine  = '<span>[</span> ';
			secondLine += (currentHints.from.x != currentHints.hints[id].x) ? currentHints.hints[id].x : '<span>' + currentHints.hints[id].x + '</span>';
			secondLine += '<span> ; </span> ';
			secondLine += (currentHints.from.y != currentHints.hints[id].y) ? currentHints.hints[id].y : '<span>' + currentHints.hints[id].y + '</span>';
			secondLine += ' <span>]</span> ';
		document.getElementById('secondLine').innerHTML = secondLine;
		document.getElementById('result').className = 'displayed';

		if (document.getElementById('x').value != currentHints.hints[id].x) {
			setTimeout(function(){
				changeCoordinates('x', currentHints.hints[id].x);
			}, 1000);
		}
		if (document.getElementById('y').value != currentHints.hints[id].y) {
			setTimeout(function(){
				changeCoordinates('y', currentHints.hints[id].y);
			}, 1000);
		}
		cancelDirection(false);

		currentSelectedHint = {
			'name': text[currentHints.hints[id].n],
			'nameId': currentHints.hints[id].n,
			'x' :   currentHints.hints[id].x,
			'y' :   currentHints.hints[id].y
		};

		nextMapId = ('i' in currentHints.hints[id]) ? currentHints.hints[id].i : null;

		//ajoute "indice mal placé ?"
		var misplacedDiv = document.createElement('div');
			misplacedDiv.id = 'misplacedHint';
		var misplacedSpan = document.createElement('span');
			misplacedSpan.textContent = i18n(978);
			misplacedSpan.onclick = function(){ createErrorReport(); };
			misplacedDiv.appendChild(misplacedSpan);
		document.getElementById('result').appendChild(misplacedDiv);

		var selectNode = document.getElementById('hintName');
		if (selectNode.firstChild.value == 'null') selectNode.removeChild(selectNode.firstChild);
	}
}

function valueToPlaceholder(input) {
	input.placeholder = input.value;
	input.value = '';
}

function fillInput(input) {
	if (input.value == '') {
		input.value = input.placeholder;
	}
}

function coordonnatesAreConflictual(x, y, node) {
	var conflictualMaps = {"areas":{"0":{"name":15,"world":0},"1":{"name":16,"world":1},"2":{"name":17,"world":0},"3":{"name":18,"world":2},"4":{"name":23,"world":0},"5":{"name":24,"world":0}},"maps":{"0":{"0":[0,1],"1":[0,1],"-5":[0,1],"-4":[0,1],"-3":[0,1],"-2":[0,1],"-1":[0,1]},"1":{"0":[0,1],"-5":[0,1],"-4":[0,1],"-3":[0,1],"-2":[0,1],"-1":[0,1]},"2":{"0":[0,1],"-5":[0,1],"-4":[0,1],"-3":[0,1],"-2":[0,1],"-1":[0,1]},"3":{"0":[0,1],"1":[0,1],"-5":[0,1],"-4":[0,1],"-3":[0,1],"-2":[0,1],"-1":[0,1]},"4":{"0":[0,1],"1":[0,1],"-4":[0,1],"-3":[0,1],"-1":[0,1]},"5":{"0":[0,1],"-1":[0,1]},"-58":{"18":[5,3],"21":[5,3]},"-57":{"11":[4,3],"12":[4,3],"13":[4,3],"14":[4,3],"15":[4,3],"16":[4,3],"18":[4,3],"19":[4,3],"20":[4,3],"21":[4,3]},"-56":{"13":[2,3],"16":[2,3],"18":[2,3],"21":[4,3]},"-55":{"13":[2,3],"16":[2,3],"18":[2,3],"21":[2,3]},"-54":{"13":[2,3],"14":[2,3],"15":[2,3],"16":[2,3],"18":[2,3],"19":[2,3],"20":[2,3],"21":[2,3]},"-53":{"16":[2,3],"18":[2,3]},"-52":{"13":[2,3],"14":[2,3],"15":[2,3],"16":[2,3],"17":[2,3],"18":[2,3],"19":[2,3],"20":[2,3],"21":[4,3],"22":[4,3],"23":[5,3]},"-51":{"12":[2,3],"13":[2,3],"16":[2,3],"18":[2,3],"21":[4,3]},"-50":{"13":[4,3],"14":[2,3],"16":[2,3],"18":[2,3],"21":[4,3]},"-49":{"13":[4,3],"14":[4,3],"15":[4,3],"16":[4,3],"18":[4,3],"19":[4,3],"20":[4,3],"21":[5,3]},"-3":{"-6":[0,1],"-5":[0,1]},"-2":{"0":[0,1],"-6":[0,1],"-5":[0,1],"-4":[0,1],"-3":[0,1],"-2":[0,1],"-1":[0,1]},"-1":{"0":[0,1],"1":[0,1],"-6":[0,1],"-5":[0,1],"-4":[0,1],"-3":[0,1],"-2":[0,1],"-1":[0,1]}}};

	if (x in conflictualMaps['maps'] && y in conflictualMaps['maps'][x]) {
		if (conflictResolved) return false;

		var DIVworldSelection = document.getElementById('worldSelection');
		var DIVchoices = DIVworldSelection.lastChild.lastChild;

		while (DIVchoices.firstChild) { DIVchoices.removeChild(DIVchoices.firstChild); } //vide la liste de span

		conflictualMaps['maps'][x][y].forEach(function(area){
			var span = document.createElement('span');
				span.innerHTML = text[conflictualMaps['areas'][area]['name']];
				span.onclick = function() {
					resolveConflict(conflictualMaps['areas'][area]['world'], node);
				}
			DIVchoices.appendChild(span);
		});

		DIVworldSelection.className = 'display';
		return true;
	} else {
		world = 0;
	}
	return false;
}

function mapsAreOverlaid(x, y, node) {
	var coordsString = x + ';' + y;
	var overlaidMaps = {
		'0': {
			'7;-5': [3845, 68419586],
			'-4;13': [53086221, 133133],
			'-30;39': [172229642, 146471],
			'-15;39': [171443204, 178257922]
		}
	};

	if (world in overlaidMaps) {
		if (coordsString in overlaidMaps[world]) {
			if (nextMapId !== null) return false;

			var DIVmapSelection = document.getElementById('mapSelection');
			var DIVchoices = DIVmapSelection.lastChild.lastChild;

			while (DIVchoices.firstChild) { DIVchoices.removeChild(DIVchoices.firstChild); } //vide la liste d'images

			overlaidMaps[world][coordsString].forEach(function(mapId){
				var div = document.createElement('div');
				var size = 250;
				if (window.innerWidth > 1024) {
					size = 570;
				} else if (window.innerWidth > 360) {
					size = 460;
				} else if (window.innerWidth > 320) {
					size = 290;
				}
				div.style.backgroundImage = 'url(' + urlBase + 'overlaidMaps/' + mapId + '_' + size + '.jpg)';
				div.onclick = function() {
					resolveOverlaid(mapId, node);
				}
				DIVchoices.appendChild(div);
			});

			DIVmapSelection.className = 'display';
			return true;
		}
	}
	return false;
}

function resolveConflict(id, node) {
	world = id;
	conflictResolved = true;
	document.getElementById('worldSelection').className = '';
	setDirection(node);
}

function resolveOverlaid(mapId, node) {
	nextMapId = mapId;
	document.getElementById('mapSelection').className = '';
	setDirection(node);
}

function toggleDayNight(node) {
	if (document.body.className == 'nightMode') {
		document.body.className = '';
		node.textContent = text['975'];
		setCookie('nightMode', '0');
	} else {
		document.body.className = 'nightMode';
		node.textContent = text['974'];
		setCookie('nightMode', '1');
	}
}

function loginUser() {
	var button    = document.getElementById('donationMailSubmit');
	var mailInput = document.getElementById('donationMailInput');

	var donateLogin = document.getElementById('donateLogin');
	var donateLoginForm = donateLogin.innerHTML;

	if (mailInput.value != '' && mailInput.disabled == false) {
		mailInput.disabled = true;
		donateLogin.innerHTML = text['976'];

		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				var isLogged = JSON.parse(xmlhttp.responseText);
				if (isLogged) {
					donateLogin.innerHTML = text['971'];
				} else {
					donateLogin.innerHTML = text['19'];
					setTimeout(function(){
						mailInput.disabled = false;
						donateLogin.innerHTML = donateLoginForm;
					}, 2000);
				}
			}
		};
		xmlhttp.open("GET", dns+'loginUserAjax.php?mail='+mailInput.value, true);
		xmlhttp.send();
	}
}

function setCookie(name, value, expire) {
	expire = expire || 1000*60*60*24*365; //1 an
	var d = new Date();
		d.setTime(d.getTime() + expire);
	document.cookie = name + '=' + value + ';expires=' + d.toUTCString() + ';path=/';
}

function sendErrorReport() {
	var correct = true;
	var selectErrorReport = document.getElementById('selectErrorReport')
	if (selectErrorReport && selectErrorReport.value != parseInt(selectErrorReport.value)) {
		selectErrorReport.className = 'error';
		setTimeout(function(){
			selectErrorReport.className = '';
		}, 500);
		correct = false;
	}
	var xErrorReport = document.getElementById('xErrorReport')
	if (xErrorReport.value == '' || xErrorReport.value != parseInt(xErrorReport.value) || xErrorReport.value < -100 || xErrorReport.value > 100) {
		xErrorReport.className = 'error';
		setTimeout(function(){
			xErrorReport.className = '';
		}, 500);
		correct = false;
	}
	var yErrorReport = document.getElementById('yErrorReport')
	if (yErrorReport.value == '' || yErrorReport.value != parseInt(yErrorReport.value) || yErrorReport.value < -100 || yErrorReport.value > 100) {
		yErrorReport.className = 'error';
		setTimeout(function(){
			yErrorReport.className = '';
		}, 500);
		correct = false;
	}

	if (correct) {
		var submitErrorReport = document.getElementById('submitErrorReport');
		submitErrorReport.onclick = function(){return false;};
		submitErrorReport.textContent = i18n(988);

		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				var serverResponse = JSON.parse(xmlhttp.responseText);
				var submitErrorReport = document.getElementById('submitErrorReport');
				if (serverResponse === true) {
					submitErrorReport.textContent = i18n(971);
					var tofu = document.createElement('div');
						tofu.id = 'animTofu';
					document.getElementById('errorReportContent').appendChild(tofu);
					setTimeout(function(){
						document.getElementById('errorReport').className = '';
						var x = document.getElementById('x');
						var y = document.getElementById('y');
						if (x.value != xErrorReport.value) {
							changeCoordinates('x', xErrorReport.value);
						}
						if (y.value != yErrorReport.value) {
							changeCoordinates('y', yErrorReport.value);
						}
						cancelDirection(false);
						nextMapId = null;
						if (!currentHints) {
							removeErrorLeadingMessages();
						}
					}, 1200);
				} else {
					alert(serverResponse.error);
					submitErrorReport.textContent = i18n(987);
					submitErrorReport.onclick = function(){sendErrorReport();};
				}
			}
		};
		var nameId = (document.getElementById('selectErrorReport')) ? document.getElementById('selectErrorReport').value : submitErrorReport.dataset.nameid;
		var note = (document.getElementById('checkboxTextErrorReport').checked) ? encodeURIComponent(document.getElementById('textErrorReport').value) : '';
		//console.log(JSON.stringify(submitErrorReport.dataset));
		var url = urlBase+'sendErrorReport.php?w='+world+'&d='+submitErrorReport.dataset.di+'&fx='+submitErrorReport.dataset.fromx+'&fy='+submitErrorReport.dataset.fromy+'&n='+nameId+'&x='+document.getElementById('xErrorReport').value+'&y='+document.getElementById('yErrorReport').value+'&px='+submitErrorReport.dataset.proposedx+'&py='+submitErrorReport.dataset.proposedy+'&note='+note;
		console.log(url);
		xmlhttp.open("GET", url, true);
		xmlhttp.send();
	}
}

function createErrorReport() {
	if (!direction && !currentHints) {
		return false;
	}
	var di    = (currentHints) ? currentHints.from.di : direction;
	var fromX = (currentHints) ? currentHints.from.x  : parseInt(document.getElementById('x').value);
	var fromY = (currentHints) ? currentHints.from.y  : parseInt(document.getElementById('y').value);

	var content  = '';
	if (di == 'top') {
		content += i18n(980);
	} else if (di == 'right') {
		content += i18n(982);
	} else if (di == 'bottom') {
		content += i18n(981);
	} else {
		content += i18n(983);
	}

	if (currentSelectedHint) {
		var hintStr = '<span>« ' + currentSelectedHint.name + ' »</span>';
		var nameId = currentSelectedHint.nameId;
	} else {
		var nameId = '';
		var hintStr = '<select id="selectErrorReport">';
		var currentHintsIds = [];
		if (currentHints) {
			currentHints.hints.forEach(function(hint){
				currentHintsIds.push(hint.n);
			});
		}
		var possibleHints = [];
		var namesAlreadyUsed = [];
		allHintsNameIds.forEach(function(id){
			if (!currentHintsIds.includes(id) && !namesAlreadyUsed.includes(text[id])) {
				possibleHints.push({
					'name': text[id],
					'id':   id
				});
				namesAlreadyUsed.push(text[id]);
			}
		});
		hintStr += '<option value="null"></option>';
		possibleHints.sort(function(a,b){return a.name.localeCompare(b.name);});
		possibleHints.forEach(function(hint){
			hintStr += '<option value="' + hint.id + '">' + hint.name + '</option>';
		});
		hintStr += '</select>';
	}

	var prefilledX = '';
	var prefilledY = '';
	if (di == 'top' || di == 'bottom') {
		prefilledX = fromX;
	} else {
		prefilledY = fromY;
	}
	var xStr = '<input type="number" value="' + prefilledX + '" id="xErrorReport"/>';
	var yStr = '<input type="number" value="' + prefilledY + '" id="yErrorReport"/>';
	
	content += i18n(984, fromX, fromY, hintStr, xStr, yStr);
	
	var proposedX = '';
	var proposedY = '';
	if (currentSelectedHint) {
		proposedX = currentSelectedHint.x;
		proposedY = currentSelectedHint.y;
		content += i18n(985, proposedX, proposedY);
	}

	content += '<input type="checkbox" id="checkboxTextErrorReport" onclick="document.getElementById(\'textErrorReport\').style.display=(document.getElementById(\'textErrorReport\').style.display==\'block\')?\'none\':\'block\';"/><label for="checkboxTextErrorReport">' + i18n(986) + '</label>';
	content += '<textarea id="textErrorReport" rows="2" maxlength="400" oninput="searchInTextareaErrorReport(this)"></textarea>';
	content += '<div id="warningErrorReport"></div>';
	content += '<button type="button" onclick="sendErrorReport();" data-proposedy="' + proposedY + '" data-proposedx="' + proposedX + '" data-nameid="' + nameId + '" data-di="' + di + '" data-fromx="' + fromX + '" data-fromy="' + fromY + '" id="submitErrorReport">' + i18n(987) + '</button>';

	var divContent = document.getElementById('errorReportContent');
		divContent.innerHTML = content;

	document.getElementById('errorReport').className = 'display';
}

function searchInTextareaErrorReport(textarea) {
	var warningErrorReport = document.getElementById('warningErrorReport');
	if (textarea.value.search(new RegExp(i18n(989), 'i')) >= 0) {
		warningErrorReport.style.display = 'block';
		warningErrorReport.textContent = i18n(990);
	} else if (textarea.value.search(new RegExp(i18n(992), 'i')) >= 0) {
		warningErrorReport.style.display = 'block';
		warningErrorReport.textContent = i18n(991);
	} else {
		warningErrorReport.style.display = 'none';
	}
}

function i18n(textId) {
	var str = text[textId];
	if (arguments.length == 1) {
		return str;
	}
	var includes = Array.prototype.slice.call(arguments);
	function convert(str, p1, offset, s) {
		return includes[p1];
	}
	return str.replace(/%(\d+)/g, convert);
}
