function calcRegister(register) {
	sum = 0;
	$('input.bits').each(function(index, inputField) {
		field = register.fields[inputField.id];
		v = Number(inputField.value) * Math.pow(2, field.offset);
		v = v & (((1 << field.length) - 1)* Math.pow(2, field.offset));
		sum += v;
	});
	register.value = sum;
	$("div#reg_value").html(sum.toString(16));
	console.log("hex :" + sum.toString(16));
}

function setRegister(register) {
	calcRegister(register);
	setCmd = {
		"$address": register.address,
		"$value": register.value.toString(16)
	};
	setCmd["#src"] = "browser";
	setCmd["id"] = Math.random() * 65536 & 0xFFFF;
	setCmd["#dst"] = "ESP.memory";
	setCmd["#request"] = "set";
	mqttPublish("dst/ESP.memory",JSON.stringify(setCmd));
}

function getBits(value, offset, length) {
	field = value >> offset;
	field = field & ((1 << length) - 1);
	return field;
}

function showRegister(register) {
	register.fields = {};
	register.value = 0x018C1001;
	for (var i = 0, len = register.bits.length; i < len; i++) {
		name = register.bits[i][0];
		console.log(register.bits[i][0]);
		register.fields[name] = {};
		register.fields[name].name = name;
		register.fields[name].offset = register.bits[i][1];
		register.fields[name].length = register.bits[i][2];
		register.fields[name].desc = register.bits[i][3];
		field = register.fields[name];
		register.fields[name].n = getBits(register.value, field.offset, field.length);
	};

	$("div#reg_name").html(register.name);
	$("div#reg_desc").html(register.desc);
	trHTML = "<tr><th>Name</th><th>offset</th><th>length</th>th>value</th></tr>";
	$.each(register.fields, function(i, field) {
		trHTML += '<tr><td>' + field.name 
		+ '</td><td>' + field.offset 
		+ '</td><td>' + field.length 
		+ '</td><td><input type="text" max-width=100px class="bits" id="' + field.name + '" value="' + field.n + '"/></td>'
		+ '<td>'+ field.desc + '</td></tr>';
	});
	$('table#reg_fields').append(trHTML);
	$("input.bits").on("change paste keyup", function() {
		   	calcRegister(register); 
			});
	$('input.bits').on('input', calcRegister(register));
	$('button#send').click(function() { 
		setRegister(register);
		});
}