/**
 *
 * Created by gavin on 4/7/15.
 */
induction._storageTableInfo = ['query/queryRelation', function ($, $$) {
    return {
        execute: function (p) {
            return $$.query('SELECT IP,VALUE FROM SYS_TABLEINFO_STORAGE WHERE @CONDITION',
                p,
                function (rs) {
                    return {
                        tableInf: _.chain(rs).map(function (r) {
                            return JSON.parse(r.VALUE);
                        }).filter(function (r) {
                            return r.length > 0;
                        }).flatten().value()
                    };
                });
        }
    }
}];