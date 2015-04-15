/**
 *
 * Created by gavin on 2015/4/15.
 */
induction.main = ['induction.common.test', function ($, test) {
    return {
        execute: function () {
            $.log('do test...');
            test.test();
        }
    }
}];
