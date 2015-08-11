define("util", function () {
	return {
		tokenize: function(message) {
			// Links
		    var pat_link = /(((https?|ftp):\/\/)\S+\.\S{2,})/ig;
		    var rep_link = '<a href="$1" target="_blank">$1</a>';
		    message = message.replace(pat_link, rep_link);
		
		    // Line links
		    // TODO: This will cause unwanted behavior if an
		    //       existing link has something that matches
		    //       the pattern in pat_linelink below.
		    var pat_linelink = /(^|\s)(#\d+)(\s|$)/im;
		    var rep_linelink = '$1<a href="#" class="linelink" data-line="$2">$2</a>$3';
		    message = message.replace(pat_linelink, rep_linelink);
		
		    return message;
		},
		validateName: function(name) {
		    if (typeof name !== "undefined"
		        && name !== ""
		        && name !== null
  		        && !name.match(/server/i)
		        && usernames.indexOf(name) === -1) {
		 		
				return name;
		 	}
		 	else {
		    	return false;
		 	}
		}
	}
});