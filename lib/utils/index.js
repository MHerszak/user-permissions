exports.intersection = function intersection(arrays) {
    return Array.prototype.reduce.call(arrays, function(result, array) {
        Array.prototype.filter.call(result, function (e) {
            return array.includes(e);
        });
    });
};

exports.uniq = function uniq(arr) {
    return Array.prototype.filter.call(arr, function(elt, i) {
        return arr.indexOf(elt) === i;
    });
};

exports.flatten = function flatten(arr) {
    return Array.prototype.reduce.call(arr, function (flat, toFlatten) {
        return Array.prototype.concat.call(flat, Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
};

exports.difference = function difference(a1, a2) {
    var a = [], diff = [];
    for (var i = 0; i < a1.length; i++) {
        a[a1[i]] = true;
    }
    for (var i = 0; i < a2.length; i++) {
        if (a[a2[i]]) {
            delete a[a2[i]];
        } else {
            a[a2[i]] = true;
        }
    }
    for (var k in a) {
        diff.push(k);
    }
    return diff;
};
