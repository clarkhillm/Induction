induction.switchInfo = function ($) {

    var sql = "SELECT A.ID,A.SYS_ID,A.WWN,B.ID,B.NAME,B.IP " +
        "FROM SWITCH A, STOR_SYSTEM B " +
        "WHERE " +
        "A.SYS_ID=B.ID " +
        "AND B.TYPE=2 " +
        "@condition " +
        "limit ?,?";

    return {
        /**
         * do execute...
         * @param p a json string like : {"pageNum":1,"rows":20,"conditions":{"ip":[],"name":""}}
         * @returns {{switchinf: (Array|*)}}
         */
        execute: function (p) {
            p = $.checkParameters(p);
            var condition = p.conditions;
            if (condition.ip.length == 0 && condition.name.length == 0) {
                sql = sql.replace('@condition', '');
            }
            if (condition.ip.length > 0) {
                var condition_string = "";
                _.each(condition.ip, function (ip) {
                    condition_string = condition_string + " B.IP='" + ip + "' OR ";
                });
                sql = sql.replace('@condition', ' AND (' + condition_string + ' FALSE )');
            } else {
                if (condition.name.length > 0) {
                    sql = sql.replace('@condition', " AND B.NAME like '%" + condition.name + "%' ");
                }
            }

            $.log('sql :' + '\n' + sql);
            var data = $queryForList(sql, $.start(p.pageNum, p.rows));
            $.log($mf('response data length {0}', data.length + ''));

            return {
                switchinf: _.map(data, function (o) {
                    return {
                        switchname: o.NAME,
                        ip: o.IP
                    };
                })
            };
        }
    }
};
