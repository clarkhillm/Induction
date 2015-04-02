package com.skycloud.storage.toponew.induction;

/**
 * @author gavin.
 *         create on 2015/3/19.
 */
public class Executor extends Base {
    @Override
    public Object setParametersAndCall(String key, String parameters) {
        return toJSONObject(executeMethod(key, "execute(" + parameters + ")"));
    }
}
