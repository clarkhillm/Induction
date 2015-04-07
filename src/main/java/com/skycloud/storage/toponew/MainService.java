package com.skycloud.storage.toponew;

import com.skycloud.storage.toponew.induction.Executor;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.text.MessageFormat;

/**
 * @author gavin.
 *         create on 2015/3/17.
 */
@RequestMapping("/rest")

@Controller
public class MainService {

    private Logger log = Logger.getLogger(this.getClass());

    private Executor executor;

    @Autowired
    public void setExecutor(Executor executor) {
        this.executor = executor;
    }

    @RequestMapping(value = "/{path}", method = RequestMethod.POST)
    public Object switchInfo(@PathVariable("path") String path, @RequestBody String json) {
        log.debug(MessageFormat.format("request path is {0} ----------------------------------------", path));
        return executor.execute(path, json);
    }
}
