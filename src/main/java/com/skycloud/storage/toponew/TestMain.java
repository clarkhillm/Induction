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


        String sql="CREATE TABLE sys_relation_switch\n" +
                "(\n" +
                "    ID BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,\n" +
                "    UUID VARCHAR(50),\n" +
                "    IP VARCHAR(50),\n" +
                "    VALUE TEXT,\n" +
                "    SWITCH TEXT,\n" +
                "    STORAGE TEXT,\n" +
                "    HOST TEXT\n" +
                ");\n";


    }
}
