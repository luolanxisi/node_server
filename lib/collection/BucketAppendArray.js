"use strict";


module.exports = BucketAppendArray;

// bucket代表元素删除及id生成模式为见缝插针，Append代表元素插位方式，Array代表存储的数据结构
// 用该数据结构主键有且只有一个（可考虑扩展多键支持）
function BucketAppendArray(key) {
    this.elements = [];
    this.bucket = []; // 用于见缝插针生成id的数组
    this.key = key || 'id';
}

var pro = BucketAppendArray.prototype;

// _下划线代表私有方法
pro._insertBucket = function(value) {
    for (var i in this.bucket) {
        if ( this.bucket[i] == null ) {
            this.bucket[i] = value;
            return parseInt(i) + 1;
        }
    }
    this.bucket.push(value);
    return this.bucket.length;
}

pro._setNullBucket = function(id) {
    this.bucket[id-1] = null;
}

pro._setId = function(value, id) {
    value[this.key] = id;
}

pro.add = function(value) {
    this.elements.push(value);
    var id = this._insertBucket(value);
    this._setId(value, id);
}

// 专用于数据库恢复对象
pro.resume = function(value) {
    this.elements.push(value);
    var id = value[this.key];
    this.bucket[id-1] = value;
}

pro.get = function(id) {
    return this.bucket[id-1];
}

pro.remove = function(id) {
    for (var i in this.elements) {
        var item = this.elements[i];
        if ( item && item[this.key] == id ) {
            this.elements.splice(i, 1);
            this._setNullBucket(id);
            return item;
        }
    }
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
    return this.elements.length;
}

pro.toArray = function() {
    return this.elements.slice(0);
}
