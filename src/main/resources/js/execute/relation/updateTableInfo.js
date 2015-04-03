/**
 *
 * Created by gavin on 4/3/15.
 */
induction.relation.updateTableInfo = function ($) {
    return {
        update: function (tableName, info, transformDataFun) {
            var sql = 'DELETE FROM ' + tableName;
            _$jdbcTemplate.update(sql);
            var insertSQL = 'INSERT INTO ' + tableName + ' (UUID,IP,VALUE)VALUES(?,?,?)';
            $.log(insertSQL);
            _.each(info, function (data) {
                _$jdbcTemplate.update(insertSQL, transformDataFun(data));
            });
        }
    }
};

