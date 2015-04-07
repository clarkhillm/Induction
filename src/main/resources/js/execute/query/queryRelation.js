/**
 *
 * Created by gavin on 4/7/15.
 */
induction.query.queryRelation = function ($) {
    return {
        query: function (sql, p, callback) {
            if (!(p && p.length > 0)) {
                sql = sql.replace('@CONDITION', 'TRUE');
            } else {
                var condition = '';
                _.each(p, function (pp) {
                    condition = condition + 'IP=\'' + pp + '\' OR ';
                });
                condition = condition + 'FALSE';

                sql = sql.replace('@CONDITION', condition);

            }
            $.log(sql);

            return callback($queryForList(sql));
        }
    }
};
