package com.skycloud.storage.toponew.induction;

/**
 * @author gavin.
 *         create on 2015/3/19.
 */
public class Executor extends Base {
    @Override
    public Object execute(String key, String parameters) {
        init(key);
        loadJS();
        return toJSONObject(executeMethod("execute(" + parameters + ")"));
    }
}
