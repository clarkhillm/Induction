/**
 * 对日期的处理，主要是为了兼容1.6的JDK。
 * 一般情况下，建议使用moment js
 *
 * Created by gavin on 15/05/12.
 */
induction.utils.dateUtil = function ($$) {
    return {
        getDate: function (y, m, d, h, mm, ss) {
            var date = new Date();
            date.setFullYear(y, m - 1, d);
            date.setHours(h);
            date.setMinutes(mm);
            date.setSeconds(ss);
            return date;
        },
        isBefore: function (d1, d2) {
            var dd1 = d1.getTime();
            var dd2 = d2.getTime();
            return dd1 < dd2;
        },
        isBetween: function (d, d1, d2) {
            var dd = d.getTime();
            var dd1 = d1.getTime();
            var dd2 = d2.getTime();
            return dd > dd1 && dd < dd2;
        },
        toString: function (d) {
            return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' +
                d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
        }
    }
};
