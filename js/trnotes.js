// JavaScript Document

$(document).bind("mobileinit", function(){
    $.mobile.notesdb = openDatabase('trnotes', '1.0', 'Geo Tagged Properties', 20*1024*1024);
    $.mobile.notesdb.transaction(function (t) {
	    t.executeSql('CREATE TABLE IF NOT EXISTS properties (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, lagis TEXT NOT NULL, pin TEXT NOT NULL,houseNo TEXT NOT NULL,street TEXT NOT NULL,district TEXT NOT NULL,lga TEXT NOT NULL,usage TEXT NOT NULL,otherUsage TEXT NOT NULL, poi TEXT NOT NULL,otherPoi TEXT NOT NULL, lasaHouseNo TEXT NOT NULL,lasaStreet TEXT NOT NULL, remarks TEXT NOT NULL, fileUpload TEXT NOT NULL, entered TEXT NOT NULL, updated TEXT, latitude REAL, longitude REAL);');
    });
});

$(function() {
	$('#home').live('pagebeforeshow', getTitles);
	$('#new').live('pageshow', getLocation);
	$('#insert').live('submit', insertEntry);
	$('#editItem').live('click', editItem);
	$('#delete').live('click', deleteItem);
	$('#update').live('click', updateItem);
	$('#limit').live('click', swapList);
});

var trNotes = {
	lat: null,
	lng: null,
	limit: 20
};

function getTitles() {
	var list = $('#recent'),
	    items = [];
	$.mobile.notesdb.transaction(function(t) {
		t.executeSql('SELECT id, lagis, pin, houseNo,street,district,lga,usage,otherUsage,poi,otherPoi,lasaHouseNo,lasaStreet, remarks, fileUpload FROM properties ORDER BY id DESC LIMIT ?', [trNotes.limit], function(t, result) {
			var i,
			    len = result.rows.length,
				row;
			if (len > 0 ) {
				for (i = 0; i < len; i += 1) {
					row = result.rows.item(i);
					items.push('<li><a href="#display" data-trnote="' + row.id + '">' + row.pin + ' ' + row.houseNo + ' ' + row.street + ' ' + row.lga + '</a></li>');
					
				}
				list.html(items.join('\n'));
				list.listview('refresh');
				$('a', list).live('click', function(e) {
					getItem($(this).attr('data-trnote'));
				});
				$('#entries').show();
			} else {
				$('#entries').hide();
			}
		})
	});
}

function getItem(id) {
	$.mobile.notesdb.transaction(function(t) {
		t.executeSql('SELECT * FROM properties WHERE id = ?',
		[id],
		function(t, result) {
			var row = result.rows.item(0),
				entered = convertToMDY(row.entered),
				updated = row.updated,
				opts = {};
			$('#display h1').text(row.lagis);
			$('#display article').html('<p><strong>Property Pin:</strong>  ' + row.pin + '<br /><strong>House Number: </strong> ' + row.houseNo + '<br /><strong>Street Name:</strong> ' + row.street + '<br /><strong>District Name:</strong> ' + row.district + '<br /><strong>LGA:</strong> ' + row.lga + '<br /><strong>Property Usage:</strong> ' + row.usage + '<br/><strong>Other Usages:</strong> ' + row.otherUsage + '<br/><strong>Point of Interest:</strong> ' + row.poi + '<br/><strong>Other Points of Interests:</strong> ' + row.otherPoi + '<br/><strong>LASAA House No:</strong> ' + row.lasaHouseNo + '<br/><strong>LASAA Street Name:</strong> ' + row.lasaStreet + '<br/><strong>Remarks:</strong> ' + row.remarks + '<br/><strong>Uploaded File:</strong> ' + row.fileUpload + '<br/><strong>Date Created:</strong> ' + row.entered + '</p>');
			if (row.latitude == null) {
				$('#showmap').parent('p').hide();
			} else {
				$('#showmap').parent('p').show();
				opts.pin = row.pin;
				opts.lat = row.latitude;
				opts.lng = row.longitude;
				$('#showmap').unbind('click');
				$('#showmap').click(opts, displayMap);
			}
			$('#display footer').html('<p>Created: ' + entered + '</p>');
			if (updated != null) {
				updated = convertToMDY(updated);
				$('#display footer').append('<p>Updated: ' + updated + '</p>');
			}
			$('#delete, #update').attr('data-trnote', id);
			$('#lagis2').val(row.lagis);
			$('#pin2').val(row.pin);
			$('#houseNo2').val(row.houseNo);
			$('#street2').val(row.street);
			$('#district2').val(row.district);
			$('#lga2').val(row.lga);
			$('#usage2').val(row.usage);
			$('#otherUsage2').val(row.otherUsage);
			$('#poi2').val(row.poi);
			$('#otherPoi2').val(row.otherPoi);
			$('#lasaHouseNo2').val(row.lasaHouseNo);
			$('#lasaStreet2').val(row.lasaStreet);
			$('#remarks2').val(row.remarks);
			$('#fileUpload2').val(row.fileUpload);
		})
	});
}

function convertToMDY(date) {
	var d = date.split('-');
	return d[1] + '/' + d[2] + '/' + d[0];
};

function displayMap(e) {
	var lagis = e.data.pin,
	    latlng = e.data.lat + ',' + e.data.lng;
	if (typeof device !='undefined' && device.platform.toLowerCase() == 'android') {
		window.location = 'http://maps.google.com/maps?z=16&q=' + encodeURIComponent(pin) + '@' + latlng;
	} else {
		$('#map h1').text(pin);
		$('#map div[data-role=content]').html('<img src="http://maps.google.com/maps/api/staticmap?center=' + latlng + ' &zoom=16&size=320x420&markers=' + latlng + '&sensor=false">');
		$.mobile.changePage('#map', 'fade', false, true);
	}
}

function editItem() {
	$.mobile.changePage('#editNote', 'slideup', false, true);
}

function deleteItem(e) {
	var id = $(this).attr('data-trnote');
	$.mobile.notesdb.transaction(function(t) {
		t.executeSql('DELETE FROM properties WHERE id = ?',
			[id],
			$.mobile.changePage('#home', 'slide', false, true),
			null);
	});
	e.preventDefault();
}

function updateItem(e) {
	var lagis = $('#lagis2').val(),
		pin = $('#pin2').val(),
		houseNo = $('#houseNo').val(),
		street = $('#street2').val(),
		district = $('#district2').val(),
		lga = $('#lga2').val(),
		usage = $('#usage2').val(),
		otherUsage = $('#otherUsage2').val(),
		poi = $('#poi2').val(),
		otherPoi = $('#otherPoi2').val(),
		lasaHouseNo = $('#lasaHouseNo2').val(),
		lasaStreet = $('#lasaStreet2').val(),
	    remarks = $('#remarks2').val(),
		fileUpload = $('#fileUpload2').val(),
		id = $(this).attr('data-trnote');
	$.mobile.notesdb.transaction(function(t) {
		t.executeSql('UPDATE properties SET lagis = ?, pin = ?, houseNo = ?, street = ?, district = ?, lga = ?, usage = ?, otherUsage = ?, poi = ?, otherPoi = ?, lasaHouseNo = ?, lasaStreet = ?, remarks = ?, fileUpload = ?, updated = date("now") WHERE id = ?',
		    [lagis, pin, houseNo, street, district, lga, usage, otherUsage, poi, otherPoi, lasaHouseNo, lasaStreet, remarks, fileUpload, id],
			$.mobile.changePage('#home', 'flip', false, true),
			null);
	});
	e.preventDefault();
}

function getLocation() {
	navigator.geolocation.getCurrentPosition(
	    locSuccess,
		locFail,
		{enableHighAccuracy: true}
	);
}

function locSuccess(position) {
	trNotes.lat = position.coords.latitude;
	trNotes.lng = position.coords.longitude;
}

function locFail(error) {
	var message = 'Cannot determine location.';
	if (error.code == error.PERMISSION_DENIED) {
		message += ' Geolocation is disabled.';
	}
	try {
		navigator.notification.alert(message, null, 'Geolocation');
	} catch (e) {
		alert(message);
	}
};

function insertEntry(e) {
	var lagis = $('#lagis').val(),
		pin = $('#pin').val(),
		houseNo = $('#houseNo').val(),
		street = $('#street').val(),
		district = $('#district').val(),
		lga = $('#lga').val(),
		usage = $('#usage').val(),
		otherUsage = $('#otherUsage').val(),
		poi = $('#poi').val(),
		otherPoi = $('#otherPoi').val(),
		lasaHouseNo = $('#lasaHouseNo').val(),
		lasaStreet= $('#lasaStreet').val(),
	    remarks = $('#remarks').val(),
		fileUpload = $('#fileUpload').val();
	$.mobile.notesdb.transaction(function(t) {
		t.executeSql('INSERT into properties (lagis, pin,houseNo,street,district,lga,usage,otherUsage,poi,otherPoi,lasaHouseNo,lasaStreet,remarks,fileUpload,entered, latitude, longitude) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,date("now"),?,?);',
		[lagis, pin, houseNo,street,district,lga,usage,otherUsage,poi,otherPoi,lasaHouseNo,lasaStreet,remarks,fileUpload, trNotes.lat, trNotes.lng],
		function() {
			$.mobile.changePage('#home', 'slide', false, true);	
			$('#lagis').val('');
			$('#pin').val('');
			$('#houseNo').val('');
			$('#street').val('');
			$('#district').val('');
			$('#lga').val('');
			$('#usage').val('');
			$('#otherUsage').val('');
			$('#poi').val('');
			$('#otherPoi').val('');
			$('#lasaHouseNo').val('');
			$('#lasaStreet').val('');
			$('#remarks').val('');
			$('#fileUpload').val('');
		}, 
		null);
	});
	e.preventDefault();
};

function swapList() {
	var btn = $('#limit .ui-btn-text');
	if (btn.text() == 'List All') {
		btn.text('List Most Recent');
		$('#entries h2').text('All Notes');
		trNotes.limit = -1;
	} else {
		btn.text('List All');
		$('#entries h2').text('Most Recent Notes');
		trNotes.limit = 20;
	}
	getTitles();
}