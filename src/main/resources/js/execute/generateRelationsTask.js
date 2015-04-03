/**
 *
 * Created by gavin on 3/31/15.
 */
induction.generateRelationsTask = [
    'relation/SQL',
    'relation/switchLinkInfo',
    function ($, sql, switchLinkInfo) {
        return {
            updateLinkInfo: function (linkInfoTableName, linkInfo, values) {
                _$jdbcTemplate.update('DELETE FROM ' + linkInfoTableName);
                _.each(linkInfo, function (info) {
                    _$jdbcTemplate.update('INSERT INTO ' + linkInfoTableName +
                        '(UUID,IP,VALUE,STORAGE,SWITCH,HOST)VALUES(?,?,?,?,?,?)', values(info)
                    );
                });
            },
            execute: function () {

                $.log(sql.switchSQL);

                var switchInfo = $queryForList(sql.switchSQL);

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
                sql.switchPortSQL = sql.switchPortSQL.replace('@C', condition);
                $.log(sql.switchPortSQL);

                var switchPort = $queryForList(sql.switchPortSQL);

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

                $.log($mf('storage info sql : {0}', sql.storagePortSQL));
                var storages = $queryForList(sql.storagePortSQL);
                storages = _.map(storages, function (storage) {
                    storage.PERMANENT_ADDRESS = storage.PERMANENT_ADDRESS.replace(/:/g, '').toLowerCase();
                    return storage;
                });
                //return {length: storages.length, storage: storages};

                var hosts = $queryForList(sql.physicalSQL);
                //return hosts;

                this.updateLinkInfo('SYS_RELATION_SWITCH',
                    switchLinkInfo.calculate(switches, storages, hosts),
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
    }];

