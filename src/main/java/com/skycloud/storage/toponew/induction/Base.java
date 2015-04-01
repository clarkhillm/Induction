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
import java.text.MessageFormat;
import java.util.*;

/**
 * @author gavin.
 *         create on 2015/3/18.
 *         使用JDK自带的javascript引擎来简化我们的工作。
 */
public abstract class Base {

    protected ScriptEngine E;

    protected Logger log = Logger.getLogger(this.getClass());

    private JdbcTemplate template;

    private Map<String, ScriptEngine> engineMap = new HashMap<String, ScriptEngine>();
    private Map<String, String> loadedJS = new HashMap<String, String>();

    public void setTemplate(JdbcTemplate template) {
        this.template = template;
    }

    private Set<String> modules = new HashSet<String>();

    /**
     * 加载Base.js以及lib。
     * 为Base注入数据。
     * 需要注意的是lib是以全局的方式加载的。
     *
     * @param key js的名称。
     */
    protected void init(String key) {
        E = engineMap.get(key);
        if (E == null) {
            ScriptEngineManager manager = new ScriptEngineManager();
            E = manager.getEngineByName("JavaScript");
            try {
                loadLibs();
                engineMap.put(key, E);
                loadBaseJS("Base");
                E.put("_$log", log);
                E.put("_$jdbcTemplate", template);
                E.put("_$tool", new Tool());
                E.put("_$fileName", key + ".js");
            } catch (ScriptException e) {
                e.printStackTrace();
                log.error(e);
            } catch (URISyntaxException e) {
                e.printStackTrace();
            }
        }
    }

    protected void loadJS(String key) {
        try {
            if (!modules.contains(key)) {
                loadExecutorJS(key);
                modules.add(key.replaceAll("/", "."));
                String typeOfJS = E.eval("(function(){return typeof induction." + key + ";}())").toString();
                log.debug("typeof " + key + " " + typeOfJS);

                if (!"function".equals(typeOfJS)) {
                    String moduleString = E.eval("(function(){return JSON.stringify(_.initial(induction." + key + "))}())").toString();
                    log.debug(MessageFormat.format("moduleString is {0}", moduleString));
                }
            }
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

    private void loadBaseJS(String baseJs) throws URISyntaxException, ScriptException {
        String modifyTime = loadedJS.get(baseJs);
        String lastModifyTime = new File(this.getClass().getResource("/js/Base.js").toURI()).lastModified() + "";
        if (modifyTime != null && !modifyTime.equals(lastModifyTime)) {
            E.eval(new InputStreamReader(this.getClass().getResourceAsStream("/js/Base.js")));
        } else {
            loadedJS.put(baseJs, lastModifyTime);
            E.eval(new InputStreamReader(this.getClass().getResourceAsStream("/js/Base.js")));
        }
    }

    private void loadLibs() throws ScriptException {
        E.eval(new InputStreamReader(this.getClass().getResourceAsStream("/js/lib/json2.js")));
        E.eval(new InputStreamReader(this.getClass().getResourceAsStream("/js/lib/underscore-min.js")));
    }

    protected String executeMethod(String key, String functionName) {
        try {
            log.debug(MessageFormat.format("xxxx {0}", modules));
            return E.eval("(function($){return JSON.stringify(induction." + key + "($)." + functionName + ");}(induction.Base))").toString();
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
