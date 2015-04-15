/**
 * 严重依赖 underscore
 *
 * 无异步加载,需要手动注册模块。
 *
 * 注意引用顺序：
 * 1.core
 * 2.modulesRegister
 * 3.loader
 *
 * Created by gavin on 2015/4/14.
 */

var induction = {};

induction.core = {};

induction.core.execute = function (module) {
    induction.core.base('core').log('module name:', module);
    var m = eval(module);
    var t = typeof m;
    if ('function' === t) {
        return eval(module).call({}, induction.core.base(module));
    } else {
        var f = _.last(m);
        var dependenceModuleNames = _.initial(m);
        var dependenceModules = [];
        _.each(dependenceModuleNames, function (d) {
            dependenceModules.push(induction.core.execute(d));
        });
        dependenceModules.unshift(induction.core.base(module));
        return eval(f).apply({}, dependenceModules);
    }
};
induction.core.calculateNameSpace = function (name) {
    var rs = "";
    var index = name.indexOf('/');
    if (index > 0) {
        var factors = _.initial(name.split(/\//));
        factors.push('');
        _.reduce(factors, function (f1, f2) {
            rs = rs + 'induction.' + f1 + '= induction.' + f1 + '||{};';
            return f1 + '.' + f2;
        });
    }
    return rs;
};
induction.core.base = function (moduleName) {
    return {

        log: function () {
            var level = ['ERROR', 'INFO', 'DEBUG'];
            var a = arguments;
            var ll = 'DEBUG';
            var message = [];
            if (_.contains(level, _.last(a))) {
                ll = _.last(a);
                message = _.initial(a);
            } else {
                message = _.map(a, function (x) {
                    return x;
                });
            }

            var d = new Date();
            message.unshift(d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' '
            + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '.' + d.getMilliseconds()
            + '--' + moduleName + '--');

            switch (induction.core.config.logLevel) {
                case 'DEBUG':
                    console.log.apply(console, message);
                    break;
                case 'INFO':
                    if (ll === 'INFO' || ll === 'ERROR') {
                        console.log.apply(console, message);
                    }
                    break;
                case 'ERROR':
                    if (ll === 'ERROR') {
                        console.log.apply(console, message);
                    }
                    break;
            }
        }
    }
};
