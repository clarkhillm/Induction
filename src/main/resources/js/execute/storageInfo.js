/**
 * Created by gavin on 2015/3/20.
 */

induction.storageInfo = function () {
    var $ = this;

    var sql = 'SELECT ID,IP,NAME FROM STOR_SYSTEM WHERE TYPE=1 @condition LIMIT ?,?';

    return {
        execute: function (p) {

            if (!p) {
                $.log("parameter input " + p);
                p = {
                    "pageNum": 1,
                    "rows": 20,
                    "conditions": {"ip": [], "name": []}
                };
            }

            $.log('parameter :' + '\n' + JSON.stringify(p));

            var condition = p.conditions;
            if (condition.ip.length == 0 && condition.name.length == 0) {
                sql = sql.replace('@condition', '');
            }
            if (condition.ip.length > 0) {
                var condition_string = "";
                _.each(condition.ip, function (ip) {
                    condition_string = condition_string + " IP='" + ip + "' OR ";
                });
                sql = sql.replace('@condition', ' AND (' + condition_string + ' FALSE )');
            } else {
                if (condition.name.length > 0) {
                    sql = sql.replace('@condition', " AND NAME like '%" + condition.name + "%' ");
                }
            }
            $.log('sql :' + '\n' + sql);
            var data = $queryForList(sql, $.start(p.pageNum, p.rows));
            return {
                storageInf: _.map(data, function (d) {
                    return {
                        name: d.NAME,
                        ip: d.IP
                    }
                })
            }
        }
    }
};
