/**
 * Created by gavin on 2015/3/20.
 */

induction.switchLinkInfo = function () {
    var $ = this;

    var switchSQL = 'SELECT ID ,IP FROM STOR_SYSTEM WHERE @C';
    var switchPortSQL = 'SELECT SYS_ID, SLOT_ID, PORT_ID, ELEMENT_ID ,WWN FROM SWITCH_PORT WHERE WWN!=\'\' AND (@C)';

    var storPortSQL = 'select a.SYS_ID, a.PERMANENT_ADDRESS ,b.name,b.ip from stor_port a , stor_system b where a.sys_id = b.id and @C';

    var switchs = [];

    return {
        execute: function (p) {
            if (!p) {
                $.log("parameter input " + p);
                p = [];
            }
            $.log('parameter :' + '\n' + JSON.stringify(p));

            if (p.length > 0) {
                var condition = '';
                _.each(p, function (ip) {
                    condition = condition + ' IP=\'' + ip + '\' OR ';
                });
                condition += ' FALSE ';
                switchSQL = switchSQL.replace('@C', condition);
                $.log(switchSQL);
                var switchInfo = $queryForList(switchSQL);
                $.log($mf('switch by ip : {0}', JSON.stringify(switchInfo)));

                switchs = _.map(switchInfo, function (s) {
                    return {id: s.ID, ip: s.IP}
                });

                condition = '';
                _.each(switchs, function (s) {
                    condition = condition + ' SYS_ID =\'' + s.id + '\' OR ';
                });
                condition += ' FALSE ';
                switchPortSQL = switchPortSQL.replace('@C', condition);
                $.log(switchPortSQL);
                var switchPort = $queryForList(switchPortSQL);
                switchs = _.map(switchs, function (s) {
                    s.ports = _.chain(switchPort)
                        .filter(function (sp) {
                            return sp.SYS_ID === s.id;
                        })
                        .map(function (sp) {
                            return {
                                WWN: sp.WWN,
                                slotID: sp.SLOT_ID,
                                portID: sp.PORT_ID,
                                elementID: sp.ELEMENT_ID
                            }
                        }).value();
                    return s;
                });
                return switchs;
            } else {
                return {
                    linkInf: []
                }


            }
        }
    }
};
