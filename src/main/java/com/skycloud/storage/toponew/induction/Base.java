package com.skycloud.storage.toponew.induction;

import org.apache.log4j.Logger;
import org.codehaus.jackson.map.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.StringWriter;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author gavin.
 *         create on 2015/3/18.
 *         使用JDK自带的javascript引擎来简化我们的工作。
 */
public abstract class Base {

    protected ScriptEngine E;

    protected Logger log = Logger.getLogger(this.getClass());

    private String key;
    private String prefix = "__$";

    private JdbcTemplate template;

    private Map<String, ScriptEngine> engineMap = new HashMap<String, ScriptEngine>();
    private Map<String, String> loadedJS = new HashMap<String, String>();

    public void setTemplate(JdbcTemplate template) {
        this.template = template;
    }

    protected void init(String key) {
        this.key = key;
        E = engineMap.get(key);
        if (E == null) {
            ScriptEngineManager manager = new ScriptEngineManager();
            E = manager.getEngineByName("JavaScript");
            try {
                loadLibs();
                engineMap.put(key, E);
            } catch (ScriptException e) {
                e.printStackTrace();
                log.error(e);
            }
        }
    }

    protected void loadJS(String key) {
        try {

            loadBaseJS("Base");
            loadExecutorJS(key);

            E.put("_$log", log);
            E.put("_$jdbcTemplate", template);
            E.put("_$tool", new Tool());
            E.put("_$fileName", key + ".js");

            E.eval("var " + prefix + key + " = induction." + key + ".call(induction.Base);");
        } catch (ScriptException e) {
            e.printStackTrace();
        } catch (URISyntaxException e) {
            e.printStackTrace();
        }
    }

    private void loadExecutorJS(String key) throws URISyntaxException, ScriptException {
        String modifyTime = loadedJS.get(key);
        String lastModifyTime = new File(this.getClass().getResource("/js/execute/" + key + ".js").toURI()).lastModified() + "";
        if (modifyTime != null && !modifyTime.equals(lastModifyTime)) {
            E.eval(new InputStreamReader(this.getClass().getResourceAsStream("/js/execute/" + key + ".js")));
        } else {
            loadedJS.put(key, lastModifyTime);
            E.eval(new InputStreamReader(this.getClass().getResourceAsStream("/js/execute/" + key + ".js")));
        }
    }

    private void loadBaseJS(String basejs) throws URISyntaxException, ScriptException {
        String modifyTime = loadedJS.get(basejs);
        String lastModifyTime = new File(this.getClass().getResource("/js/Base.js").toURI()).lastModified() + "";
        if (modifyTime != null && !modifyTime.equals(lastModifyTime)) {
            E.eval(new InputStreamReader(this.getClass().getResourceAsStream("/js/Base.js")));
        } else {
            loadedJS.put(basejs, lastModifyTime);
            E.eval(new InputStreamReader(this.getClass().getResourceAsStream("/js/Base.js")));
        }
    }

    private void loadLibs() throws ScriptException {
        E.eval(new InputStreamReader(this.getClass().getResourceAsStream("/js/lib/json2.js")));
        E.eval(new InputStreamReader(this.getClass().getResourceAsStream("/js/lib/underscore-min.js")));
    }

    protected String executeMethod(String functionName) {
        try {
            String evalString = "var " + prefix + key + "_result = JSON.stringify(" + prefix + key + "." + functionName + ");";
            log.debug(evalString);
            E.eval(evalString);
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
