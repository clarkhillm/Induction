/**
 *
 * Created by gavin on 2015/4/14.
 */
(function () {

    var modules = induction.modules || [];

    var loadModules = _.map(modules, function (m) {
        return m.replace(/\./g, '/');
    });

    _.each(loadModules, function (m) {
        document.write('<script>' + induction.core.calculateNameSpace(m) + '</script>'
        + '<script src=\'' + induction.core.config.basePath + '/' + m + '.js\'></script>');
    });
    //document.write('<script>console.log(induction.common)</script>');
    document.write('<script>induction.core.execute(induction.entrance.module).' + induction.entrance.method + '();</script>')
}());
