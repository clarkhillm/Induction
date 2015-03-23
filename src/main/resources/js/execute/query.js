/**
 *
 * Created by gavin on 2015/3/20.
 */

induction.query = function () {
    var sql = 'SELECT IP from stor_system where type=2 ';
    return {
        execute: function () {
            var data = $queryForList(sql);
            return _.map(data, function (d) {
                return d.IP;
            });
        }
    }
};
