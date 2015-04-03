/**
 *
 * Created by gavin on 4/2/15.
 */
induction.relation = {};
induction.relation.SQL = function ($) {
    return {
        switchSQL: 'SELECT A.ID,A.IP,A.NAME,B.WWN ' +
        'FROM STOR_SYSTEM A ,SWITCH B WHERE A.ID=B.ID',

        switchPortSQL: 'SELECT SYS_ID, SLOT_ID, PORT_ID, ELEMENT_ID ,NAME,WWN ' +
        'FROM SWITCH_PORT WHERE WWN!=\'\' AND (@C)',

        storagePortSQL: 'SELECT A.SYS_ID, A.PERMANENT_ADDRESS ,A.NAME AS PORT_NAME ' +
        ',B.NAME,B.IP' +
        ' FROM ' +
        'STOR_PORT A , STOR_SYSTEM B ' +
        'WHERE A.SYS_ID = B.ID AND A.PERMANENT_ADDRESS IS NOT NULL AND A.PERMANENT_ADDRESS !=\'\'',

        physicalSQL: 'SELECT A.IP,A.UUID,A.NAME,B.WWN ' +
        'FROM SYS_PHYSICAL_HOST A , SYS_PHYSICAL_HBA B' +
        ' WHERE A.UUID=B.HOST_UUID'
    }
};
