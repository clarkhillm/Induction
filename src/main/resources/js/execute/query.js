/**
 *
 * Created by gavin on 2015/3/20.
 */

induction.query = ['Tool', 'relation/SQL', function ($, tool) {
    var sql = 'SELECT IP from  sys_physical_host ';
    return {
        execute: function () {
            var name = 'a/b/c';
            var index = name.indexOf('/');
            if (index > 0) {
                var factors = _.initial(name.split(/\//));
                factors.push('');
                _$log.debug($mf('--Base.js-- CALCULATE name space factor : {0}', JSON.stringify(factors)));
                var rs = "";
                _.reduce(factors, function (f1, f2) {
                    rs = rs + 'induction.' + f1 + '= induction.' + f1 + '||{};';
                    return f1 + '.' + f2;
                });
            }
            $.log("*** ***" + tool.test());
            var data = $queryForList(sql);
            return _.map(data, function (d) {
                return d.IP;
            });
        }
    }
}];
