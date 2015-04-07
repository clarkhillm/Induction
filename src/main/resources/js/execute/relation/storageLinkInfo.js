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
                        return ss.PERMANENT_ADDRESS;
                    }).uniq().value();
                    return s;
                }).uniq(function (s) {
                    return s.SYS_ID;
                }).value();
                return {rs: rs}
            }
        }
    }];
