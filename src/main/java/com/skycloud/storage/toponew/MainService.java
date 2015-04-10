package com.skycloud.storage.toponew;

import com.skycloud.storage.toponew.induction.Executor;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.servlet.http.HttpServletResponse;
import java.text.MessageFormat;

/**
 * @author gavin.
 *         create on 2015/3/17.
 */
@RequestMapping("/rest/topo")

@Controller
public class MainService {

    private Logger log = Logger.getLogger(this.getClass());

    private Executor executor;

    @Autowired
    public void setExecutor(Executor executor) {
        this.executor = executor;
    }

    @RequestMapping(value = "/{path}", method = RequestMethod.POST)
    public Object switchInfo(@PathVariable("path") String path,
                             @RequestBody String json,
                             HttpServletResponse response) {
        log.debug(MessageFormat.format("-- {0} -----{1}--------", path, json));
        response.setHeader("Access-Control-Allow-Origin", "*");
        return executor.execute(path, json);
    }
}
