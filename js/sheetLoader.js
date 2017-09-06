   sheetUrl = "https://docs.google.com/spreadsheets/d/1BNLxDNru_yCzKDj1i8CG6zDpSrbQNrcUdwg9t4SSN6A/edit?usp=sharing"
   sheetUrl2 = "https://docs.google.com/spreadsheets/d/1BNLxDNru_yCzKDj1i8CG6zDpSrbQNrcUdwg9t4SSN6A/edit?usp=sharing?alt=json-in-script&callback=x"
   sheetUrl3 = "https://spreadsheets.google.com/feeds/list/1BNLxDNru_yCzKDj1i8CG6zDpSrbQNrcUdwg9t4SSN6A/od6/public/values?alt=json-in-script&callback=x"

   var spreadsheetID = "1BNLxDNru_yCzKDj1i8CG6zDpSrbQNrcUdwg9t4SSN6A";

   // Make sure it is public or set to Anyone with link can view 
   var url = "https://spreadsheets.google.com/feeds/list/" + spreadsheetID + "/od6/public/values?alt=json";
   var list = [];


   function sheetLoader(url) {
       $.getJSON(url, function(data) {
           var entry = data.feed.entry;


           $(entry).each(function() {
               entry = {};
               entry.controller = this.gsx$controller.$t;
               findAngularScope('#processorList').add(entry.controller);
               address = this.gsx$address.$t;
               if (address.startsWith("0x")) {
                   entry.address = parseInt(address.substr(2), 16);
               } else {
                   entry.address = parseInt(address, 16);
               }
               entry.register = this.gsx$register.$t;
               findAngularScope('#registerList').add(entry.register);
               entry.field = this.gsx$field.$t;
               entry.offset = parseInt(this.gsx$offset.$t,10);
               entry.len = parseInt(this.gsx$length.$t,10);
               entry.desc = this.gsx$desc.$t;
               entry.value = 0;
               list.push(entry);
               //               findAngularScope('#fieldGrid').add(entry);
               //       console.log(this.content.$t);

               // Column names are name, age, etc.
               //    $('.results').prepend('<h2>'+this.gsx$name.$t+'</h2><p>'+this.gsx$age.$t+'</p>');
           });
           model.list = list;
           getRegisterFields(model.controller,model.register);
           model.getRegister();
       });
   }


   function getRegisterFields(controller, register) {
       registerFields = [];
       address = "";
       for (entry of model.list) {
           var field = {};
           if (entry.controller === controller && entry.register === register) {
               field.field = entry.field;
               field.offset = entry.offset;
               field.len = entry.len;
               field.desc = entry.desc;
               field.value = 0;
               address = entry.address;
               registerFields.push(field);
           }
       };
       model.address = address;
       model.controller = controller;
       model.register = register;
       model.registerFields = registerFields;
       findAngularScope('#fieldGrid').setData(registerFields);
//       findAngularScope('#fieldGrid').$apply();
       return registerFields;
   }
