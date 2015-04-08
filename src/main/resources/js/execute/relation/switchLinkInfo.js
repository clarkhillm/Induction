/**
 *
 * Created by gavin on 4/2/15.
 */

induction.relation.switchLinkInfo = [
    'relation/updateLinkInfo',
    'relation/updateTableInfo',
    function ($, updateLink, updateTable) {
        return {
            calculate: function (switches, storages, hosts) {
                var switchInfo = _.map(switches, function (prime_switch) {
                    var rs = {};

                    rs.uuid = prime_switch.id;
                    rs.ip = prime_switch.ip;
                    rs.WWN = prime_switch.WWN;
                    rs.name = prime_switch.name;

                    rs.linkswitch = _.flatten(_.map(prime_switch.ports, function (psp) {
                        return _.chain(switches).filter(function (ss) {
                            return ss.WWN === psp.WWN;
                        }).map(function (xx) {
                            var selfPort = _.chain(xx.ports)
                                .filter(function (x) {
                                    return x.WWN === xx.WWN;
                                }).map(function (sp) {
                                    return {
                                        WWN: sp.WWN,
                                        slotID: sp.SLOT_ID,
                                        portID: sp.PORT_ID,
                                        name: sp.NAME,
                                        elementID: sp.ELEMENT_ID
                                    }
                                }).first().value();
                            if (!selfPort) {
                                selfPort = {
                                    WWN: '*',
                                    slotID: '*',
                                    portID: '*',
                                    name: '*',
                                    elementID: '*'
                                }
                            }
                            return {
                                name: xx.name,
                                switchIp: xx.ip,
                                sPort: psp.name,
                                portName: selfPort.name,
                                WWN: selfPort.WWN
                            };
                        }).value();
                    }));

                    rs.linkstor = _.flatten(_.map(prime_switch.ports, function (psp) {
                        return _.chain(storages).filter(function (s) {
                            return psp.WWN === s.PERMANENT_ADDRESS;
                        }).map(function (ss) {
                            return {
                                name: ss.NAME,
                                storIp: ss.IP,
                                sPort: psp.name,
                                port: ss.PORT_NAME,
                                WWN: ss.PERMANENT_ADDRESS
                            };
                        }).value();
                    }));

                    rs.linkhost = _.flatten(_.map(prime_switch.ports, function (psp) {
                        return _.chain(hosts).filter(function (s) {
                            return psp.WWN === s.WWN;
                        }).map(function (ss) {
                            return {
                                name: ss.NAME,
                                hostIp: ss.IP,
                                sPort: psp.name,
                                portName: ss.PORTNAME,
                                WWN: ss.WWN
                            };
                        }).value();
                    }));
                    return rs;
                });

                updateLink.updateLinkInfo('SYS_RELATION_SWITCH', switchInfo, function (s) {
                    return [
                        s.uuid,
                        s.ip,
                        JSON.stringify({ip: s.switchIP, WWN: s.WWN}),
                        JSON.stringify(_.uniq(s.linkstor, function (x) {
                            return x.storIp;
                        })),
                        JSON.stringify(_.uniq(s.linkswitch, function (x) {
                            return x.switchIp;
                        })),
                        JSON.stringify(_.uniq(s.linkhost, function (x) {
                            return x.hostIp;
                        }))
                    ];
                });

                updateTable.update('SYS_TABLEINFO_SWITCH', switchInfo, function (s) {
                    return [
                        s.uuid,
                        s.ip,
                        (function () {
                            var rs = [];
                            rs = rs.concat(_.map(s.linkstor, function (stor) {
                                return {
                                    mainNodeName: s.ip + s.name,
                                    mainNodeType: 'switch',
                                    mainsPort: stor.sPort,
                                    localWwn: s.WWN,
                                    otherNodeName: stor.storIp + stor.name,
                                    otherNodeType: 'storage',
                                    otherPortName: stor.port,
                                    otherWwn: stor.WWN
                                }
                            }));
                            rs = rs.concat(_.map(s.linkswitch, function (ss) {
                                return {
                                    mainNodeName: s.ip + s.name,
                                    mainNodeType: 'switch',
                                    mainsPort: ss.sPort,
                                    localWwn: s.WWN,
                                    otherNodeName: ss.switchIp + ss.name,
                                    otherNodeType: 'switch',
                                    otherPortName: ss.portName,
                                    otherWwn: ss.WWN
                                }
                            }));
                            rs = rs.concat(_.map(s.linkhost, function (h) {
                                return {
                                    mainNodeName: s.ip + s.name,
                                    mainNodeType: 'switch',
                                    mainsPort: h.sPort,
                                    localWwn: s.WWN,
                                    otherNodeName: h.hostIp + h.name,
                                    otherNodeType: 'host',
                                    otherPortName: h.portName,
                                    otherWwn: h.WWN
                                }
                            }));
                            return JSON.stringify(rs);
                        }())
                    ]
                });
            }
        }
    }];
