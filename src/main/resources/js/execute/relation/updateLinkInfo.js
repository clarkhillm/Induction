/**
 *
 * Created by gavin on 4/3/15.
 */
induction.relation.updateLinkInfo = function ($) {
    return {
        updateLinkInfo: function (linkInfoTableName, linkInfo, values) {
            _$jdbcTemplate.update('DELETE FROM ' + linkInfoTableName);
            var sql = 'INSERT INTO ' + linkInfoTableName + '(UUID,IP,VALUE,STORAGE,SWITCH,HOST)VALUES(?,?,?,?,?,?)';
            $.log(sql);
            _.each(linkInfo, function (info) {
                _$jdbcTemplate.update(sql, values(info));
            });
        }
    }
};
