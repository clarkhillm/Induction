/**
 *
 * Created by gavin on 3/31/15.
 */
induction.generateRelationsTask = function ($) {

    var switchSQL = 'SELECT A.ID,A.IP,A.NAME,B.WWN ' +
        'FROM STOR_SYSTEM A ,SWITCH B WHERE A.ID=B.ID';

    var switchPortSQL = 'SELECT SYS_ID, SLOT_ID, PORT_ID, ELEMENT_ID ,NAME,WWN ' +
        'FROM SWITCH_PORT WHERE WWN!=\'\' AND (@C)';

    var storagePortSQL = 'SELECT A.SYS_ID, A.PERMANENT_ADDRESS ,A.NAME AS PORT_NAME ' +
        ',B.NAME,B.IP' +
        ' FROM ' +
        'STOR_PORT A , STOR_SYSTEM B ' +
        'WHERE A.SYS_ID = B.ID AND A.PERMANENT_ADDRESS IS NOT NULL AND A.PERMANENT_ADDRESS !=\'\'';

    var physicalSQL = 'SELECT A.IP,A.UUID,A.NAME,B.WWN ' +
        'FROM SYS_PHYSICAL_HOST A , SYS_PHYSICAL_HBA B' +
        ' WHERE A.UUID=B.HOST_UUID';

    return {
        genSwitchLinkInfo: function (switches, storages, hosts) {
            return _.map(switches, function (prime_switch) {
                var rs = {};

                rs.uuid = prime_switch.id;
                rs.ip = prime_switch.ip;
                rs.WWN = prime_switch.WWN;

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
                rs.linkhost = _.flatten(_.map(prime_switch.ports, function (psp) {
                    return _.chain(hosts).filter(function (s) {
                        return psp.WWN === s.WWN;
                    }).map(function (ss) {
                        return {name: ss.NAME, hostIp: ss.IP};
                    }).value();
                }));

                return rs;
            });
        },
        updateLinkInfo: function (linkInfoTableName, linkInfo, values) {
            _$jdbcTemplate.update('DELETE FROM ' + linkInfoTableName);
            _.each(linkInfo, function (info) {
                _$jdbcTemplate.update('INSERT INTO ' + linkInfoTableName +
                    '(UUID,IP,VALUE,STORAGE,SWITCH,HOST)VALUES(?,?,?,?,?,?)', values(info)
                );
            });
        },
        execute: function () {

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

            var condition = '';
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
                            name: sp.NAME,
                            elementID: sp.ELEMENT_ID
                        }
                    }).value();
                return s;
            });
            //return {switches: switches, length: switches.length};

            $.log($mf('storage info sql : {0}', storagePortSQL));
            var storages = $queryForList(storagePortSQL);
            storages = _.map(storages, function (storage) {
                storage.PERMANENT_ADDRESS = storage.PERMANENT_ADDRESS.replace(/:/g, '').toLowerCase();
                return storage;
            });
            //return {length: storages.length, storage: storages};

            var hosts = $queryForList(physicalSQL);
            //return hosts;

            this.updateLinkInfo('SYS_RELATION_SWITCH',
                this.genSwitchLinkInfo(switches, storages, hosts),
                function (s) {
                    return [
                        s.uuid,
                        s.ip,
                        JSON.stringify({ip: s.switchIP, WWN: s.WWN}),
                        JSON.stringify(s.linkstor),
                        JSON.stringify(s.linkswitch),
                        JSON.stringify(s.linkhost)
                    ];
                });

            return {rs: 'success'};
        }
    }
};
