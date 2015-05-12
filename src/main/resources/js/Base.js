/**
 * 约定：
 * 1.凡是从java那边put过来的对象，全部以_$开头
 * 2.凡是全局对象包括方法，以$开头。
 * 3.凡是调用java对象中的方法，不要用apply或者call，Nashorn引擎不支持这种调用。
 *
 */
var javaArray = java.lang.reflect.Array;
var mf = java.text.MessageFormat.format;
var javaInteger = java.lang.Integer;
var UUID = java.util.UUID;

var _$log;
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

/**
 * 计算工具，会被java调用，用来简化java语言的计算。
 * 不要试图实现过于复杂的计算。
 * 还要注意一点，和java交互只能使用字符串等基础类型，比较方便。
 *
 * @returns {{calculateNameSpace: Function}}
 */
induction.calculateTool = function () {
    return {
        calculateNameSpace: function (name) {
            var rs = "";
            var index = name.indexOf('/');
            if (index > 0) {
                var factors = _.initial(name.split(/\//));
                factors.push('');
                _$log.debug($mf('--Base.js-- CALCULATE name space factor : {0}', JSON.stringify(factors)));
                _.reduce(factors, function (f1, f2) {
                    rs = rs + 'induction.' + f1 + '= induction.' + f1 + '||{};';
                    return f1 + '.' + f2;
                });
            }
            return rs;
        }
    }
};

/**
 * 所有的模块都会依赖这个基础模块，不会共享状态。不用显式的依赖，有由框架主动的注入。
 * 所以这个对象最好不要太复杂。
 *
 */
induction.Base = function (fileName) {
    return {
        log: function (message, level) {
            if (!level) {
                level = 'info';
            }
            _$log[level](' -- ' + fileName + '.js -- ' + message);
        }
    }
};
