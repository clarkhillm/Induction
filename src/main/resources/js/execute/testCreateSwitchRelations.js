/**
 * 创建以交换机为中心的关系表。
 * Created by gavin on 3/31/15.
 */
induction.testCreateSwitchRelations = function ($) {

    var sql = "CREATE TABLE sys_relation_switch\n" +
        "(\n" +
        "    UUID VARCHAR(50),\n" +
        "    IP VARCHAR(50),\n" +
        "    VALUE TEXT,\n" +
        "    SWITCH TEXT,\n" +
        "    STORAGE TEXT,\n" +
        "    HOST TEXT\n" +
        ");\n";

    return {
        execute: function (p) {
            var rs = {rs: ''};
            $.log(sql);
            return rs;
        }
    }
};
