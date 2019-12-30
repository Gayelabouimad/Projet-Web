
// Populate the table

document.addEventListener( "DOMContentLoaded", get_json_data, false );

function get_json_data(){
	var json_url = 'boardData.json';
	// AJAX Request
	xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() { 
		if (this.readyState == 4 && this.status == 200) {
			// If response is ok --> parse json then call appendJson
			var data = JSON.parse(this.responseText);
			append_json(data);
		}
	}
	xmlhttp.open("GET", json_url, true);
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlhttp.send();
}

function append_json(data){
	var table = document.getElementById('ScoreBoard');
	data.forEach(function(object) {
		var tr = document.createElement('tr');
		tr.innerHTML = '<td>' + object.Name + '</td>' +
		'<td>' + object.Email + '</td>' +
		'<td>' + object.Country + '</td>' +
		'<td>' + object.Score + '</td>';
		table.appendChild(tr);
	});
}