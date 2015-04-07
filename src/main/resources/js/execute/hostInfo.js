/**
 * Created by gavin on 15-3-26.
 *
 */
induction.hostInfo = function ($) {

    var sql = 'SELECT IP ,NAME FROM SYS_PHYSICAL_HOST  WHERE {0} LIMIT ?,?';

    return {
        execute: function (p) {
            p = $.checkParameters(p);

            var condition = p.conditions;
            if (condition.ip.length == 0 && condition.name.length == 0) {
                sql = $mf(sql, 'TRUE');
            } else {
                if (condition.ip.length > 0) {
                    var condition_string = '';
                    _.each(condition.ip, function (ip) {
                        condition_string = condition_string + ' IP=\'' + ip + '\' OR ';
                    });
                    sql = $mf(sql, condition_string + ' FALSE ');
                } else {
                    if (condition.name.length > 0) {
                        sql = $mf(sql, ' NAME like \'%' + condition.name + '%\' ');
                    }
                }
            }
            $.log(sql);
            return {
                hostinf: _.map($queryForList(sql, $.start(p.pageNum, p.rows)), function (h) {
                    return {ip: h.IP, name: h.NAME}
                })
            };
        }
    }
};
