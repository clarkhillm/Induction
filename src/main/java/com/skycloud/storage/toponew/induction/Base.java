package com.skycloud.storage.toponew.induction;

import org.apache.log4j.Logger;
import org.codehaus.jackson.map.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.StringWriter;
import java.text.MessageFormat;
import java.util.List;

/**
 * @author gavin.
 *         create on 2015/3/18.
 */
public abstract class Base {

    private static ScriptEngineManager manager = new ScriptEngineManager();
    protected static ScriptEngine E = manager.getEngineByName("JavaScript");
    protected Logger log = Logger.getLogger(this.getClass());
    private String key;
    private String prefix = "__$";

    private JdbcTemplate template;

    public void setTemplate(JdbcTemplate template) {
        this.template = template;
    }

    protected void init(String key) {
        this.key = key;
        try {
            E.eval(new InputStreamReader(this.getClass().getResourceAsStream("/js/lib/json2.js")));
            E.eval(new InputStreamReader(this.getClass().getResourceAsStream("/js/lib/underscore-min.js")));
            E.eval(new InputStreamReader(this.getClass().getResourceAsStream("/js/Base.js")));

            E.put("_$log", log);
            E.put("_$jdbcTemplate", template);
            E.put("_$tool", new Tool());
            E.put("_$fileName", key + ".js");

        } catch (ScriptException e) {
            e.printStackTrace();
        }
    }

    protected void loadJS() {
        try {
            E.eval(new InputStreamReader(this.getClass().getResourceAsStream("/js/execute/" + key + ".js")));
            E.eval("var " + prefix + key + " = induction." + key + ".call(induction.Base);");
        } catch (ScriptException e) {
            e.printStackTrace();
        }
    }

    protected String executeMethod(String functionName) {
        try {
            String evalString = "var " + prefix + key + "_result = JSON.stringify(" + prefix + key + "." + functionName + ");";
            log.debug(evalString);
            E.eval(evalString);
//            log.debug(MessageFormat.format("js return : {0}", E.get(prefix + key + "_result")));
            return E.get(prefix + key + "_result").toString();
        } catch (ScriptException e) {
            e.printStackTrace();
        }
        return "[]";
    }

    protected Object toJSONObject(String json) {
        ObjectMapper mapper = new ObjectMapper();
        try {
            return mapper.readValue(json, Object.class);
        } catch (IOException e) {
            e.printStackTrace();
            return "[]";
        }
    }

    public abstract Object execute(String key, String parameters);

    public static class Tool {
        public String toJSON(List result) {
            ObjectMapper mapper = new ObjectMapper();
            StringWriter writer = new StringWriter();
            try {
                mapper.writeValue(writer, result);
            } catch (IOException e) {
                e.printStackTrace();
            }
            return writer.toString();
        }
    }
}
