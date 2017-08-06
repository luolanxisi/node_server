"use strict";


module.exports = Dict;

// 常规哈希结构
function Dict() {
    this.elements = {}
    this.size = 0;
}

var pro = Dict.prototype;


pro.add = function(id, value) {
    if (value == null) {
        return;
    }
    if ( this.elements[id] == null ) {
        ++this.size;
    }
    this.elements[id] = value;
}

pro.get = function(id) {
    return this.elements[id];
}

pro.remove = function(id) {
    --this.size;
    var temp = this.elements[id];
    delete this.elements[id];
    return temp;
}

pro.each = function(cb) {
    for (var i in this.elements) {
        cb(this.elements[i]);
    }
}

pro.eachBreak = function(cb) {
    for (var i in this.elements) {
        var ret = cb(this.elements[i]);
        if ( ret ) {
            return ret;
        }
    }
}

pro.getSize = function() {
    return this.size;
}

pro.toArray = function() {
    var arr = [];
    for (var i in this.elements) {
        arr.push(this.elements[i]);
    }
    return arr;
}

pro.getRaw = function() {
    return this.elements;
}

pro.has = function(id) {
    return this.elements[id] != null;
}


