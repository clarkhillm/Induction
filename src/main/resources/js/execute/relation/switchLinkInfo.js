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
                            return {name: xx.name, switchIp: xx.ip, sPort: psp.name};
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
                            return {name: ss.NAME, hostIp: ss.IP, sPort: psp.name};
                        }).value();
                    }));
                    return rs;
                });

                updateLink.updateLinkInfo('SYS_RELATION_SWITCH', switchInfo, function (s) {
                    return [
                        s.uuid,
                        s.ip,
                        JSON.stringify({ip: s.switchIP, WWN: s.WWN}),
                        JSON.stringify(s.linkstor),
                        JSON.stringify(s.linkswitch),
                        JSON.stringify(s.linkhost)
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
                                    otherNodeName: stor.ip + stor.stroIp,
                                    otherNodeType: 'storage',
                                    otherPortName: stor.port,
                                    otherWwn: stor.WWN
                                }
                            }));
                            return JSON.stringify(rs);
                        }())
                    ]
                });
            }
        }
    }];
