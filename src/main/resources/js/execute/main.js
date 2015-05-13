/**
 * test main
 * Created by gavin on 15/05/12.
 */
induction.main = ['utils/dateUtil', function ($$, dateUtil) {
    return {
        execute: function () {
            $$.log('do some test. ' + _$test + dateUtil.toString(new Date()));
            return 'Hello world!'
        }
    }
}];
