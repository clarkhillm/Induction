/**
 *
 * Created by gavin on 4/1/15.
 */
induction.Tool = function ($) {
    return {
        test: function () {
            return 'xxx';
        },
        execute: function (s) {


            var s1 = s.substring(0, 2);
            var s2 = s.substring(2, 4);
            var s3 = s.substring(4, 6);
            var s4 = s.substring(6, 8);
            var s5 = s.substring(8, 10);
            var s6 = s.substring(10, 12);
            var s7 = s.substring(12, 14);
            var s8 = s.substring(14, 16);
            var ans = s1 + ":" + s2 + ":" + s3 + ":" + s4 + ":" + s5 + ":" + s6 + ":" + s7 + ":" + s8;

            return ans.toUpperCase();

        }
    }
};
