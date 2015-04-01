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
        log.debug(MessageFormat.format("load js : /js/execute/{0}.js", key));
        try {
            if (!modules.contains(key)) {
                loadExecutorJS(key);
                modules.add(key.replaceAll("/", "."));

                String typeOfJS = E.eval("(function(){return typeof induction." + key + ";}())").toString();
                log.debug("typeof " + key + " " + typeOfJS);

                if (!"function".equals(typeOfJS)) {
                    List<String> dependence = getModuleDependence(key);
                    log.debug(MessageFormat.format("dependence of this module (induction.{0}) are {1}", key, dependence));
                    for (String s : dependence) {
                        loadJS(s);
                    }
                }
            } else {
                log.debug("load failed. Some other js has the same name has been loaded.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e);
        }
    }

    @SuppressWarnings("unchecked")
    private List<String> getModuleDependence(String key) throws ScriptException, IOException {
        String moduleString = E.eval("(function(){return JSON.stringify(_.initial(induction." + key + "))}())").toString();
        ObjectMapper mapper = new ObjectMapper();
        return mapper.readValue(moduleString, List.class);
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
            String typeOfJS = E.eval("(function(){return typeof induction." + key + ";}())").toString();
            if ("function".equals(typeOfJS)) {
                return E.eval("(function($){return JSON.stringify(induction." + key + "($)." + functionName + ");}(induction.Base))").toString();
            } else {
                List<DependenceModel> ds = new ArrayList<DependenceModel>();
                Map<String, List<String>> dsMap = new HashMap<String, List<String>>();

                for (String module : modules) {
                    List<String> dependence = getModuleDependence(module);
                    if (dependence.contains(module)) {
                        throw new Exception(MessageFormat.format("can not dependence self.({0})", key));
                    }
                    ds.add(new DependenceModel(module, dependence));
                    dsMap.put(module, dependence);
                }

                for (DependenceModel d : ds) {
                    for (String name : d.dependence) {
                        if (dsMap.get(name).contains(d.name)) {
                            throw new Exception(MessageFormat.format("There is a circular dependency. ({0}-{1})", name, d.name));
                        }
                    }
                }

                DependenceTreeNode node = createDependenceTree(dsMap, key);
                String js = calculateJSString(node);
                int x = js.lastIndexOf(';');

                String f = js.substring(0, x);
                int xx = js.indexOf('_');
                String f0 = f.substring(0, xx);
                String f1 = f.substring(xx, f.length());

                f = f0 + "JSON.stringify(" + f1;

                String e = js.substring(x, js.length());
                log.debug(f + "." + functionName + ")" + e);
                return E.eval(f + "." + functionName + ")" + e).toString();
            }
        } catch (ScriptException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "{\"rs\":\"It seems some error occur,please check log.\"}";
    }

    protected DependenceTreeNode createDependenceTree(Map<String, List<String>> input, String key) {
        System.out.println("key = " + key);
        DependenceTreeNode node = new DependenceTreeNode();
        node.name = key;
        for (String nk : input.get(key)) {
            node.nodes.add(createDependenceTree(input, nk));
        }
        return node;
    }

    protected String calculateJSString(DependenceTreeNode node) {
        String dependence = "";
        for (DependenceTreeNode n : node.nodes) {
            n.JSString = calculateJSString(n);
            dependence = dependence + n.JSString + ",";
        }
        if (dependence.length() > 0) {
            dependence = dependence.substring(0, dependence.length() - 1);
        }
        return genDependenceString(node.name, dependence, node.nodes.size() == 0);
    }

    private String genDependenceString(String key, String dependence, boolean flag) {
        String dot = "";
        if (dependence.length() > 0) {
            dot = ",";
        }
        if (flag) {
            return "(function($){return induction." + key.replaceAll("/", ".") + "($" + dot + dependence + ");})(induction.Base)";
        } else {
            return "(function($){return _.last(induction." + key.replaceAll("/", ".") + ")($" + dot + dependence + ");})(induction.Base)";
        }
    }

    protected Object toJSONObject(String json) {
        log.debug(MessageFormat.format("returned json string is {0}", json));
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

    private static class DependenceModel {
        public final String name;
        public final List<String> dependence;

        private DependenceModel(String name, List<String> dependence) {
            this.name = name;
            this.dependence = dependence;
        }
    }

    private static class DependenceTreeNode {
        public String name;
        public List<DependenceTreeNode> nodes = new ArrayList<DependenceTreeNode>();
        public String JSString = "";

        @Override
        public String toString() {
            return "DependenceTreeNode{" +
                    "name='" + name + '\'' +
                    '}';
        }
    }

    protected void cleanModules() {
        modules.clear();
    }

    public static void main(String[] args) {
        Base tester = new Base() {
            @Override
            public Object execute(String key, String parameters) {
                Map<String, List<String>> testMap = new HashMap<String, List<String>>();
                testMap.put("a", Arrays.asList("b", "c", "d"));
                testMap.put("b", Arrays.asList("e", "x/f"));
                testMap.put("c", Arrays.asList("e", "x/f"));
                testMap.put("e", new ArrayList<String>());
                testMap.put("x/f", new ArrayList<String>());
                testMap.put("d", new ArrayList<String>());
                DependenceTreeNode rs = createDependenceTree(testMap, "a");
                String rss = calculateJSString(rs);
                //rss = calculateJSString(rs);

                int x = rss.lastIndexOf(';');
                System.out.println(rss.substring(0, x));
                System.out.println(rss.substring(x, rss.length()));
                // System.out.println("rss = " + rss);
                return "";
            }
        };

        tester.execute("", "");
    }
}
