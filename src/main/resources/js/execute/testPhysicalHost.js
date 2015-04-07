/**
 *
 * Created by gavin on 2015/3/24.
 */

induction.testPhysicalHost = function ($) {

    var sql = 'INSERT INTO SYS_PHYSICAL_HOST (UUID,NAME,IP) VALUES(?,?,?)';

    return {
        execute: function (p) {
            var rs = {empty: []};
            _.each([1, 1, 1, 1, 1, 1, 1, 1, 1, 1], function (v, i) {
                var result = _$jdbcTemplate.update(sql, [$genUUID(), $mf('name{0}', i), $mf('10.1.1.{0}', i)]);
                $.log($mf('update success : {0}', result));
            });
            return rs;
        }
    }
};
