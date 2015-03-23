/**
 * Created by gavin on 2015/3/20.
 */

induction.switchLinkInfo = function () {
    var $ = this;

    var switchSQL = 'SELECT A.ID,A.IP,A.NAME,B.WWN ' +
        'FROM STOR_SYSTEM A ,SWITCH B WHERE A.ID=B.ID AND (@C)';

    var switchPortSQL = 'SELECT SYS_ID, SLOT_ID, PORT_ID, ELEMENT_ID ,WWN ' +
        'FROM SWITCH_PORT WHERE WWN!=\'\' AND (@C)';

    var storagePortSQL = 'SELECT A.SYS_ID, A.PERMANENT_ADDRESS ,B.NAME,B.IP FROM ' +
        'STOR_PORT A , STOR_SYSTEM B ' +
        'WHERE A.SYS_ID = B.ID AND A.PERMANENT_ADDRESS IS NOT NULL AND A.PERMANENT_ADDRESS !=\'\'';

    var storages = [];

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
                    condition = condition + ' A.IP=\'' + ip + '\' OR ';
                });
                condition += ' FALSE ';
                switchSQL = switchSQL.replace('@C', condition);
                $.log(switchSQL);

                var switchInfo = $queryForList(switchSQL);

                var switches = _.map(switchInfo, function (s) {
                    return {
                        id: s.ID,
                        ip: s.IP,
                        name: s.NAME,
                        WWN: s.WWN.replace(/:/g, '').toLowerCase()
                    }
                });

                //return {switchInfo: switches, length: switches.length};

                condition = '';
                _.each(switches, function (s) {
                    condition = condition + ' SYS_ID =\'' + s.id + '\' OR ';
                });
                condition += ' FALSE ';
                switchPortSQL = switchPortSQL.replace('@C', condition);
                $.log(switchPortSQL);

                var switchPort = $queryForList(switchPortSQL);

                switches = _.map(switches, function (s) {
                    s.ports = _.chain(switchPort)
                        .filter(function (sp) {
                            return sp.SYS_ID === s.id;
                        })
                        .map(function (sp) {
                            return {
                                WWN: sp.WWN.replace(/:/g, '').toLowerCase(),
                                slotID: sp.SLOT_ID,
                                portID: sp.PORT_ID,
                                elementID: sp.ELEMENT_ID
                            }
                        }).value();
                    return s;
                });
                //return {switches: switches, length: switches.length};

                $.log($mf('storage info sql : {0}', storagePortSQL));
                storages = $queryForList(storagePortSQL);
                storages = _.map(storages, function (storage) {
                    storage.PERMANENT_ADDRESS = storage.PERMANENT_ADDRESS.replace(/:/g, '').toLowerCase();
                    return storage;
                });
                //return {length: storages.length, storage: storages};

                var switchLinkInfo = _.map(switches, function (prime_switch) {
                    var rs = {};
                    rs.switchIP = prime_switch.ip;
                    rs.linkswitch = _.flatten(_.map(prime_switch.ports, function (psp) {
                        return _.chain(switches).filter(function (ss) {
                            return ss.WWN === psp.WWN;
                        }).map(function (xx) {
                            return {name: xx.name, switchIp: xx.ip};
                        }).value();
                    }));
                    rs.linkstor = _.flatten(_.map(prime_switch.ports, function (psp) {
                        return _.chain(storages).filter(function (s) {
                            return psp.WWN === s.PERMANENT_ADDRESS;
                        }).map(function (ss) {
                            return {name: ss.NAME, storIp: ss.IP};
                        }).value();
                    }));

                    return rs;
                });
                return {
                    linkInf: switchLinkInfo,
                    length: switchLinkInfo.length
                };
            } else {
                return {
                    linkInf: []
                }
            }
        }
    }
};
