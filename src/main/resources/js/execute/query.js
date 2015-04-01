/**
 *
 * Created by gavin on 2015/3/20.
 */

induction.query = ['Tool', function ($, tool) {
    var sql = 'SELECT IP from  sys_physical_host ';
    return {
        execute: function () {
            $.log("********"+tool.test());
            var data = $queryForList(sql);
            return _.map(data, function (d) {
                return d.IP;
            });
        }
    }
}];
