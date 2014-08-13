
Util = function () {}

Util.prototype = {
	
	stringify: function (object) {
		try { 
			return JSON.stringify(object);
		} catch (e) {
			this.root = {};
			this.root.objects = {};
			var key = this._createKey();
			this.root.pointers = [];
			this._circularStringify('root', object);
			return JSON.stringify(this.root);
		}
	},

	parse: function (string) {
		var object = JSON.parse(string);
		if(!object.objects && object.pointers){
			return object;
		} else {
			var parsedObjects = {};
			for(prop in object.objects){
				parsedObjects[prop] = JSON.parse(object.objects[prop]);
			}
			for (var i = object.pointers.length - 1; i >= 0; i--) {
				parsedObjects[object.pointers[i].origin][object.pointers[i].prop] = parsedObjects[object.pointers[i].pointer];
			};
		}
		return parsedObjects['root'];
	},

	_circularStringify: function (originKey, object, start) {
		var toAnalyze = [];
		for(prop in object){
			if(object[prop] instanceof Object){
				var newObject = object[prop];
				toAnalyze.push({
					object: newObject,
					prop: prop
				});
				delete object[prop];
			}
		}
		
		if(!this._getExistingKey()){
			this.root.objects[originKey] = JSON.stringify(object);	
		}

		for (var i = toAnalyze.length - 1; i >= 0; i--) {
			var existingKey;
			try {
				existingKey = this._getExistingKey(JSON.stringify(toAnalyze[i].object));
			} catch (e) {

			}
			var pointerKey = existingKey ? existingKey : this._createKey();
			this.root.pointers.push({
				origin: originKey,
				pointer: pointerKey,
				prop: toAnalyze[i].prop
			});
			this._circularStringify(pointerKey, toAnalyze[i].object, false);
		};
		
	},

	_getExistingKey: function (jsonString) {
		for(prop in this.root.objects){
			if(this.root.objects[prop] == jsonString){
				// Already exists
				return prop;
			}
		}
		return false;
	},

	_createKey: function () {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		    return v.toString(16);
		});
	}
}

var util = new Util();

// TESTS!

var seth = {
	name: 'Seth',
	age: 25,
	homeTown: 'Aurora'
}

var chloe = {
	name: 'Chloe',
	age: 23,
	homeTown: 'Japan'
}

seth.wife = chloe;
chloe.husband = seth;

var json = util.stringify(seth);
console.log(json);

var obj = util.parse(json);
console.log(obj);

console.log("Test1 - ", seth == obj);





// A = []; A[0] = A

// var json = util.stringify(A);
// console.log(json);
