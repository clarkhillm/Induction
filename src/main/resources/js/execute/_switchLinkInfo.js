/**
 *
 * Created by gavin on 4/7/15.
 */
induction._switchLinkInfo = ['query/queryRelation', function ($, $$) {
    return {
        execute: function (p) {
            return $$.query('SELECT IP,VALUE,STORAGE,SWITCH,HOST FROM' +
                ' SYS_RELATION_SWITCH WHERE @CONDITION',
                p,
                function (rs) {
                    return {
                        linkInfo: _.map(rs, function (r) {
                            return {
                                ip: r.IP,
                                linkSwitch: JSON.parse(r.SWITCH),
                                linkHost: JSON.parse(r.HOST),
                                linkStor: JSON.parse(r.STORAGE)
                            }
                        })
                    }
                });
        }
    }
}];
