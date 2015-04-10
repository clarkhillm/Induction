/**
 *
 * Created by gavin on 4/7/15.
 */
induction.relation.hostLinkInfo = [
    'relation/updateLinkInfo',
    'relation/updateTableInfo',
    function ($, updateLink, updateTable) {
        return {
            calculate: function (switches, storages, hosts) {
                hosts = _.chain(hosts).filter(function (_$) {
                    return _$.WWN != null && _$.WWN != '' && _$.WWN != '000000000000';
                }).value();

                hosts = _.chain(hosts).map(function (h) {
                    h.ports = _.chain(hosts).filter(function (hh) {
                        return hh.UUID === h.UUID;
                    }).map(function (hh) {
                        return {WWN: hh.WWN, name: hh.PORT_NAME || ''};
                    }).uniq(function (hh) {
                        return hh.WWN;
                    }).value();
                    return h;
                }).uniq(function (h) {
                    return h.UUID;
                }).value();

                hosts = _.chain(hosts).map(function (h) {
                    var rs = {};

                    rs.ip = h.IP;
                    rs.name = h.NAME;
                    rs.uuid = h.UUID;

                    rs.linkswitch = _.chain(h.ports).map(function (sps) {
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
                }).value();

                updateLink.updateLinkInfo('SYS_RELATION_HOST', hosts, function (s) {
                    return [
                        s.uuid,
                        s.ip,
                        JSON.stringify({ip: s.ip, name: s.name}),
                        '[]'
                        , JSON.stringify(_.uniq(_.map(s.linkswitch, function (swth) {
                            return {ip: swth.ip, name: swth.name}
                        }), function (x) {
                            $.log(x);
                            return x.ip;
                        })),
                        '[]'
                    ];
                });

                updateTable.update('SYS_TABLEINFO_HOST', hosts, function (s) {
                    return [
                        s.uuid,
                        s.ip,
                        JSON.stringify(_.map(s.linkswitch, function (swth) {
                            return {
                                mainNodeName: s.ip + s.name,
                                mainNodeType: 'host',
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
    }
];
