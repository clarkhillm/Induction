package com.skycloud.induction;

import org.springframework.context.support.ClassPathXmlApplicationContext;

/**
 * @author gavin.
 *         create on 2015/3/19.
 */
public class Executor extends Base {
    @Override
    public Object setParametersAndCall(String key, String parameters) {
        return executeMethod(key, "execute(" + parameters + ")");
    }

    public static void main(String[] args) {
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("applicationContext.xml");
        Executor executor = (Executor) context.getBean("switchExecute");
        Object rs = executor.execute("main", "");
        System.out.println(rs);
    }
}
