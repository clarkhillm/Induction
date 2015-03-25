/**
 *
 * Created by gavin on 15-3-25.
 */

induction.storageLinkInfo = function () {
    var $ = this;

    var storagePortSQL = 'SELECT '
        + ' a.id,'
        + ' a.name,'
        + ' a.ip,'
        + ' b.PERMANENT_ADDRESS'
        + ' FROM stor_system a, stor_port b'
        + ' WHERE a.type = 1 AND a.id = b.SYS_ID AND b.PERMANENT_ADDRESS IS NOT NULL  ' +
        'AND ({0})';

    var switchPortSQL = 'SELECT ' +
        'A.IP,A.NAME,B.WWN FROM ' +
        'STOR_SYSTEM A , SWITCH_PORT B ' +
        'WHERE A.ID=B.SYS_ID AND B.WWN !=\'\' AND B.WWN IS NOT NULL';

    return {
        execute: function (p) {

            if (!(p && p.length > 0)) {
                storagePortSQL = $mf(storagePortSQL, 'true');
            } else {
                var condition = '';
                _.each(p, function (pp) {
                    condition = condition + 'a.ip=\'' + pp + '\' or ';
                });
                condition = condition + 'false';
                storagePortSQL = $mf(storagePortSQL, condition);
            }

            $.log($mf('storage sql : {0}', storagePortSQL));
            var storageInfo = _.chain($queryForList(storagePortSQL)).map(function (s) {
                s.PERMANENT_ADDRESS = s.PERMANENT_ADDRESS.replace(/:/g, '').toLocaleLowerCase();
                return s;
            }).filter(function (_$) {
                return _$.PERMANENT_ADDRESS != '' && _$.PERMANENT_ADDRESS != '000000000000';
            }).value();

            //return {storage: storageInfo, length: storageInfo.length};

            $.log($mf('switch port info sql : {0}', switchPortSQL));
            var switchInfo = _.map($queryForList(switchPortSQL), function (i) {
                i.WWN = i.WWN.replace(/:/g, '').toLocaleLowerCase();
                return i;
            });
            //return {s: switchInfo, l: switchInfo.length};

            var rs = {rs: []};
            storageInfo = _.chain(storageInfo).map(function (storage) {
                storage.ports = _.chain(storageInfo)
                    .filter(function (s) {
                        return storage.id === s.id;
                    }).map(function (s) {
                        return s.PERMANENT_ADDRESS;
                    }).uniq().value();
                return storage
            }).uniq(function (s) {
                return s.id;
            }).map(function (_$) {
                return {ip: _$.ip, name: _$.name, ports: _$.ports};
            }).value();

            rs.rs = storageInfo;
            rs.length = rs.rs.length;

            return rs;
        }
    }
};
