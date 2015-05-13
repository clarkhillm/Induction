package com.skycloud.induction;

/**
 * @author gavin.
 *         create on 2015/3/19.
 */
public class Executor extends Base {

    @Override
    public Object setParametersAndCall(String key, String parameters) {
        putObjectToJS("_$test","test ");
        return executeMethod(key, "execute(" + parameters + ")");
    }

    public static void main(String[] args) {
        Executor executor = new Executor();
        Object rs = executor.execute("main", "");
        System.out.println("rs = " + rs);
    }
}
