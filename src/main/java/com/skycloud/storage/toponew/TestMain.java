package com.skycloud.storage.toponew;


import java.io.File;
import java.net.URISyntaxException;

/**
 * @author gavin.
 *         create on 2015/3/18.
 */
public class TestMain {

    public static void main(String[] args) throws URISyntaxException {
//        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("/applicationContext.xml");
//        SwitchExecute switchExecute = (SwitchExecute) context.getBean("switchExecute");
//        switchExecute.execute();
        File test = new File(TestMain.class.getResource("/js/Base.js").toURI());
        System.out.println("test = " + test.lastModified());


    }
}
