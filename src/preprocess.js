
var isV4OrBetter = function (d3) {
  return (d3.version && (+d3.version.split('.')[0] >= 4));
};

var d3_selection_creator = function (d3, name) {
  return typeof name === 'function' ? name
      : (name = d3.ns.qualify(name)).local ? function () { return this.ownerDocument.createElementNS(name.space, name.local); }
      : function () { return this.ownerDocument.createElementNS(this.namespaceURI, name); };
};

var mapAppendName = function (d3, name) {
  if (isV4OrBetter(d3)) {
    return typeof name === 'function' ? name : d3.creator(name);
  }
  return d3_selection_creator(d3, name);
}

module.exports = function (count) {
  var appendCount = count || -1;
  var d3;
  var dataString = 'data-pid';

  var retThis = function () {
    return this;
  };

  var setD3 = function (_d3) {
    d3 = _d3;
    d3.selection.prototype._append = d3.selection.prototype.append;
    d3.selection.prototype._html = d3.selection.prototype.html;
    d3.selection.prototype._attr = d3.selection.prototype.attr;
    d3.selection.prototype._each = d3.selection.prototype.each;

    d3.selection.prototype.append = retThis;
    d3.selection.prototype.html = retThis;
    d3.selection.prototype.attr = retThis;
    d3.selection.prototype.each = retThis;

    if (!isV4OrBetter(d3)) {
      d3.selection.enter.prototype._append = d3.selection.enter.prototype.append;
      d3.selection.enter.prototype.append = retThis;
    }
  };

  var start = function () {

    var newAppend = function (name) {
      var ogName = name;
      name = mapAppendName(d3, name);

      var isEmpty = -1;

      var topNode = null;
      var allNodes = null;

      return this.select(function () {
        appendCount++;

        if (isEmpty === -1) {
          topNode = d3.select(this);
          var selection = topNode.select(ogName + '[' + dataString + '="' + appendCount + '"]');

          if (selection.empty()) {
            isEmpty = 1;
          } else {
            isEmpty = 0;
            allNodes = topNode.select('*');
          }
        }

        if (isEmpty === 1) {
          var c = this.appendChild(name.apply(this, arguments));
          return d3.select(c).attr(dataString, appendCount).node();
        } else if (isEmpty === 0) {
          return allNodes[arguments[2]];
        }

        return selection;
      });
    };

    d3.selection.prototype.append = newAppend;
    d3.selection.prototype.html = d3.selection.prototype._html;
    d3.selection.prototype.attr = d3.selection.prototype._attr;
    d3.selection.prototype.each = d3.selection.prototype._each;
    if (!isV4OrBetter(d3)) {
      d3.selection.enter.prototype.append = newAppend;
    }

  };

  var stop = function () {
    if (!isV4OrBetter(d3)) {
      d3.selection.enter.prototype.append = retThis;
    }

    d3.selection.prototype.append = retThis;
    d3.selection.prototype.html = retThis;
    d3.selection.prototype.attr = retThis;
    d3.selection.prototype.each = retThis;
  };

  return {
    start: start,
    stop: stop,
    setD3: setD3
  };
}
