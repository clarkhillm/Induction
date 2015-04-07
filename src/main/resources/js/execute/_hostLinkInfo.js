/**
 *
 * Created by gavin on 4/7/15.
 */
induction._hostLinkInfo = ['query/queryRelation', function ($, $$) {
    return {
        execute: function (p) {
            return $$.query('SELECT IP,VALUE,STORAGE,SWITCH,HOST FROM' +
                ' SYS_RELATION_HOST WHERE @CONDITION',
                p,
                function (rs) {
                    return {
                        linkInfo: _.map(rs, function (r) {
                            return {
                                ip: r.IP,
                                linkSwitch: JSON.parse(r.SWITCH)
                            }
                        })
                    }
                });
        }
    }
}];
