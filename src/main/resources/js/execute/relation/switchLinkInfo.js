/**
 *
 * Created by gavin on 4/2/15.
 */

induction.relation.switchLinkInfo = ['relation/updateLinkInfo', function ($, update) {
    return {
        calculate: function (switches, storages, hosts) {
            update.updateLinkInfo('SYS_RELATION_SWITCH',
                _.map(switches, function (prime_switch) {
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
                }),
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
        }
    }
}];
