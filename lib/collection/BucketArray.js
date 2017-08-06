"use strict";


module.exports = BucketArray;

// 见缝插针模式
function BucketArray(key) {
    this.elements = [];
    this.key = key || 'id';
    this.size = 0;
}

var pro = BucketArray.prototype;


pro._setId = function(value, id) {
    value[this.key] = id;
}

pro.add = function(value) {
    if (value == null) {
        return;
    }
    ++this.size;
    for (var i in this.elements) {
        if ( this.elements[i] == null ) {
            this.elements[i] = value;
            this._setId(value, parseInt(i) + 1);
            return;
        }
    }
    this.elements.push(value);
    this._setId(value, this.elements.length);
}

// 专用于数据库恢复对象
pro.resume = function(value) {
    ++this.size;
    var id = value[this.key];
    this.elements[id-1] = value;
}

pro.get = function(id) {
    return this.elements[id-1];
}

pro.remove = function(id) {
    let temp = this.elements[id-1];
    if (temp != null) {
        this.elements[id-1] = null;
        --this.size;
    }
    return temp;
}

pro.removeBy = function(field, value) {
    for (var i in this.elements) {
        if ( this.elements[i] && this.elements[i][field] == value ) {
            --this.size;
            var temp = this.elements[i];
            this.elements[i] = null;
            return temp;
        }
    }
}

pro.each = function(cb) {
    for (var i in this.elements) {
        if (this.elements[i] != null) {
            cb(this.elements[i]);
        }
    }
}

pro.eachBreak = function(cb) {
    for (var i in this.elements) {
        if (this.elements[i] != null) {
            var ret = cb(this.elements[i]);
            if (ret) {
                return ret;
            }
        }
    }
}

pro.getSize = function() {
    return this.size;
}

pro.first = function() {
    for (var i in this.elements) {
        if (this.elements[i] != null) {
            return this.elements[i];
        }
    }
}

pro.toArray = function() {
    var arr = [];
    for (var i in this.elements) {
        if (this.elements[i] != null) {
            arr.push(this.elements[i]);
        }
    }
    return arr;
}
