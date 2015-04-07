/**
 *
 * Created by gavin on 4/6/15.
 */
induction.relation.storageLinkInfo = [
    'relation/updateLinkInfo',
    'relation/updateTableInfo',
    function ($, updateLink, updateTable) {
        return {
            calculate: function (switches, storages, hosts) {
                var rs = _.chain(storages).filter(function (_$) {
                    return _$.PERMANENT_ADDRESS != '' && _$.PERMANENT_ADDRESS != '000000000000';
                }).value();

                rs = _.chain(rs).map(function (s) {
                    s.ports = _.chain(rs).filter(function (ss) {
                        return s.SYS_ID === ss.SYS_ID;
                    }).map(function (ss) {
                        return {WWN: ss.PERMANENT_ADDRESS, name: ss.PORT_NAME};
                    }).uniq(function (x) {
                        return x.WWN;
                    }).value();
                    return s;
                }).uniq(function (s) {
                    return s.SYS_ID;
                }).value();

                rs = _.map(rs, function (rss) {
                    var rs = {};

                    rs.ip = rss.IP;
                    rs.name = rss.NAME;
                    rs.uuid = rss.UUID;


                    rs.linkswitch = _.chain(rss.ports)
                        .map(function (sps) {
                            return _.chain(switches)
                                .filter(function (swth) {
                                    return _.chain(swth.ports)
                                        .map(function (swp) {
                                            return swp.WWN;
                                        })
                                        .contains(sps.WWN)
                                        .value();
                                })
                                .map(function (swth) {
                                    var otherPort = _.chain(swth.ports)
                                        .filter(function (swp) {
                                            return swp.WWN === sps.WWN;
                                        })
                                        .first()
                                        .value();
                                    return {
                                        name: swth.name,
                                        ip: swth.ip,
                                        portName: otherPort.name,
                                        WWN: swth.WWN,
                                        mainPortName: sps.name,
                                        localWWN: sps.WWN
                                    };
                                }).value();
                        }).flatten().value();
                    return rs;
                });

                updateLink.updateLinkInfo('SYS_RELATION_STORAGE', rs, function (s) {
                    return [
                        s.uuid,
                        s.ip,
                        JSON.stringify({ip: s.ip, name: s.name}),
                        '[]'
                        , JSON.stringify(_.map(s.linkswitch, function (swth) {
                            return {ip: swth.ip, name: swth.name}
                        })),
                        '[]'
                    ];
                });

                updateTable.update('SYS_TABLEINFO_STORAGE', rs, function (s) {
                    return [
                        s.uuid,
                        s.ip,
                        JSON.stringify(_.map(s.linkswitch, function (swth) {
                            return {
                                mainNodeName: s.ip + s.name,
                                mainNodeType: 'storage',
                                mainsPort: swth.mainPortName,
                                localWwn: swth.localWWN,
                                otherNodeName: swth.ip + swth.name,
                                otherNodeType: 'switch',
                                otherPortName: swth.portName,
                                otherWwn: swth.WWN
                            }
                        }))
                    ]
                });
            }
        }
    }];
