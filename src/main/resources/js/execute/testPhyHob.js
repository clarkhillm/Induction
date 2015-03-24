/**
 *
 * Created by gavin on 2015/3/24.
 */
induction.testPhyHob = function () {
    var $ = this;
    return {
        execute: function (p) {
            var phyHost = $queryForList('select uuid from sys_physical_host');
            _.each(phyHost, function (h) {
                _$jdbcTemplate.update('insert into sys_physical_hba (host_uuid) values(?)', h.uuid);
            });
            return {rs: []}
        }
    }
};
