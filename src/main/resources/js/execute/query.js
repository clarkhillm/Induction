/**
 *
 * Created by gavin on 2015/3/20.
 */

induction.query = function () {
    var sql = 'SELECT IP from  sys_physical_host ';
    return {
        execute: function () {
            var data = $queryForList(sql);
            return _.map(data, function (d) {
                return d.IP;
            });
        }
    }
};
