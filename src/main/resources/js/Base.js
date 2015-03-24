/**
 * 约定：
 * 1.凡是从java那边put过来的对象，全部以_$开头
 * 2.凡是全局对象包括方法，以$开头。
 * 3.凡是调用java对象中的方法，不要用apply或者call，Nashorn引擎不支持这种调用。
 */
var javaArray = java.lang.reflect.Array;
var mf = java.text.MessageFormat.format;
var javaInteger = java.lang.Integer;
var UUID = java.util.UUID;

var _$log;
var _$fileName;
var _$jdbcTemplate;
var _$tool;

var induction = {};

var $mf = function () {
    return mf(_.first(arguments), _.rest(arguments));
};

var $genUUID = function () {
    return UUID.randomUUID().toString();
};

var $queryForList = function () {
    if (arguments[1]) {
        return JSON.parse(_$tool.toJSON(_$jdbcTemplate.queryForList(arguments[0], arguments[1])));
    } else {
        return JSON.parse(_$tool.toJSON(_$jdbcTemplate.queryForList(arguments[0])));
    }
};

var $JavaIntArray = function () {
    var a = javaArray.newInstance(new javaInteger(1).getClass(), arguments.length);
    _.each(arguments, function (arg, i) {
        a[i] = arg;
    });
    return a;
};

induction.Base = (function () {
    return {
        start: function (pageNum, rows) {
            return $JavaIntArray((pageNum - 1) * rows, rows);
        },
        log: function (message, level) {
            if (!level) {
                level = 'debug';
            }
            _$log[level](' -- ' + _$fileName + ' -- ' + message);
        }
    }
}());
